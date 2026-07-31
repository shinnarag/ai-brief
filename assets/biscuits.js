/**
 * AI Biscuits — pre-deploy prototype
 * Catalog grows from terms in briefs. Cards keep illustration art.
 */
(function (global) {
  "use strict";

  const ART = {
      cli: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#1d1d1f"/>
  <rect x="12" y="12" width="336" height="96" rx="10" fill="#2c2c2e"/>
  <circle cx="28" cy="28" r="4" fill="#ff5f57"/><circle cx="42" cy="28" r="4" fill="#febc2e"/><circle cx="56" cy="28" r="4" fill="#28c840"/>
  <text x="24" y="62" fill="#7dffa5" font-family="ui-monospace,monospace" font-size="16">$ npm run dev</text>
  <text x="24" y="86" fill="#8e8e93" font-family="ui-monospace,monospace" font-size="13">서버가 켜졌어요 ▌</text>
</svg>`,
      api: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef5ff"/>
  <rect x="24" y="30" width="90" height="60" rx="12" fill="#fff" stroke="#0066cc" stroke-width="2"/>
  <text x="69" y="66" text-anchor="middle" fill="#0066cc" font-size="14" font-weight="700" font-family="system-ui">앱</text>
  <path d="M124 60 H170" stroke="#0066cc" stroke-width="3" stroke-dasharray="4 4"/>
  <polygon points="170,54 184,60 170,66" fill="#0066cc"/>
  <rect x="190" y="22" width="146" height="76" rx="14" fill="#0066cc"/>
  <text x="263" y="52" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">API 창구</text>
  <text x="263" y="74" text-anchor="middle" fill="#cfe3ff" font-size="11" font-family="system-ui">요청 받기 · 답 주기</text>
</svg>`,
      moe: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f3eeff"/>
  <circle cx="180" cy="60" r="18" fill="#7c3aed"/>
  <text x="180" y="65" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="system-ui">라우터</text>
  <g fill="#c4b5fd">
    <rect x="40" y="28" width="48" height="28" rx="8"/><rect x="40" y="64" width="48" height="28" rx="8"/>
    <rect x="100" y="20" width="48" height="28" rx="8"/><rect x="100" y="72" width="48" height="28" rx="8"/>
    <rect x="212" y="20" width="48" height="28" rx="8"/><rect x="212" y="72" width="48" height="28" rx="8"/>
    <rect x="272" y="28" width="48" height="28" rx="8"/><rect x="272" y="64" width="48" height="28" rx="8"/>
  </g>
  <g fill="#7c3aed">
    <rect x="100" y="20" width="48" height="28" rx="8"/><rect x="212" y="72" width="48" height="28" rx="8"/>
    <rect x="272" y="28" width="48" height="28" rx="8"/>
  </g>
  <text x="180" y="112" text-anchor="middle" fill="#6b21a8" font-size="11" font-family="system-ui">전문가 여러 명 중 몇 명만 호출</text>
</svg>`,
      "open-weight": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eaf8f4"/>
  <rect x="50" y="28" width="100" height="64" rx="12" fill="#fff" stroke="#0a7d6c" stroke-width="2"/>
  <text x="100" y="58" text-anchor="middle" fill="#0a7d6c" font-size="12" font-weight="700" font-family="system-ui">모델 파일</text>
  <text x="100" y="76" text-anchor="middle" fill="#5f9e93" font-size="10" font-family="system-ui">가중치 📦</text>
  <path d="M160 60 H210" stroke="#0a7d6c" stroke-width="3"/>
  <polygon points="210,54 224,60 210,66" fill="#0a7d6c"/>
  <rect x="230" y="34" width="90" height="52" rx="12" fill="#0a7d6c"/>
  <text x="275" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">내 컴퓨터</text>
  <text x="275" y="74" text-anchor="middle" fill="#b8ebe0" font-size="10" font-family="system-ui">다운로드 OK</text>
</svg>`,
      context: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fff8e8"/>
  <rect x="30" y="44" width="300" height="28" rx="14" fill="#ffe6b0"/>
  <rect x="30" y="44" width="210" height="28" rx="14" fill="#ffb020"/>
  <text x="180" y="36" text-anchor="middle" fill="#8a5a00" font-size="12" font-family="system-ui">한 번에 기억할 수 있는 대화 길이</text>
  <text x="135" y="63" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">지금 읽은 부분</text>
  <text x="290" y="88" text-anchor="middle" fill="#b8860b" font-size="11" font-family="system-ui">창 밖 = 까먹음</text>
</svg>`,
      agent: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef5ff"/>
  <circle cx="70" cy="60" r="26" fill="#0066cc"/>
  <text x="70" y="65" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">AI</text>
  <path d="M100 60 H140" stroke="#0066cc" stroke-width="2" marker-end="url(#a)"/>
  <rect x="148" y="24" width="70" height="28" rx="8" fill="#fff" stroke="#0066cc"/>
  <text x="183" y="42" text-anchor="middle" fill="#0066cc" font-size="11" font-family="system-ui">검색</text>
  <rect x="148" y="60" width="70" height="28" rx="8" fill="#fff" stroke="#0066cc"/>
  <text x="183" y="78" text-anchor="middle" fill="#0066cc" font-size="11" font-family="system-ui">코드 실행</text>
  <path d="M218 74 H250" stroke="#0066cc" stroke-width="2"/>
  <rect x="250" y="46" width="80" height="40" rx="10" fill="#34c759"/>
  <text x="290" y="70" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">결과</text>
</svg>`,
      prompt: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f5f5f7"/>
  <rect x="40" y="28" width="160" height="64" rx="12" fill="#fff" stroke="#c7c7cc"/>
  <text x="55" y="52" fill="#1d1d1f" font-size="12" font-family="system-ui">“고양이 그려줘”</text>
  <text x="55" y="72" fill="#86868b" font-size="11" font-family="system-ui">← 이게 프롬프트</text>
  <path d="M210 60 H240" stroke="#0066cc" stroke-width="3"/>
  <polygon points="240,54 254,60 240,66" fill="#0066cc"/>
  <circle cx="290" cy="60" r="30" fill="#ffd60a"/>
  <text x="290" y="65" text-anchor="middle" font-size="22">🐱</text>
</svg>`,
      hallucination: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#ffecec"/>
  <circle cx="100" cy="60" r="32" fill="#fff" stroke="#c41e3a" stroke-width="2"/>
  <text x="100" y="66" text-anchor="middle" font-size="24">🧠</text>
  <path d="M140 50 Q180 20 220 50" fill="none" stroke="#c41e3a" stroke-width="2" stroke-dasharray="4 3"/>
  <rect x="220" y="34" width="110" height="52" rx="12" fill="#c41e3a"/>
  <text x="275" y="56" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">자신 있게</text>
  <text x="275" y="72" text-anchor="middle" fill="#ffd0d6" font-size="11" font-family="system-ui">틀린 말 가능</text>
</svg>`,
      token: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f5f5f7"/>
  <text x="180" y="30" text-anchor="middle" fill="#6e6e73" font-size="12" font-family="system-ui">문장을 잘게 나눈 조각</text>
  <g font-family="system-ui" font-size="13" font-weight="700">
    <rect x="36" y="48" width="52" height="36" rx="10" fill="#0066cc"/><text x="62" y="71" text-anchor="middle" fill="#fff">안</text>
    <rect x="96" y="48" width="52" height="36" rx="10" fill="#0066cc"/><text x="122" y="71" text-anchor="middle" fill="#fff">녕</text>
    <rect x="156" y="48" width="70" height="36" rx="10" fill="#5ac8fa"/><text x="191" y="71" text-anchor="middle" fill="#003d66">하세요</text>
    <rect x="234" y="48" width="40" height="36" rx="10" fill="#34c759"/><text x="254" y="71" text-anchor="middle" fill="#fff">!</text>
    <rect x="282" y="48" width="48" height="36" rx="10" fill="#af52de"/><text x="306" y="71" text-anchor="middle" fill="#fff">👋</text>
  </g>
</svg>`,
      fp8: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef5ff"/>
  <rect x="40" y="36" width="120" height="52" rx="12" fill="#d1d1d6"/>
  <text x="100" y="60" text-anchor="middle" fill="#1d1d1f" font-size="13" font-weight="700" font-family="system-ui">BF16</text>
  <text x="100" y="76" text-anchor="middle" fill="#6e6e73" font-size="10" font-family="system-ui">무거움 🏋️</text>
  <text x="180" y="66" text-anchor="middle" fill="#0066cc" font-size="18">→</text>
  <rect x="210" y="36" width="120" height="52" rx="12" fill="#0066cc"/>
  <text x="270" y="60" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">FP8</text>
  <text x="270" y="76" text-anchor="middle" fill="#cfe3ff" font-size="10" font-family="system-ui">가볍게 압축</text>
</svg>`
    };

  const BISCUITS = [
    {
      id: "cli",
      term: "CLI",
      en: "Command Line Interface",
      tag: "basics",
      tagLabel: "기초",
      text: "마우스 클릭 대신, 글자로 컴퓨터에게 명령을 내리는 창이에요.",
      firstSeen: "2026-07-29",
      mentions: [
        { date: "2026-07-29", title: "방어 모델이 벤치 1등이고…" },
        { date: "2026-07-31", title: "토큰은 싸지고, 로봇은 걷고…" }
      ]
    },
    {
      id: "api",
      term: "API",
      en: "Application Programming Interface",
      tag: "basics",
      tagLabel: "기초",
      text: "서로 다른 프로그램이 이야기할 때 쓰는 ‘주문 창구’예요.",
      firstSeen: "2026-07-14",
      mentions: [
        { date: "2026-07-14", title: "가격은 루피, 인재는 소송…" },
        { date: "2026-07-28", title: "가중치는 풀렸고, 칩은 성소로…" },
        { date: "2026-07-30", title: "연구실엔 무료 좌석…" },
        { date: "2026-07-31", title: "토큰은 싸지고, 로봇은 걷고…" }
      ]
    },
    {
      id: "prompt",
      term: "프롬프트",
      en: "Prompt",
      tag: "basics",
      tagLabel: "기초",
      text: "AI에게 건네는 지시문·질문이에요. 자세히 쓸수록 결과 방향이 잡힙니다.",
      firstSeen: "2026-07-16",
      mentions: [
        { date: "2026-07-16", title: "끄지 못하는 검색…" },
        { date: "2026-07-31", title: "토큰은 싸지고, 로봇은 걷고…" }
      ]
    },
    {
      id: "token",
      term: "토큰",
      en: "Token",
      tag: "basics",
      tagLabel: "기초",
      text: "AI가 글을 처리할 때 나누는 작은 조각 단위예요. 요금·길이 제한도 보통 토큰으로 셉니다.",
      firstSeen: "2026-07-24",
      mentions: [
        { date: "2026-07-24", title: "요금 서약이 찍히고…" },
        { date: "2026-07-31", title: "토큰은 싸지고, 로봇은 걷고…" }
      ]
    },
    {
      id: "context",
      term: "컨텍스트 창",
      en: "Context window",
      tag: "model",
      tagLabel: "모델",
      text: "AI가 한 대화에서 동시에 붙잡고 있을 수 있는 글의 최대 길이예요.",
      firstSeen: "2026-07-20",
      mentions: [{ date: "2026-07-20", title: "중국은 웨이트를 풀고…" }]
    },
    {
      id: "moe",
      term: "MoE",
      en: "Mixture of Experts",
      tag: "model",
      tagLabel: "모델",
      text: "모델 안에 전문가 여러 명을 두고, 질문마다 그중 몇 명만 깨워 답을 만드는 구조예요.",
      firstSeen: "2026-07-27",
      mentions: [
        { date: "2026-07-27", title: "반값 프론티어가 선두를 치고…" },
        { date: "2026-07-28", title: "가중치는 풀렸고, 칩은 성소로…" }
      ]
    },
    {
      id: "open-weight",
      term: "오픈웨이트",
      en: "Open weights",
      tag: "model",
      tagLabel: "모델",
      text: "모델의 가중치 파일을 내려받아 직접 돌려 볼 수 있게 공개한 상태예요.",
      firstSeen: "2026-07-20",
      mentions: [
        { date: "2026-07-20", title: "중국은 웨이트를 풀고…" },
        { date: "2026-07-28", title: "가중치는 풀렸고, 칩은 성소로…" }
      ]
    },
    {
      id: "agent",
      term: "에이전트",
      en: "AI agent",
      tag: "work",
      tagLabel: "활용",
      text: "한 번 답하고 끝내지 않고, 검색·코드 실행 같은 도구를 여러 번 쓰며 일을 진행하는 AI예요.",
      firstSeen: "2026-07-15",
      mentions: [
        { date: "2026-07-15", title: "전력이 문을 닫자…" },
        { date: "2026-07-21", title: "수표는 15억, 에이전트는…" },
        { date: "2026-07-29", title: "방어 모델이 벤치 1등이고…" },
        { date: "2026-07-31", title: "토큰은 싸지고, 로봇은 걷고…" }
      ]
    },
    {
      id: "hallucination",
      term: "할루시네이션",
      en: "Hallucination",
      tag: "risk",
      tagLabel: "주의",
      text: "AI가 그럴듯하지만 사실이 아닌 내용을 자신 있는 말투로 지어내는 현상이에요.",
      firstSeen: "2026-07-22",
      mentions: [{ date: "2026-07-22", title: "답안을 훔친 모델…" }]
    },
    {
      id: "fp8",
      term: "FP8",
      en: "8-bit floating point",
      tag: "model",
      tagLabel: "모델",
      text: "모델 숫자를 더 작은 자릿수로 저장·계산해 메모리와 속도를 아끼는 포맷이에요.",
      firstSeen: "2026-07-27",
      mentions: [{ date: "2026-07-27", title: "반값 프론티어가 선두를 치고…" }]
    }
  ];

  const LATEST_BRIEF = {
    date: "2026-07-31",
    termIds: ["token", "api", "agent", "cli", "prompt"]
  };

  const TAGS = [
    { id: "all", label: "전체" },
    { id: "basics", label: "기초" },
    { id: "model", label: "모델" },
    { id: "work", label: "활용" },
    { id: "risk", label: "주의" }
  ];

  const TAG_CLASS = {
    basics: "tag-basics",
    model: "tag-model",
    work: "tag-work",
    risk: "tag-risk"
  };

  function findBiscuit(id) {
    return BISCUITS.find(function (b) { return b.id === id; }) || null;
  }

  function artFor(id) {
    return ART[id] || "";
  }

  function sortedCatalog() {
    return BISCUITS.slice().sort(function (a, b) {
      if (a.firstSeen === b.firstSeen) return a.term.localeCompare(b.term, "ko");
      return a.firstSeen < b.firstSeen ? 1 : -1;
    });
  }

  function isRecent(b, days) {
    days = days || 10;
    var d = new Date(b.firstSeen + "T00:00:00");
    var now = new Date("2026-07-31T00:00:00");
    return (now - d) / 86400000 <= days;
  }

  function ensurePopShell() {
    var root = document.getElementById("biscuit-pop");
    if (root) return root;
    root = document.createElement("div");
    root.id = "biscuit-pop";
    root.className = "biscuit-pop";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "용어 설명");
    var biscuitHref = (function () {
      try {
        var path = location.pathname || "";
        if (path.indexOf("/brief/") !== -1 || /\/brief\//.test(path)) return "../biscuits.html";
      } catch (e) {}
      return "biscuits.html";
    })();
    root.innerHTML =
      '<p class="biscuit-pop-term" id="biscuit-pop-term"></p>' +
      '<p class="biscuit-pop-text" id="biscuit-pop-text"></p>' +
      '<div class="biscuit-pop-foot">' +
      '<a class="biscuit-pop-link" id="biscuit-pop-link" href="' + biscuitHref + '">비스킷에서 보기</a>' +
      '<button type="button" class="biscuit-pop-close" id="biscuit-pop-close">닫기</button>' +
      "</div>";
    document.body.appendChild(root);
    return root;
  }

  var popBound = false;

  function showPop(id, anchor) {
    var b = findBiscuit(id);
    if (!b) return;
    var pop = ensurePopShell();
    document.getElementById("biscuit-pop-term").innerHTML =
      b.term + '<span class="biscuit-pop-en">' + b.en + "</span>";
    document.getElementById("biscuit-pop-text").textContent = b.text;
    var base = "biscuits.html";
    try {
      var path = location.pathname || "";
      if (path.indexOf("/brief/") !== -1) base = "../biscuits.html";
    } catch (e) {}
    document.getElementById("biscuit-pop-link").href = base + "#" + b.id;
    pop.classList.add("is-on");
    var r = anchor.getBoundingClientRect();
    var pw = pop.offsetWidth;
    var ph = pop.offsetHeight;
    var left = r.left + r.width / 2 - pw / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
    var top = r.bottom + 8;
    if (top + ph > window.innerHeight - 12) top = Math.max(12, r.top - ph - 8);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function hidePop() {
    var pop = document.getElementById("biscuit-pop");
    if (pop) pop.classList.remove("is-on");
  }

  function bindPopoverOnce() {
    if (popBound) return;
    popBound = true;
    ensurePopShell();
    document.addEventListener("click", function (e) {
      if (e.target.closest("#biscuit-pop-close")) {
        hidePop();
        return;
      }
      var btn = e.target.closest(".inline-biscuit, [data-biscuit]");
      if (btn && btn.dataset.biscuit) {
        e.preventDefault();
        showPop(btn.dataset.biscuit, btn);
        return;
      }
      if (!e.target.closest("#biscuit-pop")) hidePop();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hidePop();
    });
    window.addEventListener("scroll", hidePop, { passive: true });
    window.addEventListener("resize", hidePop);
  }

  function cardHTML(b) {
    return (
      '<article class="biscuit-card" id="biscuit-' +
      b.id +
      '" data-id="' +
      b.id +
      '" data-tag="' +
      b.tag +
      '" data-search="' +
      (b.term + " " + b.en + " " + b.text).toLowerCase() +
      '">' +
      '<div class="biscuit-art">' +
      artFor(b.id) +
      "</div>" +
      '<div class="biscuit-body">' +
      '<span class="biscuit-tag ' +
      (TAG_CLASS[b.tag] || "") +
      '">' +
      b.tagLabel +
      "</span>" +
      '<h3 class="biscuit-term">' +
      b.term +
      '<span class="biscuit-en">' +
      b.en +
      "</span></h3>" +
      '<p class="biscuit-text">' +
      b.text +
      "</p>" +
      "</div></article>"
    );
  }

  function initBiscuitsPage() {
    bindPopoverOnce();
    var grid = document.getElementById("biscuit-grid");
    var empty = document.getElementById("biscuit-empty");
    var q = document.getElementById("biscuit-q");
    var chips = document.getElementById("biscuit-chips");
    var countEl = document.getElementById("biscuit-count");
    if (!grid) return;

    var catalog = sortedCatalog();
    if (countEl) {
      countEl.textContent = catalog.length + "개 · 브리프에서 모은 용어";
    }

    var activeTag = "all";

    function renderChips() {
      if (!chips) return;
      chips.innerHTML = TAGS.map(function (t) {
        return (
          '<button type="button" class="biscuit-chip' +
          (activeTag === t.id ? " is-on" : "") +
          '" data-tag="' +
          t.id +
          '">' +
          t.label +
          "</button>"
        );
      }).join("");
      chips.querySelectorAll(".biscuit-chip").forEach(function (btn) {
        btn.addEventListener("click", function () {
          activeTag = btn.dataset.tag;
          renderChips();
          filter();
        });
      });
    }

    function render() {
      grid.innerHTML = catalog.map(cardHTML).join("");
    }

    function filter() {
      var query = ((q && q.value) || "").trim().toLowerCase();
      var shown = 0;
      grid.querySelectorAll(".biscuit-card").forEach(function (el) {
        var tagOk = activeTag === "all" || el.dataset.tag === activeTag;
        var qOk = !query || (el.dataset.search || "").includes(query);
        var on = tagOk && qOk;
        el.classList.toggle("is-hidden", !on);
        if (on) shown++;
      });
      if (empty) empty.classList.toggle("is-on", shown === 0);
    }

    renderChips();
    render();
    if (q) q.addEventListener("input", filter);
    filter();

    var hash = (location.hash || "").replace(/^#/, "");
    if (hash) {
      var el = document.getElementById("biscuit-" + hash);
      if (el) {
        setTimeout(function () {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("is-flash");
          setTimeout(function () {
            el.classList.remove("is-flash");
          }, 1400);
        }, 60);
      }
    }
  }

  function initRelatedMin(ids) {
    bindPopoverOnce();
    var root = document.getElementById("related-biscuits");
    if (!root) return;
    var list = root.querySelector(".related-biscuits-min-list");
    if (!list) return;
    var items = (ids || LATEST_BRIEF.termIds).map(findBiscuit).filter(Boolean);
    if (!items.length) {
      root.hidden = true;
      return;
    }
    list.innerHTML = items
      .map(function (b) {
        return (
          '<li><button type="button" data-biscuit="' +
          b.id +
          '">' +
          b.term +
          "</button></li>"
        );
      })
      .join("");
  }

  /**
   * Home: "오늘의 AI 비스킷" — one term + meaning at a time, fade in/out (toast/notice feel)
   */
  function initHomeTicker(ids) {
    bindPopoverOnce();
    var root = document.getElementById("home-biscuit-ticker");
    if (!root) return;

    var list = (ids || LATEST_BRIEF.termIds || [])
      .map(findBiscuit)
      .filter(Boolean);
    if (!list.length) {
      root.hidden = true;
      return;
    }

    var HOLD_MS = 4200;
    var FADE_MS = 420;
    var idx = 0;
    var timer = null;
    var paused = false;

    root.innerHTML =
      '<div class="biscuit-ticker">' +
      '<div class="biscuit-ticker-label">' +
      '<span class="biscuit-ticker-dot" aria-hidden="true"></span>' +
      "오늘의 AI 비스킷" +
      '<a class="biscuit-ticker-all" href="biscuits.html">전체</a>' +
      "</div>" +
      '<button type="button" class="biscuit-ticker-card" id="biscuit-ticker-card" data-biscuit="">' +
      '<div class="biscuit-ticker-art" id="biscuit-ticker-art"></div>' +
      '<div class="biscuit-ticker-copy">' +
      '<span class="biscuit-ticker-term" id="biscuit-ticker-term"></span>' +
      '<span class="biscuit-ticker-en" id="biscuit-ticker-en"></span>' +
      '<p class="biscuit-ticker-text" id="biscuit-ticker-text"></p>' +
      "</div>" +
      "</button>" +
      '<div class="biscuit-ticker-dots" id="biscuit-ticker-dots" role="tablist" aria-label="비스킷 순서"></div>' +
      "</div>";

    var card = document.getElementById("biscuit-ticker-card");
    var artEl = document.getElementById("biscuit-ticker-art");
    var termEl = document.getElementById("biscuit-ticker-term");
    var enEl = document.getElementById("biscuit-ticker-en");
    var textEl = document.getElementById("biscuit-ticker-text");
    var dotsEl = document.getElementById("biscuit-ticker-dots");

    dotsEl.innerHTML = list
      .map(function (_, i) {
        return (
          '<button type="button" class="biscuit-ticker-dotbtn' +
          (i === 0 ? " is-on" : "") +
          '" data-i="' +
          i +
          '" aria-label="' +
          (i + 1) +
          "번째" +
          '"></button>'
        );
      })
      .join("");

    function setDots() {
      dotsEl.querySelectorAll(".biscuit-ticker-dotbtn").forEach(function (d, i) {
        d.classList.toggle("is-on", i === idx);
      });
    }

    function paint(b) {
      card.dataset.biscuit = b.id;
      artEl.innerHTML = artFor(b.id);
      termEl.textContent = b.term;
      enEl.textContent = b.en;
      textEl.textContent = b.text;
      setDots();
    }

    function show(i, animate) {
      idx = ((i % list.length) + list.length) % list.length;
      var b = list[idx];
      if (!animate) {
        paint(b);
        card.classList.add("is-in");
        return;
      }
      card.classList.remove("is-in");
      card.classList.add("is-out");
      setTimeout(function () {
        paint(b);
        card.classList.remove("is-out");
        // force reflow
        void card.offsetWidth;
        card.classList.add("is-in");
      }, FADE_MS);
    }

    function next() {
      if (paused) return;
      show(idx + 1, true);
    }

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        next();
        schedule();
      }, HOLD_MS);
    }

    paint(list[0]);
    requestAnimationFrame(function () {
      card.classList.add("is-in");
    });
    schedule();

    root.addEventListener("mouseenter", function () {
      paused = true;
      clearTimeout(timer);
    });
    root.addEventListener("mouseleave", function () {
      paused = false;
      schedule();
    });

    dotsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".biscuit-ticker-dotbtn");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      show(parseInt(btn.dataset.i, 10), true);
      if (!paused) schedule();
    });
  }


  function parseTermIds(el) {
    if (!el) return null;
    var raw = el.getAttribute("data-terms") || "";
    if (!raw.trim()) return null;
    return raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function autoBoot() {
    bindPopoverOnce();
    var grid = document.getElementById("biscuit-grid");
    if (grid) initBiscuitsPage();
    var ticker = document.getElementById("home-biscuit-ticker");
    if (ticker) {
      var ids = parseTermIds(ticker);
      initHomeTicker(ids || undefined);
    }
    var related = document.getElementById("related-biscuits");
    if (related) {
      var rids = parseTermIds(related);
      initRelatedMin(rids || undefined);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoBoot);
  } else {
    autoBoot();
  }

  global.AIBiscuits = {
    ART: ART,
    BISCUITS: BISCUITS,
    LATEST_BRIEF: LATEST_BRIEF,
    findBiscuit: findBiscuit,
    artFor: artFor,
    showPop: showPop,
    hidePop: hidePop,
    bindPopoverOnce: bindPopoverOnce,
    initBiscuitsPage: initBiscuitsPage,
    initRelatedMin: initRelatedMin,
    initHomeTicker: initHomeTicker
  };
})(window);
