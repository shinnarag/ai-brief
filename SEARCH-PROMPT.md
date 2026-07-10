# AI Brief 검색·편집·배포 명세

이 문서는 AI Brief 정기 업데이트의 **단일 기준 문서(source of truth)**다.
예약 작업은 검색이나 파일 수정을 시작하기 전에 이 문서를 끝까지 읽고 따라야 한다.
정상적인 브리프 실행에서는 이 문서 자체를 수정하지 않는다.

외부 참고 문서인 `/Users/joseph/AI-Brief-platform.md`에서는 공식 소스 중심 탐색, 검색·필터 관점, 액션과 워치리스트, Agents/MCP/Apps, Voice/Copy, 공식 SNS 확인 원칙만 반영한다. 해당 문서의 팀 전용 구성, 다크 UI, 단일 HTML, 구식 파일명·섹션 구조는 현재 플랫폼 구현 지침이 아니다.

---

## 0. 플랫폼 목표와 독자

AI Brief는 특정 팀을 위한 뉴스레터가 아니라 **누구나 최신 AI 변화를 이해하고 다음 판단으로 연결할 수 있는 전사 공용 AI 인텔리전스 플랫폼**이다.

각 브리프는 다음 질문에 빠르게 답해야 한다.

1. 무엇이 실제로 바뀌었는가?
2. 지금 누가, 어떤 플랜·지역·경로에서 사용할 수 있는가?
3. 가격, API, 권리, 보안, 일정에 어떤 제약이 있는가?
4. 지금 확인하거나 비교할 것은 무엇인가?
5. 아직 출시 전이라면 무엇을 언제 다시 확인해야 하는가?

원칙:

- 일반 AI 담론보다 제품·모델·기능·접근·가격·정책 변화가 우선이다.
- 쉬운 한국어를 사용하고, 직무 전문용어는 필요한 경우에만 짧게 설명한다.
- 특정 부서만 호명하지 않는다. 영향받는 **업무 또는 의사결정**을 설명한다.
- `사용 가능`과 `예정`, 사실과 추정, 공식 발표와 보도를 명확히 구분한다.
- 빈 섹션을 채우기 위해 중요도가 낮은 항목을 넣지 않는다.

---

## 1. 실행일과 날짜 윈도우

모든 날짜 계산은 **Asia/Seoul(KST)** 기준이다.

| 실행 요일 | 포함 범위 |
| --- | --- |
| 월요일 | 직전 금요일 00:00 KST ~ 실행일 월요일 23:59 KST |
| 목요일 | 직전 화요일 00:00 KST ~ 실행일 목요일 23:59 KST |

규칙:

- 발행일, 시행일, 공개일, rollout 시작일, beta/waitlist 오픈일, 가격·플랜 적용일, 종료·마이그레이션 공지일 중 하나가 윈도우 안이면 후보가 된다.
- 출시 자체가 미래여도 공식 예고·roadmap·teaser 또는 신뢰 가능한 취재 보도가 윈도우 안에 나오면 후보가 된다. 단, 상태는 `출시 예정·로드맵` 또는 `보도`로 적는다.
- 시간대가 표시된 게시물은 KST로 변환해 윈도우를 판정한다. 미국 기준 요일로 실행일을 다시 해석하지 않는다.
- 기사 발행일과 실제 제품 이벤트 날짜가 다르면 둘을 분리해 기록하고, 어떤 날짜로 윈도우를 통과했는지 확인한다.
- 날짜가 불명확한 evergreen 문서, 오래된 발표의 재포장, 과거 기사 재노출은 제외한다.
- 월·목이 아닌 날의 수동 실행은 사용자가 날짜 범위를 명시하지 않았다면 임의로 창을 만들지 말고 중단·보고한다.

---

## 2. 조사 파이프라인

각 실행에서 아래 순서를 지킨다.

### 2-1. 사전 점검

