"""
AI Biscuits — build-time helpers (link terms, harvest mentions, candidates).
Client UI/art lives in assets/biscuits.js (keep ids in sync).
"""

from __future__ import annotations

import html
import json
import re
from collections import Counter
from pathlib import Path
from typing import Iterable, Optional

# Max times each term is highlighted in one brief page
MAX_HITS_PER_TERM = 3

# Home ticker: how many biscuits to show from today's brief
HOME_TICKER_MAX = 6

# Tag used for home ranking boost (must match biscuits.js tag ids)
CREATIVE_TAGS = frozenset({"creative", "work"})

# id → rough tag for ranking (keep in sync with biscuits.js)
_BISCUIT_TAGS: dict[str, str] = {
    "cli": "basics",
    "api": "basics",
    "prompt": "basics",
    "token": "basics",
    "context": "model",
    "moe": "model",
    "open-weight": "model",
    "agent": "work",
    "harness": "model",
    "hallucination": "risk",
    "fp8": "model",
    "t2v": "creative",
    "i2v": "creative",
    "r2v": "creative",
    "native-audio": "creative",
    "keyframe": "creative",
    "lip-sync": "creative",
    "draft-mode": "creative",
    "upscale": "creative",
    "multi-shot": "creative",
    "video-continuation": "creative",
    "character-ip": "creative",
    "ai-influencer": "creative",
    "short-drama": "creative",
    "lora": "creative",
    "reference-image": "creative",
    "multimodal": "model",
    "early-access": "basics",
    "deepfake": "risk",
    "zdr": "work",
    "guardrail": "risk",
    "credits": "work",
    "rag": "work",
    "sandbox": "work",
    "watermark": "risk",
    "ga": "basics",
    "mcp": "work",
    "hdr": "creative",
    "asr": "creative",
    "wer": "creative",
    "cot": "model",
    "mhs": "work",
    "inpaint": "creative",
    "outpaint": "creative",
    "maas": "work",
    "world-model": "model",
    "diarization": "creative",
    "recurrent-depth": "model",
    "preparedness-framework": "risk",
    "intelligence-index": "model",
    "misalignment": "risk",
    "lean": "model",
    "c2pa": "risk",
    "ctf": "risk",
    "vla": "model",
    "ppa": "work",
    "ivo": "risk",
    "distillation": "risk",
    "full-duplex": "creative"
}

