# AI Brief 검색 요청 명세 (SEARCH-PROMPT)

이 문서는 다음 AI Brief를 만들 때 **검색을 어떻게 요청하고, 어떤 정보를 수집해 카드로 채울지**를 정의합니다.
페이지 구조(`index.html`, `briefs/YYYY-MM-DD.html`)에서 실제로 필요한 정보만 역으로 정리했습니다.
새 브리프를 만들 때 이 문서를 그대로 검색 에이전트에게 전달하면 됩니다.

---

## 0. 한 줄 작업 정의

> "오늘 날짜 기준 윈도우(아래 규칙) 안에 **발행·시행·공개 예고된** AI 제품/모델 업데이트만 우선 모아,
> 5개 섹션 카드 구조(`briefs/`의 기존 HTML)와 동일한 형식으로 한국어 브리프를 만든다."

---

## 1. 날짜 윈도우 규칙 (가장 먼저 확정)

브리프는 **월요일·목요일** 주 2회 실행을 전제로 합니다. 실행일(run date) 기준으로 수집 윈도우를 정합니다.

| 실행 요일 | 수집 윈도우 (포함 범위) | 파일명 예시 |
| --- | --- | --- |
| 월요일 | 직전 금요일 ~ 당일 월요일 (금·토·일·월) | `briefs/2026-06-08.html` |
| 목요일 | 직전 화요일 ~ 당일 목요일 (화·수·목) | `briefs/2026-06-05.html` |

판정 기준:
- **발행일(published)** 또는 **시행일(effective/적용 시작일)** 중 하나라도 윈도우 안에 들면 포함.
  - 예: 발표는 이전이지만 "제거/마이그레이션 시행일"이 윈도우 안이면 포함(2026-06-08 Gemini 스키마 제거 사례).
- 명확히 날짜가 찍힌 **공개 예정/roadmap/출시 예고**도 포함할 수 있다. 단, 출처가 공식 문서·공식 포스트·신뢰 가능한 취재 보도여야 한다.
- 윈도우 밖이거나, 업데이트성보다 **evergreen(시점 무관 일반 정보)** 성격이 강하면 제외.
- 같은 사안의 중복 보도는 1개 카드로 합치고, 가장 1차에 가까운/정보량 많은 출처를 우선.

---

## 1-1. 편집 우선순위 (정보성 업데이트 우선)

브리프의 목적은 "AI 업계에서 지금 무엇을 써볼 수 있고, 무엇을 준비해야 하는가"를 알려주는 것입니다.
따라서 아래 순서로 후보를 고르고, 하위 후보가 상위 후보를 밀어내지 않게 합니다.

1. **P0: 제품·모델·API 업데이트**
   - 새 모델/버전, benchmark/system card, API/SDK/CLI/runtime, agent/coding-agent, 가격·rate limit·context window, access/beta/region 변화, cloud platform 배포.
2. **P1: 가까운 출시 계획·roadmap**
   - 공식 preview, waitlist, staged rollout, 공개된 출시 예정일, 신뢰 가능한 보도로 확인된 upcoming model/product 계획.
3. **P2: creator workflow 변화**
   - Video/Music/Design 툴의 새 기능, 4K/upscaling, 편집·협업·캠페인 생성 워크플로, 상업 사용 조건, 엔터프라이즈 접근 변화.
4. **P3: 정책·권리·비판·소송**
   - 새 판결, 공식 정책 변경, 서비스 접근 제한, 라이선스 조건 변경처럼 실무 사용 여부를 직접 바꾸는 경우만 포함.
   - 단순 반발, 일반 비판, 진행 중 소송 보도, publisher traffic 논쟁, AI 윤리/위험 논평은 제품 업데이트 후보가 부족해도 빈칸 채우기용으로 넣지 않는다.

섹션에 P0~P2 후보가 없으면 `발견된 이슈없음`이 낫습니다. 낮은 우선순위의 비판성 기사로 억지로 채우지 않습니다.

---

## 2. 섹션과 검색 대상 (5개 섹션 = 5개 카테고리)

각 섹션은 브리프 페이지의 `<section>` 하나에 대응합니다. 순서는 아래 우선순위를 따릅니다.
**Major AI를 가장 먼저 확정**한 뒤 나머지 4개를 보강 검색합니다.

