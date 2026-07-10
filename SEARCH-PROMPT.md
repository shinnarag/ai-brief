# AI Brief 검색 요청 명세 (SEARCH-PROMPT)

이 문서는 AI Brief 자동화가 무엇을 찾아야 하는지 정의합니다.
브리프의 목적은 "AI 업계에서 지금 써볼 만한 제품·모델·기능과 곧 준비해야 할 출시 계획"을 빠르게 파악하는 것입니다.
소송, 비판, 정책 논쟁, 일반적인 업계 담론은 기본값이 아닙니다.

---

## 0. 작업 정의

오늘 실행일 기준 날짜 윈도우 안에서 **실제 제품·모델·기능·가격·접근·로드맵 업데이트**를 찾아 한국어 HTML 브리프로 만든다.

중요한 예시:
- Seedance 2.0 4K 공개, Seedance 2.5 출시 예고
- Kling/Runway/Veo/Midjourney/Luma/Pika의 새 영상 모델, 해상도, 길이, 속도, 가격, API, 지역·플랜 접근 변화
- GPT/Gemini/Claude/Grok/Llama/Qwen/DeepSeek/Kimi/GLM 같은 주요 모델의 새 버전, API, context, rate limit, pricing, agent runtime 변화
- Figma/Adobe/Canva/OpenArt/Krea/Freepik/Recraft 같은 제작 툴의 생성·편집·디자인 agent 기능 출시
- Suno/Udio/ElevenLabs/Stable Audio/Deezer/Lyria 같은 음악 생성·탐지·상업 사용 조건 변화
- AI 광고·마케팅 자동화·synthetic talent·GEO/SEO 도구의 실제 제품 변화

---

## 1. 날짜 윈도우

실행일(run date) 기준으로 정확한 수집 윈도우를 먼저 계산한다.

| 실행 요일 | 포함 범위 |
| --- | --- |
| 월요일 | 직전 금요일 ~ 실행일 월요일 |
| 목요일 | 직전 화요일 ~ 실행일 목요일 |

포함 기준:
- 발행일, 시행일, 공개일, rollout 시작일, beta/waitlist 오픈일, 가격·플랜 적용일 중 하나가 윈도우 안이면 포함한다.
- 출시 자체는 나중이어도, **출시 예고·roadmap·공식 teaser·credible leak/취재 보도**가 윈도우 안에 나오면 포함한다.
- 날짜가 불명확한 evergreen 설명글, 사용법 튜토리얼, 오래된 발표 재포장 글은 제외한다.
- 같은 사안은 중복 카드로 나누지 말고 가장 정보량 많은 출처 1개로 합친다.

---

## 2. 편집 우선순위

브리프는 뉴스 비평이 아니라 **실무자가 무엇을 써보고, 무엇을 준비해야 하는지**를 알려주는 제품 인텔리전스다.

후보 우선순위:

1. **P0: Creator/product release**
   - 새 생성 모델, 새 버전, 4K/HD/upscaling, longer generation, image-to-video, video-to-audio, character/scene consistency, motion control, editing workflow, API, mobile/web app rollout, pricing, plan/access change.
   - Video AI는 특히 중요하다. Seedance, Kling, Runway, Veo, Midjourney Video, Luma, Pika, Hailuo/MiniMax, PixVerse, Vidu, LTX/Lightricks, CapCut, Synthesia, HeyGen을 반드시 확인한다.
2. **P1: Frontier/platform update**
   - GPT, Gemini, Claude, Grok, Llama, Mistral, Qwen, DeepSeek, Kimi, GLM, Bedrock, Vertex/AI Studio, Copilot/Codex/Claude Code 등의 모델·API·agent runtime·가격·rate limit·context·system card·benchmark·access 변화.
3. **P2: Near-term roadmap**
   - 공식 preview, waitlist, staged rollout, 2.5/3.0 등 다음 버전 예고, credible coverage of upcoming launch, product teaser, beta 모집.