# (id, list of regex patterns). Longer / more specific first within each term.
# Ids must match assets/biscuits.js BISCUITS[].id
_BISCUIT_PATTERNS: list[tuple[str, list[re.Pattern[str]]]] = [
    # —— creative (specific first) ——
    (
        "video-continuation",
        [
            re.compile(r"Video\s*Continuation", re.I),
            re.compile(r"비디오\s*컨티뉴에이션"),
            re.compile(r"영상\s*이어\s*쓰기"),
            re.compile(r"컨티뉴에이션"),
        ],
    ),
    (
        "native-audio",
        [
            re.compile(r"네이티브\s*오디오"),
            re.compile(r"native\s*audio", re.I),
        ],
    ),
    (
        "draft-mode",
        [
            re.compile(r"Draft\s*Mode", re.I),
            re.compile(r"Draft\s*모드", re.I),
            re.compile(r"드래프트\s*모드"),
        ],
    ),
    (
        "text-to-video-skip",  # placeholder removed below
        [],
    ),
    (
        "t2v",
        [
            re.compile(r"Text[-\s]?to[-\s]?Video", re.I),
            re.compile(r"텍스트[-\s]?투[-\s]?비디오"),
            re.compile(r"텍스트→영상"),
            re.compile(r"(?<![A-Za-z])T2V(?![A-Za-z])"),
        ],
    ),
    (
        "i2v",
        [
            re.compile(r"Image[-\s]?to[-\s]?Video", re.I),
            re.compile(r"이미지[-\s]?투[-\s]?비디오"),
            re.compile(r"이미지→영상"),
            re.compile(r"(?<![A-Za-z])I2V(?![A-Za-z])"),
        ],
    ),
    (
        "lip-sync",
        [
            re.compile(r"립\s*싱크"),
            re.compile(r"lip[-\s]?sync(?:ing)?", re.I),
        ],
    ),
    (
        "keyframe",
        [
            re.compile(r"키\s*프레임"),
            re.compile(r"keyframes?", re.I),
        ],
    ),
    (
        "multi-shot",
        [
            re.compile(r"멀티\s*샷"),
            re.compile(r"multi[-\s]?shots?", re.I),
            re.compile(r"다중\s*샷"),
        ],
    ),
    (
        "upscale",
        [
            re.compile(r"업\s*스케일"),
            re.compile(r"upscal(?:e|ing)", re.I),
        ],
    ),
    (
        "character-ip",
        [
            re.compile(r"캐릭터\s*IP"),
            re.compile(r"character\s*IP", re.I),
            re.compile(r"가상\s*캐릭터\s*IP"),
        ],
    ),
    (
        "ai-influencer",
        [
            re.compile(r"AI\s*인플루언서", re.I),
            re.compile(r"가상\s*인플루언서"),
            re.compile(r"virtual\s*influencers?", re.I),
            re.compile(r"AI\s*influencers?", re.I),
        ],
    ),
    (
        "short-drama",
        [
            re.compile(r"AI\s*숏\s*드라마"),
            re.compile(r"숏\s*드라마"),
            re.compile(r"AI\s*short\s*dramas?", re.I),
            re.compile(r"short\s*dramas?", re.I),
        ],
    ),
    (
        "reference-image",
        [
            re.compile(r"레퍼런스\s*이미지"),
            re.compile(r"reference\s*images?", re.I),
            re.compile(r"참조\s*이미지"),
        ],
    ),
    (
        "lora",
        [
            re.compile(r"\bLoRAs?\b"),
            re.compile(r"로라\b"),
        ],
    ),
    (
        "multimodal",
        [
            re.compile(r"멀티\s*모달"),
            re.compile(r"multi[-\s]?modal", re.I),
        ],
    ),
    (
        "early-access",
        [
            re.compile(r"얼리\s*액세스"),
            re.compile(r"early\s*access", re.I),
            re.compile(r"클로즈드\s*베타"),
            re.compile(r"closed\s*beta", re.I),
            re.compile(r"(?<![가-힣A-Za-z])베타(?![가-힣A-Za-z])"),
            re.compile(r"\bbeta\b", re.I),
        ],
    ),
    (
        "deepfake",
        [
            re.compile(r"딥\s*페이크"),
            re.compile(r"deepfakes?", re.I),
        ],
    ),
    (
        "credits",
        [
            re.compile(r"크레딧"),
            re.compile(r"\bcredits\b", re.I),
        ],
    ),
    (
        "harness",
        [
            re.compile(r"에이전트\s*하네스"),
            re.compile(r"코딩\s*하네스"),
            re.compile(r"오픈\s*하네스"),
            re.compile(r"하네스"),
            re.compile(r"agent\s*harness(?:es)?", re.I),
            re.compile(r"coding\s*harness(?:es)?", re.I),
            re.compile(r"(?<![A-Za-z])harness(?:es)?(?![A-Za-z])", re.I),
        ],
    ),
    # —— core (existing) ——
    (
        "open-weight",
        [
            re.compile(r"오픈\s*웨이트"),
            re.compile(r"open[-\s]?weights?", re.I),
        ],
    ),
    (
        "context",
        [
            re.compile(r"컨텍스트\s*창"),
            re.compile(r"context\s*windows?", re.I),
        ],
    ),
    (
        "hallucination",
        [
            re.compile(r"할루시네이션"),
            re.compile(r"hallucinations?", re.I),
        ],
    ),
    (
        "prompt",
        [
            re.compile(r"프롬프트"),
            re.compile(r"\bprompts?\b", re.I),
        ],
    ),
    (
        "agent",
        [
            re.compile(r"에이전틱"),
            re.compile(r"에이전트"),
            re.compile(r"\bagentic\b", re.I),
            re.compile(r"\bagents?\b", re.I),
        ],
    ),
    (
        "token",
        [
            re.compile(r"\bMTok\b"),
            re.compile(r"토큰"),
            re.compile(r"\btokens?\b", re.I),
        ],
    ),
    (
        "moe",
        [
            re.compile(r"\bMoE\b"),
            re.compile(r"Mixture of Experts", re.I),
        ],
    ),
    (
        "fp8",
        [re.compile(r"\bFP8\b")],
    ),
    (
        "cli",
        [re.compile(r"\bCLI\b")],
    ),
    (
        "api",
        [re.compile(r"(?<![A-Za-z])API(?![A-Za-z])")],
    ),
]

