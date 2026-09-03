/**
 * AI Biscuits — pre-deploy prototype
 * Catalog grows from terms in briefs. Cards keep illustration art.
 */
(function (global) {
  "use strict";

  const ART = {
      zdr: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef6f3"/>
  <rect x="28" y="28" width="110" height="64" rx="12" fill="#fff" stroke="#0a7d6c" stroke-width="2"/>
  <text x="83" y="56" text-anchor="middle" fill="#0a7d6c" font-size="12" font-weight="700" font-family="system-ui">요청</text>
  <text x="83" y="76" text-anchor="middle" fill="#5f9e93" font-size="10" font-family="system-ui">파일 · 프롬프트</text>
  <path d="M148 60 H186" stroke="#0a7d6c" stroke-width="3"/>
  <polygon points="186,54 200,60 186,66" fill="#0a7d6c"/>
  <rect x="210" y="28" width="122" height="64" rx="12" fill="#0a7d6c"/>
  <text x="271" y="56" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">답만 남김</text>
  <text x="271" y="76" text-anchor="middle" fill="#b8ebe0" font-size="10" font-family="system-ui">저장 안 함</text>
</svg>`,
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
      harness: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f0f4ff"/>
  <rect x="28" y="22" width="120" height="76" rx="12" fill="#fff" stroke="#4338ca" stroke-width="2"/>
  <text x="88" y="48" text-anchor="middle" fill="#4338ca" font-size="12" font-weight="700" font-family="system-ui">모델</text>
  <text x="88" y="68" text-anchor="middle" fill="#818cf8" font-size="11" font-family="system-ui">Opus · Spark…</text>
  <path d="M158 60 H188" stroke="#4338ca" stroke-width="3"/>
  <polygon points="188,54 202,60 188,66" fill="#4338ca"/>
  <rect x="210" y="18" width="122" height="84" rx="14" fill="#4338ca"/>
  <text x="271" y="48" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">하네스</text>
  <text x="271" y="68" text-anchor="middle" fill="#c7d2fe" font-size="10" font-family="system-ui">툴 · 메모리 · 루프</text>
  <text x="271" y="86" text-anchor="middle" fill="#a5b4fc" font-size="10" font-family="system-ui">실행 환경</text>
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
</svg>`,
      t2v: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#1a1a2e"/>
  <rect x="28" y="28" width="100" height="64" rx="10" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
  <text x="78" y="58" text-anchor="middle" fill="#7c3aed" font-size="12" font-weight="700" font-family="system-ui">글 프롬프트</text>
  <text x="78" y="76" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="system-ui">“비 오는 거리…”</text>
  <path d="M138 60 H168" stroke="#a78bfa" stroke-width="3"/>
  <polygon points="168,54 182,60 168,66" fill="#a78bfa"/>
  <rect x="190" y="24" width="140" height="72" rx="12" fill="#7c3aed"/>
  <text x="260" y="56" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">▶ 영상</text>
  <text x="260" y="76" text-anchor="middle" fill="#ddd6fe" font-size="11" font-family="system-ui">Text-to-Video</text>
</svg>`,
      i2v: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#0f172a"/>
  <rect x="30" y="26" width="88" height="68" rx="10" fill="#334155"/>
  <circle cx="58" cy="50" r="12" fill="#fbbf24"/>
  <path d="M38 82 L70 58 L90 72 L110 48 L118 82 Z" fill="#38bdf8"/>
  <path d="M130 60 H165" stroke="#38bdf8" stroke-width="3"/>
  <polygon points="165,54 179,60 165,66" fill="#38bdf8"/>
  <g>
    <rect x="188" y="30" width="48" height="36" rx="6" fill="#1e293b" stroke="#38bdf8"/>
    <rect x="244" y="42" width="48" height="36" rx="6" fill="#1e293b" stroke="#38bdf8"/>
    <rect x="300" y="28" width="40" height="36" rx="6" fill="#0ea5e9"/>
  </g>
  <text x="250" y="108" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="system-ui">한 장 → 움직임</text>
</svg>`,
      "native-audio": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#ecfdf5"/>
  <rect x="40" y="30" width="120" height="60" rx="12" fill="#059669"/>
  <text x="100" y="58" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">영상 프레임</text>
  <text x="100" y="76" text-anchor="middle" fill="#a7f3d0" font-size="11" font-family="system-ui">+ 소리 동시</text>
  <g fill="#047857">
    <rect x="200" y="48" width="8" height="24" rx="2"/><rect x="214" y="40" width="8" height="40" rx="2"/>
    <rect x="228" y="34" width="8" height="52" rx="2"/><rect x="242" y="42" width="8" height="36" rx="2"/>
    <rect x="256" y="38" width="8" height="44" rx="2"/><rect x="270" y="46" width="8" height="28" rx="2"/>
    <rect x="284" y="36" width="8" height="48" rx="2"/>
  </g>
  <text x="250" y="100" text-anchor="middle" fill="#065f46" font-size="11" font-family="system-ui">별도 TTS 패스 아님</text>
</svg>`,
      keyframe: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fff7ed"/>
  <circle cx="70" cy="60" r="22" fill="#ea580c"/>
  <text x="70" y="65" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="system-ui">시작</text>
  <path d="M100 60 H150" stroke="#fb923c" stroke-width="3" stroke-dasharray="6 4"/>
  <circle cx="180" cy="60" r="18" fill="#fdba74"/>
  <text x="180" y="64" text-anchor="middle" fill="#7c2d12" font-size="10" font-family="system-ui">중간</text>
  <path d="M205 60 H255" stroke="#fb923c" stroke-width="3" stroke-dasharray="6 4"/>
  <circle cx="290" cy="60" r="22" fill="#c2410c"/>
  <text x="290" y="65" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="system-ui">끝</text>
  <text x="180" y="100" text-anchor="middle" fill="#9a3412" font-size="11" font-family="system-ui">중요 컷만 찍고 AI가 잇기</text>
</svg>`,
      "lip-sync": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fdf2f8"/>
  <circle cx="100" cy="58" r="36" fill="#fce7f3" stroke="#db2777" stroke-width="2"/>
  <ellipse cx="100" cy="70" rx="14" ry="8" fill="#be185d"/>
  <circle cx="88" cy="52" r="3" fill="#831843"/><circle cx="112" cy="52" r="3" fill="#831843"/>
  <path d="M150 50 Q200 30 250 50" fill="none" stroke="#db2777" stroke-width="2"/>
  <rect x="220" y="40" width="100" height="44" rx="12" fill="#db2777"/>
  <text x="270" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">대사 · 음성</text>
  <text x="270" y="74" text-anchor="middle" fill="#fbcfe8" font-size="10" font-family="system-ui">입 모양 맞춤</text>
</svg>`,
      "draft-mode": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f8fafc"/>
  <rect x="36" y="32" width="100" height="56" rx="10" fill="#e2e8f0"/>
  <text x="86" y="58" text-anchor="middle" fill="#475569" font-size="12" font-weight="700" font-family="system-ui">초안</text>
  <text x="86" y="74" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="system-ui">빠르고 저렴</text>
  <text x="160" y="64" text-anchor="middle" fill="#0ea5e9" font-size="18">→</text>
  <rect x="190" y="28" width="130" height="64" rx="12" fill="#0ea5e9"/>
  <text x="255" y="56" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">풀퀄 렌더</text>
  <text x="255" y="74" text-anchor="middle" fill="#bae6fd" font-size="10" font-family="system-ui">같은 구도·모션</text>
</svg>`,
      upscale: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef2ff"/>
  <rect x="50" y="40" width="70" height="44" rx="8" fill="#818cf8"/>
  <text x="85" y="66" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">720p</text>
  <text x="150" y="66" text-anchor="middle" fill="#4f46e5" font-size="20">↗</text>
  <rect x="180" y="28" width="120" height="64" rx="10" fill="#4f46e5"/>
  <text x="240" y="58" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" font-family="system-ui">1080p</text>
  <text x="240" y="76" text-anchor="middle" fill="#c7d2fe" font-size="11" font-family="system-ui">업스케일</text>
</svg>`,
      "multi-shot": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#18181b"/>
  <rect x="24" y="28" width="90" height="52" rx="8" fill="#3f3f46"/>
  <text x="69" y="58" text-anchor="middle" fill="#e4e4e7" font-size="11" font-family="system-ui">샷 A</text>
  <rect x="128" y="36" width="90" height="52" rx="8" fill="#52525b"/>
  <text x="173" y="66" text-anchor="middle" fill="#e4e4e7" font-size="11" font-family="system-ui">샷 B</text>
  <rect x="232" y="28" width="100" height="52" rx="8" fill="#a1a1aa"/>
  <text x="282" y="58" text-anchor="middle" fill="#18181b" font-size="11" font-weight="700" font-family="system-ui">샷 C</text>
  <text x="180" y="102" text-anchor="middle" fill="#a1a1aa" font-size="11" font-family="system-ui">한 생성에 여러 컷</text>
</svg>`,
      "video-continuation": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#042f2e"/>
  <rect x="28" y="34" width="110" height="52" rx="10" fill="#0d9488"/>
  <text x="83" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">기존 클립</text>
  <text x="83" y="74" text-anchor="middle" fill="#99f6e4" font-size="10" font-family="system-ui">최대 ~4초</text>
  <path d="M150 60 H190" stroke="#2dd4bf" stroke-width="3"/>
  <polygon points="190,54 204,60 190,66" fill="#2dd4bf"/>
  <rect x="212" y="34" width="120" height="52" rx="10" fill="#14b8a6"/>
  <text x="272" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">이어쓰기</text>
  <text x="272" y="74" text-anchor="middle" fill="#ccfbf1" font-size="10" font-family="system-ui">모션·대사 연결</text>
</svg>`,
      "character-ip": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fff1f2"/>
  <circle cx="90" cy="56" r="30" fill="#fb7185"/>
  <text x="90" y="62" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" font-family="system-ui">캐릭터</text>
  <rect x="150" y="28" width="170" height="64" rx="12" fill="#fff" stroke="#e11d48" stroke-width="2"/>
  <text x="235" y="52" text-anchor="middle" fill="#9f1239" font-size="12" font-weight="700" font-family="system-ui">성격 · 세계관 · 일상</text>
  <text x="235" y="72" text-anchor="middle" fill="#fb7185" font-size="11" font-family="system-ui">팬덤 = IP 자산</text>
</svg>`,
      "ai-influencer": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f0f9ff"/>
  <circle cx="80" cy="55" r="28" fill="#38bdf8"/>
  <text x="80" y="60" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">AI</text>
  <rect x="130" y="30" width="60" height="50" rx="8" fill="#fff" stroke="#0ea5e9"/>
  <text x="160" y="58" text-anchor="middle" fill="#0369a1" font-size="11" font-family="system-ui">SNS</text>
  <rect x="210" y="30" width="60" height="50" rx="8" fill="#fff" stroke="#0ea5e9"/>
  <text x="240" y="58" text-anchor="middle" fill="#0369a1" font-size="11" font-family="system-ui">광고</text>
  <rect x="290" y="30" width="48" height="50" rx="8" fill="#0ea5e9"/>
  <text x="314" y="58" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="system-ui">₩</text>
  <text x="180" y="102" text-anchor="middle" fill="#0369a1" font-size="11" font-family="system-ui">가상 인물도 인플루언서 단가</text>
</svg>`,
      "short-drama": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#1c1917"/>
  <rect x="120" y="12" width="120" height="96" rx="14" fill="#292524" stroke="#a8a29e" stroke-width="2"/>
  <rect x="132" y="28" width="96" height="52" rx="6" fill="#44403c"/>
  <text x="180" y="58" text-anchor="middle" fill="#fafaf9" font-size="12" font-weight="700" font-family="system-ui">숏드라마</text>
  <circle cx="180" cy="92" r="6" fill="#57534e"/>
  <text x="180" y="116" text-anchor="middle" fill="#a8a29e" font-size="10" font-family="system-ui">세로 에피소드 · AI 배우</text>
</svg>`,
      lora: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#faf5ff"/>
  <rect x="40" y="32" width="100" height="56" rx="12" fill="#7c3aed"/>
  <text x="90" y="64" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">기본 모델</text>
  <text x="165" y="64" text-anchor="middle" fill="#7c3aed" font-size="22">+</text>
  <rect x="190" y="32" width="130" height="56" rx="12" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="255" y="58" text-anchor="middle" fill="#5b21b6" font-size="13" font-weight="700" font-family="system-ui">LoRA 어댑터</text>
  <text x="255" y="74" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="system-ui">스타일·인물 소량 학습</text>
</svg>`,
      "reference-image": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f1f5f9"/>
  <rect x="36" y="28" width="80" height="64" rx="8" fill="#cbd5e1"/>
  <text x="76" y="64" text-anchor="middle" fill="#334155" font-size="11" font-family="system-ui">참조 사진</text>
  <path d="M128 60 H168" stroke="#64748b" stroke-width="2"/>
  <rect x="176" y="24" width="148" height="72" rx="10" fill="#fff" stroke="#0f172a" stroke-width="2"/>
  <text x="250" y="56" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="700" font-family="system-ui">생성 결과</text>
  <text x="250" y="74" text-anchor="middle" fill="#64748b" font-size="10" font-family="system-ui">얼굴·구도 유지</text>
</svg>`,
      multimodal: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eff6ff"/>
  <circle cx="180" cy="60" r="22" fill="#2563eb"/>
  <text x="180" y="65" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="system-ui">한 모델</text>
  <rect x="40" y="28" width="56" height="28" rx="8" fill="#93c5fd"/><text x="68" y="46" text-anchor="middle" fill="#1e3a8a" font-size="10" font-family="system-ui">이미지</text>
  <rect x="40" y="64" width="56" height="28" rx="8" fill="#93c5fd"/><text x="68" y="82" text-anchor="middle" fill="#1e3a8a" font-size="10" font-family="system-ui">영상</text>
  <rect x="264" y="28" width="56" height="28" rx="8" fill="#93c5fd"/><text x="292" y="46" text-anchor="middle" fill="#1e3a8a" font-size="10" font-family="system-ui">오디오</text>
  <rect x="264" y="64" width="56" height="28" rx="8" fill="#93c5fd"/><text x="292" y="82" text-anchor="middle" fill="#1e3a8a" font-size="10" font-family="system-ui">텍스트</text>
</svg>`,
      "early-access": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fffbeb"/>
  <rect x="50" y="34" width="100" height="52" rx="12" fill="#f59e0b"/>
  <text x="100" y="64" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">얼리 액세스</text>
  <path d="M165 60 H210" stroke="#d97706" stroke-width="3" stroke-dasharray="4 3"/>
  <rect x="220" y="34" width="100" height="52" rx="12" fill="#fff" stroke="#d97706" stroke-width="2"/>
  <text x="270" y="64" text-anchor="middle" fill="#92400e" font-size="13" font-weight="700" font-family="system-ui">정식 GA</text>
</svg>`,
      deepfake: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fef2f2"/>
  <circle cx="100" cy="60" r="30" fill="#fecaca" stroke="#dc2626" stroke-width="2"/>
  <text x="100" y="66" text-anchor="middle" font-size="22">😶</text>
  <path d="M140 60 H190" stroke="#dc2626" stroke-width="2"/>
  <rect x="200" y="36" width="120" height="48" rx="10" fill="#dc2626"/>
  <text x="260" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">얼굴·목소리</text>
  <text x="260" y="74" text-anchor="middle" fill="#fecaca" font-size="10" font-family="system-ui">합성 · 주의</text>
</svg>`,
      credits: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f0fdf4"/>
  <circle cx="90" cy="60" r="28" fill="#16a34a"/>
  <text x="90" y="66" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" font-family="system-ui">🪙</text>
  <rect x="150" y="36" width="170" height="48" rx="12" fill="#fff" stroke="#16a34a" stroke-width="2"/>
  <text x="235" y="58" text-anchor="middle" fill="#14532d" font-size="12" font-weight="700" font-family="system-ui">생성 크레딧</text>
  <text x="235" y="74" text-anchor="middle" fill="#4ade80" font-size="10" font-family="system-ui">구독·종량 결제 단위</text>
</svg>`,
      rag: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef6f3"/>
  <rect x="20" y="28" width="92" height="64" rx="12" fill="#fff" stroke="#0a7d6c" stroke-width="2"/>
  <text x="66" y="56" text-anchor="middle" fill="#0a7d6c" font-size="12" font-weight="700" font-family="system-ui">문서 검색</text>
  <text x="66" y="74" text-anchor="middle" fill="#5f9e93" font-size="10" font-family="system-ui">사내 · 가이드</text>
  <path d="M122 60 H154" stroke="#0a7d6c" stroke-width="3"/>
  <polygon points="154,54 168,60 154,66" fill="#0a7d6c"/>
  <rect x="176" y="28" width="72" height="64" rx="12" fill="#0a7d6c"/>
  <text x="212" y="64" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">모델</text>
  <path d="M256 60 H286" stroke="#0a7d6c" stroke-width="3"/>
  <polygon points="286,54 300,60 286,66" fill="#0a7d6c"/>
  <rect x="306" y="36" width="38" height="48" rx="10" fill="#fff" stroke="#0a7d6c" stroke-width="2"/>
  <text x="325" y="64" text-anchor="middle" fill="#0a7d6c" font-size="11" font-weight="700" font-family="system-ui">답</text>
</svg>`,
      sandbox: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f4f0ea"/>
  <rect x="48" y="18" width="264" height="84" rx="16" fill="none" stroke="#b45309" stroke-width="3" stroke-dasharray="7 5"/>
  <rect x="86" y="36" width="188" height="50" rx="12" fill="#fff7ed" stroke="#b45309" stroke-width="2"/>
  <text x="180" y="58" text-anchor="middle" fill="#9a3412" font-size="13" font-weight="700" font-family="system-ui">코드 실행</text>
  <text x="180" y="76" text-anchor="middle" fill="#c2410c" font-size="10" font-family="system-ui">바깥 망 · 파일과 분리</text>
</svg>`,
      watermark: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fef2f2"/>
  <rect x="36" y="22" width="170" height="76" rx="12" fill="#fff" stroke="#b91c1c" stroke-width="2"/>
  <text x="121" y="56" text-anchor="middle" fill="#7f1d1d" font-size="13" font-weight="700" font-family="system-ui">생성 결과</text>
  <text x="121" y="76" text-anchor="middle" fill="#f87171" font-size="10" font-family="system-ui">이미지 · 영상</text>
  <rect x="150" y="40" width="168" height="44" rx="10" fill="#b91c1c" opacity="0.92"/>
  <text x="234" y="66" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">AI 표시 · 추적</text>
</svg>`,
      ga: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fffbeb"/>
  <rect x="28" y="30" width="118" height="60" rx="12" fill="#fff" stroke="#d97706" stroke-width="2"/>
  <text x="87" y="56" text-anchor="middle" fill="#92400e" font-size="12" font-weight="700" font-family="system-ui">베타 · 초대</text>
  <text x="87" y="74" text-anchor="middle" fill="#f59e0b" font-size="10" font-family="system-ui">제한 공개</text>
  <path d="M156 60 H196" stroke="#d97706" stroke-width="3"/>
  <polygon points="196,54 210,60 196,66" fill="#d97706"/>
  <rect x="218" y="30" width="118" height="60" rx="12" fill="#d97706"/>
  <text x="277" y="56" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">정식 공개</text>
  <text x="277" y="74" text-anchor="middle" fill="#fde68a" font-size="10" font-family="system-ui">GA · 전원 개방</text>
</svg>`,
      mcp: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef5ff"/>
  <rect x="22" y="30" width="96" height="60" rx="12" fill="#fff" stroke="#1d4ed8" stroke-width="2"/>
  <text x="70" y="56" text-anchor="middle" fill="#1d4ed8" font-size="13" font-weight="700" font-family="system-ui">모델</text>
  <text x="70" y="74" text-anchor="middle" fill="#60a5fa" font-size="10" font-family="system-ui">질문 · 계획</text>
  <rect x="132" y="42" width="96" height="36" rx="10" fill="#1d4ed8"/>
  <text x="180" y="65" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">MCP 규약</text>
  <rect x="242" y="22" width="96" height="28" rx="8" fill="#fff" stroke="#1d4ed8" stroke-width="2"/>
  <text x="290" y="41" text-anchor="middle" fill="#1d4ed8" font-size="11" font-weight="700" font-family="system-ui">검색</text>
  <rect x="242" y="70" width="96" height="28" rx="8" fill="#fff" stroke="#1d4ed8" stroke-width="2"/>
  <text x="290" y="89" text-anchor="middle" fill="#1d4ed8" font-size="11" font-weight="700" font-family="system-ui">도구</text>
  <path d="M118 60 H132" stroke="#1d4ed8" stroke-width="3"/>
  <path d="M228 50 H242" stroke="#1d4ed8" stroke-width="2"/>
  <path d="M228 70 H242" stroke="#1d4ed8" stroke-width="2"/>
</svg>`,
      hdr: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#111827"/>
  <rect x="28" y="28" width="130" height="64" rx="10" fill="#374151"/>
  <text x="93" y="56" text-anchor="middle" fill="#9ca3af" font-size="13" font-weight="700" font-family="system-ui">SDR</text>
  <text x="93" y="76" text-anchor="middle" fill="#6b7280" font-size="10" font-family="system-ui">표준 밝기</text>
  <text x="175" y="66" text-anchor="middle" fill="#fbbf24" font-size="18">→</text>
  <rect x="202" y="22" width="130" height="76" rx="12" fill="#fbbf24"/>
  <text x="267" y="56" text-anchor="middle" fill="#111827" font-size="14" font-weight="700" font-family="system-ui">HDR</text>
  <text x="267" y="76" text-anchor="middle" fill="#78350f" font-size="10" font-family="system-ui">하이 다이내믹</text>
</svg>`,
      asr: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#ecfdf5"/>
  <rect x="36" y="34" width="88" height="52" rx="12" fill="#059669"/>
  <text x="80" y="66" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" font-family="system-ui">🎙</text>
  <text x="160" y="58" fill="#065f46" font-size="14" font-weight="700" font-family="system-ui">→ 텍스트</text>
  <text x="160" y="82" fill="#047857" font-size="11" font-family="system-ui">ASR 자동 음성 인식</text>
</svg>`,
      wer: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fff7ed"/>
  <text x="180" y="28" text-anchor="middle" fill="#9a3412" font-size="12" font-family="system-ui">맞은 단어 vs 틀린 단어</text>
  <rect x="28" y="44" width="70" height="40" rx="10" fill="#16a34a"/>
  <text x="63" y="70" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">맞음</text>
  <rect x="108" y="44" width="70" height="40" rx="10" fill="#16a34a"/>
  <text x="143" y="70" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">맞음</text>
  <rect x="188" y="44" width="70" height="40" rx="10" fill="#dc2626"/>
  <text x="223" y="70" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">틀림</text>
  <rect x="268" y="44" width="70" height="40" rx="10" fill="#16a34a"/>
  <text x="303" y="70" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">맞음</text>
  <text x="180" y="106" text-anchor="middle" fill="#c2410c" font-size="12" font-family="system-ui">WER = 틀린 비율 · 낮을수록 정확</text>
</svg>`,
      cot: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef2ff"/>
  <rect x="20" y="36" width="88" height="48" rx="16" fill="#fff" stroke="#4338ca" stroke-width="2"/>
  <text x="64" y="66" text-anchor="middle" fill="#4338ca" font-size="12" font-weight="700" font-family="system-ui">생각1</text>
  <path d="M112 60 H138" stroke="#4338ca" stroke-width="3"/>
  <polygon points="138,54 150,60 138,66" fill="#4338ca"/>
  <rect x="154" y="36" width="88" height="48" rx="16" fill="#fff" stroke="#4338ca" stroke-width="2"/>
  <text x="198" y="66" text-anchor="middle" fill="#4338ca" font-size="12" font-weight="700" font-family="system-ui">생각2</text>
  <path d="M246 60 H272" stroke="#4338ca" stroke-width="3"/>
  <polygon points="272,54 284,60 272,66" fill="#4338ca"/>
  <rect x="288" y="36" width="52" height="48" rx="16" fill="#4338ca"/>
  <text x="314" y="66" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">답</text>
  <text x="180" y="108" text-anchor="middle" fill="#3730a3" font-size="11" font-family="system-ui">연쇄 사고 · 한 줄씩 이어서 생각</text>
</svg>`,
      mhs: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f3f4f6"/>
  <rect x="22" y="28" width="88" height="64" rx="12" fill="#111827"/>
  <text x="66" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">에이전트</text>
  <text x="66" y="76" text-anchor="middle" fill="#9ca3af" font-size="10" font-family="system-ui">읽기 · 쓰기</text>
  <path d="M118 60 H150" stroke="#111827" stroke-width="3"/>
  <polygon points="150,54 164,60 150,66" fill="#111827"/>
  <rect x="172" y="22" width="70" height="32" rx="8" fill="#fff" stroke="#111827" stroke-width="2"/>
  <text x="207" y="43" text-anchor="middle" fill="#111827" font-size="11" font-weight="700" font-family="system-ui">현미경</text>
  <rect x="172" y="66" width="70" height="32" rx="8" fill="#fff" stroke="#111827" stroke-width="2"/>
  <text x="207" y="87" text-anchor="middle" fill="#111827" font-size="11" font-weight="700" font-family="system-ui">로봇팔</text>
  <rect x="256" y="34" width="82" height="52" rx="12" fill="#0a7d6c"/>
  <text x="297" y="58" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">MHS</text>
  <text x="297" y="76" text-anchor="middle" fill="#b8ebe0" font-size="10" font-family="system-ui">공통 규약</text>
</svg>`,
      inpaint: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#fff7ed"/>
  <rect x="36" y="24" width="160" height="72" rx="12" fill="#fed7aa"/>
  <rect x="92" y="42" width="48" height="36" rx="6" fill="#fff" stroke="#ea580c" stroke-dasharray="4 3"/>
  <text x="116" y="65" text-anchor="middle" fill="#c2410c" font-size="16">+</text>
  <path d="M210 60 H246" stroke="#ea580c" stroke-width="3"/>
  <polygon points="246,54 260,60 246,66" fill="#ea580c"/>
  <rect x="268" y="24" width="64" height="72" rx="12" fill="#ea580c"/>
  <text x="300" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">메움</text>
  <text x="300" y="76" text-anchor="middle" fill="#ffedd5" font-size="10" font-family="system-ui">빈 칸만</text>
</svg>`,
      outpaint: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#ecfeff"/>
  <rect x="118" y="34" width="70" height="52" rx="8" fill="#0891b2"/>
  <text x="153" y="65" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="system-ui">원본</text>
  <rect x="78" y="28" width="204" height="64" rx="12" fill="none" stroke="#0e7490" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="180" y="108" text-anchor="middle" fill="#155e75" font-size="11" font-family="system-ui">화면을 바깥으로 넓힘</text>
</svg>`,
      maas: `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eef2ff"/>
  <rect x="24" y="30" width="100" height="60" rx="12" fill="#fff" stroke="#3730a3" stroke-width="2"/>
  <text x="74" y="56" text-anchor="middle" fill="#3730a3" font-size="12" font-weight="700" font-family="system-ui">모델 파일</text>
  <text x="74" y="74" text-anchor="middle" fill="#6366f1" font-size="10" font-family="system-ui">내가 호스팅</text>
  <path d="M132 60 H176" stroke="#3730a3" stroke-width="3"/>
  <polygon points="176,54 190,60 176,66" fill="#3730a3"/>
  <rect x="198" y="24" width="138" height="72" rx="14" fill="#3730a3"/>
  <text x="267" y="54" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui">API로 빌려 줌</text>
  <text x="267" y="76" text-anchor="middle" fill="#c7d2fe" font-size="11" font-family="system-ui">MaaS</text>
</svg>`,
      "world-model": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#f0fdf4"/>
  <rect x="28" y="28" width="120" height="64" rx="12" fill="#166534"/>
  <text x="88" y="56" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">장면 이해</text>
  <text x="88" y="74" text-anchor="middle" fill="#bbf7d0" font-size="10" font-family="system-ui">물리·인과</text>
  <path d="M156 60 H196" stroke="#166534" stroke-width="3"/>
  <polygon points="196,54 210,60 196,66" fill="#166534"/>
  <rect x="218" y="22" width="114" height="76" rx="14" fill="#fff" stroke="#166534" stroke-width="2"/>
  <text x="275" y="48" text-anchor="middle" fill="#166534" font-size="12" font-weight="700" font-family="system-ui">다음 프레임</text>
  <text x="275" y="68" text-anchor="middle" fill="#15803d" font-size="10" font-family="system-ui">행동에 반응</text>
  <text x="275" y="86" text-anchor="middle" fill="#86efac" font-size="10" font-family="system-ui">월드 모델</text>
</svg>`,
      "diarization": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#eff6ff"/>
  <rect x="24" y="30" width="70" height="60" rx="12" fill="#1d4ed8"/>
  <text x="59" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">A</text>
  <text x="59" y="74" text-anchor="middle" fill="#bfdbfe" font-size="10" font-family="system-ui">화자</text>
  <rect x="108" y="30" width="70" height="60" rx="12" fill="#2563eb"/>
  <text x="143" y="58" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui">B</text>
  <text x="143" y="74" text-anchor="middle" fill="#bfdbfe" font-size="10" font-family="system-ui">화자</text>
  <path d="M190 60 H230" stroke="#1d4ed8" stroke-width="3"/>
  <polygon points="230,54 244,60 230,66" fill="#1d4ed8"/>
  <rect x="252" y="28" width="84" height="64" rx="12" fill="#fff" stroke="#1d4ed8" stroke-width="2"/>
  <text x="294" y="55" text-anchor="middle" fill="#1d4ed8" font-size="11" font-weight="700" font-family="system-ui">누가</text>
  <text x="294" y="72" text-anchor="middle" fill="#3b82f6" font-size="11" font-family="system-ui">말했나</text>
</svg>`,
      "recurrent-depth": `
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="120" fill="#faf5ff"/>
  <circle cx="90" cy="60" r="36" fill="none" stroke="#7c3aed" stroke-width="3"/>
  <path d="M90 36 A24 24 0 1 1 66 78" fill="none" stroke="#7c3aed" stroke-width="3"/>
  <polygon points="62,72 54,84 72,80" fill="#7c3aed"/>
  <text x="90" y="64" text-anchor="middle" fill="#7c3aed" font-size="11" font-weight="700" font-family="system-ui">루프</text>
  <path d="M140 60 H180" stroke="#7c3aed" stroke-width="3"/>
  <polygon points="180,54 194,60 180,66" fill="#7c3aed"/>
  <rect x="202" y="28" width="130" height="64" rx="12" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
  <text x="267" y="52" text-anchor="middle" fill="#7c3aed" font-size="12" font-weight="700" font-family="system-ui">안쪽 계산</text>
  <text x="267" y="72" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="system-ui">글자로 안 보임</text>
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
      id: "harness",
      term: "하네스",
      en: "Harness",
      tag: "model",
      tagLabel: "모델",
      text: "모델을 감싸 툴·메모리·루프를 돌리는 실행 환경(코딩 에이전트 뼈대)이에요.",
      detail: "하네스는 모델 자체와 별개로, 에이전트가 도구를 호출하고 컨텍스트를 유지하며 여러 턴 작업을 이어 가게 만드는 런타임·스캐폴딩입니다. Claude Code, Codex, Muse Code, Prime Agent처럼 ‘같은 모델 + 다른 하네스’면 벤치 점수(ARC-AGI 등)와 실무 체감이 달라질 수 있습니다. 브리프에서 하네스 공개·오픈소스 하네스 점수는 모델 재출시가 아니라 별도 시그널로 둡니다.",
      firstSeen: "2026-08-06"
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
    },
    {
      id: "t2v",
      term: "T2V",
      en: "Text-to-Video",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "글 프롬프트만으로 영상 클립을 만드는 방식이에요.",
      detail: "Text-to-Video(T2V)는 텍스트 설명만 넣고 영상 시퀀스를 생성하는 파이프라인입니다. ‘비 오는 밤 골목, 네온, 슬로 트래킹’처럼 장면·카메라·분위기를 글로 적으면 모델이 프레임 흐름을 만듭니다. 숏폼·MV 프리비즈·광고 콘셉트 탐색에 쓰이고, 초수·해상도·오디오 포함 여부가 툴마다 다릅니다. 실무에서는 초안 T2V → 키프레임·I2V로 고정하는 식의 단계 파이프가 흔합니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "i2v",
      term: "I2V",
      en: "Image-to-Video",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "한 장의 정지 이미지를 출발점으로 움직임을 입히는 방식이에요.",
      detail: "Image-to-Video(I2V)는 포스터·키아트·스타트 프레임을 넣고 카메라 움직임·피사체 모션을 생성합니다. 브랜드 비주얼 아이덴티티를 유지한 채 숏폼으로 확장할 때 T2V보다 통제가 쉽습니다. 끝 프레임·키프레임을 같이 주는 모델도 있고, 얼굴·로고 일관성은 레퍼런스·시드로 보완합니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "native-audio",
      term: "네이티브 오디오",
      en: "Native audio",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "영상 프레임과 같은 생성 패스에서 대사·효과음·앰비언스를 같이 뽑는 방식이에요.",
      detail: "네이티브 오디오는 완성 영상에 TTS·사운드 디자인을 따로 얹는 후처리와 달리, 모델이 영상과 소리를 한 번에 맞춥니다. 립싱크·발소리·환경음 동기화가 장점이고, FLUX 3 Video처럼 ‘최대 N초 + 네이티브 오디오’로 스펙에 적히는 경우가 많습니다. 광고·숏드라마 파이프에서는 별도 보이스 스택 비용을 줄일 수 있지만, 브랜드 보이스 가이드·음악 저작권은 여전히 별도 점검이 필요합니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "keyframe",
      term: "키프레임",
      en: "Keyframe",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "시작·끝·중요 컷처럼 ‘꼭 맞출 장면’을 찍어 두고, 사이 움직임을 AI가 잇게 하는 기준 프레임이에요.",
      detail: "키프레임은 애니메이션·편집에서 중요한 포즈·구도를 고정하는 프레임입니다. 생성 영상 툴에서는 시작 이미지 + 끝 이미지, 또는 여러 장 시퀀스를 주고 자연스러운 전환을 만들 때 씁니다. 감독·아트가 ‘이 구도는 필수’일 때 T2V 자유 생성보다 키프레임 제어가 안전합니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "lip-sync",
      term: "립싱크",
      en: "Lip-sync",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "대사·노래 타이밍에 맞춰 입 모양·얼굴 움직임을 맞추는 기술이에요.",
      detail: "립싱크는 음성 파형·음소에 맞춰 캐릭터 입이 움직이도록 정렬하는 작업입니다. AI 영상·디지털 휴먼·숏드라마에서 다국어 대사 생성 시 ‘자연스러운 입 모양’이 품질 지표가 됩니다. 네이티브 오디오 모델이 립싱크를 내장하기도 하고, 후처리 전용 툴을 쓰기도 합니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "draft-mode",
      term: "Draft 모드",
      en: "Draft mode",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "저비용·저해상도로 빠른 초안을 뽑고, 마음에 들면 같은 구도로 풀퀄 렌더하는 모드예요.",
      detail: "Draft(드래프트) 모드는 탐색용 프리뷰입니다. 프롬프트·구도·모션을 여러 번 돌려본 뒤, 확정본만 고해상도·긴 초수로 렌더해 크레딧을 아낍니다. FLUX 3 Video 등은 드래프트와 파이널이 같은 구성·모션을 유지한다고 명시하기도 합니다. 팀 워크플로에서는 ‘드래프트 리뷰 → 승인자 → 파이널’ 단계를 두면 비용 통제가 쉽습니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "upscale",
      term: "업스케일",
      en: "Upscale",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "720p처럼 낮은 해상도 결과물을 1080p·4K 등으로 키우며 디테일을 보완하는 단계예요.",
      detail: "업스케일은 생성·촬영본의 가로·세로 픽셀을 늘리고 선명도를 복원하는 후처리입니다. 생성 모델이 HD로 뽑고 Full HD는 업스케일 경로로 제공하는 식이 흔합니다. 과하면 플라스틱 질감·아티팩트가 생길 수 있어, 최종 배포 해상도 기준으로 파이프를 맞춥니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "multi-shot",
      term: "멀티 샷",
      en: "Multi-shot",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "한 번의 생성 안에 여러 카메라 앵글·장면을 이어 담는 방식이에요.",
      detail: "멀티 샷은 단일 연속 테이크가 아니라, 컷이 나뉜 시퀀스를 한 클립에서 만드는 능력입니다. 숏폼·트레일러 톤을 빠르게 잡을 때 유리하고, 샷 간 캐릭터·조명 일관성이 품질 포인트입니다. 편집 팀이 쓰려면 샷 경계를 인식해 타임라인으로 쪼개는 후속 작업이 필요할 수 있습니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "video-continuation",
      term: "비디오 컨티뉴에이션",
      en: "Video continuation",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "이미 있는 영상·오디오 일부를 넣고 ‘다음에 무슨 일이 이어질지’를 이어서 생성하는 기능이에요.",
      detail: "Video continuation은 최대 수 초의 기존 클립을 시드로 삼아 모션·카메라·대사를 끊김 없이 연장합니다. 시리즈 숏폼·스토리 이어가기·리테이크 대체에 쓰고, 시접(seam)에서 점프컷이 생기지 않는지가 관건입니다. 편집 파이프의 중간 노드로 두면 ‘찍은 컷 → AI 연장 → 다시 편집’ 루프가 가능합니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "character-ip",
      term: "캐릭터 IP",
      en: "Character IP",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "얼굴 하나가 아니라, 성격·이야기·일상 루틴까지 갖춰 팬덤이 생기는 캐릭터 자산이에요.",
      detail: "캐릭터 IP는 외형 디자인에 그치지 않고 세계관·말투·관계성·시리즈 서사로 ‘다시 보고 싶은 인물’을 만드는 자산입니다. AI 숏드라마·버추얼 휴먼 시대에는 제작비 절감보다 IP의 광고·굿즈·세계관 확장 가치가 논의됩니다. 브리프의 팡타오쯔 사례처럼 팔로 수·광고 제안가가 이슈가 되면, 단가표에 실인 vs 캐릭터 IP 행을 나누는 편이 좋습니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "ai-influencer",
      term: "AI 인플루언서",
      en: "AI / virtual influencer",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "실제 사람이 아닌 AI·가상 캐릭터가 SNS에서 팔로워를 모으고 광고를 받는 형태예요.",
      detail: "AI·가상 인플루언서는 생성 이미지·영상으로 계정을 운영하며 브랜디드 콘텐츠·라이브 커머스에 참여합니다. 장점은 스케줄·이미지 통제와 ‘불탱’ 리스크 완화 프레이밍이고, 과제는 AI 고지·신뢰·실제 계약 단가 검증입니다. 운영사 제안가와 체결액은 다를 수 있으니 브리프 수치를 계약액으로 단정하지 않습니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "short-drama",
      term: "숏드라마",
      en: "Short drama",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "세로형·짧은 회차로 소비하는 드라마 포맷이에요. AI 배우·생성 영상과 자주 붙습니다.",
      detail: "숏드라마는 모바일 세로 화면에 맞춘 수 분 내외 에피소드 시리즈입니다. 중국 시장에서 먼저 규모가 커졌고, AI 생성 배우·배경으로 제작 속도를 올리는 실험이 이어집니다. 콘텐츠 팀은 ‘에피소드 공장’ 파이프(대본→샷→생성→편집→계정 운영)와 캐릭터 IP 수익화(광고·굿즈)를 같이 봅니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "lora",
      term: "LoRA",
      en: "Low-Rank Adaptation",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "큰 모델을 통째로 다시 학습하지 않고, 작은 어댑터로 스타일·인물을 입히는 기법이에요.",
      detail: "LoRA는 기반 모델 가중치는 고정한 채 저랭크 행렬만 학습해 스타일·캐릭터·브랜드 룩을 이식합니다. 파일 용량이 작고 여러 LoRA를 섞어 쓰는 워크플로가 흔합니다. 팀 공용 ‘브랜드 LoRA’를 만들어 두면 외주·내부 생성물의 톤 일관성에 도움이 됩니다. 라이선스·학습 데이터 출처는 별도 확인이 필요합니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "reference-image",
      term: "레퍼런스 이미지",
      en: "Reference image",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "생성 때 ‘이 얼굴·이 구도·이 스타일을 참고해’라고 넣는 기준 이미지예요.",
      detail: "레퍼런스 이미지는 프롬프트만으로 부족한 시각 조건을 사진·일러스트로 고정합니다. I2V의 시작 프레임, 캐릭터 일관성, 제품 샷 유지에 필수입니다. 여러 장을 넣는 멀티 레퍼런스 모델도 있고, 가중치·마스크로 영향 범위를 조절하기도 합니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "multimodal",
      term: "멀티모달",
      en: "Multimodal",
      tag: "model",
      tagLabel: "모델",
      text: "글·이미지·영상·소리처럼 여러 종류의 입출력을 하나의 모델이 다루는 구조예요.",
      detail: "멀티모달 모델은 텍스트만이 아니라 이미지·오디오·비디오 등을 같은 표현 공간에서 이해·생성합니다. FLUX 3처럼 영상+오디오+이미지를 한 백본으로 묶는 발표가 대표적입니다. 콘텐츠 팀에선 ‘툴을 여러 개 잇는 파이프’ 대신 ‘한 모델에 섞어 넣기’ 실험이 늘고, 권한·안전 정책도 모달리티별로 달라집니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "early-access",
      term: "얼리 액세스",
      en: "Early access",
      tag: "basics",
      tagLabel: "기초",
      text: "정식 공개 전에 신청·초대된 사용자만 먼저 써 보는 단계예요.",
      detail: "얼리 액세스(또는 클로즈드 베타)는 품질·안전·용량을 검증하려고 접근을 제한한 기간입니다. 브리프에서는 ‘얼리 → API GA’처럼 상태 업그레이드가 뉴스입니다. 같은 베타 단계 재탕은 피하고, 누가 쓸 수 있는지·대기열·유료 여부를 카드에 적습니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "deepfake",
      term: "딥페이크",
      en: "Deepfake",
      tag: "risk",
      tagLabel: "주의",
      text: "실제와 구분하기 어렵게 얼굴·목소리를 합성하는 기술·결과물을 가리켜요. 악용 위험이 큽니다.",
      detail: "딥페이크는 학습 기반 합성으로 특정 인물의 얼굴·음성을 다른 영상에 옮기거나 가짜 발언을 만드는 기술입니다. 엔터테인먼트·더빙에 쓰이기도 하지만, 사칭·비동의 합성(NCII)·선거 개입 등 리스크가 커서 워터마크·탐지·동의 절차가 함께 논의됩니다. 제작 파이프에 쓸 때는 초상권·초상 라이선스·고지 문구를 체크리스트에 넣습니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "zdr",
      term: "ZDR",
      en: "Zero Data Retention",
      tag: "work",
      tagLabel: "활용",
      text: "요청이 끝나면 프롬프트나 파일을 서버에 남기지 않는 약정이에요. 데이터 미보관이라고 불러요.",
      detail: "ZDR(Zero Data Retention)은 API 호출이 끝난 뒤 입력·출력을 보관하지 않겠다는 엔터 약정입니다. 학습에도 안 쓰고, 로그에도 안 남기는 쪽이 목표예요. Files API처럼 파일을 워크스페이스에 올려 두는 기능은 보통 ZDR 밖이라서, 올린 파일이 만료 전까지 남아 있습니다. 브랜드 가이드나 캠페인 원본을 올릴 때는 워크스페이스 분리와 만료 설정을 같이 보시면 됩니다.",
      firstSeen: "2026-08-20"
    },
    {
      id: "credits",
      term: "크레딧",
      en: "Credits",
      tag: "work",
      tagLabel: "활용",
      text: "생성 툴에서 한 번 렌더·한 장 뽑을 때마다 깎이는 사용량 단위예요.",
      detail: "크레딧은 구독 플랜에 묶이거나 종량 과금되는 ‘생성 횟수·연산량’ 단위입니다. Draft는 적게, 고해상·긴 초수는 많이 소모하는 식입니다. 팀 예산 관리에서는 인원별 크레딧 캡, 프로모 종료일, 연간 할인 조건을 브리프 가격 카드와 같이 봅니다.",
      firstSeen: "2026-08-05"
    },
    {
      id: "rag",
      term: "RAG",
      en: "Retrieval-Augmented Generation",
      tag: "work",
      tagLabel: "활용",
      text: "답을 만들기 전에 사내 문서 같은 걸 먼저 찾아 붙이는 방식이에요. 검색 증강 생성이라고 불러요.",
      detail: "RAG(Retrieval-Augmented Generation, 검색 증강 생성)는 모델 기억만으로 답하지 않고, 검색·벡터 저장소에서 관련 문서를 가져온 뒤 그 조각을 프롬프트에 넣어 생성합니다. 사내 규정·캠페인 가이드처럼 ‘우리 자료’를 붙일 때 환각을 줄이는 기본 패턴이에요. 설치 당일 RAG가 켜진다는 말은 온프레 문서 검색이 바로 붙는다는 뜻으로 보시면 됩니다. 검색 품질·권한·최신성이 답 품질을 좌우해요.",
      firstSeen: "2026-08-20"
    },
    {
      id: "sandbox",
      term: "샌드박스",
      en: "Sandbox",
      tag: "work",
      tagLabel: "활용",
      text: "에이전트가 코드를 돌릴 때, 바깥 시스템과 떨어뜨려 두는 격리 실행 환경이에요.",
      detail: "샌드박스는 프로세스·네트워크·파일을 제한한 실행 칸입니다. 코딩 에이전트나 스킬이 패키지를 깔거나 사내망에 손대지 못하게 막을 때 씁니다. 셀프호스티드 샌드박스에 메모리 스토어를 붙인다는 말은, 격리는 유지한 채 대화 기억만 연결한다는 뜻이에요. 권한 최소화·사람 승인과 같이 설계하는 경우가 많아요.",
      firstSeen: "2026-08-20"
    },
    {
      id: "watermark",
      term: "워터마크",
      en: "Watermark",
      tag: "risk",
      tagLabel: "주의",
      text: "생성된 이미지·영상에 ‘AI가 만든 결과’라는 흔적을 심어 두는 표시예요.",
      detail: "워터마크는 눈에 보이는 로고일 수도 있고, 픽셀·비트에 숨긴 탐지용 신호일 수도 있습니다. 딥페이크·비동의 합성 대응, 플랫폼 고지, 출처 추적에 쓰여요. 토글을 끄면 표시가 빠지는 제품도 있어, 브랜드 배포 전에 켜짐 여부와 탐지 가능 여부를 확인하는 편이 안전합니다.",
      firstSeen: "2026-08-20"
    },
    {
      id: "ga",
      term: "정식 공개",
      en: "Generally Available",
      tag: "basics",
      tagLabel: "기초",
      text: "베타·초대 없이 대상 사용자에게 제품이 열린 상태예요. 영문에선 GA라고 불러요.",
      detail: "GA(Generally Available)는 얼리 액세스·클로즈드 베타가 끝나고 일반(또는 해당 플랜) 사용자에게 정식으로 열리는 단계입니다. 본문 기본은 ‘정식 공개’이고, 하이라이트가 필요하면 `GA(정식 공개)`처럼 약어도 같이 둡니다. 베타 헤더 해제·API 정식은 이 전환을 가리켜요. 같은 베타 단계 재탕은 카드로 올리지 않습니다.",
      firstSeen: "2026-08-20"
    },
    {
      id: "mcp",
      term: "MCP",
      en: "Model Context Protocol",
      tag: "work",
      tagLabel: "활용",
      text: "모델이 검색·도구·데이터를 부를 때 쓰는 공통 연결 규약이에요. 모델 컨텍스트 프로토콜이라고 불러요.",
      detail: "MCP(Model Context Protocol, 모델 컨텍스트 프로토콜)는 모델이 파일·검색·외부 앱 같은 도구를 같은 방식으로 부르도록 정한 연결 규약입니다. Slack·법률 워크벤치·거래소처럼 서로 다른 제품이 ‘도구 서버’를 열어 두면, 에이전트가 각각 다른 플러그인을 배우지 않고도 권한을 나눠 쓸 수 있어요. 읽기 전용과 실행 권한을 나누고, 사람 승인 뒤에만 나가게 설계하는 경우가 많아요.",
      firstSeen: "2026-08-21"
    },
    {
      id: "hdr",
      term: "HDR",
      en: "High Dynamic Range",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "아주 밝은 하이라이트와 아주 어두운 그림자를 한 화면에 같이 담는 넓은 밝기 범위예요. 맞은편은 SDR(표준 다이내믹 레인지)이에요.",
      detail: "HDR(High Dynamic Range, 하이 다이내믹 레인지)은 화면이 담을 수 있는 밝기·대비 폭을 넓힌 영상 규격입니다. SDR(Standard Dynamic Range) 납품본은 TV·웹에서 흔히 보는 표준 밝기고, HDR10·HLG·PQ 같은 마스터는 하이라이트가 더 살아납니다. Runway Ruby처럼 SDR을 다시 그리지 않고 HDR로 넘기는 단계는 해상도를 키우는 업스케일과 달리 색 마스터에 가깝습니다. 캠페인 히어로를 HDR로 내야 하면 납품 규격(HDR10/HLG/ProRes/EXR)을 먼저 맞춰 두세요.",
      firstSeen: "2026-08-24"
    },
    {
      id: "asr",
      term: "ASR",
      en: "Automatic Speech Recognition",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "말소리를 글자로 바꿔 주는 자동 음성 인식이에요. 인터뷰·원테이크를 자막·스크립트로 뽑을 때 쓰는 층이에요.",
      detail: "ASR(Automatic Speech Recognition, 자동 음성 인식)은 음성을 텍스트로 옮기는 기술입니다. 영상 후반·고객센터·회의록처럼 ‘듣고 받아 적는’ 일이 필요할 때 쓰고요. WER(단어 오류율)은 틀린 단어 비율, RTFx(실시간 배수)는 실제 시간보다 몇 배로 빨리 도는지 보여 줘요. 번역·요약은 보통 ASR 다음에 붙는 별도 단계예요.",
      firstSeen: "2026-08-26"
    },
    {
      id: "wer",
      term: "WER",
      en: "Word Error Rate",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "받아 적은 글이 원문과 얼마나 다른지 보는 틀린 단어 비율이에요. 낮을수록 전사가 정확해요.",
      detail: "WER(Word Error Rate, 단어 오류율)은 자동 음성 인식이 원문 대비 삽입·삭제·교체한 단어 수를 전체 단어로 나눈 값입니다. 4.0%면 100단어 중 대략 네 곳이 틀린 셈이에요. 스트리밍(실시간)과 파일(비스트리밍) 숫자는 보통 따로 적히고, 벤치 세트·언어가 바뀌면 같은 모델도 값이 달라요. ASR 카드를 볼 때 속도(RTFx)와 짝으로 보시면 돼요.",
      firstSeen: "2026-08-27"
    },
    {
      id: "cot",
      term: "CoT",
      en: "Chain of Thought",
      tag: "model",
      tagLabel: "모델",
      text: "답을 내기 전에 생각을 한 줄씩 이어 가는 연쇄 사고예요. 모니터하면 이상한 목표를 더 일찍 볼 수 있어요.",
      detail: "CoT(Chain of Thought, 연쇄 사고)는 모델이 최종 답 앞에 중간 추론을 풀어 쓰는 방식입니다. 코딩·수학에서 단계를 밝히면 맞힐 확률이 올라가는 편이고, 에이전트 안전에서는 그 생각 스트림을 감시해 위험한 계획을 중간에 끊기도 해요. OpenAI 리포트의 CoT 모니터는 이 작업 메모를 보고 이상 행동을 호출하는 장치에 가깝습니다. 생각 토큰은 출력 요금에 잡히는 경우가 많아요.",
      firstSeen: "2026-08-27"
    },
    {
      id: "mhs",
      term: "MHS",
      en: "Model Hardware Standard",
      tag: "work",
      tagLabel: "활용",
      text: "에이전트가 현미경·로봇팔 같은 기계를 같은 말로 다루게 하는 공통 규약이에요.",
      detail: "MHS(Model Hardware Standard, 모델 하드웨어 스탠더드)는 Anthropic이 연 기계-에이전트 연결 규약입니다. 온도 읽기·쓰기처럼 짧은 명령으로 장치를 번역하고, 팔 무게 같은 안전 정보를 자연어 태그로 적어두면 처음 보는 기계도 다룰 수 있어요. MCP·명령줄·코드 파일로 붙일 수 있고, 연구 미리보기 뒤에 오픈소스로 풀 계획이에요. 영상 API가 아니라 실험실·공장 기계를 에이전트에 붙이는 층이에요.",
      firstSeen: "2026-08-28"
    },
    {
      id: "inpaint",
      term: "인페인팅",
      en: "Inpainting",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "그림에서 빈 칸이나 지우고 싶은 부분만 골라, 그 자리만 다시 그려 넣는 편집이에요.",
      detail: "인페인팅은 마스크로 고른 영역만 모델이 다시 채우는 이미지 편집입니다. 로고를 빼거나, 손에 든 소품만 바꾸거나, 얼굴만 다듬을 때 써요. 바깥 픽셀은 그대로 두고 안쪽만 고치므로, 전체 재생성보다 구도와 브랜드 요소를 지키기 쉬워요. Midjourney V8.2 편집 모델처럼 지시문·레퍼런스 이미지와 같이 쓰는 경우가 많아요.",
      firstSeen: "2026-08-28"
    },
    {
      id: "outpaint",
      term: "아웃페인팅",
      en: "Outpainting",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "이미 있는 그림의 바깥을 이어서 그려, 화면을 더 넓히는 편집이에요.",
      detail: "아웃페인팅은 원본 프레임 밖을 모델이 이어서 그리는 확장 편집입니다. 세로 숏폼을 가로 히어로로 넓히거나, 잘린 배경을 살릴 때 써요. 인페인팅이 안쪽을 메운다면 아웃페인팅은 캔버스를 키우는 쪽에 가깝습니다. 가장자리가 어색하면 프롬프트로 이어질 배경을 한 줄 더 적거나, 넓힌 뒤 한 번 더 다듬으면 좋아요.",
      firstSeen: "2026-08-28"
    },
    {
      id: "maas",
      term: "MaaS",
      en: "Model as a Service",
      tag: "work",
      tagLabel: "활용",
      text: "모델 파일을 내가 띄워 두고, 남에게 API처럼 빌려 주는 호스팅 사업이에요.",
      detail: "MaaS(Model as a Service, 모델 즉 서비스)는 다운로드한 가중치를 자기 서버에 올려 제3자가 입력·파라미터·학습 데이터를 실질적으로 고르게 하는 호스팅입니다. 앱 기능 안에만 모델을 심거나, 남의 창구로 요청만 넘기는 일은 보통 MaaS가 아니에요. GLM-5.3 라이선스는 연속 12개월 매출 100억 달러를 넘는 MaaS 사업자에게 Z.AI 보안 심사를 요구해요.",
      firstSeen: "2026-08-31"
    },
    {
      id: "world-model",
      term: "월드 모델",
      en: "World Model",
      tag: "model",
      tagLabel: "모델",
      text: "화면·물리·다음 순간을 안에서 그려 보며, 행동에 어떻게 반응할지 예측하는 모델이에요.",
      detail: "월드 모델(World Model)은 이미지나 상태를 보고 다음 장면을 스스로 시뮬레이션하는 모델입니다. 클릭·드래그·말 같은 행동을 조건으로 넣고 프레임을 이어 그리면, 코드로 짠 화면 없이도 상호작용이 가능해져요. Interface World Model은 그 아이디어를 앱·웹 UI 런타임에 붙인 표현이에요. 아직 글자 안정성·긴 세션 일관성 같은 한계가 있어, 연구 미리보기와 제작 파이프를 나눠 보시면 좋아요.",
      firstSeen: "2026-09-01"
    },
    {
      id: "diarization",
      term: "화자 분리",
      en: "Diarization",
      tag: "creative",
      tagLabel: "크리에이티브",
      text: "녹음에서 누가 말했는지 구간을 갈라, 화자마다 다른 태그로 적어 주는 처리예요.",
      detail: "화자 분리(Diarization)는 여러 사람이 섞인 오디오에서 말 구간을 화자별로 나누는 기술입니다. 회의록·인터뷰·숏폼 자막에서 ‘A/B가 언제 말했는지’를 자동으로 붙일 때 써요. Muse Voice Transcribe처럼 ASR·말끝 감지와 한 모델에 붙이면, 따로 후처리 파이프를 두지 않아도 실시간으로 태그가 따라와요. 화자가 많거나 겹쳐 말할수록 어려운 편이에요.",
      firstSeen: "2026-09-02"
    },
    {
      id: "recurrent-depth",
      term: "recurrent depth",
      en: "Recurrent Depth",
      tag: "model",
      tagLabel: "모델",
      text: "같은 층을 여러 번 돌며 안쪽에서 추론해, 글자로 된 CoT보다 읽기 어려운 계산을 늘리는 구조예요.",
      detail: "recurrent depth(불투명 재귀·루프 트랜스포머로도 불려요)는 입력을 같은 신경망 층에 반복 통과시켜 성능을 올리는 기법입니다. 단계별 생각을 문장으로 남기는 CoT와 달리, 일부 추론이 숫자 활성화 안에만 남아 모니터하기 어려워질 수 있어요. Astra 보도에서 안전 연구자들이 이 점을 우려했고, OpenAI는 사용을 제한해 CoT를 읽을 수 있게 둔다고 반박했어요.",
      firstSeen: "2026-09-03"
    }
  ];

  const LATEST_BRIEF = {
    date: "2026-09-03",
    termIds: ["upscale", "sandbox", "cot", "recurrent-depth", "harness", "moe"]
  };

  const TAGS = [
    { id: "all", label: "전체" },
    { id: "basics", label: "기초" },
    { id: "model", label: "모델" },
    { id: "creative", label: "크리에이티브" },
    { id: "work", label: "활용" },
    { id: "risk", label: "주의" }
  ];

  const TAG_CLASS = {
    basics: "tag-basics",
    model: "tag-model",
    creative: "tag-creative",
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
    var anchor = (LATEST_BRIEF && LATEST_BRIEF.date) || "2026-08-05";
    var now = new Date(anchor + "T00:00:00");
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
    try {
      bindPopoverOnce();
    } catch (e) {
      /* popover bind failure must not leave related strip empty */
    }
    var root = document.getElementById("related-biscuits");
    if (!root) return;
    var list = root.querySelector(".related-biscuits-min-list");
    if (!list) return;
    var items = (ids || LATEST_BRIEF.termIds).map(findBiscuit).filter(Boolean);
    if (!items.length) {
      // Keep server-rendered buttons if catalog miss; only hide when truly empty
      if (!list.querySelector("[data-biscuit]")) {
        root.hidden = true;
      }
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
    root.hidden = false;
  }

  /**
   * Home: "오늘의 AI 비스킷" — one term + meaning at a time, fade in/out (toast/notice feel)
   */
  function initHomeTicker(ids, meta) {
    bindPopoverOnce();
    var root = document.getElementById("home-biscuit-ticker");
    if (!root) return;

    meta = meta || {};
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
    var dayLabel = meta.label || root.getAttribute("data-label") || "";
    var titleMain = "오늘의 AI 비스킷";
    var titleSub = dayLabel
      ? '<span class="biscuit-ticker-day">' + dayLabel + "</span>"
      : "";

    root.classList.add("biscuit-ticker-host");
    root.innerHTML =
      '<div class="biscuit-ticker biscuit-ticker--hero">' +
      '<div class="biscuit-ticker-label">' +
      '<span class="biscuit-ticker-dot" aria-hidden="true"></span>' +
      '<span class="biscuit-ticker-title">' +
      titleMain +
      titleSub +
      "</span>" +
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
    try {
      bindPopoverOnce();
    } catch (e) {
      /* ignore */
    }
    try {
      var grid = document.getElementById("biscuit-grid");
      if (grid) initBiscuitsPage();
    } catch (e) {
      /* ignore */
    }
    try {
      var ticker = document.getElementById("home-biscuit-ticker");
      if (ticker) {
        var ids = parseTermIds(ticker);
        initHomeTicker(ids || undefined, {
          date: ticker.getAttribute("data-date") || "",
          label: ticker.getAttribute("data-label") || ""
        });
      }
    } catch (e) {
      /* ignore */
    }
    try {
      var related = document.getElementById("related-biscuits");
      if (related) {
        var rids = parseTermIds(related);
        initRelatedMin(rids || undefined);
      }
    } catch (e) {
      /* server-rendered list still visible */
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
