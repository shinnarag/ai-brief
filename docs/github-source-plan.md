# GitHub 원본 보관과 배포 구조

목표는 GitHub에서 내려받은 원본만으로 같은 사이트를 다시 만들 수 있는 구조입니다. 뉴스 자동 수집·AI 작성은 별도의 실행 단계이며, Pages 빌드만 연결한다고 자동으로 수집되지는 않습니다.

## 원본으로 관리할 파일

```text
briefs/                  날짜별 Markdown 원문
site/build.py            HTML 생성 코드
site/biscuits_lib.py      용어 매칭·렌더링 코드
site/assets/             CSS·JS·용어사전
scripts/                 실행·검증 코드
requirements.txt         Python 의존성
.python-version          Python 버전
.node-version            Node.js 버전
.github/workflows/       빌드 검사와, 이후 연결할 배포 설정
docs/                    운영·이전 설명
```

최신 `prompt.md`, `WATCHLIST.md`, 수집·중복 검사·실행 상태 관리 코드도 확보 후 원본에 포함합니다. 현재 `references/`의 과거 프롬프트를 최신 운영 규칙으로 승격하지 않습니다.

생성 결과 `site/public/`, 로그, 실행 환경, 비밀값, 로컬 가져오기 기록은 원본 커밋에서 제외합니다. `source-manifest.json`과 `references/`에는 컴퓨터 경로와 내부 인계 정보가 있어 현재 로컬에만 보관합니다. 필요한 운영 규칙을 정식 파일로 검토한 뒤 저장소 공개 범위에 맞게 추가합니다.

## 준비된 빌드 검사

`.github/workflows/build.yml`은 source/main 푸시 또는 pull request 시 의존성을 설치하고 `python scripts/local.py build`를 실행합니다. 주요 산출물과 JavaScript를 검사하고 빌드가 원본 파일을 변경하지 않았는지 확인합니다. 이 워크플로는 사이트 배포나 뉴스 생성, 메시지 전송을 하지 않습니다. `workflow_dispatch`도 정의했지만, GitHub 화면의 수동 실행은 워크플로가 기본 브랜치에 반영된 후 사용할 수 있습니다.

2026-09-16에 Git 관리 대상 57개 파일만 별도 폴더로 복사해 로컬 빌드를 확인했습니다. `references/`와 `source-manifest.json` 없이 브리프 44개와 최신 페이지가 생성됐고, 빌드 전후 원본 파일의 해시는 모두 같았습니다. 이 검사는 현재 Mac의 설치된 의존성을 사용했으며 GitHub/Linux 실행 검증은 남아 있습니다.

## 저장소 선택

첫 연결은 기존 공개 저장소의 `source` 브랜치에 웹사이트 코드와 공개 브리프를 보관하는 방식입니다. 기존 main 이력에서 분기하며 현재 사이트를 배포하는 main은 건드리지 않습니다. 인계서와 로컬 메타데이터는 업로드하지 않습니다. 운영 프롬프트·수집 코드까지 가져올 때는 아래 두 방식 중 공개 범위를 다시 적용합니다.

### 비공개 원본 + 기존 공개 사이트

- 비공개 저장소에 코드·규칙·브리프를 관리합니다.
- 현재 공개 `ai-brief` 저장소와 사이트 URL은 유지합니다.
- 원본 저장소에서 빌드한 `site/public/`만 공개 배포 대상으로 전달합니다.
- 두 저장소를 연결하는 배포 인증과 실행 방식은 별도 설정이 필요합니다. 기본 `GITHUB_TOKEN`이 다른 저장소에도 쓰기 권한을 가진다고 가정하지 않습니다.

### 기존 공개 저장소에 원본 포함

- 현재 `ai-brief`의 이력을 유지하며 원본 구조로 이전합니다.
- 코드와 운영 프롬프트도 공개된다는 전제로 포함 파일을 검토합니다.
- Actions에서 빌드한 `site/public/`만 Pages artifact에 올립니다. 저장소 루트 `.` 전체를 업로드하는 현재 배포 방식은 교체해야 합니다.
- 같은 저장소의 Pages 배포에는 `contents: read`, `pages: write`, `id-token: write` 권한과 `github-pages` 배포 환경을 사용합니다.

## 이전 순서

1. 공개본의 달력과 59개 용어사전을 로컬 원본 코드에 동기화합니다. 현재 원본은 44개 브리프를 포함하지만 화면 코드·용어사전 동기화가 남아 있습니다.
2. 최신 운영 규칙과 수집 관련 코드를 확보해 별도로 검증합니다.
3. 선택한 GitHub 저장소의 브랜치에서 원본 빌드를 확인합니다. 기존 저장소를 사용할 경우 원격 이력 위에 변경을 올리고, 로컬 최초 커밋으로 원격 main을 강제 교체하지 않습니다.
4. box 자동 배포의 활성 여부와 마지막 실행을 확인합니다. 인계서에 설명된 `publish-from-box.sh`는 대상 저장소 내용을 비우고 Pages 설정도 재작성하므로, 원본을 같은 저장소에 합치기 전에 실제 동작을 확인하고 이 배포 경로를 중지하거나 교체해야 합니다.
5. 검증한 산출물만 Pages에 배포하고 실제 최신 페이지를 확인합니다. 이전 정상 배포는 되돌릴 수 있도록 남깁니다.
6. 사이트 배포가 안정된 뒤 뉴스 생성 작업의 일정·인증·영속 상태·실패 알림을 GitHub 실행 환경에 연결합니다.

## 현재 경계

- 원본 브랜치를 연결해도 현재 GitHub 사이트의 배포는 변경하지 않습니다.
- GitHub 빌드 검사의 실행 결과는 저장소 Actions의 `source` 브랜치 기록에서 확인합니다.
- `prompt.md`, `WATCHLIST.md` 최신본과 box 예약 상태는 아직 확인이 필요합니다.

공식 참고: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