# drop empty placeholder if any
_BISCUIT_PATTERNS = [(bid, pats) for bid, pats in _BISCUIT_PATTERNS if pats]

# Additional catalog entries recovered from the published 59-card catalog.
# The original server-side source was not published; use explicit names and
# established aliases, not generic words such as "speech", "전사", or "정식".
# ASCII boundaries let acronyms take Korean particles without matching inside
# longer English words or identifiers (e.g. MCP는, but not MCProvider).
def _term_pattern(english: str, korean: str = "", *, flags: int = 0) -> re.Pattern[str]:
    bounded = rf"(?<![A-Za-z0-9_])(?:{english})(?![A-Za-z0-9_])"
    return re.compile(rf"(?:{bounded}|{korean})" if korean else bounded, flags)


_BISCUIT_PATTERNS.extend([
    ("r2v", [_term_pattern(r"R2V|Reference[-\s]+to[-\s]+Video", r"참조[-\s]*투[-\s]*비디오", flags=re.I)]),
    ("zdr", [_term_pattern(r"ZDR|Zero[-\s]+Data[-\s]+Retention", r"제로\s*데이터\s*리텐션", flags=re.I)]),
    ("guardrail", [_term_pattern(r"guardrails?", r"가드\s*레일", flags=re.I)]),
    ("rag", [_term_pattern(r"RAG|Retrieval[-\s]+Augmented[-\s]+Generation", r"검색\s*증강(?:\s*생성)?")]),
    ("sandbox", [_term_pattern(r"sandboxes|sandbox", r"샌드\s*박스", flags=re.I)]),
    ("watermark", [_term_pattern(r"watermarks?|watermarking", r"워터\s*마크", flags=re.I)]),
    ("ga", [_term_pattern(r"GA|Generally\s+Available|General\s+Availability", r"정식\s*공개")]),
    ("mcp", [_term_pattern(r"MCP|Model\s+Context\s+Protocol", r"모델\s*컨텍스트\s*프로토콜")]),
    ("hdr", [_term_pattern(r"HDR|High\s+Dynamic\s+Range", r"하이\s*다이내믹\s*레인지")]),
    ("asr", [_term_pattern(r"ASR|Automatic\s+Speech\s+Recognition", r"자동\s*음성\s*인식")]),
    ("wer", [_term_pattern(r"WER|Word\s+Error\s+Rate", r"단어\s*오류율")]),
    ("cot", [_term_pattern(r"CoT|Chain[-\s]+of[-\s]+Thought", r"연쇄\s*사고")]),
    ("mhs", [_term_pattern(r"MHS|Model\s+Hardware\s+Standard", r"모델\s*하드웨어\s*(?:스탠더드|표준)")]),
    ("inpaint", [_term_pattern(r"inpaint(?:ing)?", r"인\s*페인팅", flags=re.I)]),
    ("outpaint", [_term_pattern(r"outpaint(?:ing)?", r"아웃\s*페인팅", flags=re.I)]),
    ("maas", [_term_pattern(r"MaaS|Model[-\s]+as[-\s]+a[-\s]+Service")]),
    ("world-model", [_term_pattern(r"world[-\s]+models?", r"월드\s*모델", flags=re.I)]),
    ("diarization", [_term_pattern(r"(?:speaker\s+)?diari[sz]ation", r"화자\s*분리", flags=re.I)]),
    ("recurrent-depth", [_term_pattern(r"recurrent[-\s]+depth", flags=re.I)]),
    ("preparedness-framework", [_term_pattern(r"Preparedness\s+Framework", r"준비도\s*프레임워크")]),
    ("intelligence-index", [_term_pattern(r"Intelligence\s+Index", r"지능\s*지수")]),
    ("misalignment", [_term_pattern(r"misalignment", r"오정렬", flags=re.I)]),
    ("lean", [_term_pattern(r"Lean(?:\s+4)?")]),
    ("c2pa", [_term_pattern(r"C2PA|Coalition\s+for\s+Content\s+Provenance\s+and\s+Authenticity")]),
    ("ctf", [_term_pattern(r"CTF|Capture[-\s]+the[-\s]+Flag")]),
    ("vla", [_term_pattern(r"VLA|Vision[-\s]+Language[-\s]+Action")]),
    ("ppa", [_term_pattern(r"PPA|Power\s+Purchase\s+Agreement", r"전력\s*구매\s*계약")]),
    ("ivo", [_term_pattern(r"IVO|Independent\s+Verification\s+Organi[sz]ation", r"독립\s*검증\s*기관")]),
    ("distillation", [_term_pattern(r"distillation", r"증류", flags=re.I)]),
    ("full-duplex", [_term_pattern(r"full[-\s]+duplex", r"풀\s*듀플렉스", flags=re.I)]),
])