1. 이 문서를 끝까지 읽는다.
2. `WATCHLIST.md`를 읽고 이전 실행의 예정·종료·롤아웃 항목을 확인한다.
3. 최신 브리프 2개를 확인해 같은 발표의 반복 수록을 막는다.
4. KST 기준 `RUN_DATE`, `WINDOW_START`, `WINDOW_END`를 먼저 고정한다.
5. 다섯 분야와 교차 sweep용 검색 행렬을 만든다.

### 2-2. 분야별 1차 소스 sweep

다섯 분야를 각각 독립적으로 조사한다. 어느 한 분야가 다른 분야를 밀어내지 않게 한다.

- 공식 blog, newsroom, release notes, changelog
- 공식 docs, API reference, model card, system/safety card
- pricing, plan, credits, region/access, help center, terms/license
- 공식 product page, waitlist/beta page, status/deprecation notice
- 공식 GitHub release, Hugging Face model page, 연구·벤치마크 원문

### 2-3. 교차 sweep

다음 주제는 별도로 검색하되 새 섹션을 만들지 않고 기존 5개 분야에 가장 잘 맞게 배치한다.

- **Agents / MCP / Apps**: agent runtime, MCP server, connector, app, skill, tool use, computer use, workflow integration, IDE·workspace 연동
- **Voice / Copy**: realtime voice, TTS, dubbing, speech-to-speech, translation, voice cloning/licensing, brand voice, copy generation
- **SNS 공식 채널**: Instagram, Threads, X, TikTok, YouTube, Discord/community의 공식 계정에서 날짜 범위 안의 출시·롤아웃·데모·접근 공지

### 2-4. 보조 근거와 반대 확인

- 신뢰 가능한 매체에서 공식 발표에 없는 일정, 접근 범위, 시장 맥락을 확인한다.
- 가격, credits, region, plan, API access, commercial rights는 반드시 공식 pricing/docs/help/terms에서 다시 확인한다.
- 공급사 성능 주장과 독립 벤치마크가 다르면 둘을 구분해 적는다.
- 한 출처만의 유출·추측은 확정 카드로 만들지 않는다.

### 2-5. 후보 정리와 최종 선택

각 후보를 아래 필드로 정리한 뒤 중복 제거와 점수 평가를 한다.

| 필드 | 기록 내용 |
| --- | --- |
| 분야 | 5개 출력 섹션 중 최적 섹션 |
| 조직·제품 | 회사, 제품, 모델, 기능명 |
| 상태 | 사용 가능 / 순차 배포 / 베타·프리뷰 / 출시 예정·로드맵 / 가격·조건 변경 / 제한·종료 / 보도 |
| 판정 날짜 | 윈도우 통과에 사용한 KST 날짜와 근거 |
| Primary source | 공식 원문 URL과 발행 주체 |
| Supporting source | 독립 보도·공식 SNS·벤치마크 최대 2개 |
| 가용 조건 | 지역, 플랜, 계정, API, 가격, 권리, rollout 범위 |
| 새로움 | 이전 브리프 이후 새로 확인된 사실 |
| 실무 영향 | 영향받는 업무·비용·리스크·의사결정 |
| 다음 행동 | 테스트·비교 / 확인·준비 / 점검 / 추적 중 1개 |
| 신뢰도 | 공식 확인 / 복수 출처 확인 / 단일 보도 |

---

## 3. 검색식 품질 기준

검색은 한국어와 영어를 함께 사용하고, 제품의 공식 표기와 이전 이름을 모두 확인한다.

기본 조합:

```text
[회사 또는 제품] + [변화 유형] + [가용 조건] + [날짜 범위]
```

변화 유형 예시:

- `release`, `launch`, `rollout`, `available`, `preview`, `beta`, `waitlist`, `roadmap`
- `API`, `SDK`, `MCP`, `connector`, `agent`, `app`, `plugin`, `integration`
- `pricing`, `credits`, `rate limit`, `context window`, `region`, `enterprise`, `commercial use`
- `deprecation`, `migration`, `end of support`, `security`, `privacy`, `license`, `terms`
- `4K`, `upscaling`, `longer generation`, `audio sync`, `reference`, `consistency`, `stems`, `dubbing`

