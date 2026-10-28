# GitHub에서 Cloudflare Pages 자동 배포

이 앱은 React·TypeScript·Vite로 만든 정적 웹앱이다. GitHub 저장소를 Cloudflare Pages의 기본 Git 통합에 연결하면 커밋을 푸시할 때 자동 빌드·배포할 수 있다. [Cloudflare Git 통합 문서](https://developers.cloudflare.com/pages/configuration/git-integration/)

대상 저장소: [sirlma111216-boop/vivacon](https://github.com/sirlma111216-boop/vivacon). Cloudflare Pages 프로젝트 `vivacon`에 GitHub 저장소를 연결했으며, 운영 브랜치는 `main`이다. 대시보드에서 **Automatic deployments enabled**를 확인했다.

실행 주소: **[https://vivacon.pages.dev/](https://vivacon.pages.dev/)**

## 배포 확인 기록

- 2026-10-28 23:57 KST: 첫 운영 배포 `cd9c929b-4694-4879-b190-33f9b7c792de` 성공. 커밋은 `c19d8b10db7b150a4d38dd9b39ad1e06fa4c269e`이다.
- Cloudflare 빌드 로그에서 Node.js 24.22.1, 테스트와 TypeScript·Vite 빌드 성공을 확인했다. 같은 커밋의 [GitHub Actions 검증](https://github.com/sirlma111216-boop/vivacon/actions/runs/40710421164)도 성공했다.
- 운영 HTTPS 주소에서 실제 앱이 열리고 제목이 ‘별빛 탐구실 · 별빛의 거리를 재다’로 표시됨을 확인했다.
- Git 저장소 연결, 운영 브랜치 `main`, 자동 배포 활성화, 전체 경로 감시(`*`), 아래 빌드 설정을 대시보드에서 확인했다.

자동 배포 확인은 문서 변경을 `main`에 푸시한 뒤 새 커밋의 배포가 자동 생성되고 성공하는지 대시보드에서 확인한다. 배포 버튼을 수동으로 누르거나 GitHub Actions 성공만 보는 것으로 대신하지 않는다.

## 저장소 구성

```text
vivacon/                      # GitHub 저장소 루트
  .github/workflows/ci.yml     # GitHub Actions 검증
  star-inquiry/               # Cloudflare의 Root directory
    .node-version
    package.json
    package-lock.json
    wrangler.toml
    public/
      _headers
      assets/astronomy/        # 제공받은 PNG 원본 3개
    src/
    docs/
```

`node_modules/`, `dist/`, 다운로드된 학습 기록과 개인 JSON 백업은 저장소에 올리지 않는다. 배포 산출물은 Cloudflare에서 소스로부터 다시 만든다. `package-lock.json`과 이미지 원본은 저장소에 포함한다.

## 처음 연결할 때

Cloudflare 대시보드의 **Workers & Pages → Create application → Pages → Connect to Git**에서 `sirlma111216-boop/vivacon`을 선택한다. Pages 프로젝트를 생성할 때 연결 대상 저장소에 필요한 접근 권한을 부여한다. 저장소 목록이 없으면 GitHub 앱 설치의 저장소 허용 범위를 확인한다. 로그인·권한 승인은 계정 소유자가 진행한다.

| 설정 | 이 저장소에 넣을 값 |
| --- | --- |
| 프로젝트 이름 | `vivacon` (`wrangler.toml`과 일치) |
| Production branch | `main` |
| Framework preset | React (Vite) |
| Root directory | `star-inquiry` |
| Build command | `npm test && npm run build` |
| Build output directory | `dist` |
| Build system | v3 |
| Node.js 버전 | `.node-version`의 `24`; 대시보드에 `NODE_VERSION`을 설정할 경우 동일하게 `24` |
| 앱용 API 키·비밀값 | 필요 없음 |

Vite의 산출물은 `dist`이며, 저장소 안의 하위 프로젝트는 Root directory를 지정한다. 출력 경로는 선택한 Root directory를 기준으로 하므로 `star-inquiry/dist`를 다시 입력하지 않는다. 빌드 명령에서 테스트가 실패하면 이후 빌드는 진행하지 않는다. [빌드 설정 공식 문서](https://developers.cloudflare.com/pages/configuration/build-configuration/)

Pages의 Node 버전은 `.node-version` 또는 `NODE_VERSION`으로 지정할 수 있다. 앱은 TypeScript 검사와 Vite 빌드를 위해 개발 의존성도 설치해야 하므로 `NODE_ENV=production`으로 개발 의존성을 생략하지 않는다. 의존성 설치는 Pages의 기본 설치 단계를 사용한다. 별도 설치를 직접 관리하려는 경우에만 `SKIP_DEPENDENCY_INSTALL=1`과 `npm ci && npm test && npm run build`를 함께 설정한다. [빌드 환경 공식 문서](https://developers.cloudflare.com/pages/configuration/build-image/)

프로젝트에 서버 함수나 데이터베이스 바인딩은 없다. `wrangler.toml`은 빌드 산출물 위치와 프로젝트 이름을 명시한다. Node 버전은 Wrangler의 런타임 변수에 넣지 않는다. 계정 ID·API 토큰·GitHub 비밀키를 소스에 기록하지 않는다. [Pages Wrangler 설정](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)

## 자동 배포와 CI의 역할

`.github/workflows/ci.yml`은 `main`·`master` 푸시와 해당 브랜치 대상 PR에서 Node 24로 `npm ci`, `npm test`, `npm run build`를 순서대로 실행한다. 파일 경로는 저장소 루트의 `star-inquiry`를 기준으로 설정되어 있다. 배포 API 토큰이 필요 없는 읽기 전용 검증 작업이며 원격 계정에 배포하지 않는다. 워크플로는 공식 [checkout](https://github.com/actions/checkout)과 [setup-node](https://github.com/actions/setup-node)의 현재 v7 사용 예를 따른다.

Cloudflare의 Git 통합은 GitHub CI와 별도로 빌드한다. 그래서 Cloudflare 빌드 명령에도 테스트를 넣었다. 브랜치 보호를 사용할 경우 `test-and-build` 검사를 필수로 지정할 수 있다. GitHub Actions 성공만으로 실제 사이트 배포 성공을 판단하지 않고, Cloudflare의 해당 커밋 배포가 성공했는지 확인한다.

`public/_headers`는 Vite 빌드 시 `dist/_headers`로 복사된다. 콘텐츠 유형과 참조자 정책을 설정하고, Web Serial 정책은 같은 출처로 제한한다. 실제 센서 선택은 여전히 브라우저의 명시적 사용자 동작과 권한이 필요하다. [Pages 헤더 파일](https://developers.cloudflare.com/pages/configuration/headers/)

별도 `_redirects`는 넣지 않았다. 이 앱은 하나의 진입점에서 차시를 전환하며, Pages는 최상위 `404.html`이 없을 때 정적 파일에 대응하지 않는 요청에 SPA 진입점을 제공한다. [Pages SPA 처리](https://developers.cloudflare.com/pages/configuration/serving-pages/)

## 연결 후 확인

1. 첫 배포 로그에서 선택한 저장소·브랜치·커밋과 Root directory, Node 24를 확인한다.
2. 테스트와 빌드가 성공하고 Pages가 제공한 실제 HTTPS URL을 연다.
3. 도입 이미지 3개, 차시 이동, 연습 데이터와 그래프, JSON/CSV 내보내기를 확인한다.
4. 변경을 GitHub에 푸시하고 새 커밋이 자동 배포되는지 확인한다.
5. 로컬 주소·미리보기 주소·최종 도메인은 서로 다른 출처이므로 학습 기록이 자동 이동하지 않는다. 기존 주소에서 JSON 백업을 받고 최종 주소에서 복원한다.

실제 센서 수신과 자동차 주행은 웹 배포 성공과 별도의 실물 검증 항목이다. 서버 저장·모둠 동기화 기능은 없으며, 앱을 공개 배포해도 학생의 브라우저 학습 기록이 GitHub나 Cloudflare로 자동 전송되는 구조가 아니다.
