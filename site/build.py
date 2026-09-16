#!/usr/bin/env python3
"""
AI Pulse platform builder
Builds a full static intelligence desk from briefs/*.md
(and optional legacy HTML stubs for timeline history).
"""

from __future__ import annotations

import html
import json
import re
import shutil
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

# Company / product heat map: rolling window (calendar days, inclusive of anchor)
COMPANY_HEAT_DAYS = 7

import markdown

from biscuits_lib import (  # noqa: E402
    biscuits_page_body_html,
    harvest_biscuit_counts,
    harvest_biscuit_ids,
    home_ticker_html,
    link_biscuits_in_html,
    rank_biscuit_ids_for_home,
    related_biscuits_section_html,
    suggest_biscuit_candidates,
    toc_related_item_html,
    write_biscuit_candidates_log,
    write_biscuit_runtime,
)

BASE = Path(__file__).resolve().parent.parent
BRIEFS_MD = BASE / "briefs"
LEGACY_HTML = BASE / "history" / "legacy-briefs"
# fallbacks
LEGACY_FALLBACKS = [
    BASE / "_upstream-ai-brief" / "brief",
    BASE / "_upstream-ai-brief" / "briefs",
]
SITE = BASE / "site"
ASSETS_SRC = SITE / "assets"
PUBLIC = SITE / "public"
BRIEF_OUT = PUBLIC / "brief"
DATA_OUT = PUBLIC / "data"
ASSETS_OUT = PUBLIC / "assets"

MD = markdown.Markdown(
    extensions=["extra", "sane_lists", "tables", "fenced_code", "toc"],
    extension_configs={"toc": {"permalink": False, "toc_depth": "2-3"}},
)

COMPANIES = [
    "OpenAI", "Anthropic", "Google", "DeepMind", "Microsoft", "Meta", "Amazon",
    "Apple", "NVIDIA", "Nvidia", "xAI", "Grok", "Mistral", "Cohere", "Perplexity",
    "ByteDance", "Adobe", "Salesforce", "Oracle", "IBM", "Samsung", "Hugging Face",
    "Midjourney", "Runway", "Stability", "Canva", "Figma", "GitHub", "Cloudflare",
    "DeepSeek", "Claude", "Gemini", "ChatGPT", "Copilot", "Firefly", "Kling",
    "Sora", "Luma", "Pika", "ElevenLabs", "Notion", "Zapier", "AWS", "Azure",
]

# Keyword rules: (domain, keys). Scoring uses all matches; only ONE primary domain is kept.
DOMAIN_RULES = [
    ("models", ["모델", "플랫폼", "gpt-5", "gpt-4", "claude", "gemini", "llama", "grok", "llm", "오픈웨이트", "벤치", "api", "솔", "terra", "luna", "코덱스"]),
    ("agents", ["에이전트", "agent", "computer use", "tool calling", "툴콜", "claude code", "browser", "브라우저", "hermes", "워크플로 자동화"]),
    ("creative", ["콘텐츠 제작", "크리에이티브", "영상", "이미지", "디자인", "firefly", "midjourney", "runway", "sora", "video", "숏폼", "생성 도구"]),
    ("marketing", ["마케팅", "비즈니스", "광고", "seo", "구독", "gtm", "랜딩", "요금", "가격 도입", "현지 가격", "₹", "루피", "gst", "캠페인"]),
    ("infra", ["인프라", "gpu", "nvidia", "칩", "추론 비용", "사이버", "세이프가드", "nvdock", "도킹"]),
    ("policy", ["규제", "소송", "정책", "영업비밀", "저작권", "eu ai", "deepfake", "제소", "법정"]),
]

# Tie-break when scores are equal (more specific / constrained first)
DOMAIN_TIEBREAK = ["policy", "infra", "agents", "creative", "marketing", "models"]

DOMAIN_META = {
    "models": ("모델 · 플랫폼", "Frontier·오픈 모델, API, 벤치마크"),
    "agents": ("에이전트 · 자동화", "툴유즈, 브라우저, 워크플로, 멀티에이전트"),
    "creative": ("크리에이티브", "이미지·영상·음성·디자인 생성 스택"),
    "marketing": ("마케팅 · 비즈니스", "광고, GTM, 가격 전략, 시장 운영"),
    "infra": ("인프라 · 보안", "칩, 클라우드, 추론 비용, 보안"),
    "policy": ("규제 · 리스크", "소송, 정책, 컴플라이언스"),
}

SECTION_DOMAIN_HINTS = [
    (["마케팅", "비즈니스"], "marketing"),
    (["콘텐츠", "크리에이티브", "제작"], "creative"),
    (["sns", "루머", "바이럴", "트렌드"], "agents"),  # often product UX viral; refined by text
    (["테크", "인프라", "규제", "보안"], None),  # split by text: policy vs infra
    (["모델", "플랫폼"], "models"),
    (["액션", "실무"], None),
    (["top 5", "꼭 볼"], None),
]


@dataclass
class Signal:
    title: str
    summary: str = ""
    why: str = ""
    section: str = ""
    domains: list[str] = field(default_factory=list)
    companies: list[str] = field(default_factory=list)
    reliability: str = ""
    urls: list[str] = field(default_factory=list)


def section_anchor(heading: str) -> str:
    """Stable HTML id for a ## section heading (emoji-stripped)."""
    plain = strip_section_emoji(heading)
    aid = re.sub(r"[^a-zA-Z0-9가-힣]+", "-", plain).strip("-").lower()
    return aid or "sec"


def card_anchor(section_id: str, n: int) -> str:
    """Stable HTML id for a news card (deep-link / archive search)."""
    return f"c-{section_id}-{n:02d}"


@dataclass
class Brief:
    date: str
    path: Path
    title: str
    collected_at: str = ""
    scope: str = ""
    excerpt: str = ""
    theme: str = ""  # witty edition headline (not the calendar date)
    theme_blurb: str = ""  # plain-language gloss of the theme (card subtitle)
    top5: list[str] = field(default_factory=list)
    sections: list[str] = field(default_factory=list)
    signals: list[Signal] = field(default_factory=list)
    domains: list[str] = field(default_factory=list)
    companies: list[str] = field(default_factory=list)
    company_counts: dict = field(default_factory=dict)  # name -> mention weight
    has_rumor: bool = False
    body_html: str = ""
    toc_html: str = ""
    search_items: list[dict] = field(default_factory=list)  # deep search units (cards)
    source: str = "md"  # md | legacy
    is_stub: bool = False

    @property
    def url(self) -> str:
        return f"brief/{self.date}.html"

    @property
    def display_date(self) -> str:
        try:
            d = datetime.strptime(self.date, "%Y-%m-%d")
            wd = "월화수목금토일"[d.weekday()]
            return f"{d.year}년 {d.month}월 {d.day}일({wd})"
        except ValueError:
            return self.date

    @property
    def edition_title(self) -> str:
        """Primary human title for cards / H1 — theme preferred over calendar date."""
        if self.theme:
            return self.theme
        if self.top5:
            return self.top5[0]
        if self.excerpt:
            return re.sub(r"\s+", " ", self.excerpt)[:48].rstrip() + ("…" if len(self.excerpt) > 48 else "")
        return self.display_date

    @property
    def edition_blurb(self) -> str:
        """Short gloss under the theme — explains what the headline means."""
        if self.theme_blurb:
            return self.theme_blurb
        if self.excerpt:
            return re.sub(r"\s+", " ", self.excerpt).strip()
        if self.top5:
            return self.top5[0]
        return ""


def _normalize_company(name: str) -> str:
    aliases = {
        "nvidia": "NVIDIA",
        "chatgpt": "ChatGPT",
        "deepmind": "DeepMind",
        "hugging face": "Hugging Face",
        "github": "GitHub",
        "xai": "xAI",
        "elevenlabs": "ElevenLabs",
    }
    return aliases.get(name.lower(), name)