4. **P3: Workflow/business impact**
   - 상업 사용 조건, rights-cleared claim, enterprise plan, collaboration, asset management, brand kit, campaign generation, detection/labeling tool, marketplace/distribution 변화.
5. **P4: Legal/policy/criticism**
   - 새 판결, 공식 정책 변경, 사용 제한, 라이선스 조건 변경처럼 실제 사용 가능성을 바꾸는 경우만 포함한다.
   - 단순 소송 진행, 반발, 일반 비판, publisher traffic 논쟁, 윤리 논평은 제외한다.

중요: P4로 빈 섹션을 채우지 않는다. P0~P3가 없으면 `발견된 이슈없음`을 쓴다.

---

## 3. 필수 sweep 순서

이 순서를 반드시 따른다. Major AI만 먼저 훑고 끝내지 않는다.

### 3-1. Video AI (creator sweep 최우선)

무조건 별도 sweep을 한다.

찾을 것:
- 새 모델/버전: Seedance 2.0/2.5, Kling, Runway Gen, Veo, Sora/OpenAI video, Midjourney Video, Luma Dream Machine/Ray, Pika, Hailuo/MiniMax, PixVerse, Vidu, LTX/Lightricks, Genmo, CapCut AI
- 4K/HD/upscaling, generation length, frame rate, audio sync, video-to-audio, reference video, multi-shot/storyboard, camera/motion control, character consistency
- API, commercial plan, credits/pricing, mobile/web availability, region rollout, waitlist, beta, enterprise access
- 실제 제작 workflow: storyboard-to-video, image-to-video, text-to-video, video editing agent, avatar/localization, ad/social video production

필수 검색어 예시:
- `Seedance 2.0 4K`, `Seedance 2.5 release`, `ByteDance Seedance video model`, `Seedance AI video 4K`
- `Kling 4K video generation`, `Runway Gen video update`, `Veo 4K upscaling`, `Midjourney video model`
- `Luma Dream Machine update`, `Pika video update`, `Hailuo AI video`, `PixVerse update`, `Vidu video model`, `CapCut AI video`

### 3-2. Major AI

찾을 것:
- OpenAI/ChatGPT/Codex/API, Anthropic/Claude/Claude Code, Google/Gemini/DeepMind/AI Studio/Vertex, xAI/Grok, Meta/Llama, Mistral, Cohere, Perplexity, Microsoft Copilot, GitHub Copilot, Amazon Bedrock, DeepSeek, Qwen/Alibaba, Moonshot/Kimi, Zhipu/GLM, Baidu/ERNIE
- 새 모델, context window, pricing, rate limit, API schema, tool use, agent runtime, coding agent, benchmark/system card, safety card, region/access, deprecation/migration

주의:
- GitHub Copilot/Codex/Claude Code 같은 개발자 도구는 모델·agent runtime·API·pricing·access 변화일 때만 포함한다.
- 단순 UI polish, 작은 편의 기능, 일반 장애 보도는 제외한다.

### 3-3. Design/Image AI

찾을 것:
- GPT Image/ChatGPT Images/OpenAI image, Midjourney, Adobe Firefly/Photoshop/Premiere/Express, Canva/Leonardo/Affinity, Figma/Weave/Make/Buzz, OpenArt, Krea, Ideogram, Freepik, Recraft, Black Forest Labs/Flux, Google Imagen/Gemini image
- 이미지 모델 버전, text rendering, reference/character consistency, inpainting/outpainting, brand kit, design agent, layout/campaign variant generation, motion/design crossover, API/pricing/access

### 3-4. Music AI

찾을 것:
- Suno, Udio, ElevenLabs Music, Stable Audio, Lyria, Deezer detection/tagging, Spotify/label AI tools, voice/music licensing products
- 새 생성 모델, editing, stems, vocals, multilingual lyrics, commercial clearance, distribution, detection/labeling, pricing/access
- 권리 이슈는 사용 조건을 바꾸는 새 라이선스·정책·플랫폼 조치일 때만 포함한다.

