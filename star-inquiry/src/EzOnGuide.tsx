import { ExampleLightGraph } from "./ExampleLightGraph";
import type { ReactNode } from "react";
import { ArrowRight, ExternalLink, Usb } from "lucide-react";
import { SmartImage } from "./SmartImage";
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
        <SmartImage
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
    <section className="ezon-entry" aria-label="이지온 측정 안내">
      <span className="ezon-entry-icon">
        <Usb size={25} aria-hidden="true" />
      </span>
      <div>
        <span className="eyebrow">4차시 측정 방법</span>
        <h2>이지온으로 측정하고, 여기서 비교해요</h2>
        <p>
          이지메이커 밝기 센서의 값은 이지온에서 수집하고 그래프로 확인해요.
          내려받은 파일을 별빛 탐구실로 가져와 처음 예상과 비교합니다.
        </p>
      </div>
      <button className="primary" onClick={onOpen}>
        연결·수집 방법 보기 <ArrowRight size={17} aria-hidden="true" />
      </button>
    </section>
  );
}

export function EzOnLinks() {
  return (
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
  );
}

/** "setup": open EZ-ON, build blocks, upload. "collect": connect, collect, graph, download. */
export function EzOnSteps({ part }: { part: "setup" | "collect" | "all" }) {
  return (
    <>
      <p className="ezon-source">
        제공된 이지온 사용 예시 화면입니다. 메뉴 모양은 달라질 수 있어요.
      </p>
      <ol className="ezon-steps">
        {part !== "collect" && (
          <>
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
                <strong>이지온 홈페이지 → 유선 체험하기</strong>를 선택해요.
              </p>
            </GuideStep>
            <GuideStep
              number={2}
              title="블록 코딩 화면 열기"
              image={
                <Screenshot number={2} caption="설정과 반복 실행 블록 확인" />
              }
            >
              <p>
                상단 <strong>블록 코딩</strong> 탭을 열고{" "}
                <strong>EZMAKER 설정</strong>,{" "}
                <strong>EZMAKER 반복 실행</strong> 블록이 보이는 화면으로 이동해요.
              </p>
            </GuideStep>
            <GuideStep
              number={3}
              title="예제 코드 버튼으로 한 번에 완성하기"
              image={
                <Screenshot
                  number={3}
                  caption="입력 → 밝기 센서 → 밝기 센서 예제 코드 열기"
                />
              }
            >
              <p>
                왼쪽 <strong>입력 → 밝기 센서</strong>를 열고, 위쪽의{" "}
                <strong>밝기 센서 예제 코드 열기</strong> 버튼을 눌러요.
              </p>
              <p className="notice">
                <strong>이 버튼을 누르면 밝기 측정·데이터 전송·기다리기 블록이 자동으로 완성돼요!</strong> 블록을 하나씩 끌어다 조립할 필요가 없어요.
              </p>
              <p>
                센서를 보드의 <strong>A0</strong>에 꽂았다면 블록에서도 A0를
                골라요. 다른 자리에 꽂았다면 그 이름에 맞춰요.
              </p>
            </GuideStep>
            <GuideStep
              number={4}
              title="자동으로 만들어진 블록 확인"
              image={
                <>
                  <Screenshot
                    number={4}
                    caption="반복 실행 안의 데이터 전송과 0.1초 기다리기"
                  />
                  <details className="ezon-more">
                    <summary>완성된 전체 화면 더 보기</summary>
                    <Screenshot
                      number={5}
                      caption="완성된 밝기 센서 수집 블록"
                    />
                  </details>
                </>
              }
            >
              <p>
                예제 코드가 열리면 아래 그림처럼 밝기 센서의 값을 보내는 블록과
                <strong>0.1초 동안 기다리기</strong>가 함께 들어 있어요.
              </p>
              <p>
                센서를 꽂은 자리와 블록의 <strong>A0</strong> 표시가 같은지 확인한 뒤, 다음 단계에서 보드에 업로드해요.
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
                USB로 보드를 연결하고 <strong>업로드</strong>를 눌러요. 장치
                선택 창에서 내 보드를 골라 <strong>연결</strong>을 누르고 전송이
                끝날 때까지 기다려요.
              </p>
              <p>
                화면의 <strong>COM3</strong> 번호는 컴퓨터마다 달라질 수 있어요.
              </p>
            </GuideStep>
          </>
        )}
        {part !== "setup" && (
          <>
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
                <strong>데이터 분석 → 보드 연결</strong>을 누르고 내 보드를
                골라요.
              </p>
              <p>
                <strong>수집 시작</strong>을 누르면 표에 시간과 센서값이 쌓여요.
                센서에 비추는 빛을 바꿔 값이 움직이는지 보고, 측정이 끝나면{" "}
                <strong>수집 중지</strong>를 눌러요.
              </p>
            </GuideStep>
            <GuideStep
              number={7}
              title="그래프 확인하고 데이터 저장"
              image={
                <ExampleLightGraph />
              }
            >
              <p>
                그래프 설정에서 <strong>X축은 수집시간</strong>,{" "}
                <strong>Y축은 센서 1</strong>로 선택해 밝기 값의 시간 변화를
                살펴봅니다.
              </p>
              <p>
                <strong>데이터 다운로드</strong>를 눌러 기록을 저장해요.
              </p>
            </GuideStep>
          </>
        )}
      </ol>
    </>
  );
}