검색 규칙:

- 공식 도메인을 알고 있으면 `site:` 검색으로 release notes, docs, pricing, help center를 각각 확인한다.
- 검색 결과의 제목이나 snippet만 근거로 쓰지 않고 원문 페이지를 연다.
- 공식 문서의 `updated` 날짜가 실제 기능 변경일인지 단순 문서 수정일인지 구분한다.
- 제품명만 검색하지 말고 버전명, 기능명, API명, 과거 브랜드명도 교차 검색한다.
- 공식 발표가 약한 creator tool은 공식 SNS, product page, community announcement까지 확인하되 SNS 검증 규칙을 지킨다.
- 같은 내용을 베껴 쓴 기사 여러 개를 독립 출처로 계산하지 않는다.

---

## 4. 후보 점수와 편집 우선순위

후보는 아래 5개 항목을 각각 0~2점으로 평가한다. 점수는 내부 판단용이며 HTML에 표시하지 않는다.

| 기준 | 0점 | 1점 | 2점 |
| --- | --- | --- | --- |
| 근거 | 출처 불명·단일 소문 | 신뢰 매체 또는 공식 teaser | 공식 제품·문서 확인 |
| 새로움 | 기존 내용 반복 | 조건·일정 보강 | 새 출시·중대한 변경 |
| 실행 가능성 | 행동 없음 | 추적 가치 | 즉시 테스트·준비·점검 가능 |
| 영향 범위 | 매우 제한적 | 특정 업무 영향 | 여러 업무·비용·조달에 영향 |
| 시급성 | 기한 없음 | 근시일 변화 | 출시·종료·가격·보안 기한 임박 |

기본 포함 기준:

- 총점 6점 이상이고 `근거`가 1점 이상인 항목을 우선한다.
- 총점은 카드 수를 채우기 위한 면허가 아니다. 낮은 품질이면 `발견된 이슈없음`을 쓴다.
- 보도 단계의 미래 출시는 공식 확인 1개 또는 서로 독립적인 신뢰 매체 2개가 있을 때만 포함한다.
- 보안·정책 항목은 실제 사용 가능성, 조달, 권리, 배포, 상업 이용 조건을 바꿀 때만 포함한다.

우선순위:

1. 실제 출시, 접근 확대·제한, 종료·마이그레이션·보안 기한
2. 의미 있는 기능, API, agent workflow, 가격·플랜 변화
3. 근시일 beta·preview·waitlist·roadmap
4. 조달·연속성·상업 이용에 영향을 주는 시장·정책 변화
5. 그 밖의 일반 동향은 제외

---

## 5. 분야별 필수 sweep

출력 섹션은 아래 5개를 정확히 이 순서로 유지한다. Video AI는 반드시 별도 sweep하지만 자동 최우선 분야로 취급하지 않는다.

### 5-1. Major AI

대상:

- OpenAI/ChatGPT/Codex/API, Anthropic/Claude/Claude Code, Google/Gemini/DeepMind/AI Studio/Vertex
- xAI/Grok, Meta/Llama, Mistral, Cohere, Perplexity, Microsoft Copilot, GitHub Copilot, Amazon Bedrock
- DeepSeek, Qwen/Alibaba, Moonshot/Kimi, Zhipu/GLM, Baidu/ERNIE 및 널리 쓰이는 모델 공급자
- agent runtime, MCP, connectors, apps, computer use, tool use, coding agent, realtime voice처럼 플랫폼 선택을 바꾸는 교차 기능

찾을 것:

- 새 모델·버전, context, rate limit, pricing, API schema, tool use, benchmark/system card
- agent runtime, coding agent, MCP/App/connector 배포, workspace·IDE 연동
- deprecation/migration, region/access, security, enterprise 조건
- 실제 모델 선택이나 운영 방식을 바꾸는 voice/copy 기능