### 3-5. AI Content/Marketing Issues

찾을 것:
- AI ad generation, campaign automation, creative testing, synthetic influencer/talent tools, brand kit, GEO/AEO/AI search visibility tools, disclosure/watermark tooling, brand safety automation
- Google Ads, Meta Ads, TikTok, Amazon Ads, Adobe, Canva, Figma Buzz, HubSpot, Salesforce, Braze, Jasper, Writer, Typeface, Omneky, Pencil, AdCreative, Evertune, Profound 등
- 단순 "AI가 광고를 바꾼다"식 분석글은 제외한다. 실제 제품, 기능, 정책, 캠페인 사례만 포함한다.

---

## 4. 출처 우선순위

출처는 아래 순서로 우선한다.

1. 공식 blog/newsroom/release notes/docs/changelog/pricing page/status page
2. 공식 X/Discord/YouTube/community post처럼 날짜와 작성 주체가 명확한 primary post
3. The Verge, TechCrunch, VentureBeat, Reuters, Bloomberg, Financial Times, Business Insider, Axios, The Information, Wired, Creative Bloq, Music Business Worldwide, Billboard, Adweek, Marketing Dive 등 신뢰 가능한 보도
4. Hugging Face, GitHub, arXiv, Artificial Analysis, LMArena 등 모델·benchmark primary source

공식 문서가 없어도 credible coverage가 있고 날짜·제품 사실이 분명하면 포함한다.
creator tool 업데이트는 공식 release note가 약한 경우가 많으므로, 제품 페이지 변경·공식 social post·신뢰 가능한 매체 보도를 함께 확인한다.

---

## 5. 제외 기준

다음은 제외한다.

- 날짜 없는 evergreen guide, "best tools" roundup, SEO용 설명글
- 단순 의견, 비판, 우려, 일반 시장 전망
- 진행 중 소송의 반복 보도
- "AI slop", publisher traffic, copyright backlash만 다루고 제품·정책·사용 조건 변화가 없는 기사
- 장애(outage) 보도. 단, 장애가 새 rate limit, SLA, fallback, status policy 변화로 이어진 경우만 포함
- Wikipedia 같은 2차 요약 페이지. 단, 검색 단서로만 쓰고 카드 출처로는 쓰지 않는다.

---

## 6. 섹션별 카드 수

브리프는 정확히 아래 섹션을 이 순서로 쓴다.

1. Major AI: 최대 7개
2. Video AI: 최대 5개
3. Music AI: 최대 5개
4. Design AI: 최대 5개
5. AI Content/Marketing Issues: 최대 5개

Video AI에 중요한 P0/P2 항목이 있으면 반드시 포함한다. Major AI 항목이 많아도 Video AI를 희생하지 않는다.
섹션에 적합한 항목이 없으면 `발견된 이슈없음`을 쓴다.

---

## 7. 카드 필드

각 카드에는 아래 6개를 모두 넣는다.

| 필드 | 작성 규칙 |
| --- | --- |
| 제목 | 회사/제품명 + 무엇이 바뀌었는지 명확히 쓴다. |
| 발행일 | YYYY-MM-DD. 발행일, 시행일, rollout일, 공식 예고일 중 윈도우 판정에 쓴 날짜. |
| 출처 | 공식 문서명 또는 매체명. |
| 요약 | 2~3문장. 새 기능, 적용 대상, 수치, 플랜/가격/접근 조건을 포함한다. |
| 실무적 시사점 | 1문장. 제작자, 개발자, 마케팅팀, 제품팀이 무엇을 바꿔야 하는지 쓴다. |
| 직접 링크 | 실제 원문 URL 1개. |

요약은 "핫하다"가 아니라 다음 질문에 답해야 한다.
- 무엇이 새로 나왔나?
- 누가 쓸 수 있나?
- 어떤 스펙/가격/제약/일정이 중요한가?
- 바로 테스트하거나 준비할 이유가 무엇인가?