# Known creative / product jargon to flag as biscuit candidates when not in catalog
_CANDIDATE_WATCH: list[tuple[re.Pattern[str], str, str]] = [
    (re.compile(r"\bControlNet\b", re.I), "ControlNet", "이미지 조건 제어 네트워크"),
    (re.compile(r"\bIP[-\s]?Adapter\b", re.I), "IP-Adapter", "레퍼런스 얼굴·스타일 유지"),
    (re.compile(r"\bComfyUI\b", re.I), "ComfyUI", "노드 기반 생성 워크플로 UI"),
    (re.compile(r"\bAutomatic1111\b|\bA1111\b", re.I), "A1111", "스테이블 디퓨전 웹 UI"),
    (re.compile(r"\bSeedance\b", re.I), "Seedance", "ByteDance 영상 생성 모델"),
    (re.compile(r"\bSeedream\b", re.I), "Seedream", "ByteDance 이미지 생성 모델"),
    (re.compile(r"\bFLUX\.?\s*3\b|\bFLUX\s*3\b", re.I), "FLUX 3", "BFL 멀티모달·영상 모델"),
    (re.compile(r"\bKling\b", re.I), "Kling", "영상 생성 모델"),
    (re.compile(r"\bRunway\b", re.I), "Runway", "영상·크리에이티브 툴"),
    (re.compile(r"\bMidjourney\b", re.I), "Midjourney", "이미지 생성 서비스"),
    (re.compile(r"\bHiggsfield\b", re.I), "Higgsfield", "영상·모션 생성 플랫폼"),
    (re.compile(r"\bHailuo\b|\bMiniMax\b", re.I), "Hailuo/MiniMax", "영상·모델 벤더"),
    (re.compile(r"\bSora\b", re.I), "Sora", "OpenAI 영상 모델"),
    (re.compile(r"\bVeo\b", re.I), "Veo", "Google 영상 모델"),
    (re.compile(r"\bLuma\b", re.I), "Luma", "영상 생성"),
    (re.compile(r"\bPika\b", re.I), "Pika", "영상 생성"),
    (re.compile(r"\bfal\.ai\b|\bfal\b", re.I), "fal", "생성 모델 추론 허브"),
    (re.compile(r"\bReplicate\b", re.I), "Replicate", "모델 호스팅 허브"),
    (re.compile(r"\bElevenLabs\b", re.I), "ElevenLabs", "음성 합성"),
    (re.compile(r"\bSuno\b", re.I), "Suno", "음악 생성"),
    (re.compile(r"\bUdio\b", re.I), "Udio", "음악 생성"),
    (re.compile(r"인페인팅|inpaint(?:ing)?", re.I), "인페인팅", "영역 다시 그리기"),
    (re.compile(r"아웃페인팅|outpaint(?:ing)?", re.I), "아웃페인팅", "화면 밖 확장"),
    (re.compile(r"모션\s*브러시|motion\s*brush", re.I), "모션 브러시", "영역별 움직임 지정"),
    (re.compile(r"카메라\s*앵글|camera\s*angle", re.I), "카메라 앵글", "시점·렌즈 연출"),
    (re.compile(r"\b720p\b|\b1080p\b|\b4K\b", re.I), "해상도(720p/1080p/4K)", "출력 화질 단위"),
    (re.compile(r"화면비|aspect\s*ratio", re.I), "화면비", "9:16·16:9 등"),
    (re.compile(r"\bfps\b|프레임\s*레이트", re.I), "fps", "초당 프레임"),
    (re.compile(r"네거티브\s*프롬프트|negative\s*prompt", re.I), "네거티브 프롬프트", "빼고 싶은 요소 지시"),
    (
        re.compile(
            r"(?<![A-Za-z])시드\s*(값|번호)?(?![가-힣])|(?<![A-Za-z])random\s*seed\b|(?<![A-Za-z])generation\s*seed\b",
            re.I,
        ),
        "시드(seed)",
        "재현용 난수 시드",
    ),
    (re.compile(r"체크포인트|\bcheckpoint\b", re.I), "체크포인트", "학습 가중치 스냅샷"),
    (re.compile(r"디퓨전|diffusion\s*model", re.I), "디퓨전", "확산 기반 생성 모델"),
    (re.compile(r"래턴트|\blatent\b", re.I), "래턴트", "압축 잠재 공간"),
    (re.compile(r"파인\s*튜닝|fine[-\s]?tun(?:e|ing)", re.I), "파인튜닝", "추가 학습으로 맞춤"),
    (re.compile(r"RAG\b|검색\s*증강", re.I), "RAG", "검색 증강 생성"),
    (re.compile(r"MCP\b", re.I), "MCP", "Model Context Protocol"),
    (re.compile(r"샌드박스|sandbox", re.I), "샌드박스", "격리 실행 환경"),
    (re.compile(r"워터마크|watermark", re.I), "워터마크", "생성물 표시·추적"),
    (re.compile(r"NCII|비동의\s*합성", re.I), "NCII", "비동의 합성 이미지 리스크"),
    (re.compile(r"星图|성도|Star\s*Map", re.I), "星图(광고 단가 플랫폼)", "중국 인플루언서 단가 표시"),
]


