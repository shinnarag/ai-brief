# AI Brief 검색 요청 명세 (SEARCH-PROMPT)

이 문서는 다음 AI Brief를 만들 때 **검색을 어떻게 요청하고, 어떤 정보를 수집해 카드로 채울지**를 정의합니다.
페이지 구조(`index.html`, `briefs/YYYY-MM-DD.html`)에서 실제로 필요한 정보만 역으로 정리했습니다.
새 브리프를 만들 때 이 문서를 그대로 검색 에이전트에게 전달하면 됩니다.

---

## 0. 한 줄 작업 정의

> "오늘 날짜 기준 윈도우(아래 규칙) 안에 **발행되었거나 시행된** AI 업데이트만 모아,
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
- 윈도우 밖이거나, 업데이트성보다 **evergreen(시점 무관 일반 정보)** 성격이 강하면 제외.
- 같은 사안의 중복 보도는 1개 카드로 합치고, 가장 1차에 가까운/정보량 많은 출처를 우선.

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
- **무엇을 찾나:** 음악 생성 모델·제품, 투자/시장, 훈련 데이터·라이선스·권리 투명성 이슈.
- **검색 대상:** Suno, Udio, ElevenLabs Music, Stable Audio, Deezer (+ 레이블/스트리밍 권리 이슈).

### 2-4. Design AI (이미지·디자인)
- **무엇을 찾나:** 이미지 생성/편집 모델, 캠페인 변형 생성, DAM·디자인 툴 내 생성 워크플로.
- **검색 대상:** GPT Image / ChatGPT image generation / OpenAI image, Midjourney, Adobe Firefly, Canva, Figma,
  OpenArt, Krea, Ideogram, Freepik, Recraft.

### 2-5. AI Content / Marketing Issues
- **무엇을 찾나:** AI 광고 제작, 합성 인플루언서, 저작권, 고지(disclosure), 검색 가시성(answer engine), 브랜드 세이프티, 마케팅 자동화.
- **검색 대상:** 위 이슈를 다루는 업계 매체·캠페인 사례·규제/소송 동향.

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
  3) Music AI: Suno, Udio, ElevenLabs Music, Stable Audio, Deezer + 음악 권리/라이선스 이슈.
  4) Design AI: GPT Image, Midjourney, Adobe Firefly, Canva, Figma, OpenArt, Krea, Ideogram, Freepik, Recraft.
  5) AI Content/Marketing Issues: AI 광고·합성 인플루언서·저작권·고지·검색 가시성·브랜드 세이프티·마케팅 자동화.

[각 항목마다 반드시 회수] 제목 후보 / 발행(시행)일 / 출처명(+원출처) / URL / 본문 핵심 사실 3~4개.
공식 changelog·release notes·API docs를 1차 보도보다 우선. 같은 사안 중복은 1개로 병합.

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