### 2-1. Major AI (최우선)
- **무엇을 찾나:** 모델·API·가격·접근(access)·컨텍스트 길이·에이전트 런타임·코딩 에이전트·안전성 정책·플랫폼 배포(클라우드 연동) 업데이트.
- **검색 대상:** OpenAI, Anthropic/Claude, Google/Gemini/DeepMind, Meta AI, xAI/Grok, Mistral, Cohere, Perplexity,
  Microsoft Copilot, Amazon Bedrock, AI Studio/Vertex AI, DeepSeek, Qwen/Alibaba, Moonshot/Kimi, Zhipu/GLM, Baidu/ERNIE.
- **신뢰 출처 우선:** 공식 changelog/release notes/API docs > 1차 보도(Reuters, VentureBeat, The Verge 등) > 종합 테크 매체.

### 2-2. Video AI
- **무엇을 찾나:** 영상 생성 모델 성능, image-to-video 비용, 기업 거버넌스, 상업 영상 제작 생태계.
- **검색 대상:** Kling, Runway, Sora, Veo, Pika, Luma, Synthesia, HeyGen, CapCut AI.

### 2-3. Music AI
- **무엇을 찾나:** 음악 생성 모델·제품, 새 기능, 배포/상업 사용 조건, 투자/시장, 가까운 출시 계획.
- **권리/소송 이슈:** 라이선스 조건, 플랫폼 정책, 이용 가능성, 보상 구조가 새로 바뀌는 경우만 포함. 단순 반발·진행 중 소송 보도는 후순위.
- **검색 대상:** Suno, Udio, ElevenLabs Music, Stable Audio, Deezer (+ 레이블/스트리밍 권리 이슈).

### 2-4. Design AI (이미지·디자인)
- **무엇을 찾나:** 이미지 생성/편집 모델, 캠페인 변형 생성, DAM·디자인 툴 내 생성 워크플로.
- **검색 대상:** GPT Image / ChatGPT image generation / OpenAI image, Midjourney, Adobe Firefly, Canva, Figma,
  OpenArt, Krea, Ideogram, Freepik, Recraft.

### 2-5. AI Content / Marketing Issues
- **무엇을 찾나:** AI 광고 제작 툴, 캠페인 자동화, 합성 talent 제작/관리 제품, SEO/GEO 도구, disclosure·brand safety를 바꾸는 플랫폼 기능·정책 업데이트.
- **비판/소송/논쟁:** 새 규칙·정책·계약·제품 제한으로 마케팅 운영이 바뀌는 경우만 포함. 일반적인 publisher traffic 우려나 브랜드 비판 기사는 제외.
- **검색 대상:** 공식 제품 업데이트, ad-tech/martech release note, 캠페인 사례, 플랫폼 정책 변경, 신뢰 가능한 업계 보도.

> 섹션이 비면 그대로 비워도 됩니다. 단, **Major AI는 가급적 채우는 것**을 목표로 합니다.
> 항목이 적은 날은 섹션 자체를 생략할 수 있습니다(과거 브리프에 Major AI 없는 날 있음).

---

## 3. 카드 1개당 수집해야 하는 필드

각 항목은 페이지에서 `<article class="card">` 하나가 됩니다. **아래 6개를 모두 채웁니다.**

| 필드 | 페이지 위치 | 작성 규칙 |
| --- | --- | --- |
| **제목** | `.card-title` | 핵심 사실을 한 문장으로. 회사+무엇을 했는지가 드러나게. 과장·낚시 금지. |
| **발행일** | `.tag` (발행일 YYYY-MM-DD) | 1차 발행/시행일. 보도 인용이면 보도일 기준. |
| **출처** | `.tag` (출처 ...) | 매체/공식 문서명. 인용 구조면 `보도매체 / 원출처` 형식(예: `TechStartups / Reuters`). |
| **요약** | `.detail-label`=요약 | 3~4문장. **사실 중심**, 누가·무엇을·언제·수치/조건. 추측은 "~로 보도" 등으로 명시. |
| **실무적 시사점** | `.detail-label`=실무적 시사점 | 1~2문장. 도입·운영·법무/보안/조달 관점에서 "그래서 무엇을 해야 하나". |
| **직접 링크** | `.detail-label`=직접 링크 | 실제 기사/문서 URL 1개. `<a href target="_blank" rel="noreferrer">`. 링크 텍스트=URL. |

수집 시 검색 에이전트가 반드시 함께 가져와야 할 raw 데이터:
1. 기사/문서 **URL**
2. **발행일/시행일** (윈도우 판정용)
3. **출처명**(+ 인용 구조면 원출처)
4. 요약·시사점을 쓸 수 있는 **본문 핵심 사실 3~4개** (수치, 조건, 적용 대상 포함)