def known_biscuit_ids() -> list[str]:
    return [bid for bid, _ in _BISCUIT_PATTERNS]


def harvest_biscuit_counts(text: str) -> Counter[str]:
    """Count pattern hits per biscuit id in plain text."""
    counts: Counter[str] = Counter()
    if not text:
        return counts
    for bid, patterns in _BISCUIT_PATTERNS:
        n = 0
        for pat in patterns:
            n += len(pat.findall(text))
        if n:
            counts[bid] = n
    return counts


def harvest_biscuit_ids(text: str) -> list[str]:
    """Return biscuit ids found in plain text (brief markdown or html-stripped)."""
    counts = harvest_biscuit_counts(text)
    return list(counts.keys())


def rank_biscuit_ids_for_home(text: str, *, max_n: int = HOME_TICKER_MAX) -> list[str]:
    """
    Order biscuits for home ticker: creative terms first, then by frequency.
    Generic high-frequency terms (api, token, agent spam) sink when creative hits exist.
    """
    counts = harvest_biscuit_counts(text)
    if not counts:
        return ["prompt", "api", "t2v", "i2v", "native-audio"][:max_n]

    has_creative = any(_BISCUIT_TAGS.get(x) == "creative" for x in counts)

    def tag_tier(tag: str) -> int:
        if tag == "creative":
            return 0
        if tag == "work":
            return 1
        if tag == "model":
            return 2
        if tag == "risk":
            return 3
        return 4

    def sort_key(bid: str) -> tuple:
        tag = _BISCUIT_TAGS.get(bid, "basics")
        tier = tag_tier(tag)
        # When the day is creative-heavy, keep agent/api/token out of the top slot
        generic_penalty = 0
        if has_creative and bid in ("api", "token", "cli", "agent", "prompt", "credits"):
            generic_penalty = 3
        return (tier + generic_penalty, -counts[bid], bid)

    ordered = sorted(counts.keys(), key=sort_key)
    return ordered[:max_n]