단순 UI polish와 일반 장애 보도는 제외한다.

### 5-2. Video AI

대상:

- Seedance/ByteDance Seed, Kling/Kuaishou, Runway, Veo/Google, Sora/OpenAI Video
- Midjourney Video, Luma Dream Machine/Ray, Pika, Hailuo/MiniMax, PixVerse, Vidu
- LTX/Lightricks, Genmo, CapCut AI, Synthesia, HeyGen 및 비교 가능한 영상 도구

찾을 것:

- 새 모델·버전, 4K/HD/upscaling, 길이, frame rate, audio sync, video-to-audio
- image/video/reference-to-video, multi-shot, storyboard, camera/motion control, character/scene consistency
- API, credits/pricing, commercial plan, region rollout, beta/waitlist, enterprise access
- avatar, localization, music-video, ad/social video, 편집 agent 등 실제 제작 흐름 변화

### 5-3. Music AI

대상:

- Suno, Udio, ElevenLabs Music, Stable Audio, Lyria
- Deezer detection/tagging, Spotify·label AI tools, voice/music licensing·distribution 제품
- AI music video agent 및 음악 제작과 직접 연결된 도구

찾을 것:

- generation/editing 모델, stems, vocals, multilingual lyrics, mastering
- voice/music licensing, commercial clearance, distribution, detection/labeling
- pricing, credits, plan/access, API와 creator workflow 변화

권리 분쟁은 새 라이선스·정책·배포 조건이 실제 사용 조건을 바꿀 때만 포함한다.

### 5-4. Design AI

대상:

- GPT Image/ChatGPT Images, Midjourney, Adobe Firefly/Photoshop/Premiere/Express
- Canva/Leonardo/Affinity, Figma/Weave/Make/Buzz, OpenArt, Krea, Ideogram
- Freepik, Recraft, Black Forest Labs/Flux, Google Imagen/Gemini Image 및 비교 가능한 도구

찾을 것:

- 이미지 모델 버전, text rendering, reference/character consistency
- inpainting/outpainting, layout, brand kit, design agent, campaign variants
- motion/design crossover, API, pricing, commercial rights, access 변화

### 5-5. AI Content/Marketing Issues

대상:

- Google Ads, Meta Ads, TikTok, Amazon Ads, Adobe, Canva, Figma Buzz
- HubSpot, Salesforce, Braze, Jasper, Writer, Typeface, Omneky, Pencil, AdCreative
- Evertune, Profound 및 GEO/AEO·AI 검색 가시성·brand safety 도구

찾을 것:

- AI ad generation, campaign automation, creative testing, synthetic talent
- brand voice/copy, promotion, localization, disclosure/watermark, brand safety
- SNS 플랫폼의 공식 AI 제작·배포 기능과 상업 캠페인 workflow 변화
- 실제 제품·기능·가격·정책·접근 조건 변화

단순한 “AI가 마케팅을 바꾼다”식 분석글과 성과 근거 없는 사례 홍보는 제외한다.

---

## 6. 출처와 SNS 검증

출처 우선순위:

1. 공식 blog/newsroom/release notes/docs/changelog/pricing/help/terms/product page
2. 공식 GitHub/Hugging Face/연구·benchmark 원문
3. 날짜와 발행 주체가 확인되는 공식 X/Instagram/Threads/TikTok/YouTube/Discord/community 게시물
4. Reuters, Bloomberg, Financial Times, Wall Street Journal, The Verge, TechCrunch, Axios, Wired, VentureBeat 등 신뢰 가능한 보도
5. 전문 매체와 산업 자료는 해당 분야 사실을 직접 확인할 수 있을 때 보조로 사용

카드별 규칙:

