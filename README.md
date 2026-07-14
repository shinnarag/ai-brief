# AI Pulse

사내 AI 인텔리전스 데스크. 매일 자동 수집된 시그널로 **모델 · 에이전트 · 크리에이티브 · 마케팅 · 인프라 · 규제** 흐름을 읽습니다.

## Live

- **Site:** https://shinnarag.github.io/ai-brief/
- **Latest:** https://shinnarag.github.io/ai-brief/latest.html
- **Flow map:** https://shinnarag.github.io/ai-brief/flow.html
- **Archive:** https://shinnarag.github.io/ai-brief/archive.html

## Structure

```
index.html      홈 (랜드스케이프 · 시그널 보드 · 최신 브리프 · 타임라인)
flow.html       AI 산업 흐름 맵
archive.html    검색·도메인 필터 아카이브
brief/          날짜별 풀 리포트
assets/         디자인 시스템
data/           index.json (기계 가독)
```

자동 배포: 로컬 수집기 → `site/build.py` → 이 저장소 push → GitHub Pages.