def _is_skippable_tag(tag: str) -> bool:
    t = tag.lower()
    if t.startswith("</"):
        return False
    for name in (
        "script",
        "style",
        "code",
        "pre",
        "textarea",
        "svg",
        "button",
        "a ",
        "a>",
    ):
        if t.startswith("<" + name):
            return True
    if t.startswith("<a"):
        return True
    return False


def link_biscuits_in_html(html_body: str) -> tuple[str, list[str]]:
    """
    Wrap first N plain-text matches per biscuit id in .inline-biscuit buttons.
    Returns (new_html, ordered unique ids found).
    """
    if not html_body:
        return html_body, []

    parts = re.split(r"(<[^>]+>)", html_body)
    counts: dict[str, int] = {bid: 0 for bid, _ in _BISCUIT_PATTERNS}
    found_order: list[str] = []
    found_set: set[str] = set()

    skip_depth = 0
    skip_stack: list[str] = []

    def open_skip(tag: str) -> None:
        nonlocal skip_depth
        m = re.match(r"<([a-zA-Z0-9]+)", tag)
        if not m:
            return
        name = m.group(1).lower()
        if name in ("script", "style", "code", "pre", "textarea", "svg", "button", "a"):
            skip_stack.append(name)
            skip_depth += 1

    def close_skip(tag: str) -> None:
        nonlocal skip_depth
        m = re.match(r"</([a-zA-Z0-9]+)", tag)
        if not m or not skip_stack:
            return
        name = m.group(1).lower()
        if skip_stack and skip_stack[-1] == name:
            skip_stack.pop()
            skip_depth = max(0, skip_depth - 1)

    def link_text(segment: str) -> str:
        if not segment or not segment.strip():
            return segment
        out = segment
        for bid, patterns in _BISCUIT_PATTERNS:
            if counts[bid] >= MAX_HITS_PER_TERM:
                continue
            for pat in patterns:
                if counts[bid] >= MAX_HITS_PER_TERM:
                    break
                chunks = re.split(r"(<[^>]+>)", out)
                changed = False
                nest = 0
                for i, chunk in enumerate(chunks):
                    if chunk.startswith("<"):
                        low = chunk.lower()
                        if low.startswith("<button"):
                            nest += 1
                        elif low.startswith("</button"):
                            nest = max(0, nest - 1)
                        continue
                    if nest > 0 or not chunk:
                        continue
                    if counts[bid] >= MAX_HITS_PER_TERM:
                        break
                    remain = MAX_HITS_PER_TERM - counts[bid]

                    def repl(m: re.Match[str], _bid: str = bid) -> str:
                        if counts[_bid] >= MAX_HITS_PER_TERM:
                            return m.group(0)
                        counts[_bid] += 1
                        if _bid not in found_set:
                            found_set.add(_bid)
                            found_order.append(_bid)
                        raw = m.group(0)
                        return (
                            f'<button type="button" class="inline-biscuit" '
                            f'data-biscuit="{html.escape(_bid, quote=True)}">'
                            f"{raw}</button>"
                        )

                    new_chunk, n = pat.subn(repl, chunk, count=remain)
                    if n:
                        chunks[i] = new_chunk
                        changed = True
                if changed:
                    out = "".join(chunks)
        return out

    for i, part in enumerate(parts):
        if not part:
            continue
        if part.startswith("<"):
            if part.startswith("</"):
                close_skip(part)
            elif not part.endswith("/>"):
                open_skip(part)
            continue
        if skip_depth > 0:
            continue
        parts[i] = link_text(part)

    return "".join(parts), found_order