- 공식 문서가 있으면 공식 문서 1개를 primary source로 삼는다.
- 공식 문서가 없는 취재 보도는 독립적인 신뢰 매체 2개로 핵심 사실을 교차 확인한다.
- supporting source는 새 일정, 데모, 접근 맥락을 추가할 때만 최대 2개까지 사용한다.
- HTML의 `직접 링크`는 카드의 핵심 주장을 가장 직접적으로 뒷받침하는 원문 1개를 연결한다.
- SNS는 원 게시 계정, 게시일, 직접 URL이 모두 확인될 때만 사용한다.
- 리포스트, 캡처만 남은 게시물, 출처 없는 leak, 단순 prompt 공유·반응·조회수는 제외한다.
- SNS 데모는 품질·workflow의 보조 근거일 뿐 가격·지역·플랜·상업 사용 조건의 근거가 될 수 없다.
- 공급사 자체 비용·속도·성과 수치를 독립적으로 확인하지 못하면 `공급사 자체 주장`이라고 명시한다.
- Wikipedia, 검색 결과 페이지, AI 요약 페이지, 링크 없는 aggregation을 카드 출처로 사용하지 않는다.

---

## 7. 포함·제외와 중복 처리

포함:

- 새 모델·기능·API·agent·MCP·App·connector의 출시 또는 접근 변경
- pricing, credits, plan, rate limit, context, region, enterprise 조건 변화
- waitlist, beta, preview, staged rollout, roadmap, deprecation, migration
- commercial rights, privacy, security, disclosure, distribution 조건 변화
- contest, incubator, promo, free credits는 공식 자격·혜택·마감이 명확하고 실제 접근·실험 기회를 바꿀 때만 포함
- 투자·인수·조직 변화는 제품 가용성, 조달, 가격, vendor continuity에 구체적 영향이 있을 때만 포함

제외:

- 날짜 없는 evergreen guide, “best tools” roundup, SEO 설명글
- 일반 의견, 반발, 우려, 시장 전망, publisher traffic 논쟁
- 새 사용 조건 변화가 없는 반복 소송·저작권 논평
- ordinary outage. 단, 새 SLA, fallback, rate limit, status policy가 생긴 경우는 포함 가능
- 단순 홍보 캠페인, 수상 소식, 조회수·viral 반응
- 이전 브리프와 사실이 같고 새 날짜·조건·상태 변화가 없는 항목

중복 처리:

- 하나의 발표는 하나의 primary 카드만 만든다.
- 여러 분야에 걸치면 가장 직접적인 분야에 넣고 교차 영향을 요약에 설명한다.
- 같은 보도자료를 재작성한 기사들은 독립 사건이나 독립 출처로 계산하지 않는다.
- 이전 워치리스트 항목에 변화가 없으면 새 카드로 반복하지 않고 `WATCHLIST.md`의 확인일만 갱신한다.

---

## 8. 상태·정확성 표준

각 항목은 아래 상태 중 하나를 사용하고 제목과 요약에서 혼용하지 않는다.

| 상태 | 사용 기준 |
| --- | --- |
| 사용 가능 | 대상 사용자가 지금 접근 가능 |
| 순차 배포 | 일부 지역·플랜·계정부터 rollout 중 |
| 베타·프리뷰 | 제한된 테스트 또는 waitlist 단계 |
| 출시 예정·로드맵 | 공식 계획이나 teaser만 존재 |
| 가격·조건 변경 | 가격, credits, plan, rights, policy가 변경 |
| 제한·종료 | 접근 제한, deprecation, migration, 지원 종료 |
| 보도 | 공식 미확인이나 엄격한 출처 조건을 통과한 취재 보도 |

검증:

- 회사명, 제품명, 버전, 수치, 통화, 시간대, 마감일을 원문과 대조한다.
- staged rollout은 대상 지역·계정·플랜과 확인일을 명시하고 전체 공개처럼 일반화하지 않는다.
- preview·roadmap 항목에 즉시 도입을 권하지 않는다.
- 해석이나 추론은 사실 문장과 분리해 `가능성이 있다`, `확인이 필요하다`처럼 표현한다.
- 기사 제목보다 원문 본문과 공식 문서를 우선한다.

