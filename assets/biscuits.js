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
      detail: "CLI(Command Line Interface)는 아이콘을 더블클릭하는 GUI와 달리, 터미널·콘솔에 명령어를 입력해 프로그램을 실행하는 방식입니다. 개발·서버·자동화 도구가 CLI를 많이 쓰는 이유는 반복 작업을 스크립트로 묶기 쉽고, 원격 서버에서도 동일한 명령을 재현할 수 있기 때문입니다. 예: `npm run dev`, `git status`, Codex CLI처럼 채팅형 AI도 터미널에서 돌릴 수 있습니다. 처음엔 까만 화면이 낯설지만, ‘앱 실행 버튼’을 글자로 대신하는 도구라고 보면 이해가 쉽습니다.",
      firstSeen: "2026-07-29"
    },
    {
      id: "api",
      term: "API",
      en: "Application Programming Interface",
      tag: "basics",
      tagLabel: "기초",
      text: "서로 다른 프로그램이 이야기할 때 쓰는 ‘주문 창구’예요.",
      detail: "API(Application Programming Interface)는 앱·서비스가 서로 데이터를 주고받을 때 약속한 요청·응답 규약입니다. 사용자는 버튼을 누르지만, 앱 뒤에는 ‘이 주소로 이런 형식으로 요청하면 이런 답을 준다’는 API 호출이 돌아갑니다. 날씨 앱이 기상청 서버에 날씨를 물어보거나, 브리프 사이트가 Gemini API로 모델을 부르는 식입니다. REST·JSON이 흔하고, 키(API key)로 권한을 나누며, 요금도 보통 API 호출·토큰 사용량 기준으로 책정됩니다.",
      firstSeen: "2026-07-14"
    },
    {
      id: "prompt",
      term: "프롬프트",
      en: "Prompt",
      tag: "basics",
      tagLabel: "기초",
      text: "AI에게 건네는 지시문·질문이에요. 자세히 쓸수록 결과 방향이 잡힙니다.",
      detail: "프롬프트는 모델에게 보내는 입력 전체—질문, 역할 지정, 예시, 제약 조건—를 말합니다. 같은 모델이라도 ‘고양이 그려줘’와 ‘수채화 풍의 주황 고양이, 창가, 부드러운 오후 빛’은 결과가 크게 달라집니다. 좋은 프롬프트는 목표·형식·금기·예시를 분명하게 적는 편입니다. 최근에는 시스템 프롬프트(모델 행동 규칙)와 사용자 프롬프트를 나누고, 긴 문서는 검색·요약을 거쳐 넣는 식으로 설계합니다.",
      firstSeen: "2026-07-16"
    },
    {
      id: "token",
      term: "토큰",
      en: "Token",
      tag: "basics",
      tagLabel: "기초",
      text: "AI가 글을 처리할 때 나누는 작은 조각 단위예요. 요금·길이 제한도 보통 토큰으로 셉니다.",
      detail: "토큰은 모델이 텍스트를 읽고 쓸 때 쓰는 ‘조각’ 단위입니다. 글자 수와 비슷하지만 언어·띄어쓰기에 따라 1토큰이 한 음절일 수도, 단어 일부일 수도 있습니다. 입력 토큰(질문)과 출력 토큰(답)을 합쳐 과금하는 경우가 많고, Luna $0.20/$1.20 per MTok 같은 표기의 MTok은 백만 토큰을 뜻합니다. 컨텍스트 창 한도도 토큰으로 세므로, 긴 대화·문서를 넣으면 앞부분이 잘리거나 비용이 늘어납니다. 실무에서는 요약·캐시·짧은 지시로 토큰을 아끼는 습관이 중요합니다.",
      firstSeen: "2026-07-24"
    },
    {
      id: "context",
      term: "컨텍스트 창",
      en: "Context window",
      tag: "model",
      tagLabel: "모델",
      text: "AI가 한 대화에서 동시에 붙잡고 있을 수 있는 글의 최대 길이예요.",
      detail: "컨텍스트 창(context window)은 모델이 한 번에 참고할 수 있는 입력+출력 토큰의 상한입니다. 128K·256K처럼 숫자가 클수록 긴 문서·대화 기록을 더 많이 넣을 수 있지만, 창을 넘기면 오래된 내용은 사실상 잊힌 상태가 됩니다. 창이 넓다고 항상 더 똑똑한 것은 아니고, 중요한 사실을 창 안에 잘 배치하는 설계(요약, RAG, 메모)가 성능을 좌우합니다. 긴 브리프·코드베이스를 다룰 때는 ‘무엇을 창에 남길지’를 먼저 정하는 편이 좋습니다.",
      firstSeen: "2026-07-20"
    },
    {
      id: "moe",
      term: "MoE",
      en: "Mixture of Experts",
      tag: "model",
      tagLabel: "모델",
      text: "모델 안에 전문가 여러 명을 두고, 질문마다 그중 몇 명만 깨워 답을 만드는 구조예요.",
      detail: "MoE(Mixture of Experts)는 거대한 파라미터를 여러 ‘전문가’ 하위 네트워크로 나누고, 라우터가 입력마다 일부만 활성화하는 구조입니다. 전체가 매번 일하지 않아, 총 파라미터는 커도 토큰당 활성 파라미터(연산량)를 낮출 수 있습니다. A.X K2처럼 수백 B 규모이면서 토큰마다 수십 B만 깨운다고 설명하는 모델이 대표 예입니다. 장점은 규모 대비 효율, 과제는 라우팅 안정성·학습 난이도·서빙 인프라 복잡도입니다.",
      firstSeen: "2026-07-27"
    },
    {
      id: "open-weight",
      term: "오픈웨이트",
      en: "Open weights",
      tag: "model",
      tagLabel: "모델",
      text: "모델의 가중치 파일을 내려받아 직접 돌려 볼 수 있게 공개한 상태예요.",
      detail: "오픈웨이트는 학습된 가중치(신경망 숫자 파일)를 다운로드·자체 호스팅할 수 있게 공개한 형태를 말합니다. 채팅 웹사이트만 열리는 ‘서비스 공개’와 다르고, 완전한 오픈소스(학습 코드·데이터까지)와도 구분이 필요합니다. Hugging Face 등에 올려 Apache 2.0 같은 라이선스로 배포하는 경우가 많고, 기업은 내부 서버·온프레미스로 돌릴 수 있습니다. 다운로드 가능해도 상업 이용·재배포 조건은 라이선스를 반드시 확인해야 합니다.",
      firstSeen: "2026-07-20"
    },
    {
      id: "agent",
      term: "에이전트",
      en: "AI agent",
      tag: "work",
      tagLabel: "활용",
      text: "한 번 답하고 끝내지 않고, 검색·코드 실행 같은 도구를 여러 번 쓰며 일을 진행하는 AI예요.",
      detail: "에이전트는 단일 응답 챗봇을 넘어, 목표를 위해 도구(검색, 코드 실행, 브라우저, API)를 여러 스텝 호출하며 작업을 이어 가는 시스템을 가리킵니다. ‘이 버그 고쳐줘’에 파일을 읽고 테스트를 돌린 뒤 패치를 제안하는 코딩 에이전트, 다로봇을 조율하는 로보틱스 에이전트가 예입니다. 강점은 복잡한 실무 자동화이고, 위험은 잘못된 도구 사용·권한 남용·평가 환경 탈출 같은 운영 사고입니다. 그래서 샌드박스, 권한 최소화, 사람 승인 단계가 함께 설계되는 경우가 많습니다.",
      firstSeen: "2026-07-15"
    },
    {
      id: "hallucination",
      term: "할루시네이션",
      en: "Hallucination",
      tag: "risk",
      tagLabel: "주의",
      text: "AI가 그럴듯하지만 사실이 아닌 내용을 자신 있는 말투로 지어내는 현상이에요.",
      detail: "할루시네이션(환각)은 모델이 학습 패턴에 맞춰 ‘맞는 문장처럼’ 보이는 출력을 만들다, 사실이 아닌 내용이 섞이는 현상입니다. 고의적 거짓말이라기보다, 다음 토큰을 확률적으로 잇는 생성 방식의 한계에 가깝습니다. 없는 논문·날짜·URL을 지어 내거나 수치를 잘못 말할 수 있어, 중요한 결정·출처는 원문 확인이 필요합니다. 검색 근거를 붙이거나(RAG), 도구로 검증하거나, 낮은 온도·명확한 제약을 주는 식으로 줄일 수 있습니다.",
      firstSeen: "2026-07-22"
    },
    {
      id: "fp8",
      term: "FP8",
      en: "8-bit floating point",
      tag: "model",
      tagLabel: "모델",
      text: "모델 숫자를 더 작은 자릿수로 저장·계산해 메모리와 속도를 아끼는 포맷이에요.",
      detail: "FP8은 8비트 부동소수점 포맷으로, BF16·FP16보다 자릿수를 줄여 가중치·활성값을 저장·연산합니다. 같은 모델도 메모리 footprint가 줄고 처리량이 올라갈 수 있어, 대규모 학습·서빙에서 비용을 낮추려는 선택지로 쓰입니다. 정밀도가 낮아 품질 손실 위험이 있어, 스케일링·혼합 정밀(mixed precision) 기법과 함께 씁니다. 브리프에 ‘네이티브 FP8 학습’이 나오면, 처음부터 8비트 친화적으로 학습해 효율을 노렸다는 신호로 읽으면 됩니다.",
      firstSeen: "2026-07-27"
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
  var activePopId = null;
  var activePopAnchor = null;

  function showPop(id, anchor) {
    var b = findBiscuit(id);
    if (!b) return;
    var pop = ensurePopShell();
    // same term + same anchor again → toggle off
    if (
      pop.classList.contains("is-on") &&
      activePopId === id &&
      activePopAnchor === anchor
    ) {
      hidePop();
      return;
    }
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
    activePopId = id;
    activePopAnchor = anchor;
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
    activePopId = null;
    activePopAnchor = null;
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
      // brief inline terms (toggle same word to close)
      var btn = e.target.closest("button.inline-biscuit");
      if (btn && btn.dataset.biscuit) {
        e.preventDefault();
        e.stopPropagation();
        showPop(btn.dataset.biscuit, btn);
        return;
      }
      // related biscuits list at end of brief
      var rel = e.target.closest(".related-biscuits-min-list [data-biscuit]");
      if (rel && rel.dataset.biscuit) {
        e.preventDefault();
        e.stopPropagation();
        showPop(rel.dataset.biscuit, rel);
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
      (b.term + " " + b.en + " " + b.text + " " + (b.detail || "")).toLowerCase() +
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
      (b.detail || b.text) +
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

    root.classList.add("biscuit-ticker-host");
    root.innerHTML =
      '<div class="biscuit-ticker biscuit-ticker--hero">' +
      '<div class="biscuit-ticker-label">' +
      '<span class="biscuit-ticker-dot" aria-hidden="true"></span>' +
      "오늘의 AI 비스킷" +
      '<a class="biscuit-ticker-all" href="biscuits.html">전체</a>' +
      "</div>" +
      '<div class="biscuit-ticker-card" id="biscuit-ticker-card">' +
      '<div class="biscuit-ticker-art" id="biscuit-ticker-art"></div>' +
      '<div class="biscuit-ticker-copy">' +
      '<span class="biscuit-ticker-term" id="biscuit-ticker-term"></span>' +
      '<span class="biscuit-ticker-en" id="biscuit-ticker-en"></span>' +
      '<p class="biscuit-ticker-text" id="biscuit-ticker-text"></p>' +
      "</div>" +
      "</div>" +
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
      root.classList.add("is-arrived");
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
