import type { ReactNode } from "react";
import { ArrowRight, ExternalLink, Usb } from "lucide-react";
import "./ezon-guide.css";

const screenshots = [
  { width: 2535, height: 1332, alt: "이지온 첫 화면의 유선 체험하기 버튼" },
  {
    width: 947,
    height: 587,
    alt: "블록 코딩 탭의 EZMAKER 설정과 EZMAKER 반복 실행 블록",
  },
  {
    width: 798,
    height: 788,
    alt: "입력의 밝기 센서 메뉴에 있는 0~1023 및 0~100 측정값 블록",
  },
  {
    width: 660,
    height: 385,
    alt: "반복 실행 안에 밝기 센서 데이터 전송과 0.1초 기다리기를 넣은 블록 구성",
  },
  {
    width: 997,
    height: 636,
    alt: "밝기 센서 전송 블록을 완성한 이지온 블록 코딩 전체 화면",
  },
  { width: 1546, height: 581, alt: "보드 업로드 중 표시된 직렬 포트 선택 창" },
  {
    width: 1223,
    height: 812,
    alt: "데이터 분석 탭의 보드 연결, 수집 시작, 데이터 다운로드 버튼",
  },
  {
    width: 636,
    height: 372,
    alt: "데이터 분석에서 보드 연결을 눌러 연 직렬 포트 선택 창",
  },
  {
    width: 1635,
    height: 1122,
    alt: "수집 중인 이지온의 수집시간과 센서 1 표 및 수집 중지 버튼",
  },
  {
    width: 1666,
    height: 1115,
    alt: "그래프 설정에서 X축 수집시간과 Y축 센서 1을 선택한 화면",
  },
];