---

## 9. 출력 섹션과 카드 작성

브리프는 정확히 아래 섹션을 이 순서로 쓴다.

1. Major AI: 최대 7개
2. Video AI: 최대 5개
3. Music AI: 최대 5개
4. Design AI: 최대 5개
5. AI Content/Marketing Issues: 최대 5개

적합한 항목이 없으면 `발견된 이슈없음`을 쓴다.

각 카드는 아래 6개 요소를 갖는다.

| 필드 | 작성 규칙 |
| --- | --- |
| 제목 | 회사·제품명, 변화, 사실 상태가 드러나게 작성 |
| 발행일 | 윈도우 판정에 사용한 YYYY-MM-DD |
| 출처 | primary source의 발행 주체·문서명 |
| 요약 | 2~3문장. 상태, 변경 내용, 가용 대상, 가격·플랜·지역·일정·제약 포함 |
| 실무적 시사점 | 특정 팀 대신 영향받는 업무·의사결정과 다음 행동 1개 |
| 직접 링크 | 핵심 주장을 뒷받침하는 HTTPS 원문 1개 |

실무적 시사점은 사실 상태에 맞춰 다음 중 하나로 시작한다.

- `[지금 확인할 것]` 사용 가능·롤아웃·가격·접근·보안·권리 변화의 테스트, 비교, 확인, 준비, 점검
- `[지켜볼 것]` preview·roadmap·보도 단계의 날짜, rollout, 공식 확인, 가격 공개 추적

카드에 없는 우선순위, 마감, 성과, 사용 가능성을 홈페이지에서 새로 만들어내지 않는다.

---

## 10. 워치리스트

`WATCHLIST.md`에는 활성 항목을 최대 5개만 유지한다. 워치 항목은 브리프의 신규 이슈 수에 포함하지 않는다.

등록 대상:

- 명시적 출시일·종료일·프로모션 마감
- staged rollout의 region/plan 확대 대기
- preview/waitlist, pricing 예고, API deprecation/migration
- 미해결 privacy/security/rights 조건

각 항목에 제품, 현재 상태, 확인 날짜 또는 trigger, 다음 확인 질문, primary source, 마지막 확인일을 기록한다.

다음 실행에서 공식 출처를 재확인한다.

- 변화 없음: 새 카드로 반복하지 않고 마지막 확인일과 `변경 없음`만 기록
- 출시·변경·종료·취소 확인: 새 날짜 창의 카드 후보로 평가하고 워치 상태를 완료
- 근거가 사라지거나 일정이 지나도 확인 불가: 이유를 기록하고 제거

---

## 11. HTML 구조 계약

현재 구현 기준은 `index.html`, `assets/platform.css`, `assets/platform.js`다.

공통 인프라:

- `assets/platform.css`
- `assets/platform.js`
- `scripts/sync-archive-metadata.mjs`
- `scripts/validate-site.mjs`

정상적인 브리프 실행에서는 위 파일을 수정·복제·인라인화·재생성하지 않는다.

새 브리프 `briefs/YYYY-MM-DD.html`은 다음을 지킨다.

- `<body class="brief-page">`
- `<main class="wrap" id="main-content">`
- `../assets/platform.css`를 정확히 1회 연결
- `../assets/platform.js`를 `defer`로 정확히 1회 연결
- inline `<style>` 또는 src 없는 page script 금지
- 상단 `메인으로 이동` 링크와 KST run/window 메타데이터 유지
- section nav와 아래 5개 section ID를 정확한 순서로 유지
  - `major-ai`
  - `video-ai`
  - `music-ai`
  - `design-ai`
  - `ai-content-marketing-issues`
