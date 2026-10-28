# 별빛의 거리를 재다

NC1395의 1~2차시 탐구를 잇는 중학교 과학 3~5차시 POE 웹앱입니다. React·TypeScript·Vite·Apache ECharts로 만들었으며 별도 서버 없이 브라우저에 학습 기록을 저장합니다.

## 실행

Node.js 24에서:

```sh
cd star-inquiry
npm ci
npm run dev
```

브라우저에서 터미널에 표시되는 주소를 엽니다. 배포 파일은 `npm run build`로 생성되는 `star-inquiry/dist`입니다. `npm test`로 과학 계산·CSV·백업·센서 프레임 테스트를 실행합니다.

## 학습 흐름

- **3차시:** 개인/모둠 최초 예상 그래프와 이유 보존, 거리–빛의 세기 조작 모형, 변인·측정 계획·설계 점검.
- **4차시:** 마퀸 MakeCode 안내, 수신 전용 센서 어댑터, CSV/수동 입력과 연습 데이터, 실제 속력 보정, 주행 시점 표시, 주변광 보정, 반복 비교, 분석 제외 사유, 작성자별 관찰 후 설명.
- **5차시:** 비바샘 원본 활동 연결, 전구 수와 밝기 비, 유효한 값의 상대 등급 변화, 10pc 모형, 자체 형성평가와 성찰.
- **저장:** 로컬 자동 저장, JSON 백업·복원, CSV 및 원본 CSV 저장, 그래프 PNG, 인쇄/PDF 보고서, 샘보드 공유용 텍스트. 자동 동기화·자동 게시 기능은 없습니다.

실험 전에는 JSON 백업을 보관하세요. 새 기기나 다른 주소로 이동할 때 기록은 자동 이전되지 않습니다. 교사용 패널은 인증 기능이 아닙니다.

## 센서의 검증 범위

**연동 구조 구현 완료 / 실제 기기 검증 전**입니다. 공개 이지메이커 클라이언트에서 Web Serial, 115200 설정, 숫자 CSV/줄바꿈 처리의 근거를 확인했습니다. 특정 유선보드의 펌웨어·초기화 명령·물리 포트·채널·단위·선형성은 검증하지 않았습니다. 확인되지 않은 명령을 전송하거나 A0·lux를 가정하지 않습니다. 지원하지 않는 브라우저에서는 CSV·수동 입력·연습 모드를 사용하세요.

연습 데이터는 화면·CSV·JSON·보고서에서 출처를 보존합니다. 실측 결과로 사용하지 마세요. 속력·주행 기준 시점 미확인 시 거리 추정이 불가능하며, 선형성과 단위가 미확인인 원시값은 등급으로 환산하지 않습니다.

## 문서

- [교사용 3~5차시 진행 안내](star-inquiry/docs/teacher-guide.md)
- [센서 통신 조사와 실물 검증 순서](star-inquiry/docs/sensor-research.md)
- [비바샘 콘텐츠와 확인 상태](star-inquiry/docs/content-status.md)
- [검증 결과와 한계](star-inquiry/docs/verification.md)
- [GitHub → Cloudflare Pages 자동 배포](star-inquiry/docs/deployment.md)

## 자동 배포

대상 저장소: `https://github.com/sirlma111216-boop/vivacon`

Cloudflare Pages에서 이 저장소를 Git으로 연결하고 다음 설정을 적용합니다.

| 설정 | 값 |
|---|---|
| 프로덕션 브랜치 | `main` |
| 프로젝트 루트 | `star-inquiry` |
| 빌드 명령 | `npm test && npm run build` |
| 출력 디렉터리 | `dist` |
| Node 버전 | `24` |

연결 후 `main`에 push하면 Cloudflare가 자동 빌드·배포합니다. GitHub Actions도 같은 테스트와 빌드를 수행합니다. 계정 연결과 첫 배포 성공 여부는 배포 문서의 확인 상태를 참고하세요. API 토큰이나 학생 데이터를 저장소에 넣지 마세요.

## 이미지

사용자가 제공한 PNG 3개를 `star-inquiry/public/assets/astronomy/`에 원본 그대로 보존했습니다. 생성 삽화이며 사료·공식 제품 사진·비바샘 공식 이미지·실측 데이터가 아닙니다. 수치·방향·그래프·10pc 관계는 HTML/SVG/Canvas로 따로 구현했습니다.