function Screenshot({ number, caption }: { number: number; caption: string }) {
  const shot = screenshots[number - 1];
  const src = `/assets/ezon/step-${String(number).padStart(2, "0")}.png`;
  return (
    <figure className="ezon-screenshot">
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${caption} 원본 크게 보기 (새 탭)`}
      >
        <img
          src={src}
          width={shot.width}
          height={shot.height}
          alt={shot.alt}
          loading="lazy"
          decoding="async"
        />
      </a>
      <figcaption>
        <span>{caption}</span>
        <a href={src} target="_blank" rel="noopener noreferrer">
          원본 크게 보기 <ExternalLink size={13} aria-hidden="true" />
          <span className="ezon-sr-only"> (새 탭)</span>
        </a>
      </figcaption>
    </figure>
  );
}

function GuideStep({
  number,
  title,
  children,
  image,
}: {
  number: number;
  title: string;
  children: ReactNode;
  image: ReactNode;
}) {
  return (
    <li className="ezon-step">
      <div className="ezon-step-copy">
        <span className="ezon-step-number" aria-hidden="true">
          {String(number).padStart(2, "0")}
        </span>
        <h3>{title}</h3>
        {children}
      </div>
      <div className="ezon-step-images">{image}</div>
    </li>
  );
}

export function EzOnEntry({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="ezon-entry" aria-label="이지온 직접 수집 안내">
      <span className="ezon-entry-icon">
        <Usb size={25} aria-hidden="true" />
      </span>
      <div>
        <span className="eyebrow">또 하나의 실험 방법</span>
        <h2>이지온으로 직접 수집하기</h2>
        <p>
          별빛 탐구실을 거치지 않고도 이지메이커를 이지온에 연결해 데이터를
          수집하고 그래프로 볼 수 있어요.
        </p>
      </div>
      <button className="primary" onClick={onOpen}>
        연결·수집 방법 보기 <ArrowRight size={17} aria-hidden="true" />
      </button>
    </section>
  );
}

export function EzOnGuide() {
  return (
    <section className="ezon-guide" aria-label="이지온 직접 데이터 수집 방법">
      <div className="ezon-intro">
        <span className="badge">별빛 탐구실 없이도 가능한 방법</span>
        <h3>이지메이커에서 이지온으로, 바로 실험해요.</h3>
        <p>
          이지온(EZ·ON)에 이지메이커를 연결하면 블록 코딩, 데이터 수집,
          표·그래프 확인을 그곳에서 진행할 수 있습니다. 이 앱의 센서 연결이나
          데이터 입력은 필수가 아니에요.
        </p>
        <div className="button-row">
          <a
            className="primary ezon-link-button"
            href="https://ezon.ai/sandbox"
            target="_blank"
            rel="noopener noreferrer"
          >
            이지온 유선 체험 열기 <ExternalLink size={16} aria-hidden="true" />
            <span className="ezon-sr-only"> (새 탭)</span>
          </a>
          <a
            className="ezon-link-button"
            href="https://ezon.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            이지온 홈페이지 <ExternalLink size={16} aria-hidden="true" />
            <span className="ezon-sr-only"> (새 탭)</span>
          </a>
        </div>
      </div>
      <div className="notice">
        <strong>시작 전에 USB 연결을 확인하세요.</strong>
        <br />
        이지메이커와 밝기 센서, 데이터 통신이 가능한 USB 케이블을 준비합니다. 이
        앱이나 다른 탭·프로그램에서 같은 보드를 연결했다면 수집을 중지하고
        연결을 해제한 뒤 이지온에서 연결하세요. 포트 선택 창은 사용자가 직접
        선택합니다.
      </div>
      <p className="ezon-source">
        교사가 제공한 이지온 화면(2026-10-28)을 따라 구성한 안내입니다. 메뉴
        모양은 바뀔 수 있으며, 아래 화면은 별빛 탐구실에서 실물 연결을 검증한
        결과가 아닙니다.
      </p>
      <ol className="ezon-steps">
        <GuideStep
          number={1}
          title="이지온에서 유선 체험 시작"
          image={
            <Screenshot
              number={1}
              caption="이지온 홈페이지에서 유선 체험하기"
            />
          }
        >
          <p>
            <strong>이지온 홈페이지 → 유선 체험하기</strong>를 선택합니다. 위의
            ‘이지온 유선 체험 열기’ 버튼으로도 이동할 수 있어요.
          </p>
          <p>
            제공된 화면은 유선 보드를 사용하는 게스트 체험 화면입니다. 연결
            버튼이 표시되는 브라우저와 컴퓨터에서 진행하세요.
          </p>
        </GuideStep>
        <GuideStep
          number={2}
          title="블록 코딩 화면 열기"
          image={<Screenshot number={2} caption="설정과 반복 실행 블록 확인" />}
        >
          <p>
            상단 <strong>블록 코딩</strong> 탭을 열고{" "}
            <strong>EZMAKER 설정</strong>, <strong>EZMAKER 반복 실행</strong>{" "}
            블록을 확인합니다.
          </p>
          <p>
            밝기를 반복해서 읽고 보내는 블록은 ‘EZMAKER 반복 실행’ 안에
            넣습니다.
          </p>
        </GuideStep>
        <GuideStep
          number={3}
          title="밝기 센서와 실제 포트 선택"
          image={
            <Screenshot
              number={3}
              caption="입력 → 밝기 센서에서 측정값 블록 선택"
            />
          }
        >
          <p>
            왼쪽 <strong>입력 → 밝기 센서</strong>에서 측정값 블록을 찾습니다.
            제공된 예시에서는 <strong>0~100</strong> 블록을 사용합니다.
          </p>
          <p>
            <strong>A0는 예시입니다.</strong> 센서가 실제 연결된 보드의 포트를
            확인하고 블록의 포트도 일치시킵니다.
          </p>
          <p className="ezon-callout">
            0~100과 0~1023은 서로 다른 출력 범위입니다. 같은 실험에서는 한
            범위를 유지하고, 단위가 확인되지 않은 값을 조도(lux)로 표시하지
            않습니다.
          </p>
        </GuideStep>
        <GuideStep
          number={4}
          title="밝기 전송과 기다리기 블록 조립"
          image={
            <>
              <Screenshot
                number={4}
                caption="반복 실행 안의 데이터 전송과 0.1초 기다리기"
              />
              <details className="ezon-more">
                <summary>완성된 전체 화면 더 보기</summary>
                <Screenshot number={5} caption="완성된 밝기 센서 수집 블록" />
              </details>
            </>
          }
        >
          <p>
            <strong>데이터 전송</strong> 안에{" "}
            <strong>센서 데이터 추가하기</strong>를 넣고, 그 안에 밝기 센서
            측정값 블록을 넣습니다.
          </p>
          <p>
            바로 아래에 <strong>0.1초 동안 기다리기</strong>를 연결합니다. 이 두
            동작이 반복 실행 안에 있도록 맞춰 주세요.
          </p>
          <p className="ezon-callout">
            0.1초 대기는 약 10회/초 수집을 의도한 설정입니다. 처리·통신 시간이
            더해질 수 있으므로 실제 간격은 기록된 수집시간으로 확인합니다.
          </p>
        </GuideStep>
        <GuideStep
          number={5}
          title="보드에 업로드"
          image={
            <Screenshot
              number={6}
              caption="업로드 중 사용할 보드의 직렬 포트 선택"
            />
          }
        >
          <p>
            USB로 보드를 연결하고 <strong>업로드</strong>를 누릅니다. 장치 선택
            창에서 사용 중인 보드의 포트를 선택한 뒤 <strong>연결</strong>을
            누르고 업로드가 끝날 때까지 기다립니다.
          </p>
          <p>
            <strong>USB Serial(COM3)</strong>는 제공된 화면의 예시입니다.
            컴퓨터에 따라 포트 이름과 번호가 다르므로 COM3를 그대로 찾을 필요는
            없습니다.
          </p>
        </GuideStep>
        <GuideStep
          number={6}
          title="데이터 분석에서 연결하고 수집"
          image={
            <>
              <Screenshot
                number={7}
                caption="데이터 분석 → 보드 연결 → 수집 시작"
              />
              <details className="ezon-more">
                <summary>포트 선택과 수집 중 화면 더 보기</summary>
                <Screenshot
                  number={8}
                  caption="분석용 보드 연결에서 포트 선택"
                />
                <Screenshot
                  number={9}
                  caption="수집시간·센서 1 기록과 수집 중지 버튼"
                />
              </details>
            </>
          }
        >
          <p>
            <strong>데이터 분석</strong> 탭으로 이동해{" "}
            <strong>보드 연결</strong>을 누릅니다. 포트 선택 창이 다시 뜨면 해당
            보드를 선택합니다.
          </p>
          <p>
            <strong>수집 시작</strong>을 누르고 표에 <strong>수집시간</strong>과{" "}
            <strong>센서 1</strong> 값이 쌓이는지 확인하세요. 센서에 비추는 빛을
            바꿔 값이 반응하는지 살펴본 뒤 실험을 진행합니다.
          </p>
          <p className="ezon-callout">
            실험 전 LED를 끈 주변광 값과 켠 시작값을 각각 기록하세요. 센서값이
            선택한 범위의 최댓값에 붙어 더 밝게 해도 변하지 않으면 포화 가능성을
            확인하고 거리나 밝기를 조절합니다.
          </p>
          <p>
            측정이 끝나면 <strong>수집 중지</strong>를 누릅니다. 값이 계속
            0이거나 변하지 않으면 포트, 센서 연결, 블록, 업로드 상태와 비추는
            빛을 확인합니다.
          </p>
        </GuideStep>
        <GuideStep
          number={7}
          title="그래프 확인하고 데이터 저장"
          image={
            <Screenshot
              number={10}
              caption="그래프 설정: X축 수집시간, Y축 센서 1"
            />
          }
        >
          <p>
            그래프 설정에서 <strong>X축은 수집시간</strong>,{" "}
            <strong>Y축은 센서 1</strong>로 선택해 밝기 값의 시간 변화를
            살펴봅니다.
          </p>
          <p>
            <strong>데이터 다운로드</strong>로 기록을 저장합니다. 실제 내려받은
            파일의 형식, 열 이름과 단위도 확인하세요.
          </p>
          <p className="ezon-callout">
            수집시간은 거리가 아닙니다. 거리–밝기 관계를 보려면 실제 시작 거리와
            주행 기준 시점, 측정한 속력이 필요하며 등속 구간에서만 거리를
            계산합니다.
          </p>
        </GuideStep>
      </ol>
      <div className="notice">
        <strong>화면 예시와 실험 결과를 구분해요.</strong>
        <br />위 화면의 0인 값이나 오르내리는 곡선은 이지온 사용 방법을 보여
        주는 예시입니다. 거리의 제곱에 반비례하는 관계를 입증한 실험 결과로
        해석하지 않습니다. 실제 실험에서는 고정 센서, 센서를 향한 LED, 주변광과
        이동 조건을 따로 기록하세요.
      </div>
      <section className="ezon-return" aria-labelledby="ezon-return-title">
        <h3 id="ezon-return-title">필요할 때만 별빛 탐구실로 가져오기</h3>
        <p>
          이지온에서 수집·분석을 마쳐도 됩니다. 여기서 예상과 비교하거나
          보고서를 이어 쓰고 싶다면 내려받은 파일을 별도로 준비해{" "}
          <strong>4차시 → 센서 연결·보정 → CSV · 수동 입력</strong>을
          이용하세요.
        </p>
        <p>
          두 사이트는 자동으로 동기화되지 않으며, 이지온 다운로드 파일을 그대로
          불러올 수 있다고 보장하지 않습니다. 이 앱의 CSV 양식에 맞춰{" "}
          <code>time</code>(경과 시간, 초), <code>raw</code>(센서 값), 필요하면{" "}
          <code>distance</code>(거리, cm) 열로 정리합니다. 시각으로 저장된
          수집시간은 경과 초로 바꾸고, 원본 파일은 별도로 보관하세요.
        </p>
      </section>
    </section>
  );
}