- metadata sync 호환을 위해 section 시작 태그는 정확히 `<section class="section" id="…">` 형태로 유지
- 실제 카드는 `<article class="card" id="{section-id}-item-N">` 형식의 고유하고 연속적인 ID 사용
- 실제 카드마다 `card-title` 1개, 날짜·출처 `tag` 2개, `요약 / 실무적 시사점 / 직접 링크` detail item 3개
- 외부 링크는 HTTPS, `target="_blank" rel="noreferrer"`
- 빈 섹션은 실제 카드 대신 `<article class="card empty-card">` 1개와 `발견된 이슈없음`을 사용하고 count는 0
- 팀 전용 filter, badge, section을 추가하지 않는다.

---

## 12. 홈페이지 갱신 계약

`index.html`의 shell, 공통 asset 연결, topic filter key, 기존 아카이브 카드는 보존한다.

현재 실행에서 아래 최신 영역만 실제 브리프에 맞게 갱신한다.

1. header CTA의 최신 브리프 링크
2. hero의 최신 날짜, 수집 범위, 요약
3. 실제 non-empty 카드 수, 활성 분야 수, 수집 일수
4. 최신/이전 브리프 링크
5. 범용 주제 기반 insight card 3개와 실제 카드 ID로 연결되는 deep link
6. 신규 archive card와 전체 브리프 수
7. 이전 `Latest` 라벨을 `Archive`로 변경

규칙:

- 동일 날짜 archive card가 있으면 갱신하고, 없으면 archive grid 맨 위에 정확히 1회 삽입한다.
- archive card는 최신에서 과거 순서를 유지한다.
- 기존 archive card, 링크, 필터를 삭제하거나 재정렬하지 않는다.
- insight link는 새 브리프에 실제로 존재하는 non-empty 카드 ID만 가리킨다.
- 신규 카드 삽입 후 `node scripts/sync-archive-metadata.mjs`를 실행한다.
- metadata count를 손으로 유지하지 않는다.
- sync를 다시 실행해 `Updated 0 archive cards.`인지 확인한다.

---

## 13. 검증과 Git 절차

작업 시작:

1. `git status --short --branch`와 현재 HEAD를 기록한다.
2. 기존 dirty file을 baseline으로 기록하고 수정·stage하지 않는다.
3. `.DS_Store` 같은 무관 파일을 브리프 커밋에 포함하지 않는다.

콘텐츠·구조 검증:

```bash
node scripts/sync-archive-metadata.mjs
node scripts/validate-site.mjs --run-date YYYY-MM-DD
node scripts/sync-archive-metadata.mjs
git diff --check -- briefs/YYYY-MM-DD.html index.html WATCHLIST.md
```

두 번째 sync는 `Updated 0 archive cards.`여야 한다.

정상 실행에서 변경 가능한 파일:

- `briefs/YYYY-MM-DD.html`
- `index.html`
- `WATCHLIST.md`

shared asset, script, 이 명세가 달라졌다면 정상 콘텐츠 실행으로 간주하지 말고 blocker로 보고한다.

Git 규칙:

- `git add .`, `git add -A`를 사용하지 않는다.
- 허용 파일만 명시적으로 stage한다.
- `git diff --cached --name-only`와 `git diff --cached --check`를 확인한다.
- 빈 diff는 commit하지 않는다.
- 자동 force-push, reset, amend, rebase를 하지 않는다.
- non-fast-forward, 인증 실패, 예상하지 못한 branch, merge/rebase 진행 상태면 중단하고 정확한 blocker를 보고한다.
- push 실패 시 local commit과 기존 사용자 변경을 보존한다.
- 성공 후 commit hash, `origin/main` 반영 결과, 남은 worktree 상태를 확인한다.

---

## 14. 완료 보고

예약 작업의 inbox 결과에는 아래를 짧게 포함한다.

- KST 실행일과 실제 날짜 윈도우
- 추가된 제품·모델 업데이트와 상태
- 제외한 주요 후보와 이유가 있으면 1~3개
- 워치리스트 추가·완료·변경 없음 항목
- sync 1차/2차 결과와 validation 결과
- 변경·stage된 파일과 기존 dirty file
- commit hash와 push 대상·결과
- 최종 worktree 상태 또는 정확한 blocker