export function EzOnGuide() {
  return (
    <section className="ezon-guide" aria-label="이지온 연결·수집 방법">
      <div className="ezon-intro">
        <span className="badge">4차시 측정 방법</span>
        <h3>센서값은 이지온에서 모으고, 파일로 가져와요.</h3>
        <p>
          이지메이커를 이지온(EZ·ON)에 연결해 밝기를 수집하고 그래프로
          확인합니다. 내려받은 CSV 파일은 별빛 탐구실 4차시 ‘가져와 비교’에서
          불러옵니다.
        </p>
        <EzOnLinks />
      </div>
      <div className="notice">
        다른 탭이나 프로그램이 같은 보드를 사용 중이라면 연결을 해제한 뒤
        이지온에서 연결하세요.
      </div>
      <EzOnSteps part="all" />
      <EzOnTroubleshooting />
      <section className="ezon-return" aria-labelledby="ezon-return-title">
        <h3 id="ezon-return-title">별빛 탐구실로 가져오기</h3>
        <p>
          내려받은 파일을{" "}
          <strong>4차시 → 가져와 비교 → 이지온 파일 가져오기</strong>에서
          고릅니다. 수집시간은 첫 기록부터 지난 초로 바뀌고, 센서 1 값은 원본
          그대로 기록됩니다.
        </p>
        <p className="muted">
          두 사이트는 자동으로 동기화되지 않습니다. 엑셀에서 열어 다시 저장하면
          시간 형식이 바뀔 수 있으니 내려받은 파일을 그대로 가져오세요.
        </p>
      </section>
    </section>
  );
}

export function EzOnTroubleshooting() {
  return (
    <details className="ezon-more">
      <summary>값이 움직이지 않을 때 · 교사용 참고</summary>
      <ul>
        <li>
          값이 계속 0이면 센서 연결, 블록의 A0 설정, 프로그램 전송 상태와 USB
          데이터 케이블을 살펴보세요.
        </li>
        <li>
          LED를 끈 주변 빛의 값과 켠 시작값을 각각 기록합니다. 더 밝게 해도
          최댓값에서 변하지 않으면 거리나 밝기를 조절합니다.
        </li>
        <li>
          0~100과 0~1023은 다른 출력 범위입니다. 한 실험에서는 같은 범위를
          사용하고, 확인되지 않은 값에 lux를 붙이지 않습니다. 0~1023은 먼
          거리에서 값의 차이를 더 잘게 보여 줍니다.
        </li>
        <li>
          0.1초 기다리기는 약 10회/초 수집을 위한 설정입니다. 실제 간격은 기록된
          수집시간으로 확인합니다.
        </li>
        <li>
          시간을 거리로 바꾸려면 시작 거리, 출발 시각과 실제 속력이 필요합니다.
          속력이 일정한 구간에서만 계산합니다.
        </li>
        <li>
          첨부 화면의 그래프는 사용 예시이며 거리–밝기 관계를 입증한 실험 결과가
          아닙니다. 실물 기기 연결은 수업 전에 따로 시험합니다.
        </li>
      </ul>
    </details>
  );
}