# id → Korean term label (must match assets/biscuits.js BISCUITS[].term)
_BISCUIT_LABELS: dict[str, str] = {
    "cli": "CLI",
    "api": "API",
    "prompt": "프롬프트",
    "token": "토큰",
    "context": "컨텍스트 창",
    "moe": "MoE",
    "open-weight": "오픈웨이트",
    "agent": "에이전트",
    "harness": "하네스",
    "hallucination": "할루시네이션",
    "fp8": "FP8",
    "t2v": "T2V",
    "i2v": "I2V",
    "r2v": "R2V",
    "native-audio": "네이티브 오디오",
    "keyframe": "키프레임",
    "lip-sync": "립싱크",
    "draft-mode": "Draft 모드",
    "upscale": "업스케일",
    "multi-shot": "멀티 샷",
    "video-continuation": "비디오 컨티뉴에이션",
    "character-ip": "캐릭터 IP",
    "ai-influencer": "AI 인플루언서",
    "short-drama": "숏드라마",
    "lora": "LoRA",
    "reference-image": "레퍼런스 이미지",
    "multimodal": "멀티모달",
    "early-access": "얼리 액세스",
    "deepfake": "딥페이크",
    "zdr": "ZDR",
    "guardrail": "가드레일",
    "credits": "크레딧",
    "rag": "RAG",
    "sandbox": "샌드박스",
    "watermark": "워터마크",
    "ga": "정식 공개",
    "mcp": "MCP",
    "hdr": "HDR",
    "asr": "ASR",
    "wer": "WER",
    "cot": "CoT",
    "mhs": "MHS",
    "inpaint": "인페인팅",
    "outpaint": "아웃페인팅",
    "maas": "MaaS",
    "world-model": "월드 모델",
    "diarization": "화자 분리",
    "recurrent-depth": "recurrent depth",
    "preparedness-framework": "Preparedness Framework",
    "intelligence-index": "Intelligence Index",
    "misalignment": "오정렬",
    "lean": "Lean",
    "c2pa": "C2PA",
    "ctf": "CTF",
    "vla": "VLA",
    "ppa": "PPA",
    "ivo": "IVO",
    "distillation": "증류",
    "full-duplex": "풀듀플렉스"
}


def related_biscuits_section_html(term_ids: Iterable[str], *, root_prefix: str = "") -> str:
    """
    Related strip at end of brief.
    **Server-render list items** so the section is never empty without JS.
    Client biscuits.js may re-fill the same list (idempotent).
    """
    ids = [t for t in term_ids if t]
    if not ids:
        return ""
    data = ",".join(ids)
    items: list[str] = []
    for bid in ids:
        label = _BISCUIT_LABELS.get(bid) or bid
        items.append(
            f'<li><button type="button" data-biscuit="{html.escape(bid, quote=True)}">'
            f"{html.escape(label)}</button></li>"
        )
    lis = "\n            ".join(items)
    return f"""
          <section class="related-biscuits-min news-section" id="related-biscuits" data-terms="{html.escape(data, quote=True)}" aria-label="관련 비스킷">
            <h2 class="news-section-title"><span class="sec-title-text">관련 비스킷</span></h2>
            <ul class="related-biscuits-min-list">
            {lis}
            </ul>
          </section>"""


def toc_related_item_html() -> str:
    return (
        '<li><a href="#related-biscuits" data-icon="biscuit">'
        '<span class="toc-label">관련 비스킷</span></a></li>'
    )


def _format_brief_label(date_iso: Optional[str]) -> str:
    if not date_iso:
        return "오늘 브리프"
    try:
        y, m, d = date_iso.split("-")
        return f"{int(m)}월 {int(d)}일 브리프"
    except Exception:
        return date_iso