---

## 8. 산출물

1. `briefs/YYYY-MM-DD.html`을 기존 최신 브리프의 콘텐츠 구조에 맞춰 생성 또는 갱신한다.
2. 새 브리프는 `<body class="brief-page">`를 사용하고, `../assets/platform.css`와 `../assets/platform.js`를 연결한다. 새 인라인 디자인을 만들지 않는다.
3. 상단에 `메인으로 이동` 링크와 기존 `run date / window` 메타데이터를 유지한다. 플랫폼 스크립트가 화면용 한국어 문구와 읽기 도구를 제공한다.
4. `index.html`의 최신 브리프 요약, 주제별 핵심 업데이트, archive grid 맨 위 카드를 함께 갱신한다. 최신 브리프의 실제 항목과 활성 분야 수를 정확히 반영한다.
5. 기존 archive entry를 덮어쓰거나 삭제하지 않는다.
6. 아카이브 카드 갱신 후 `node scripts/sync-archive-metadata.mjs`를 실행해 실제 이슈가 있는 분야와 건수를 동기화한다.
7. 작업 후 검증한다:
   - `git diff --check`
   - HTML parser
   - 섹션 5개 존재 여부
   - count-pill과 실제 카드 수 일치 여부
   - 링크가 해당 제품/업데이트를 가리키는지 확인
8. 이번 실행에서 바꾼 파일만 commit하고 `origin/main`에 push한다.

---

## 9. 검색 요청 템플릿

```
오늘은 {RUN_DATE} ({요일})입니다. AI Brief 후보를 찾아 주세요.

[날짜 윈도우]
{WINDOW_START} ~ {RUN_DATE} 사이에 발행, 시행, rollout, beta/waitlist 오픈, 가격/접근 변경, 또는 출시 예고가 나온 항목만 포함합니다.
윈도우 밖이거나 날짜 없는 evergreen 글은 제외합니다.

[편집 목표]
소송/비판 뉴스가 아니라 제품 인텔리전스가 목적입니다.
새 모델, 새 기능, 4K/upscaling, API, 가격, access, roadmap, creator workflow 변화를 우선합니다.
특히 Video AI는 별도 최우선 sweep을 합니다. Seedance 2.0 4K, Seedance 2.5 예고, Kling, Runway, Veo, Midjourney Video, Luma, Pika, Hailuo/MiniMax, PixVerse, Vidu, LTX, CapCut을 반드시 확인합니다.

[섹션]
1. Video AI: 생성 영상 모델/툴의 출시, 예고, 4K, 길이, API, 가격, 플랜, editing workflow.
2. Major AI: OpenAI, Anthropic, Google/Gemini, xAI, Meta, Mistral, Qwen, DeepSeek, Kimi, GLM, Bedrock, Copilot/Codex/Claude Code 등 모델/API/agent/platform 변화.
3. Design AI: GPT Image, Midjourney, Adobe Firefly, Canva, Figma, OpenArt, Krea, Ideogram, Freepik, Recraft, Flux 등 이미지/디자인 모델·agent 업데이트.
4. Music AI: Suno, Udio, ElevenLabs Music, Stable Audio, Lyria, Deezer detection/tagging 등 음악 생성·탐지·상업 사용 조건 변화.
5. AI Content/Marketing Issues: AI 광고, campaign automation, synthetic talent, GEO/SEO, disclosure/brand-safety tool의 실제 제품·정책 변화.

[제외]
단순 소송, 비판, 반발, publisher traffic 논쟁, 일반 전망, roundup, 사용법 글은 제외합니다.
정책/법무 이슈는 새 판결·공식 정책·라이선스·사용 제한처럼 실제 사용 조건을 바꿀 때만 포함합니다.

[각 후보 필드]
제목 / 날짜 / 출처 / URL / 핵심 사실 3~4개 / 왜 실무적으로 중요한지.
```