def html_to_plain(text: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>", " ", text, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;|&amp;|&lt;|&gt;|&quot;", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def detect_company_counts(text: str) -> Counter:
    """Count company/product mentions (case-insensitive, boundary-aware)."""
    counts: Counter = Counter()
    if not text:
        return counts
    # Longer names first
    for c in sorted(set(COMPANIES), key=len, reverse=True):
        pattern = re.compile(rf"(?<![A-Za-z0-9]){re.escape(c)}(?![A-Za-z0-9])", re.I)
        n = len(pattern.findall(text))
        if n:
            counts[_normalize_company(c)] += n
    return counts


def detect_companies(text: str) -> list[str]:
    counts = detect_company_counts(text)
    return [name for name, _ in counts.most_common(16)]


def _section_domain_hint(section: str) -> str | None:
    s = section.lower()
    for keys, dom in SECTION_DOMAIN_HINTS:
        if any(k in s for k in keys):
            return dom
    return None


def score_domains(text: str) -> Counter:
    t = text.lower()
    scores: Counter = Counter()
    for domain, keys in DOMAIN_RULES:
        for k in keys:
            kl = k.lower()
            if kl in t:
                scores[domain] += 1.0 + min(len(kl), 12) * 0.05
    return scores


def primary_domain(text: str, section: str = "") -> str:
    """Assign exactly one domain so the same story never appears in multiple axes."""
    scores = score_domains(text)
    hint = _section_domain_hint(section)
    if hint:
        # Strong boost from brief section placement
        scores[hint] += 4.0
    # SNS section: prefer agents/creative over models unless clear product launch
    if section and any(k in section.lower() for k in ["sns", "루머", "바이럴"]):
        if "루머" in text or "[루머]" in text:
            scores["marketing"] += 1.5
        scores["agents"] += 1.2
    if "소송" in text or "제소" in text or "영업비밀" in text:
        scores["policy"] += 5.0
    if not scores:
        return hint or "models"
    best = max(scores.values())
    cands = [d for d, sc in scores.items() if sc >= best - 1e-9]
    for d in DOMAIN_TIEBREAK:
        if d in cands:
            return d
    return cands[0]


def detect_domains(text: str, section: str = "") -> list[str]:
    """Return a single-item list [primary] for compatibility with older callers."""
    return [primary_domain(text, section)]


def assign_exclusive_headlines(
    items: list[tuple[str, str]],
) -> dict[str, str]:
    """
    items: list of (title, section_hint)
    Each title is assigned to at most one domain. First claim wins by
    walking domains in a stable order after sorting items by specificity.
    """
    claimed: dict[str, str] = {}  # domain -> title
    used_titles: set[str] = set()

    # Sort: prefer items with stronger primary score (more distinctive)
    ranked: list[tuple[float, str, str, str]] = []
    for title, section in items:
        if not title or title in used_titles:
            continue
        sc = score_domains(title + " " + section)
        hint = _section_domain_hint(section)
        if hint:
            sc[hint] += 4.0
        dom = primary_domain(title, section)
        strength = sc.get(dom, 0)
        ranked.append((strength, title, section, dom))
    ranked.sort(key=lambda x: -x[0])

    for _strength, title, _section, dom in ranked:
        if title in used_titles:
            continue
        if dom not in claimed:
            claimed[dom] = title
            used_titles.add(title)

    return claimed


# Strip leading emoji / variation selectors from markdown section titles
_EMOJI_PREFIX_RE = re.compile(
    r"^(?:[\U0001F300-\U0001FAFF\U00002700-\U000027BF\U00002600-\U000026FF"
    r"\U0001F1E0-\U0001F1FF\U0000FE0F\U0000200D\U0000FE0E]+\s*)+"
)


def strip_section_emoji(heading: str) -> str:
    return _EMOJI_PREFIX_RE.sub("", (heading or "").strip()).strip()


def section_icon_key(heading: str) -> str:
    """Map a section heading to a custom icon key (no emoji)."""
    plain = strip_section_emoji(heading)
    h = plain.lower()
    if "top 5" in h or "꼭 볼" in plain:
        return "top"
    if "모델" in plain or "플랫폼" in plain:
        return "models"
    if "콘텐츠" in plain or "크리에이티브" in plain or "제작" in plain:
        return "creative"
    if "마케팅" in plain or "비즈니스" in plain:
        return "marketing"
    if "테크" in plain or "인프라" in plain or "규제" in plain or "보안" in plain:
        return "tech"
    if "sns" in h or "루머" in plain or "바이럴" in plain or "트렌드" in plain:
        return "sns"
    if "액션" in plain or "실무" in plain:
        return "action"
    if "참고" in plain or "링크" in plain:
        return "links"
    if "한계" in plain:
        return "note"
    return "default"


# Hand-drawn-feeling geometric icons (stroke, 24×24). Soft, custom desk marks.
_ICON_PATHS: dict[str, str] = {
    # Star optically centered in 24×24 (bbox center ≈ 12,12)
    "top": (
        '<circle cx="12" cy="12" r="9.25" fill="none" opacity=".22"/>'
        '<path fill="currentColor" stroke="none" d="'
        "M12 5.82 13.7 10.32 18.51 10.55 14.76 13.57 16.03 18.21 "
        "12 15.57 7.97 18.21 9.24 13.57 5.49 10.55 10.3 10.32Z"
        '"/>'
    ),
    "models": (
        '<path d="M12 3.8 4.8 8v8L12 20.2 19.2 16V8L12 3.8z"/>'
        '<path d="M4.8 8 12 12.2 19.2 8M12 12.2V20.2" opacity=".55"/>'
    ),
    # Creative: media frame + landscape + spark (content / visual work)
    "creative": (
        '<rect x="4.6" y="6.6" width="14.8" height="11.6" rx="2.2"/>'
        '<path d="M5.4 16.4 8.8 12.2l2.3 2.5 2.9-3.8 4.6 5.5"/>'
        '<circle cx="9.1" cy="10" r="1.15"/>'
        '<path d="M17.6 4.4v2.8M16.2 5.8h2.8" opacity=".85"/>'
    ),
    "marketing": (
        '<path d="M5.2 9.2h3.1L14 5.4v13.2l-5.7-3.8H5.2z"/>'
        '<path d="M16.2 9.4c1.1.7 1.8 1.9 1.8 3.2s-.7 2.5-1.8 3.2"/>'
        '<path d="M18.4 7.6c1.8 1.2 2.9 3.2 2.9 5.4s-1.1 4.2-2.9 5.4" opacity=".55"/>'
    ),
    "tech": (
        '<circle cx="12" cy="12" r="3.1"/>'
        '<path d="M12 4.2v2.2M12 17.6v2.2M4.2 12h2.2M17.6 12h2.2'
        'M6.5 6.5l1.6 1.6M15.9 15.9l1.6 1.6M17.5 6.5l-1.6 1.6M8.1 15.9l-1.6 1.6"/>'
    ),
    "sns": (
        '<rect x="5" y="4.5" width="10.5" height="15" rx="2.2"/>'
        '<path d="M8 8.2h4.5M8 11.2h4.5M8 14.2h2.8" opacity=".7"/>'
        '<path d="M15.5 9.5h2.2a1.8 1.8 0 0 1 1.8 1.8v6.2a1.8 1.8 0 0 1-1.8 1.8H11" opacity=".55"/>'
    ),
    "action": (
        '<path d="M13.2 3.8 6.4 13.2h4.1L9.8 20.2l7.6-10.4h-4.1z"/>'
    ),
    "links": (
        '<path d="M9.6 13.6a3.6 3.6 0 0 1 0-5.1l2.2-2.2a3.6 3.6 0 1 1 5.1 5.1l-1.1 1.1"/>'
        '<path d="M14.4 10.4a3.6 3.6 0 0 1 0 5.1l-2.2 2.2a3.6 3.6 0 1 1-5.1-5.1l1.1-1.1"/>'
    ),
    "note": (
        '<path d="M7 5.2h10a1.6 1.6 0 0 1 1.6 1.6v10.4a1.6 1.6 0 0 1-1.6 1.6H7'
        'A1.6 1.6 0 0 1 5.4 17.2V6.8A1.6 1.6 0 0 1 7 5.2z"/>'
        '<path d="M8.6 9.2h6.8M8.6 12h6.8M8.6 14.8h4.2" opacity=".65"/>'
    ),
    "default": (
        '<circle cx="12" cy="12" r="7.5"/>'
        '<path d="M9.2 12h5.6M12 9.2v5.6" opacity=".7"/>'
    ),
    # Home landscape domains (alias keys)
    "agents": (
        '<circle cx="8.2" cy="10" r="2.4"/>'
        '<circle cx="15.8" cy="10" r="2.4"/>'
        '<circle cx="12" cy="15.4" r="2.4"/>'
        '<path d="M10.2 11.2 10.9 13.6M13.8 11.2 13.1 13.6M10.1 10.2h3.8" opacity=".55"/>'
    ),
    "infra": (
        '<path d="M6 16.5h12"/>'
        '<path d="M8 16.5V9.2l4-3.4 4 3.4v7.3"/>'
        '<path d="M10.2 16.5v-4.2h3.6v4.2" opacity=".65"/>'
    ),
    "policy": (
        '<path d="M12 4.2 5.5 7v4.8c0 4 2.8 6.8 6.5 8 3.7-1.2 6.5-4 6.5-8V7L12 4.2z"/>'
        '<path d="M9.2 12.1 11.1 14l3.7-4" opacity=".7"/>'
    ),
}


def icon_svg(key: str, *, size: int = 20) -> str:
    """Inline SVG mark for section / domain keys."""
    paths = _ICON_PATHS.get(key) or _ICON_PATHS["default"]
    # Top star is fill-based; keep stroke icons crisp and perfectly boxed
    return (
        f'<svg class="icon-svg icon-svg--{html.escape(key)}" width="{size}" height="{size}" '
        f'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
        f'stroke-linecap="round" stroke-linejoin="round" focusable="false" '
        f'aria-hidden="true">{paths}</svg>'
    )


def icon_badge(key: str, *, size: int = 18) -> str:
    return (
        f'<span class="sec-icon sec-icon--{html.escape(key)}" aria-hidden="true">'
        f"{icon_svg(key, size=size)}</span>"
    )


def section_class(heading: str) -> str:
    key = section_icon_key(heading)
    mapping = {
        "top": "content-card content-card--top",
        "models": "content-card content-card--model",
        "creative": "content-card content-card--creative",
        "marketing": "content-card content-card--marketing",
        "tech": "content-card content-card--tech",
        "sns": "content-card content-card--sns",
        "action": "content-card content-card--action",
        "links": "content-card content-card--links",
        "note": "content-card content-card--note",
    }
    return mapping.get(key, "content-card")


def is_top5_heading(heading: str) -> bool:
    plain = strip_section_emoji(heading)
    return bool(re.search(r"Top\s*5|꼭\s*볼", plain, re.I))


def is_short_signal_heading(heading: str) -> bool:
    plain = strip_section_emoji(heading)
    if "짧게" in plain and "시그널" in plain:
        return True
    # Renamed internal pad (not a public category)
    if "내부 참고" in plain or "삭제 예정" in plain:
        return True
    return False


def is_action_heading(heading: str) -> bool:
    plain = strip_section_emoji(heading)
    return ("실무" in plain and "액션" in plain) or plain.strip().startswith("액션")


def cards_to_one_liner(cards: list[dict], *, max_items: int = 6, max_len: int = 220) -> str:
    """Compress action-style cards into a single desk line."""
    bits: list[str] = []
    for c in cards:
        t = re.sub(r"\s+", " ", (c.get("title") or "").strip())
        if not t or c.get("_raw"):
            continue
        t = re.sub(r"[:：]\s*$", "", t)
        # Prefer short title; drop trailing em-dash fluff if very long
        if len(t) > 42:
            t = t[:39].rstrip() + "…"
        bits.append(t)
        if len(bits) >= max_items:
            break
    line = " · ".join(bits)
    if len(line) > max_len:
        line = line[: max_len - 1].rstrip() + "…"
    return line


# domain key → keywords found in category section headings
DOMAIN_SECTION_KEYWORDS: dict[str, tuple[str, ...]] = {
    "models": ("모델", "플랫폼"),
    "agents": ("모델", "플랫폼"),
    "creative": ("콘텐츠", "크리에이티브", "제작"),
    "marketing": ("마케팅", "비즈니스"),
    "infra": ("테크", "인프라", "보안"),
    "policy": ("테크", "규제", "보안"),
}

# Short label shown on Top 5 index chips
DOMAIN_CHIP_LABEL: dict[str, str] = {
    "models": "모델 · 플랫폼",
    "agents": "모델 · 플랫폼",
    "creative": "콘텐츠 · 크리에이티브",
    "marketing": "마케팅 · 비즈니스",
    "infra": "테크 · 인프라",
    "policy": "규제 · 리스크",
}

# Optional explicit tags authors may put on Top 5 teasers
CAT_TAG_ALIASES: list[tuple[str, str]] = [
    (r"모델|플랫폼", "models"),
    (r"콘텐츠|크리에이티브|제작|영상|이미지", "creative"),
    (r"마케팅|비즈니스|GTM|가격", "marketing"),
    (r"규제|정책|리스크|소송", "policy"),
    (r"테크|인프라|보안|칩", "infra"),
    (r"SNS|루머|바이럴|트렌드", "agents"),
]


def _norm_card_title(t: str) -> str:
    t = re.sub(r"^\[[^\]]+\]\s*", "", (t or "").strip())
    t = re.sub(r"\s+", " ", t).lower()
    return t


def _card_blob(card: dict) -> str:
    parts = [card.get("title") or ""]
    parts.extend(card.get("bullets") or [])
    return " ".join(parts)


def parse_explicit_category(card: dict) -> str:
    """Read · 카테고리: … from card meta / title trail / bullets → domain key."""
    tag = (card.get("explicit_cat") or "").strip()
    if not tag:
        title = card.get("title") or ""
        m = re.search(r"(?:·|—|-)\s*카테고리\s*[:：]\s*(.+)$", title)
        if m:
            tag = m.group(1).strip()
            card["title"] = re.sub(r"\s*(?:·|—|-)\s*카테고리\s*[:：].*$", "", title).strip()
    if not tag:
        for b in list(card.get("bullets") or []):
            m = re.match(r"카테고리\s*[:：]\s*(.+)$", b.strip())
            if m:
                tag = m.group(1).strip()
                card["bullets"] = [x for x in card["bullets"] if x != b]
                break
    if not tag:
        return ""
    for pat, key in CAT_TAG_ALIASES:
        if re.search(pat, tag, re.I):
            return key
    return ""


def infer_card_domain(card: dict) -> str:
    """Prefer explicit tags, then strong topic cues, then generic scorer."""
    explicit = parse_explicit_category(card)
    if explicit:
        return explicit
    blob = _card_blob(card)
    low = blob.lower()
    # Security / infra / policy before generic "model" keyword hits
    if re.search(
        r"cyber|보안|암호|취약|제로데이|zero-?day|artifactory|cryptanalysis|"
        r"aes|hawk|pacing|속도\s*조절|kill\s*switch|샌드박스|침입|레드팀|"
        r"soc|appsec|msrc|export|수출\s*통제",
        low,
        re.I,
    ):
        if re.search(r"규제|정책|청원|정부|의회|pacing|속도\s*조절|소송|공정이용", blob, re.I):
            return "policy"
        return "infra"
    if re.search(r"seedance|runway|kling|midjourney|영상|이미지|크리에이티브|숏폼", low, re.I):
        return "creative"
    if re.search(r"가격|구독|gtm|파트너|캠퍼스|광고|세일즈|요금", blob, re.I):
        return "marketing"
    if re.search(r"\bcli\b|npm|sdk|api\b|changelog|codex|gpt-|claude|gemini", low, re.I):
        return "models"
    return primary_domain(blob, "")


def find_section_index_for_domain(sections: list, domain: str) -> int | None:
    keys = DOMAIN_SECTION_KEYWORDS.get(domain) or DOMAIN_SECTION_KEYWORDS["infra"]
    for i, (_sid, heading, _cards) in enumerate(sections):
        if is_top5_heading(heading):
            continue
        ik = section_icon_key(heading)
        if domain in ("infra", "policy") and ik == "tech":
            return i
        if domain in ("models", "agents") and ik == "models":
            return i
        if domain == "creative" and ik == "creative":
            return i
        if domain == "marketing" and ik == "marketing":
            return i
        if domain == "agents" and ik == "sns":
            return i
        plain = strip_section_emoji(heading)
        if any(k in plain for k in keys):
            return i
    # last resort: tech section for policy/infra/security stories
    for i, (_sid, heading, _cards) in enumerate(sections):
        if section_icon_key(heading) == "tech":
            return i
    return None


def _title_head(t: str) -> str:
    """Entity/product head before em-dash, en-dash, or colon."""
    for sep in (" — ", " – ", " - ", ":", "："):
        if sep in t:
            return t.split(sep, 1)[0].strip()
    return t[:40].strip()


def _title_tokens(t: str) -> set[str]:
    return set(re.findall(r"[a-z0-9][a-z0-9.+-]{1,}|[가-힣]{2,}", t))


def titles_match(a: str, b: str) -> bool:
    """
    True when two card titles are the same story (Top 5 teaser ↔ category body).
    Titles often differ slightly (wording, numbers) so match on head + token overlap.
    """
    na, nb = _norm_card_title(a), _norm_card_title(b)
    if not na or not nb:
        return False
    if na == nb:
        return True
    if na[:48] == nb[:48]:
        return True
    if len(na) >= 16 and (na in nb or nb in na):
        return True
    # Same product/entity head: "Gemini on macOS — …" vs "Gemini on macOS — …"
    ha, hb = _title_head(na), _title_head(nb)
    if ha and hb and len(ha) >= 8 and (ha == hb or ha in hb or hb in ha):
        return True
    ta, tb = _title_tokens(na), _title_tokens(nb)
    if not ta or not tb:
        return False
    inter = ta & tb
    if not inter:
        return False
    # Distinctive product / org tokens both share
    products = {
        "gemini", "chatgpt", "openai", "anthropic", "deepmind", "alphafold",
        "arc-agi", "arc", "agi", "gpt", "gpt-5", "gpt-5.6", "claude", "sol",
        "midjourney", "runway", "seedance", "kling", "codex", "suno",
        "elevenlabs", "higgsfield", "fal", "academic", "researchers",
    }
    shared_prod = inter & products
    if shared_prod and len(inter) >= 2:
        return True
    # General high overlap of meaningful tokens
    ratio = len(inter) / min(len(ta), len(tb))
    if len(inter) >= 3 and ratio >= 0.45:
        return True
    return False


def redistribute_top5(sections: list) -> list:
    """
    Top 5 is an index only (guide into category body cards).

    - Match each Top 5 teaser to an existing category card when possible.
    - Mark that body card with from_top5 (shows 「Top 5」 tag) — never clone a second card.
    - Clone into a category only when no matching body card exists (fallback).
    - Attach dest_* metadata so the Top 5 UI can deep-link into the body.
    """
    top_i = next((i for i, (_, h, _) in enumerate(sections) if is_top5_heading(h)), None)
    if top_i is None:
        return sections

    # Existing non-top titles for match (exclude prior Top 5 clones if re-run)
    existing: list[tuple[int, dict]] = []
    for i, (_sid, h, cards) in enumerate(sections):
        if is_top5_heading(h):
            continue
        for c in cards:
            if c.get("title") and not c.get("_raw"):
                existing.append((i, c))

    sid, heading, top_cards = sections[top_i]
    new_top: list[dict] = []
    for rank, card in enumerate(top_cards, 1):
        if card.get("_raw") or not card.get("title"):
            new_top.append(card)
            continue
        domain = infer_card_domain(card)
        dest_i = None
        dest_card = None
        # Prefer best title match among existing category cards
        for si, ec in existing:
            if titles_match(card["title"], ec.get("title") or ""):
                dest_i, dest_card = si, ec
                break
        if dest_card is None:
            # Short names can fall below titles_match's eight-character guard.
            # Reuse only a unique exact head with additional shared context;
            # an entity name alone must not merge different stories.
            norm_title = _norm_card_title(card["title"])
            head = _title_head(norm_title)
            head_tokens = _title_tokens(head)
            if 4 <= len(head) < 8 and head != norm_title:
                same_head = [
                    (si, ec) for si, ec in existing
                    if _title_head(_norm_card_title(ec.get("title") or "")) == head
                ]
                if len(same_head) == 1:
                    si, ec = same_head[0]
                    shared_context = (
                        _title_tokens(norm_title)
                        & _title_tokens(_norm_card_title(ec["title"]))
                    ) - head_tokens
                    if shared_context:
                        dest_i, dest_card = si, ec
        if dest_card is not None:
            # Reuse body card — tag it, do not clone a short duplicate
            dest_card["from_top5"] = True
            dest_card["top5_rank"] = rank
        else:
            dest_i = find_section_index_for_domain(sections, domain)
            if dest_i is not None:
                # No body yet: place full teaser once as the body card
                clone = {
                    "n": 0,
                    "title": card.get("title") or "",
                    "bullets": list(card.get("bullets") or []),
                    "why": card.get("why") or "",
                    "links": list(card.get("links") or []),
                    "reliability": card.get("reliability") or "",
                    "badge": card.get("badge") or "",
                    "from_top5": True,
                    "top5_rank": rank,
                }
                sections[dest_i][2].append(clone)
                dest_card = clone
                existing.append((dest_i, clone))

        dest_sid = sections[dest_i][0] if dest_i is not None else ""
        dest_label = DOMAIN_CHIP_LABEL.get(domain) or "브리프"
        if dest_i is not None and not DOMAIN_CHIP_LABEL.get(domain):
            dest_label = strip_section_emoji(sections[dest_i][1])
        # Chip color follows category semantics (not the destination section bucket).
        # e.g. policy chip stays red even when the full card lives under 테크 섹션.
        dest_icon = {
            "models": "models",
            "agents": "models",
            "creative": "creative",
            "marketing": "marketing",
            "infra": "tech",
            "policy": "policy",
        }.get(domain, "default")
        # Card index within destination section (1-based among real cards)
        dest_n = 0
        if dest_i is not None and dest_card is not None:
            n = 0
            for c in sections[dest_i][2]:
                if c.get("_raw") or not c.get("title"):
                    continue
                n += 1
                if c is dest_card or titles_match(c.get("title") or "", card["title"]):
                    dest_n = n
                    break

        teaser = {
            "n": card.get("n") or rank,
            "title": card.get("title") or "",
            "bullets": (card.get("bullets") or [])[:1],  # one-line blurb for index
            "why": "",
            "links": [],
            "reliability": "",
            "badge": card.get("badge") or "",
            "is_top_teaser": True,
            "dest_domain": domain,
            "dest_section_id": dest_sid,
            "dest_section_label": dest_label,
            "dest_icon": dest_icon,
            "dest_card_n": dest_n,
        }
        new_top.append(teaser)

    sections[top_i] = (sid, heading, new_top)
    return sections


def clean_toc(toc: str) -> str:
    toc = toc.strip()
    toc = re.sub(r'^<div class="toc">\s*', "", toc)
    toc = re.sub(r"\s*</div>\s*$", "", toc)
    return toc


def _strip(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).strip()


def _is_meta(text: str) -> bool:
    return bool(re.match(r"^(?:[-*•]\s*)?(반응|출처|상태|왜 중요한가|관련|신뢰도)\s*[:：]", text.strip()))


def _split_top_lis(inner: str) -> list[tuple[str, str]]:
    items = []
    i, n = 0, len(inner)
    while i < n:
        m = re.search(r"<li\b[^>]*>", inner[i:], re.I)
        if not m:
            break
        open_tag = m.group(0)
        start = i + m.end()
        depth, j = 1, start
        while j < n and depth:
            nxt = re.search(r"</?li\b[^>]*>", inner[j:], re.I)
            if not nxt:
                break
            token = nxt.group(0)
            pos, end = j + nxt.start(), j + nxt.end()
            if token.lower().startswith("</"):
                depth -= 1
                if depth == 0:
                    items.append((open_tag, inner[start:pos]))
                    i = end
                    break
                j = end
            else:
                depth += 1
                j = end
        else:
            break
    return items


def _flatten_nested(content: str) -> str:
    m = re.search(r"<(ul|ol)\b[^>]*>", content, re.I)
    if not m:
        return content
    tag = m.group(1)
    open_start, inner_start = m.start(), m.end()
    depth, j, n = 1, inner_start, len(content)
    while j < n and depth:
        nxt = re.search(r"</?(ul|ol)\b[^>]*>", content[j:], re.I)
        if not nxt:
            return content
        token = nxt.group(0)
        pos, end = j + nxt.start(), j + nxt.end()
        if token.startswith("</"):
            depth -= 1
            if depth == 0:
                nested = content[inner_start:pos]
                metas = []
                for _, ni in _split_top_lis(nested):
                    plain = _strip(ni)
                    cleaned = re.sub(r"^<p>(.*)</p>\s*$", r"\1", ni.strip(), flags=re.I | re.S)
                    if "item-meta" in ni or "item-main" in ni:
                        for b in re.findall(r'<div class="item-(?:main|meta)">(.*?)</div>', ni, re.I | re.S):
                            metas.append(f'<div class="item-meta">{b.strip()}</div>')
                    else:
                        metas.append(f'<div class="item-meta">{cleaned.strip()}</div>')
                return content[:open_start] + "".join(metas) + content[end:]
            j = end
        else:
            depth += 1
            j = end
    return content


def polish_story(content: str) -> str:
    content = _flatten_nested(content.strip())
    if "item-meta" in content and "item-main" not in content:
        parts = re.split(r'(?=<div class="item-meta")', content, maxsplit=1)
        if len(parts) == 2:
            main = re.sub(r"^<p>(.*)</p>\s*$", r"\1", parts[0].strip(), flags=re.I | re.S)
            return f'<div class="item-main">{main}</div>{parts[1]}'
    if re.search(r"<br\s*/?>", content, re.I) and "item-meta" not in content:
        parts = re.split(r"<br\s*/?>", content, flags=re.I)
        main, metas = [], []
        for i, p in enumerate(parts):
            raw = p.strip()
            plain = re.sub(r"^[\s\-–•*]+", "", _strip(raw)).strip()
            if i == 0 or not _is_meta(plain):
                main.append(raw)
            else:
                cleaned = re.sub(r"^[\s\-–•*]+", "", raw).strip()
                if cleaned:
                    metas.append(f'<div class="item-meta">{cleaned}</div>')
        if metas:
            mh = re.sub(r"^<p>(.*)</p>\s*$", r"\1", "<br />".join(main).strip(), flags=re.I | re.S)
            return f'<div class="item-main">{mh}</div>{"".join(metas)}'
    compact = re.sub(r"^<p>(.*)</p>\s*$", r"\1", content, flags=re.I | re.S)
    if "item-main" not in content:
        return f'<div class="item-main">{compact}</div>'
    return content


def coalesce_lists(html_body: str) -> str:
    def process_inner(inner: str) -> str:
        items = _split_top_lis(inner)
        if not items:
            return inner
        merged: list[tuple[str, str]] = []
        for open_tag, content in items:
            plain = _strip(content)
            has_nested = bool(re.search(r"<(ul|ol)\b", content, re.I))
            if merged and _is_meta(plain) and not has_nested and not re.search(r"<strong\b", content, re.I):
                po, pc = merged[-1]
                cleaned = re.sub(r"^<p>(.*)</p>\s*$", r"\1", content.strip(), flags=re.I | re.S)
                if "item-main" not in pc:
                    pc = polish_story(pc)
                merged[-1] = (po, pc + f'<div class="item-meta">{cleaned.strip()}</div>')
                continue
            content = polish_story(content)
            if "story-item" not in open_tag:
                open_tag = open_tag.replace("<li", '<li class="story-item"', 1) if "class=" not in open_tag else open_tag
            merged.append((open_tag, content))
        return "".join(f"{o}{c}</li>" for o, c in merged)

    out = html_body
    for _ in range(8):
        spans = []
        i, n = 0, len(out)
        while i < n:
            m = re.search(r"<(ul|ol)(\s[^>]*)?>", out[i:], re.I)
            if not m:
                break
            tag, attrs = m.group(1).lower(), m.group(2) or ""
            open_start, inner_start = i + m.start(), i + m.end()
            depth, j = 1, inner_start
            while j < n and depth:
                nxt = re.search(r"</?(ul|ol)\b[^>]*>", out[j:], re.I)
                if not nxt:
                    break
                token = nxt.group(0)
                pos, end = j + nxt.start(), j + nxt.end()
                if token.startswith("</"):
                    depth -= 1
                    if depth == 0:
                        spans.append((open_start, end, tag, attrs, out[inner_start:pos]))
                        i = end
                        break
                    j = end
                else:
                    depth += 1
                    j = end
            else:
                i = inner_start
        if not spans:
            break
        leaf = [s for s in spans if not re.search(r"<(ul|ol)\b", s[4], re.I)] or spans
        start, end, tag, attrs, inner = leaf[-1]
        new_inner = process_inner(inner)
        new_list = f"<{tag}{attrs}>{new_inner}</{tag}>"
        if out[start:end] == new_list:
            changed = False
            for s in reversed(spans):
                start, end, tag, attrs, inner = s
                new_inner = process_inner(inner)
                new_list = f"<{tag}{attrs}>{new_inner}</{tag}>"
                if out[start:end] != new_list:
                    out = out[:start] + new_list + out[end:]
                    changed = True
                    break
            if not changed:
                break
        else:
            out = out[:start] + new_list + out[end:]
    return out


def polish_prose_html(body: str) -> str:
    """Normalize links, drop status lines, fix reference tables for display."""
    # Remove "상태: ..." meta lines (including in list items)
    body = re.sub(
        r"(?is)<li[^>]*>\s*(?:<div class=\"item-(?:main|meta)\">)?\s*상태\s*[:：][\s\S]*?</li>\s*",
        "",
        body,
    )
    body = re.sub(
        r"(?is)<div class=\"item-meta\">\s*상태\s*[:：][\s\S]*?</div>\s*",
        "",
        body,
    )
    body = re.sub(r"(?m)^\s*[-*]\s*상태\s*[:：].*$", "", body)

    # Bare https text in table cells → short 원문 link
    def repl_cell(m: re.Match) -> str:
        url = m.group(2).rstrip(").,")
        return (
            f'{m.group(1)}'
            f'<a href="{html.escape(url)}" target="_blank" rel="noreferrer">원문</a>'
            f'{m.group(3)}'
        )

    body = re.sub(
        r"(<td[^>]*>)\s*(https://[^\s<]+)\s*(</td>)",
        repl_cell,
        body,
        flags=re.I,
    )

    # Wrap tables for horizontal scroll without vertical glyph stacking
    body = re.sub(
        r"(?is)(<table\b[\s\S]*?</table>)",
        r'<div class="table-wrap">\1</div>',
        body,
    )
    return body


def sectionize(body: str) -> str:
    body = coalesce_lists(body)
    body = polish_prose_html(body)
    parts = re.split(r"(<h2\b[^>]*>.*?</h2>)", body, flags=re.I | re.S)
    if len(parts) == 1:
        return f'<div class="prose-stack"><section class="content-card content-card--intro">{body}</section></div>'
    chunks = []
    if parts[0].strip():
        chunks.append(f'<section class="content-card content-card--intro">{parts[0]}</section>')
    for i in range(1, len(parts), 2):
        heading, content = parts[i], parts[i + 1] if i + 1 < len(parts) else ""
        cls = section_class(_strip(heading))
        chunks.append(f'<section class="{cls}">{heading}{content}</section>')
    return f'<div class="prose-stack">{"".join(chunks)}</div>'


def parse_signals_from_md(text: str) -> list[Signal]:
    signals: list[Signal] = []
    section = ""
    current: Optional[Signal] = None

    def flush():
        nonlocal current
        if current and current.title:
            blob = f"{current.title} {current.summary} {current.why}"
            # Exactly one domain per signal
            current.domains = [primary_domain(blob, section)]
            current.section = section
            current.companies = detect_companies(blob)
            signals.append(current)
        current = None

    for line in text.splitlines():
        if line.startswith("## "):
            flush()
            section = line[3:].strip()
            continue
        m = re.match(r"^(?:\d+\.|[-*])\s+\*\*(.+?)\*\*\s*[—–-]?\s*(.*)$", line)
        if m:
            flush()
            title = re.sub(r"\*\*", "", m.group(1)).strip()
            rest = m.group(2).strip()
            current = Signal(title=title, summary=re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", rest), section=section)
            for u in re.findall(r"\((https?://[^)]+)\)", line):
                current.urls.append(u)
            if "신뢰도" in line:
                rm = re.search(r"신뢰도[:：]\s*\**([^*\n,·]+)", line)
                if rm:
                    current.reliability = rm.group(1).strip()
            continue
        sm = re.match(r"^\s+[-*]\s+(.+)$", line)
        if sm and current:
            body = sm.group(1).strip()
            plain = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", re.sub(r"\*\*", "", body))
            if plain.startswith("왜 중요한가") or plain.startswith("실무"):
                current.why = re.sub(r"^(?:왜 중요한가|실무 메모)\s*[:：]\s*", "", plain)
            elif plain.startswith("출처") or "http" in body:
                for u in re.findall(r"\((https?://[^)]+)\)", body):
                    current.urls.append(u)
            elif plain.startswith("상태"):
                continue
            else:
                # accumulate detail bullets into summary for domain scoring
                if current.summary:
                    current.summary += " " + plain
                else:
                    current.summary = plain
    flush()

    # Second pass: ensure exclusive domain ownership of titles (no duplicate headlines)
    claimed: dict[str, str] = {}
    used: set[str] = set()
    # Prefer stronger section-aligned signals first
    ordered = sorted(
        signals,
        key=lambda s: score_domains(s.title + " " + s.summary).get(
            (s.domains or ["models"])[0], 0
        )
        + (4.0 if _section_domain_hint(s.section) else 0),
        reverse=True,
    )
    exclusive: list[Signal] = []
    for s in ordered:
        dom = (s.domains or [primary_domain(s.title, s.section)])[0]
        if s.title in used:
            continue
        if dom in claimed:
            # try next-best domain not claimed
            sc = score_domains(s.title + " " + s.summary)
            reassigned = None
            for d, _ in sc.most_common():
                if d not in claimed:
                    reassigned = d
                    break
            if reassigned is None:
                continue  # drop from multi-domain display pool; still in brief body
            dom = reassigned
        s.domains = [dom]
        claimed[dom] = s.title
        used.add(s.title)
        exclusive.append(s)
    # Keep all signals for brief content/company heat, but mark exclusive set order
    # Restore original order for listing, with updated single domains
    title_dom = {s.title: s.domains[0] for s in exclusive}
    for s in signals:
        if s.title in title_dom:
            s.domains = [title_dom[s.title]]
        else:
            # leftover signals keep primary only (may share domain, not headline slot)
            s.domains = [primary_domain(s.title + " " + s.summary, s.section)]
    return signals


def _md_links(s: str) -> list[tuple[str, str]]:
    return [(lab, url) for lab, url in re.findall(r"\[([^\]]+)\]\((https?://[^)]+)\)", s)]


def _strip_md_inline(s: str) -> str:
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
    s = re.sub(r"\*(.+?)\*", r"\1", s)
    s = re.sub(r"`([^`]+)`", r"\1", s)
    return s.strip()


def extract_theme(text: str) -> str:
    """Pull `주제:` line from brief markdown (edition headline)."""
    for line in text.splitlines()[:25]:
        m = re.match(r"^주제\s*[:：]\s*(.+)$", line.strip())
        if m:
            t = _strip_md_inline(m.group(1))
            t = re.sub(r"\s+", " ", t).strip()
            if t:
                return t
    return ""


def extract_theme_blurb(text: str) -> str:
    """Pull `주제 설명:` — plain-language gloss of the edition theme."""
    for line in text.splitlines()[:25]:
        m = re.match(r"^주제\s*설명\s*[:：]\s*(.+)$", line.strip())
        if m:
            t = _strip_md_inline(m.group(1))
            t = re.sub(r"\s+", " ", t).strip()
            if t:
                return t
    return ""


def render_card_news_body(
    text: str, *, theme: str = "", theme_blurb: str = "", date: str = ""
) -> tuple[str, str, list[str], list[dict]]:
    """Build card-news HTML from structured daily brief markdown.

    Returns (body_html, toc_html, top5_titles, search_items).
    """
    lines = text.splitlines()
    intro_bits: list[str] = []
    sections: list[tuple[str, str, list[dict]]] = []  # id, heading, cards
    current_h = ""
    current_id = ""
    cards: list[dict] = []
    cur: Optional[dict] = None
    past_h1 = False
    theme = theme or extract_theme(text)
    theme_blurb = theme_blurb or extract_theme_blurb(text)
    blurb_injected = False

    def flush_card():
        nonlocal cur
        if cur and cur.get("title"):
            cards.append(cur)
        cur = None

    def flush_section():
        nonlocal cards, current_h, current_id
        flush_card()
        if current_h:
            sections.append((current_id, current_h, cards))
        cards = []

    idx = 0
    for raw in lines:
        line = raw.rstrip()
        if line.startswith("# ") and not line.startswith("##"):
            past_h1 = True
            # Prefer witty edition theme as the visual H1; keep technical title as kicker
            if theme:
                if date:
                    intro_bits.append(
                        f'<p class="brief-edition">AI Daily · {html.escape(date)}</p>'
                    )
                intro_bits.append(f'<h1 id="brief-title">{html.escape(theme)}</h1>')
                if theme_blurb:
                    intro_bits.append(
                        f'<p class="brief-theme-blurb">{html.escape(theme_blurb)}</p>'
                    )
                    blurb_injected = True
            else:
                intro_bits.append(f'<h1 id="brief-title">{html.escape(line[2:].strip())}</h1>')
            continue
        if not past_h1:
            continue
        # Theme lines are already promoted into H1 / blurb — don't print again
        if re.match(r"^주제\s*설명\s*[:：]", line.strip()):
            continue
        if re.match(r"^주제\s*[:：]", line.strip()):
            continue
        # Optional one-line desk action under theme blurb
        am = re.match(r"^실무\s*액션\s*[:：]\s*(.+)$", line.strip())
        if am:
            intro_bits.append(
                f'<p class="brief-action"><span class="brief-action-label">실무 액션</span> '
                f"{html.escape(am.group(1).strip())}</p>"
            )
            continue
        if line.startswith("수집 시각:") or line.startswith("범위:"):
            intro_bits.append(f'<p class="brief-kicker">{html.escape(line)}</p>')
            continue
        if line.startswith(">"):
            # Prefer theme_blurb under the title; skip long axis note when blurb exists
            if blurb_injected:
                continue
            q = _strip_md_inline(re.sub(r"^>\s*", "", line))
            if q:
                intro_bits.append(f'<div class="brief-note">{html.escape(q)}</div>')
            continue
        if line.startswith("## "):
            flush_section()
            current_h = line[3:].strip()
            current_id = section_anchor(current_h) or f"sec-{len(sections)}"
            continue

        # new card head (supports · 카테고리: … after title for Top 5 index)
        m = re.match(
            r"^(?:\d+\.|[-*])\s+\*\*(.+?)\*\*\s*(.*)$",
            line,
        )
        if m and current_h and "참고 링크" not in current_h and "한계" not in current_h:
            flush_card()
            idx += 1
            title = _strip_md_inline(m.group(1))
            rest = (m.group(2) or "").strip()
            cur = {
                "n": idx,
                "title": title,
                "bullets": [],
                "why": "",
                "links": _md_links(line),
                "reliability": "",
                "explicit_cat": "",
            }
            # · 카테고리: 테크 · 인프라  (Top 5 index tag)
            cm = re.match(r"^(?:·|—|–|-)\s*카테고리\s*[:：]\s*(.+)$", rest)
            if cm:
                cur["explicit_cat"] = cm.group(1).strip()
                rest = ""
            elif rest.startswith("카테고리") and ("：" in rest or ":" in rest):
                cur["explicit_cat"] = re.split(r"[:：]", rest, 1)[-1].strip()
                rest = ""
            if rest and not rest.startswith("http"):
                # optional one-liner after em dash → treat as bullet if short
                plain = _strip_md_inline(re.sub(r"^[—–-]\s*", "", rest))
                if plain and len(plain) < 120:
                    cur["bullets"].append(plain)
            if "신뢰도" in line:
                rm = re.search(r"신뢰도[:：]\s*\**([^*\n·|]+)", line)
                if rm:
                    cur["reliability"] = rm.group(1).strip()
            # badge from title tags
            bm = re.match(r"^\[([^\]]+)\]\s*", title)
            cur["badge"] = bm.group(1) if bm else ""
            if bm:
                cur["title"] = title[bm.end() :].strip()
            continue

        sm = re.match(r"^\s+[-*]\s+(.+)$", line)
        if sm and cur is not None:
            body = sm.group(1).strip()
            if body.startswith("상태"):
                continue
            plain = _strip_md_inline(body)
            links = _md_links(body)
            if links:
                cur["links"].extend(links)
            if "신뢰도" in body:
                rm = re.search(r"신뢰도[:：]\s*\**([^*\n·|]+)", body)
                if rm:
                    cur["reliability"] = rm.group(1).strip()
            if plain.startswith("왜 중요한가") or plain.startswith("실무 메모") or plain.startswith("한 줄"):
                # fold into summary bullets (no separate "why" box)
                folded = re.sub(
                    r"^(?:왜 중요한가|실무 메모|한 줄)\s*[:：]\s*",
                    "",
                    plain,
                ).strip()
                if folded:
                    cur["bullets"].append(folded)
            elif plain.startswith("출처"):
                pass  # links already captured
            else:
                plain = re.sub(r"^출처[:：]\s*", "", plain)
                if plain and not plain.startswith("http"):
                    cur["bullets"].append(plain)
            continue

        # reference table / limits: fall back to markdown chunk later
        if current_h and ("참고 링크" in current_h or "한계" in current_h):
            # accumulate raw for md convert
            if not cards or cards[-1].get("_raw") is None:
                flush_card()
                cards.append({"_raw": []})
            if cards and "_raw" in cards[-1]:
                cards[-1]["_raw"].append(line)

    flush_section()

    # Top 5 = index only; full stories live under category sections
    sections = redistribute_top5(sections)

    # Pull 실무 액션 → one desk line under theme blurb
    action_line = ""
    for _sid, heading, sec_cards in sections:
        if is_action_heading(heading):
            action_line = cards_to_one_liner(sec_cards)
            break
    if action_line:
        intro_bits.append(
            f'<p class="brief-action"><span class="brief-action-label">실무 액션</span> '
            f"{html.escape(action_line)}</p>"
        )

    # Pull 짧게 남긴 시그널 → internal scratch notes (not a TOC category)
    scratch_cards: list[dict] = []
    for _sid, heading, sec_cards in sections:
        if is_short_signal_heading(heading):
            scratch_cards = [
                c for c in sec_cards if (c.get("title") or c.get("_raw")) and not c.get("_raw")
            ]
            # also keep raw-less title cards
            scratch_cards = [c for c in sec_cards if c.get("title") and not c.get("_raw")]
            break

    # Build HTML + deep-search units
    toc_items = []
    search_items: list[dict] = []
    parts = ['<div class="prose-stack">']
    parts.append(
        f'<section class="content-card content-card--intro brief-intro">{"".join(intro_bits)}</section>'
    )

    for sid, heading, sec_cards in sections:
        # Drop dedicated categories: 실무 액션 / 짧게 남긴 시그널
        if is_action_heading(heading) or is_short_signal_heading(heading):
            continue

        cls = section_class(heading)
        anchor = sid
        ikey = section_icon_key(heading)
        label = strip_section_emoji(heading)
        badge = icon_badge(ikey, size=16)
        toc_items.append(
            f'<li><a href="#{html.escape(anchor)}" data-icon="{html.escape(ikey)}">'
            f'{badge}<span class="toc-label">{html.escape(label)}</span></a></li>'
        )
        parts.append(
            f'<section class="{cls} news-section" id="{html.escape(anchor)}" data-icon="{html.escape(ikey)}">'
        )
        parts.append(
            f'<h2 class="news-section-title">{icon_badge(ikey, size=20)}'
            f'<span class="sec-title-text">{html.escape(label)}</span></h2>'
        )

        # —— Top 5: compact index with category chips (guide into sections) ——
        # Use div (not ol) so generic content-card list CSS cannot hide/wipe it.
        if is_top5_heading(heading):
            teasers = [c for c in sec_cards if c.get("title") and not c.get("_raw")]
            if not teasers:
                parts.append('<p class="news-empty">항목 없음</p></section>')
                continue
            parts.append(
                '<p class="top-index-lead">'
                "오늘 가장 중요한 시그널 5건입니다. "
                "상세·출처는 아래 카테고리 본문에서 읽고, "
                "카테고리 칩 또는 「본문 보기」로 바로 이동합니다."
                "</p>"
            )
            parts.append('<div class="top-index" role="list">')
            for i, c in enumerate(teasers, 1):
                title = c.get("title") or ""
                cat_label = c.get("dest_section_label") or "카테고리"
                dest_sid = c.get("dest_section_id") or ""
                dest_icon = c.get("dest_icon") or "default"
                dest_n = int(c.get("dest_card_n") or 0)
                if dest_sid and dest_n:
                    href = f"#{card_anchor(dest_sid, dest_n)}"
                elif dest_sid:
                    href = f"#{dest_sid}"
                else:
                    href = "#brief-title"
                blurb = ""
                if c.get("bullets"):
                    blurb = c["bullets"][0]
                    if len(blurb) > 140:
                        blurb = blurb[:137].rstrip() + "…"
                blurb_html = (
                    f'<p class="top-index-blurb">{html.escape(blurb)}</p>' if blurb else ""
                )
                badge_t = c.get("badge") or ""
                badge_html = (
                    f'<span class="news-badge">{html.escape(badge_t)}</span>' if badge_t else ""
                )
                parts.append(
                    f"""
        <div class="top-index-item" role="listitem">
          <span class="top-index-num" aria-hidden="true">{i}</span>
          <div class="top-index-body">
            <div class="top-index-row">
              {badge_html}
              <a class="top-index-title" href="{html.escape(href)}">{html.escape(title)}</a>
              <a class="top-index-cat top-index-cat--{html.escape(dest_icon)}" href="#{html.escape(dest_sid)}" title="섹션으로 이동">{html.escape(cat_label)}</a>
            </div>
            {blurb_html}
            <a class="top-index-go" href="{html.escape(href)}">본문 보기 →</a>
          </div>
        </div>"""
                )
                search_items.append(
                    {
                        "section": label,
                        "sectionId": anchor,
                        "cardId": card_anchor(anchor, i),
                        "title": title,
                        "snippet": blurb or title,
                        "text": re.sub(r"\s+", " ", f"{title} {blurb} {cat_label}").strip(),
                        "n": i,
                    }
                )
            parts.append("</div></section>")
            continue

        # raw fallback (links table / limits)
        if sec_cards and sec_cards[0].get("_raw") is not None:
            raw_md = "\n".join(sum((c.get("_raw") or [] for c in sec_cards), []))
            MD.reset()
            raw_html = polish_prose_html(MD.convert(raw_md if raw_md.strip() else " "))
            parts.append(raw_html)
            parts.append("</section>")
            continue

        real_cards = [c for c in sec_cards if c.get("title") and not c.get("_raw")]
        if not real_cards:
            parts.append('<p class="news-empty">항목 없음</p></section>')
            continue

        parts.append('<div class="news-grid">')
        for i, c in enumerate(real_cards, 1):
            rel = c.get("reliability") or ""
            badge = c.get("badge") or ""
            rel_cls = "rel-official"
            if "보도" in rel:
                rel_cls = "rel-press"
            elif "커뮤니티" in rel:
                rel_cls = "rel-community"
            elif "루머" in rel:
                rel_cls = "rel-rumor"
            if "루머" in badge:
                rel_cls = "rel-rumor"
            elif "바이럴" in badge:
                rel_cls = "rel-viral"

            bullets = list(c.get("bullets") or [])[:8]
            bullets_html = "".join(f"<li>{html.escape(b)}</li>" for b in bullets)
            seen_u = set()
            link_chips = []
            for lab, url in c.get("links") or []:
                if url in seen_u:
                    continue
                seen_u.add(url)
                lab = lab if lab and not lab.startswith("http") else "원문"
                if len(lab) > 18:
                    lab = "원문"
                link_chips.append(
                    f'<a class="news-chip" href="{html.escape(url)}" target="_blank" rel="noreferrer">{html.escape(lab)}</a>'
                )
            chips = "".join(link_chips)
            if rel:
                chips += f'<span class="news-chip news-chip-muted">{html.escape(rel)}</span>'

            badge_html = f'<span class="news-badge">{html.escape(badge)}</span>' if badge else ""
            # Top 5 index points here — show tag on body card only (no second card)
            top5_tag = ""
            if c.get("from_top5"):
                rank = c.get("top5_rank")
                rank_txt = f"Top {int(rank)}" if rank else "Top 5"
                top5_tag = f'<span class="news-chip news-chip-top5">{html.escape(rank_txt)}</span>'
            cid = card_anchor(anchor, i)
            title = c.get("title") or ""
            parts.append(
                f"""
        <article class="news-card {rel_cls}" id="{html.escape(cid)}" data-card-id="{html.escape(cid)}">
          <div class="news-card-top">
            <span class="news-num">{i:02d}</span>
            {top5_tag}
            {badge_html}
          </div>
          <h3 class="news-title">{html.escape(title)}</h3>
          <ul class="news-bullets">{bullets_html}</ul>
          <div class="news-footer">{chips}</div>
        </article>"""
            )
            blob = " ".join([title, *bullets])
            snippet = bullets[0] if bullets else title
            if len(snippet) > 160:
                snippet = snippet[:157].rstrip() + "…"
            search_items.append(
                {
                    "section": label,
                    "sectionId": anchor,
                    "cardId": cid,
                    "title": title,
                    "snippet": snippet,
                    "text": re.sub(r"\s+", " ", blob).strip(),
                    "n": i,
                }
            )
        parts.append("</div></section>")

    # Internal scratch pad (not a category / not in TOC)
    if scratch_cards:
        parts.append(
            '<details class="brief-scratch">'
            "<summary>내부 참고 · 짧게 남긴 시그널 "
            '<span class="brief-scratch-hint">확인·해결되면 삭제</span></summary>'
            '<ul class="brief-scratch-list">'
        )
        for c in scratch_cards:
            title = html.escape(c.get("title") or "")
            blurb = ""
            if c.get("bullets"):
                blurb = html.escape(c["bullets"][0])
            link_bits = []
            for lab, url in (c.get("links") or [])[:3]:
                link_bits.append(
                    f'<a href="{html.escape(url)}" target="_blank" rel="noreferrer">'
                    f"{html.escape(lab if lab and not lab.startswith('http') else '원문')}</a>"
                )
            extra = f" — {blurb}" if blurb else ""
            links = (" · " + " · ".join(link_bits)) if link_bits else ""
            parts.append(f"<li><strong>{title}</strong>{extra}{links}</li>")
        parts.append("</ul></details>")

    parts.append("</div>")
    toc = "<ul>" + "".join(toc_items) + "</ul>" if toc_items else ""
    top5_titles = []
    for _sid, heading, sec_cards in sections:
        if is_top5_heading(heading):
            for c in sec_cards:
                if c.get("title"):
                    top5_titles.append(c["title"])
    return "".join(parts), toc, top5_titles, search_items


def parse_md_brief(path: Path) -> Optional[Brief]:
    m = re.search(r"(\d{4}-\d{2}-\d{2})", path.name)
    if not m:
        return None
    date = m.group(1)
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    title, collected, scope, excerpt = "AI Daily Brief", "", "", ""
    top5, sections = [], []
    theme = extract_theme(text)
    theme_blurb = extract_theme_blurb(text)
    for line in lines[:25]:
        if line.startswith("# "):
            title = line[2:].strip()
        elif line.startswith("수집 시각:"):
            collected = line.split(":", 1)[1].strip()
        elif line.startswith("범위:"):
            scope = line.split(":", 1)[1].strip()
        elif line.startswith(">") and not excerpt:
            excerpt = re.sub(r"^>\s*", "", line)
            excerpt = re.sub(r"\*\*(.+?)\*\*", r"\1", excerpt)
    for line in lines:
        sm = re.match(r"^##\s+(.+)$", line)
        if sm:
            sections.append(sm.group(1).strip())

    body, toc, top5_from_cards, search_items = render_card_news_body(
        text, theme=theme, theme_blurb=theme_blurb, date=date
    )
    top5 = top5_from_cards[:5]
    signals = parse_signals_from_md(text)
    # Brief-level domains = unique primary domains of its signals (each signal one domain)
    domains = sorted({(s.domains or ["models"])[0] for s in signals}) or [
        primary_domain(title + " " + excerpt)
    ]
    # Weighted mentions from full markdown (not just unique presence)
    c_counts = detect_company_counts(text)
    # Boost companies that appear in Top5 / signal titles
    for t in top5:
        for c, n in detect_company_counts(t).items():
            c_counts[c] += max(2, n)  # headline weight
    for s in signals:
        for c in s.companies:
            c_counts[_normalize_company(c)] += 1
    companies = [name for name, _ in c_counts.most_common(16)]

    return Brief(
        date=date,
        path=path,
        title=title,
        collected_at=collected,
        scope=scope,
        excerpt=excerpt[:280],
        theme=theme,
        theme_blurb=theme_blurb,
        top5=top5[:5],
        sections=sections,
        signals=signals,
        domains=domains,
        companies=companies,
        company_counts=dict(c_counts),
        has_rumor=bool(re.search(r"\[루머\]|신뢰도:\s*\*?\*?루머", text)),
        body_html=body,
        toc_html=toc,
        search_items=search_items,
        source="md",
    )


def parse_legacy_stub(path: Path) -> Optional[Brief]:
    m = re.search(r"(\d{4}-\d{2}-\d{2})", path.name)
    if not m:
        return None
    date = m.group(1)
    text = path.read_text(encoding="utf-8", errors="ignore")
    title_m = re.search(r"<title>([^<]+)</title>", text, re.I)
    lead_m = re.search(r'<p class="lead">([\s\S]*?)</p>', text, re.I)
    title = re.sub(r"<[^>]+>", "", title_m.group(1)).strip() if title_m else f"AI Brief | {date}"
    excerpt = re.sub(r"<[^>]+>", " ", lead_m.group(1)).strip() if lead_m else ""
    excerpt = re.sub(r"\s+", " ", excerpt)[:260]
    # Headlines from old platform cards + Pulse stubs
    tops = re.findall(r'class="card-title">([^<]+)', text)[:8]
    if not tops:
        tops = re.findall(r"<h3>([^<]+)</h3>", text)[:8]
    # Full-page plain text for company heat (legacy pages have many card bodies)
    plain = html_to_plain(text)
    c_counts = detect_company_counts(plain)
    # Headline mentions get extra weight
    for t in tops:
        for c, n in detect_company_counts(t).items():
            c_counts[c] += max(2, n)
    companies = [name for name, _ in c_counts.most_common(16)]
    domains = detect_domains(title + " " + excerpt + " " + " ".join(tops) + " " + plain[:2000])
    return Brief(
        date=date,
        path=path,
        title=title,
        excerpt=excerpt,
        top5=tops[:5],
        domains=domains,
        companies=companies,
        company_counts=dict(c_counts),
        source="legacy",
        is_stub=True,
        body_html="",
        toc_html="",
    )


def load_briefs() -> list[Brief]:
    """Only daily markdown briefs (no legacy archive stubs)."""
    by_date: dict[str, Brief] = {}
    if BRIEFS_MD.exists():
        for p in sorted(BRIEFS_MD.glob("AI-Daily-*.md")):
            b = parse_md_brief(p)
            if b:
                by_date[b.date] = b
    return sorted(by_date.values(), key=lambda b: b.date, reverse=True)


def shell(
    title: str,
    body: str,
    *,
    active: str = "home",
    description: str = "",
    root_prefix: str = "",
    header_center: str = "",
) -> str:
    """root_prefix: '' for top pages, '../' for brief/* pages.
    header_center: optional HTML (e.g. date nav) placed between brand and site nav.
    """
    rp = root_prefix
    desc = description or "AI 변화의 흐름을 읽고, 실무 시그널을 잡는 인텔리전스 데스크"
    center_block = f"\n      {header_center.strip()}\n" if header_center.strip() else "\n"
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(desc)}" />
  <meta name="theme-color" content="#f5f5f7" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <link rel="stylesheet" href="{rp}assets/styles.css?v=20260806a" />
</head>
<body class="{"page-brief" if active == "brief" else f"page-{active}"}">
  <div class="read-progress" aria-hidden="true"><i></i></div>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="{rp}index.html">
        <div class="brand-mark" aria-hidden="true">{icon_svg("action", size=16)}</div>
        <div class="brand-text">
          <strong>AI Pulse</strong>
          <span>Intelligence Desk</span>
        </div>
      </a>{center_block}      <nav class="nav">
        <a href="{rp}index.html" class="{"active" if active == "home" else ""}">홈</a>
        <a href="{rp}archive.html" class="{"active" if active == "archive" else ""}">아카이브</a>
        <a href="{rp}biscuits.html" class="nav-biscuit{" active" if active == "biscuits" else ""}">비스킷</a>
      </nav>
    </div>
  </header>
  <main class="main">
{body}
  </main>
  <footer class="footer">
    AI Pulse · 매일 자동 수집 · 모델·에이전트·크리에이티브·마케팅·인프라·규제의 흐름을 한곳에서
  </footer>
  <button type="button" class="back-to-top" aria-label="맨 위로" title="맨 위로">↑</button>
  <script src="{rp}assets/app.js?v=20260805b"></script>
  <script src="{rp}assets/biscuits.js?v=20260806a"></script>
</body>
</html>
"""


def _parse_brief_date(b: Brief) -> date | None:
    try:
        return datetime.strptime(b.date, "%Y-%m-%d").date()
    except ValueError:
        return None


def briefs_in_company_heat_window(
    briefs: list[Brief], *, days: int = COMPANY_HEAT_DAYS
) -> tuple[list[Brief], date | None, date | None]:
    """Return briefs whose date is within the last `days` days (inclusive).

    Anchor = latest brief date in the set (not wall-clock today), so a weekend
    rebuild still reflects the most recent desk window.
    """
    dated: list[tuple[date, Brief]] = []
    for b in briefs:
        d = _parse_brief_date(b)
        if d:
            dated.append((d, b))
    if not dated:
        return [], None, None
    anchor = max(d for d, _ in dated)
    start = anchor - timedelta(days=days - 1)
    windowed = [b for d, b in dated if start <= d <= anchor]
    return windowed, start, anchor


def aggregate(briefs: list[Brief]) -> dict:
    domain_counts: Counter = Counter()
    company_counts: Counter = Counter()
    theme_counter: Counter = Counter()

    heat_briefs, heat_start, heat_end = briefs_in_company_heat_window(briefs)
    heat_dates = {b.date for b in heat_briefs}

    for b in briefs:
        # Count each signal once under its single primary domain (all-time archive)
        if b.signals:
            for s in b.signals:
                d = (s.domains or [primary_domain(s.title, s.section)])[0]
                domain_counts[d] += 1
        else:
            for d in b.domains:
                domain_counts[d] += 1
        for t in b.top5:
            key = re.sub(r"\s+", " ", t)[:60]
            theme_counter[key] += 1

        # Company / product heat: last N days only
        if b.date not in heat_dates:
            continue
        if b.company_counts:
            for c, n in b.company_counts.items():
                company_counts[_normalize_company(c)] += max(1, int(n))
        else:
            for c in b.companies:
                company_counts[_normalize_company(c)] += 1

    return {
        "domain_counts": domain_counts,
        "company_counts": company_counts,
        "themes": theme_counter,
        "company_heat_days": COMPANY_HEAT_DAYS,
        "company_heat_start": heat_start.isoformat() if heat_start else "",
        "company_heat_end": heat_end.isoformat() if heat_end else "",
        "company_heat_brief_count": len(heat_briefs),
    }


def exclusive_domain_blurbs(brief: Brief) -> dict[str, str]:
    """Map domain -> one exclusive headline for landscape/flow (no duplicates)."""
    items: list[tuple[str, str]] = []
    # Prefer already-assigned signal primaries
    for s in brief.signals:
        items.append((s.title, s.section or ""))
    for t in brief.top5:
        items.append((t, ""))
    return assign_exclusive_headlines(items)


# Home landscape domain → brief section id when no matching card is found
DOMAIN_SECTION_FALLBACK = {
    "models": "모델-플랫폼",
    "agents": "sns-트렌드-루머-바이럴",
    "creative": "콘텐츠-제작-크리에이티브",
    "marketing": "마케팅-비즈니스",
    "infra": "테크-인프라-규제-보안",
    "policy": "테크-인프라-규제-보안",
}


def _normalize_headline(title: str) -> str:
    t = re.sub(r"\s+", " ", (title or "").strip())
    t = re.sub(r"^\[[^\]]+\]\s*", "", t).strip()  # strip [후속] etc.
    return t


def landscape_domain_hrefs(brief: Brief, blurbs: dict[str, str]) -> dict[str, str]:
    """
    Map domain key → deep link into the brief page.
    Prefers the news card that matches the landscape headline; falls back to section.
    """
    # title → #cardId (or sectionId)
    title_frag: dict[str, str] = {}
    for it in brief.search_items or []:
        title = _normalize_headline(it.get("title") or "")
        if not title:
            continue
        frag = (it.get("cardId") or it.get("sectionId") or "").strip()
        if frag:
            title_frag[title] = frag

    def match_frag(title: str) -> str:
        t = _normalize_headline(title)
        if not t:
            return ""
        if t in title_frag:
            return title_frag[t]
        # prefix / containment match (Top5 titles can be slightly longer)
        for k, frag in title_frag.items():
            if t[:48] == k[:48] or t in k or k in t:
                return frag
        return ""

    links: dict[str, str] = {}

    # 1) Landscape exclusive headlines (same text as domain card blurbs)
    for domain, title in blurbs.items():
        frag = match_frag(title)
        if frag:
            links[domain] = f"{brief.url}#{frag}"

    # 2) Signals with exclusive primary domain (fill gaps)
    for s in brief.signals or []:
        domain = (s.domains or [None])[0]
        if not domain or domain in links:
            continue
        frag = match_frag(s.title)
        if frag:
            links[domain] = f"{brief.url}#{frag}"
            continue
        # Section from signal heading if known
        if s.section:
            sid = section_anchor(s.section)
            if sid:
                links[domain] = f"{brief.url}#{sid}"

    # 3) Static section fallback for remaining home domains
    for domain, sec_id in DOMAIN_SECTION_FALLBACK.items():
        if domain not in links:
            links[domain] = f"{brief.url}#{sec_id}"

    return links


def write_home(briefs: list[Brief], agg: dict) -> None:
    full = [b for b in briefs if not b.is_stub]
    latest = full[0] if full else (briefs[0] if briefs else None)
    if not latest:
        body = """
    <section class="hero-panel">
      <div class="eyebrow"><span class="dot"></span> AI Pulse</div>
      <h1>아직 브리프가 없습니다</h1>
      <p class="lead">매일 아침 자동 수집이 시작되면 여기에 흐름이 쌓입니다.</p>
    </section>
"""
        (PUBLIC / "index.html").write_text(shell("AI Pulse", body), encoding="utf-8")
        return

    blurbs = exclusive_domain_blurbs(latest) if not latest.is_stub else {}
    domain_hrefs = (
        landscape_domain_hrefs(latest, blurbs) if not latest.is_stub else {}
    )
    # Map home domains → icon keys (agents/infra/policy have dedicated marks)
    domain_icon = {
        "models": "models",
        "agents": "agents",
        "creative": "creative",
        "marketing": "marketing",
        "infra": "infra",
        "policy": "policy",
    }
    domain_cards = []
    for key, (label, desc) in DOMAIN_META.items():
        n = agg["domain_counts"].get(key, 0)
        blurb = blurbs.get(key) or desc
        ik = domain_icon.get(key, "default")
        href = domain_hrefs.get(key) or latest.url
        domain_cards.append(
            f"""
      <a class="domain-card" data-domain="{key}" href="{html.escape(href)}">
        <div class="domain-card-top">
          {icon_badge(ik, size=20)}
          <div class="kicker">{html.escape(key)}</div>
        </div>
        <h3>{html.escape(label)}</h3>
        <p class="desc">{html.escape(blurb[:110])}</p>
        <div class="meta"><span>시그널</span><strong>{n}</strong></div>
      </a>"""
        )

    # Company heat (rolling window) — home heat panel only; Top5 lives on the feature card
    companies = agg["company_counts"].most_common(10)
    max_c = companies[0][1] if companies else 1
    heat = []
    for name, cnt in companies:
        pct = int(round(100 * cnt / max_c)) if max_c else 0
        heat.append(
            f"""<div class="heat-row"><div class="label"><span>{html.escape(name)}</span><b>{cnt}</b></div><div class="bar"><i style="width:{pct}%"></i></div></div>"""
        )

    # Domain cumulative counts (distinct from landscape “today” blurbs)
    domain_total = max(agg["domain_counts"].values()) if agg["domain_counts"] else 1
    domain_heat = []
    for key, (label, _) in DOMAIN_META.items():
        cnt = agg["domain_counts"].get(key, 0)
        pct = int(round(100 * cnt / domain_total)) if domain_total else 0
        short = label.split(" · ")[0]
        domain_heat.append(
            f"""<div class="heat-row"><div class="label"><span>{html.escape(short)}</span><b>{cnt}</b></div><div class="bar bar--domain"><i style="width:{pct}%"></i></div></div>"""
        )

    top_list = ""
    if latest.top5:
        lis = "".join(
            f'<li><span class="n">{i}</span><span>{html.escape(t)}</span></li>'
            for i, t in enumerate(latest.top5, 1)
        )
        top_list = f'<ol class="top-stack">{lis}</ol>'
    elif latest.signals:
        lis = "".join(
            f'<li><span class="n">{i}</span><span>{html.escape(s.title)}</span></li>'
            for i, s in enumerate(latest.signals[:5], 1)
        )
        top_list = f'<ol class="top-stack">{lis}</ol>'

    rumor_pill = '<span class="pill rose">루머 포함</span>' if latest.has_rumor else ""
    timeline = []
    for b in briefs[:8]:
        preview = html.escape(
            b.edition_blurb or (b.top5[0] if b.top5 else b.title)
        )
        timeline.append(
            f"""
      <a class="tl-item" href="{b.url}">
        <div class="tl-date">{html.escape(b.date)}</div>
        <div>
          <h4>{html.escape(b.edition_title)}{" · 요약" if b.is_stub else ""}</h4>
          <p>{preview}</p>
        </div>
      </a>"""
        )

    # Today's biscuits: ranked from latest brief (creative terms first)
    latest_md = (
        (latest.path.read_text(encoding="utf-8") if latest.path.exists() else "")
        + "\n"
        + (latest.theme or "")
        + "\n"
        + (latest.theme_blurb or "")
        + "\n"
        + "\n".join(latest.top5 or [])
    )
    latest_biscuit_ids = rank_biscuit_ids_for_home(latest_md)
    ticker = home_ticker_html(latest_biscuit_ids, brief_date=latest.date)

    body = f"""
    <section class="hero-panel hero-panel--split">
      <div class="hero-panel-main">
        <div class="eyebrow"><span class="dot"></span> Live desk · 매일 자동 업데이트</div>
        <h1>AI 변화의 흐름을<br/>한눈에 읽는 데스크</h1>
        <p class="lead">
          모델·에이전트·크리에이티브·마케팅·인프라·규제 신호를 모아<br/>
          “지금 어디에 힘이 실리는지”를 빠르게 파악합니다.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="{latest.url}">최신 브리프 읽기 →</a>
          <a class="btn btn-ghost" href="archive.html">아카이브</a>
        </div>
      </div>
      {ticker}
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>AI 랜드스케이프</h2>
          <p>6개 축 · 오늘 대표 시그널 · 클릭 시 해당 카드·섹션으로 이동</p>
        </div>
        <a href="{latest.url}">브리프 보기 →</a>
      </div>
      <div class="landscape-grid">
        {''.join(domain_cards)}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>최신 데일리 브리프</h2>
          <p>{html.escape(latest.display_date)} · Top 시그널</p>
        </div>
        <a href="{latest.url}">전체 보기 →</a>
      </div>
      <a class="feature-card" href="{latest.url}">
        <div class="meta-row">
          <span class="pill">Latest</span>
          <span class="pill muted">{html.escape(latest.display_date)}</span>
          {f'<span class="pill muted">{html.escape(latest.collected_at)}</span>' if latest.collected_at else ''}
          {rumor_pill}
        </div>
        <h3>{html.escape(latest.edition_title)}</h3>
        <p class="excerpt">{html.escape(latest.edition_blurb or latest.excerpt)}</p>
        {top_list}
        <div class="feature-cta"><span>브리프 열기</span><span>→</span></div>
      </a>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>관심 히트 · 최근 {agg.get('company_heat_days', 7)}일</h2>
          <p>{html.escape(agg.get('company_heat_start') or '—')} ~ {html.escape(agg.get('company_heat_end') or '—')} · 브리프 {agg.get('company_heat_brief_count', 0)}건 집계</p>
        </div>
        <a href="archive.html">아카이브 →</a>
      </div>
      <div class="signal-board signal-board--heat">
        <div class="panel">
          <h3>주목 기업 · 제품</h3>
          <p class="panel-sub">언급량 상위 · 최근 {agg.get('company_heat_days', 7)}일 롤링</p>
          <div class="heat-bars">
            {''.join(heat) if heat else '<p class="heat-empty">히트맵 데이터 부족</p>'}
          </div>
        </div>
        <div class="panel">
          <h3>도메인 누적 시그널</h3>
          <p class="panel-sub">전체 아카이브 기준 · 축별 카드 수</p>
          <div class="heat-bars">
            {''.join(domain_heat) if domain_heat else '<p class="heat-empty">도메인 데이터 부족</p>'}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>타임라인</h2>
          <p>최근 브리프 흐름</p>
        </div>
        <a href="archive.html">전체 아카이브 →</a>
      </div>
      <div class="timeline">
        {''.join(timeline)}
      </div>
    </section>
"""
    (PUBLIC / "index.html").write_text(
        shell(
            "AI Pulse · Intelligence Desk",
            body,
            description=latest.excerpt or latest.edition_title or latest.title,
        ),
        encoding="utf-8",
    )


def write_archive(briefs: list[Brief]) -> None:
    chips = ['<button class="chip active" type="button" data-filter="all">전체</button>']
    for key, (label, _) in DOMAIN_META.items():
        chips.append(f'<button class="chip" type="button" data-filter="{key}">{html.escape(label.split(" · ")[0])}</button>')

    cards = []
    for b in briefs:
        tags = []
        for d in b.domains[:3]:
            tags.append(f'<span class="tag">{html.escape(DOMAIN_META.get(d, (d, ""))[0].split(" · ")[0])}</span>')
        if b.has_rumor:
            tags.append('<span class="tag rumor">루머</span>')
        if b.top5:
            tags.append('<span class="tag hot">Top</span>')
        if b.is_stub:
            tags.append('<span class="tag">레거시</span>')
        # Include card titles + body text so edition cards stay filterable offline
        body_blob = " ".join(
            f"{it.get('title', '')} {it.get('text', '')}" for it in (b.search_items or [])
        )
        search = html.escape(
            " ".join(
                [
                    b.title,
                    b.theme,
                    b.theme_blurb,
                    b.edition_title,
                    b.edition_blurb,
                    b.excerpt,
                    *b.top5,
                    *b.companies,
                    *b.domains,
                    body_blob,
                ]
            )
        )
        domains = html.escape(" ".join(b.domains))
        href = b.url if not b.is_stub else f"brief/{b.date}.html"
        # Preview under theme: explain what the theme means (not a raw news dump)
        blurb = b.edition_blurb
        preview = html.escape(re.sub(r"\s+", " ", blurb)[:160]) if blurb else html.escape(b.title)
        cards.append(
            f"""
      <a class="archive-card" href="{href}" data-archive-card data-date="{html.escape(b.date)}" data-search="{search}" data-domains="{domains}">
        <div class="date">{html.escape(b.date)} · {html.escape(b.display_date)}</div>
        <h3>{html.escape(b.edition_title)}</h3>
        <p>{preview}</p>
        <div class="tags">{''.join(tags)}</div>
      </a>"""
        )

    body = f"""
    <section class="flow-hero">
      <div class="eyebrow">Archive</div>
      <h1>전체 아카이브</h1>
      <p>날짜별 에디션 주제로 훑고, 본문 키워드로 카드 단위까지 검색한 뒤 해당 위치로 바로 이동할 수 있습니다.</p>
    </section>
    <div class="toolbar">
      <div class="search">
        <input id="archive-search" type="search" placeholder="본문·제목·기업 검색… (⌘K)" autocomplete="off" />
      </div>
      <div class="filters">
        {''.join(chips)}
      </div>
    </div>
    <div id="search-empty" class="empty hidden">검색 결과가 없습니다.</div>
    <section id="search-hits" class="search-hits hidden" aria-live="polite">
      <div class="section-head">
        <div>
          <h2>본문 검색 결과</h2>
          <p id="search-hits-meta">카드 제목·요약에서 일치한 항목</p>
        </div>
      </div>
      <div class="hit-controls" role="toolbar" aria-label="검색 결과 정렬·필터">
        <div class="hit-control-group">
          <span class="hit-control-label">정렬</span>
          <div class="hit-sorts" id="hit-sorts">
            <button type="button" class="chip chip-sm active" data-sort="relevance">관련도</button>
            <button type="button" class="chip chip-sm" data-sort="newest">최신순</button>
            <button type="button" class="chip chip-sm" data-sort="oldest">오래된순</button>
            <button type="button" class="chip chip-sm" data-sort="title">제목순</button>
          </div>
        </div>
        <div class="hit-control-group">
          <span class="hit-control-label">섹션</span>
          <div class="hit-sections" id="hit-sections">
            <button type="button" class="chip chip-sm active" data-section="all">전체</button>
            <button type="button" class="chip chip-sm" data-section="top">Top 5</button>
            <button type="button" class="chip chip-sm" data-section="models">모델</button>
            <button type="button" class="chip chip-sm" data-section="creative">콘텐츠</button>
            <button type="button" class="chip chip-sm" data-section="marketing">마케팅</button>
            <button type="button" class="chip chip-sm" data-section="tech">테크·규제</button>
            <button type="button" class="chip chip-sm" data-section="sns">SNS</button>
            <button type="button" class="chip chip-sm" data-section="action">실무 액션</button>
          </div>
        </div>
      </div>
      <div id="search-hits-list" class="search-hits-list"></div>
    </section>
    <div class="section-head archive-editions-head">
      <div>
        <h2>에디션</h2>
        <p id="editions-meta">날짜별 브리프</p>
      </div>
      <div class="hit-control-group editions-sort" role="group" aria-label="에디션 정렬">
        <span class="hit-control-label">정렬</span>
        <div class="hit-sorts" id="edition-sorts">
          <button type="button" class="chip chip-sm active" data-edition-sort="newest">최신순</button>
          <button type="button" class="chip chip-sm" data-edition-sort="oldest">오래된순</button>
          <button type="button" class="chip chip-sm" data-edition-sort="title">제목순</button>
        </div>
      </div>
    </div>
    <div class="archive-grid">
      {''.join(cards) if cards else '<div class="empty">브리프가 없습니다.</div>'}
    </div>
"""
    (PUBLIC / "archive.html").write_text(
        shell("아카이브 · AI Pulse", body, active="archive"),
        encoding="utf-8",
    )


def _brief_date_picker_html(briefs: list[Brief], current_date: str) -> str:
    """Dropdown options for jumping to any full (non-stub) brief edition."""
    options: list[str] = []
    for b in briefs:
        if b.is_stub:
            continue
        is_cur = b.date == current_date
        cls = "brief-date-option is-current" if is_cur else "brief-date-option"
        selected = "true" if is_cur else "false"
        title = html.escape(b.edition_title)
        options.append(
            f'<a class="{cls}" role="option" href="{html.escape(b.date)}.html" '
            f'data-date="{html.escape(b.date)}" aria-selected="{selected}">'
            f'<span class="brief-date-option-date">{html.escape(b.display_date)}</span>'
            f'<span class="brief-date-option-title">{title}</span>'
            f"</a>"
        )
    return "\n      ".join(options)


def _brief_sticky_nav_html(
    *,
    current: Brief,
    prev_link: str,
    next_link: str,
    picker_options: str,
) -> str:
    """Header-center date control: prev/next arrows + clickable date picker."""
    picker_id = f"brief-date-picker-{current.date}"
    return f"""<nav class="brief-nav" aria-label="브리프 날짜 이동" data-current-date="{html.escape(current.date)}">
        {prev_link}
        <div class="brief-nav-date-wrap">
          <button type="button" class="brief-nav-date" aria-haspopup="listbox"
            aria-expanded="false" aria-controls="{picker_id}"
            title="다른 날짜 선택" aria-label="현재 {html.escape(current.display_date)}. 클릭하여 날짜 선택">
            <span class="brief-nav-date-text">{html.escape(current.display_date)}</span>
          </button>
          <div class="brief-date-picker" id="{picker_id}" role="listbox"
            aria-label="브리프 날짜 목록" hidden>
      {picker_options}
          </div>
        </div>
        {next_link}
      </nav>"""


def write_brief_pages(briefs: list[Brief]) -> None:
    BRIEF_OUT.mkdir(parents=True, exist_ok=True)
    full_indices = [i for i, b in enumerate(briefs) if not b.is_stub]
    picker_cache = {
        b.date: _brief_date_picker_html(briefs, b.date)
        for b in briefs
        if not b.is_stub
    }

    for i, b in enumerate(briefs):
        # navigation among full briefs primarily
        older = next((briefs[j] for j in range(i + 1, len(briefs)) if not briefs[j].is_stub), None)
        newer = next((briefs[j] for j in range(i - 1, -1, -1) if not briefs[j].is_stub), None)

        if b.is_stub:
            # lightweight legacy page
            tops = "".join(f"<li>{html.escape(t)}</li>" for t in b.top5) or "<li>상세 카드는 레거시 원문 형식입니다.</li>"
            body = f"""
    <div class="brief-nav brief-nav--legacy">
      <a href="../archive.html">← 아카이브</a>
    </div>
    <article class="brief-article">
      <div class="brief-meta">
        <span class="pill">{html.escape(b.display_date)}</span>
        <span class="pill muted">레거시 브리프</span>
      </div>
      <div class="prose-stack">
        <section class="content-card content-card--intro">
          <h1>{html.escape(b.title)}</h1>
          <p>{html.escape(b.excerpt)}</p>
          <p style="margin-top:12px;color:var(--text-3);font-size:14px">이 날짜는 이전 플랫폼 형식의 요약입니다. 2026-07-14 이후 브리프부터 새로운 Pulse 풀 리포트 포맷이 적용됩니다.</p>
        </section>
        <section class="content-card content-card--top">
          <h2>주요 헤드라인</h2>
          <ul>{tops}</ul>
        </section>
      </div>
    </article>
"""
            page = shell(
                f"{b.edition_title} · AI Pulse",
                body,
                active="archive",
                root_prefix="../",
            )
            (BRIEF_OUT / f"{b.date}.html").write_text(page, encoding="utf-8")
            continue

        if older:
            prev_tip = html.escape(f"{older.date} · {older.edition_title}")
            prev_link = (
                f'<a class="brief-nav-arrow" href="{older.date}.html" '
                f'title="{prev_tip}" aria-label="이전 브리프: {prev_tip}">‹</a>'
            )
        else:
            prev_link = '<span class="brief-nav-arrow is-disabled" aria-hidden="true">‹</span>'
        if newer:
            next_tip = html.escape(f"{newer.date} · {newer.edition_title}")
            next_link = (
                f'<a class="brief-nav-arrow" href="{newer.date}.html" '
                f'title="{next_tip}" aria-label="다음 브리프: {next_tip}">›</a>'
            )
        else:
            next_link = '<span class="brief-nav-arrow is-disabled" aria-hidden="true">›</span>'
        toc = b.toc_html if b.toc_html and "li" in b.toc_html else "<ul></ul>"
        meta = [
            f'<span class="pill">{html.escape(b.display_date)}</span>',
        ]
        if b.collected_at:
            meta.append(f'<span class="pill muted">수집 {html.escape(b.collected_at)}</span>')
        if b.scope:
            meta.append(f'<span class="pill muted">{html.escape(b.scope)}</span>')
        for d in b.domains[:4]:
            meta.append(f'<span class="pill teal">{html.escape(DOMAIN_META.get(d, (d, ""))[0].split(" · ")[0])}</span>')
        if b.has_rumor:
            meta.append('<span class="pill rose">루머 포함</span>')

        header_nav = _brief_sticky_nav_html(
            current=b,
            prev_link=prev_link,
            next_link=next_link,
            picker_options=picker_cache.get(b.date, ""),
        )

        # Inline biscuits + related strip (terms harvested from this brief)
        body_html, term_ids = link_biscuits_in_html(b.body_html or "")
        if not term_ids and b.path.exists():
            term_ids = harvest_biscuit_ids(b.path.read_text(encoding="utf-8"))
        related = related_biscuits_section_html(term_ids, root_prefix="../")
        if related:
            if body_html.rstrip().endswith("</div>"):
                stripped = body_html.rstrip()
                body_html = stripped[: -len("</div>")] + related + "</div>"
            else:
                body_html = body_html + related
            if "related-biscuits" not in toc:
                if "</ul>" in toc:
                    toc = toc.replace("</ul>", toc_related_item_html() + "</ul>", 1)
                else:
                    toc = "<ul>" + toc_related_item_html() + "</ul>"

        body = f"""
    <div class="brief-layout">
      <aside class="toc-panel">
        <h2>목차</h2>
        <nav>{toc}</nav>
      </aside>
      <article class="brief-article">
        <div class="brief-meta">{''.join(meta)}</div>
        {body_html}
      </article>
    </div>
"""
        page = shell(
            f"{b.edition_title} · AI Pulse",
            body,
            active="brief",
            description=b.excerpt or b.edition_title or b.title,
            root_prefix="../",
            header_center=header_nav,
        )
        (BRIEF_OUT / f"{b.date}.html").write_text(page, encoding="utf-8")


def write_biscuits_page() -> None:
    """Dictionary page: client fills cards from assets/biscuits.js."""
    body = biscuits_page_body_html()
    page = shell(
        "비스킷 · AI Pulse",
        body,
        active="biscuits",
        description="브리프에 나온 AI 용어를 한입 크기로 설명합니다.",
    )
    (PUBLIC / "biscuits.html").write_text(page, encoding="utf-8")


def write_data(briefs: list[Brief], agg: dict) -> None:
    DATA_OUT.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "platform": "AI Pulse",
        "count": len(briefs),
        "domains": {k: DOMAIN_META[k][0] for k in DOMAIN_META},
        "domain_counts": dict(agg["domain_counts"]),
        "companies": agg["company_counts"].most_common(40),
        "company_heat": {
            "days": agg.get("company_heat_days", COMPANY_HEAT_DAYS),
            "start": agg.get("company_heat_start", ""),
            "end": agg.get("company_heat_end", ""),
            "brief_count": agg.get("company_heat_brief_count", 0),
        },
        "briefs": [
            {
                "date": b.date,
                "title": b.title,
                "theme": b.theme,
                "theme_blurb": b.theme_blurb,
                "edition_title": b.edition_title,
                "edition_blurb": b.edition_blurb,
                "url": b.url,
                "excerpt": b.excerpt,
                "top5": b.top5,
                "domains": b.domains,
                "companies": b.companies,
                "has_rumor": b.has_rumor,
                "source": b.source,
                "stub": b.is_stub,
            }
            for b in briefs
        ],
    }
    (DATA_OUT / "index.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Deep search index: one entry per news card (title + body bullets)
    search_payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "count": 0,
        "items": [],
    }
    items = []
    for b in briefs:
        if b.is_stub:
            continue
        for it in b.search_items or []:
            items.append(
                {
                    "date": b.date,
                    "displayDate": b.display_date,
                    "briefTitle": b.edition_title,
                    "briefUrl": b.url,
                    "section": it.get("section") or "",
                    "sectionId": it.get("sectionId") or "",
                    "cardId": it.get("cardId") or "",
                    "title": it.get("title") or "",
                    "snippet": it.get("snippet") or "",
                    "text": it.get("text") or "",
                    "domains": b.domains,
                    "href": f"{b.url}#{it.get('cardId') or it.get('sectionId') or ''}",
                }
            )
    search_payload["items"] = items
    search_payload["count"] = len(items)
    (DATA_OUT / "search.json").write_text(
        json.dumps(search_payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    md_out = DATA_OUT / "md"
    md_out.mkdir(exist_ok=True)
    if BRIEFS_MD.exists():
        for p in BRIEFS_MD.glob("*.md"):
            shutil.copy2(p, md_out / p.name)


def _patch_biscuits_js_latest(js_path: Path, date: str, term_ids: list[str]) -> None:
    """Keep client LATEST_BRIEF fallback in sync with the newest brief."""
    if not js_path.is_file():
        return
    text = js_path.read_text(encoding="utf-8")
    ids_json = json.dumps(term_ids, ensure_ascii=False)
    block = (
        "const LATEST_BRIEF = {\n"
        f'    date: "{date}",\n'
        f"    termIds: {ids_json}\n"
        "  };"
    )
    new_text, n = re.subn(
        r"const LATEST_BRIEF = \{[\s\S]*?\};",
        block,
        text,
        count=1,
    )
    if n:
        js_path.write_text(new_text, encoding="utf-8")


def _write_biscuit_ops(briefs: list[Brief]) -> None:
    """
    After each build:
    - rank home biscuits from latest brief
    - scan for new biscuit candidates (not yet in catalog)
    - write data/biscuits-runtime.json + logs/biscuit-candidates-*.md
    - patch biscuits.js LATEST_BRIEF fallback
    """
    latest = next((b for b in briefs if not getattr(b, "is_stub", False)), None)
    if not latest:
        return
    text = ""
    if latest.path.exists():
        text = latest.path.read_text(encoding="utf-8")
    text = (
        text
        + "\n"
        + (latest.theme or "")
        + "\n"
        + (getattr(latest, "theme_blurb", None) or latest.excerpt or "")
        + "\n"
        + "\n".join(latest.top5 or [])
    )
    ranked = rank_biscuit_ids_for_home(text)
    all_matched = list(harvest_biscuit_counts(text).keys())
    candidates = suggest_biscuit_candidates(text, brief_date=latest.date)

    write_biscuit_runtime(
        DATA_OUT,
        brief_date=latest.date,
        term_ids=ranked,
        candidates=candidates,
        all_ids=all_matched,
    )
    logs_dir = BASE / "logs"
    write_biscuit_candidates_log(
        logs_dir / f"biscuit-candidates-{latest.date}.md",
        brief_date=latest.date,
        candidates=candidates,
    )
    write_biscuit_candidates_log(
        logs_dir / "biscuit-candidates-latest.md",
        brief_date=latest.date,
        candidates=candidates,
    )
    # Also mirror candidates into public data for optional UI later
    (DATA_OUT / "biscuit-candidates.json").write_text(
        json.dumps(
            {"date": latest.date, "candidates": candidates},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    _patch_biscuits_js_latest(ASSETS_OUT / "biscuits.js", latest.date, ranked)
    # Build output owns the runtime fallback; keep source assets unchanged.

    print(f"  home biscuits ({latest.date}): {', '.join(ranked) if ranked else '—'}")
    if candidates:
        preview = ", ".join(c["term"] for c in candidates[:10])
        more = f" (+{len(candidates) - 10})" if len(candidates) > 10 else ""
        print(f"  biscuit candidates: {preview}{more}")
        print(f"  → logs/biscuit-candidates-latest.md")
    else:
        print("  biscuit candidates: (none)")


def build() -> list[Brief]:
    if PUBLIC.exists():
        # clean generated outputs but keep structure
        for child in PUBLIC.iterdir():
            if child.name == ".git":
                continue
            if child.is_dir():
                shutil.rmtree(child)
            else:
                child.unlink()
    PUBLIC.mkdir(parents=True, exist_ok=True)
    ASSETS_OUT.mkdir(parents=True, exist_ok=True)
    BRIEF_OUT.mkdir(parents=True, exist_ok=True)
    DATA_OUT.mkdir(parents=True, exist_ok=True)

    for f in ASSETS_SRC.iterdir():
        if f.is_file():
            shutil.copy2(f, ASSETS_OUT / f.name)

    briefs = load_briefs()
    agg = aggregate(briefs)
    write_home(briefs, agg)
    write_archive(briefs)
    write_brief_pages(briefs)
    write_biscuits_page()
    write_data(briefs, agg)
    _write_biscuit_ops(briefs)
    # remove retired pages if present
    for retired in ("flow.html",):
        p = PUBLIC / retired
        if p.exists():
            p.unlink()

    # latest redirect-ish
    full = next((b for b in briefs if not b.is_stub), None)
    if full:
        (PUBLIC / "latest.html").write_text(
            shell(
                "Latest · AI Pulse",
                f'<p>이동 중… <a href="{full.url}">{html.escape(full.title)}</a></p>'
                f'<meta http-equiv="refresh" content="0; url={full.url}" />',
            ),
            encoding="utf-8",
        )

    print(f"Built AI Pulse · {len(briefs)} briefs → {PUBLIC}")
    for b in briefs[:6]:
        flag = "stub" if b.is_stub else "full"
        print(f"  [{flag}] {b.date}: {b.title[:60]}")
    return briefs


if __name__ == "__main__":
    build()