---

## 4. 출력물 (검색 후 만들어야 하는 산출)

1. **`briefs/YYYY-MM-DD.html` 신규 생성**
   - 기존 최신 브리프를 템플릿으로 복사 후 내용 교체.
   - `<title>`, `<meta name="description">`, `.meta-pill`(run date/window), `.eyebrow`(Monday/Thursday Brief),
     `h1`의 날짜, hero `.lead`, 각 섹션의 카드/`count-pill` 갱신.
2. **`index.html` 갱신**
   - 아카이브 grid 맨 위에 새 카드 1개 추가(`.archive-card`: 날짜·window·요약·카테고리 태그).
   - `.meta-pill`의 "N briefs" 카운트 +1.
   - hero의 **Latest Brief** 카드(제목·요약·버튼 href) 최신 날짜로 교체, "이전 브리프 보기"는 직전 날짜로.

---

## 5. 검색 에이전트에게 보낼 요청 템플릿 (복붙용)

```
오늘은 {RUN_DATE} ({요일})입니다. AI Brief를 만들기 위해 검색해 주세요.

[윈도우] {요일} 실행이므로 {윈도우 시작} ~ {RUN_DATE} 사이에 발행되었거나 시행된 항목만 포함.
        윈도우 밖이거나 evergreen 성격이면 제외.

[섹션별 검색] 아래 순서로 각 섹션 후보를 찾아 주세요. Major AI를 먼저 확정.
  1) Major AI: OpenAI, Anthropic/Claude, Google·Gemini·DeepMind, Meta AI, xAI/Grok, Mistral, Cohere,
     Perplexity, Microsoft Copilot, Amazon Bedrock, AI Studio/Vertex AI, DeepSeek, Qwen/Alibaba,
     Moonshot/Kimi, Zhipu/GLM, Baidu/ERNIE — 모델·API·가격·접근·컨텍스트·에이전트·코딩에이전트·안전성·플랫폼 배포.
  2) Video AI: Kling, Runway, Sora, Veo, Pika, Luma, Synthesia, HeyGen, CapCut AI.
  3) Music AI: Suno, Udio, ElevenLabs Music, Stable Audio, Deezer + 음악 생성 제품/기능/출시 계획. 권리/라이선스는 사용 조건이 새로 바뀔 때만.
  4) Design AI: GPT Image, Midjourney, Adobe Firefly, Canva, Figma, OpenArt, Krea, Ideogram, Freepik, Recraft.
  5) AI Content/Marketing Issues: AI 광고 도구·캠페인 자동화·합성 인플루언서 제품·GEO/SEO 도구·platform policy 업데이트.

[각 항목마다 반드시 회수] 제목 후보 / 발행(시행)일 / 출처명(+원출처) / URL / 본문 핵심 사실 3~4개.
공식 changelog·release notes·API docs를 1차 보도보다 우선. 같은 사안 중복은 1개로 병합.
후보 우선순위는 제품·모델·API 업데이트(P0) > 가까운 출시 계획(P1) > creator workflow 변화(P2) > 정책·권리·비판·소송(P3).
P3는 새 판결/정책/계약/접근 제한처럼 사용 여부를 직접 바꾸는 경우만 포함하고, 낮은 우선순위 기사로 빈 섹션을 채우지 마세요.

[출력] 섹션별로 후보 목록을 위 필드와 함께 정리해 주세요. (HTML은 이후 단계에서 작성)
```

---

## 6. 품질 체크리스트 (브리프 확정 전)

- [ ] 모든 카드의 발행/시행일이 윈도우 안에 있는가 (밖이면 제외 또는 사유 명확)
- [ ] 각 카드에 6개 필드(제목·발행일·출처·요약·시사점·링크) 모두 채워졌는가
- [ ] 링크가 실제로 열리고 해당 사안을 가리키는가 (404·무관 링크 금지)
- [ ] 요약이 사실 중심인가 (단정 못 할 내용은 "~로 보도/추정"으로 표기)
- [ ] 섹션별 `count-pill` 숫자가 실제 카드 수와 일치하는가
- [ ] `index.html`의 카드 추가 / briefs 카운트 / Latest Brief 블록이 갱신됐는가
- [ ] 중복 사안이 여러 카드로 쪼개지지 않았는가