def home_ticker_html(
    term_ids: Iterable[str],
    *,
    brief_date: Optional[str] = None,
) -> str:
    """Inner slot for hero right column (no outer section)."""
    ids = [t for t in term_ids if t]
    if not ids:
        ids = ["t2v", "i2v", "native-audio", "prompt", "api"]
    data = ",".join(ids)
    label = _format_brief_label(brief_date)
    date_attr = html.escape(brief_date or "", quote=True)
    label_attr = html.escape(label, quote=True)
    return (
        f'<div id="home-biscuit-ticker" class="hero-biscuit-slot" '
        f'data-terms="{html.escape(data, quote=True)}" '
        f'data-date="{date_attr}" '
        f'data-label="{label_attr}"></div>'
    )


def biscuits_page_body_html() -> str:
    return """
    <section class="biscuit-hero">
      <h1>비스킷</h1>
      <p class="meta-line" id="biscuit-count">—</p>
      <div class="biscuit-search-wrap">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input id="biscuit-q" type="search" placeholder="검색 · T2V, 네이티브 오디오, 캐릭터 IP…" autocomplete="off" />
      </div>
      <div class="biscuit-chips" id="biscuit-chips"></div>
    </section>
    <div class="biscuit-grid" id="biscuit-grid"></div>
    <div class="biscuit-empty" id="biscuit-empty">검색 결과가 없어요.</div>
    <p class="biscuit-feed-note">
      콘텐츠·제작 팀이 브리프에서 자주 만나는 AI 용어를 한입 크기로 모읍니다.
      새 브리프가 올라오면 언급된 단어가 하이라이트되고, 아직 사전에 없는 후보는 빌드 로그·후보 파일에 쌓입니다.
    </p>"""


def _covered_by_catalog(surface: str) -> bool:
    """True if surface form already matches an official biscuit pattern."""
    for _bid, pats in _BISCUIT_PATTERNS:
        for p in pats:
            if p.search(surface):
                return True
    return False


def suggest_biscuit_candidates(text: str, *, brief_date: str = "") -> list[dict]:
    """
    Scan brief text for creative/product jargon not yet in the biscuit catalog.
    Returns list of {term, hint, hits, sample, brief_date}.
    """
    if not text:
        return []

    out: list[dict] = []
    seen: set[str] = set()
    for pat, term, hint in _CANDIDATE_WATCH:
        if _covered_by_catalog(term):
            continue
        m0 = pat.search(text)
        if not m0:
            continue
        hits = len(list(pat.finditer(text)))
        sample = text[max(0, m0.start() - 20) : m0.end() + 40]
        key = term.lower()
        if key in seen:
            continue
        seen.add(key)
        sample_clean = re.sub(r"\s+", " ", sample).strip()
        out.append(
            {
                "term": term,
                "hint": hint,
                "hits": hits,
                "sample": sample_clean[:160],
                "brief_date": brief_date,
            }
        )

    out.sort(key=lambda x: (-x["hits"], x["term"]))
    return out


def write_biscuit_runtime(
    data_out: Path,
    *,
    brief_date: str,
    term_ids: list[str],
    candidates: list[dict],
    all_ids: Optional[list[str]] = None,
) -> Path:
    """Write data/biscuits-runtime.json for clients + ops."""
    data_out.mkdir(parents=True, exist_ok=True)
    payload = {
        "date": brief_date,
        "label": _format_brief_label(brief_date),
        "termIds": term_ids,
        "allMatchedIds": all_ids or term_ids,
        "candidates": candidates,
        "catalogSize": len(_BISCUIT_PATTERNS),
    }
    path = data_out / "biscuits-runtime.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path


def write_biscuit_candidates_log(
    log_path: Path,
    *,
    brief_date: str,
    candidates: list[dict],
) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# Biscuit candidates — {brief_date}",
        "",
        "브리프에 등장했지만 비스킷 사전에 아직 없는(또는 제품명) 용어 후보입니다.",
        "정의 추가 시 `site/biscuits_lib.py` 패턴 + `site/assets/biscuits.js` 카드/ART를 같이 갱신하세요.",
        "",
    ]
    if not candidates:
        lines.append("_오늘 신규 후보 없음._")
    else:
        for c in candidates:
            lines.append(
                f"- **{c['term']}** ({c['hits']}회) — {c['hint']}"
            )
            lines.append(f"  - 예: …{c['sample']}…")
        lines.append("")
    log_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
