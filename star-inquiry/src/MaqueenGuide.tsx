import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import "./maqueen-guide.css";

const scenes = [
  {
    width: 2526,
    height: 1278,
    alt: "MakeCode 첫 화면에서 새 프로젝트를 만드는 카드",
  },
  {
    width: 562,
    height: 306,
    alt: "프로젝트 이름을 등속운동으로 입력한 만들기 창",
  },
  {
    width: 1177,
    height: 782,
    alt: "새 프로젝트의 시작하면·무한반복 블록과 확장 메뉴",
  },
  {
    width: 1667,
    height: 637,
    alt: "maqueen 검색으로 나타난 마퀸과 마퀸 플러스 확장 결과",
  },
  {
    width: 1023,
    height: 765,
    alt: "확장 추가 후 표시된 Maqueen v4와 Maqueen v5 블록 분류",
  },
  {
    width: 1492,
    height: 756,
    alt: "시작 아이콘, A 버튼 전진, 초음파 거리 5cm 미만 정지, B 버튼 정지를 구성한 전체 코드",
  },
  {
    width: 512,
    height: 335,
    alt: "MakeCode 아래쪽 다운로드 버튼 옆의 점 세 개 메뉴",
  },
  {
    width: 217,
    height: 138,
    alt: "다운로드 메뉴의 장치 연결과 파일로 다운로드 항목",
  },
  {
    width: 377,
    height: 127,
    alt: "브라우저 다운로드 목록에 저장된 microbit HEX 파일",
  },
];

function SceneImage({ number, caption }: { number: number; caption: string }) {
  const scene = scenes[number - 1];
  const src = `/assets/maqueen/scene-${String(number).padStart(2, "0")}.png`;
  return (
    <figure className="maqueen-scene-image">
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${number}번 장면: ${caption}, 원본 크게 보기 (새 탭)`}
        style={{ maxWidth: scene.width }}
      >
        <img
          src={src}
          width={scene.width}
          height={scene.height}
          alt={scene.alt}
          loading="lazy"
          decoding="async"
        />
      </a>
      <figcaption>
        <span>{caption}</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${number}번 장면 원본 크게 보기 (새 탭)`}
        >
          원본 크게 보기 <ExternalLink size={13} aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

function Scene({
  number,
  title,
  children,
  caption,
}: {
  number: number;
  title: string;
  children: ReactNode;
  caption: string;
}) {
  return (
    <li id={`maqueen-scene-${number}`} className="maqueen-scene">
      <div className="maqueen-scene-copy">
        <span className="maqueen-scene-number" aria-hidden="true">
          {String(number).padStart(2, "0")}
        </span>
        <h3>{title}</h3>
        {children}
      </div>
      <SceneImage number={number} caption={caption} />
    </li>
  );
}

export function MaqueenGuide() {
  return (
    <section className="maqueen-guide" aria-labelledby="maqueen-guide-title">
      <div className="maqueen-guide-intro">
        <span className="badge">등속운동 실험을 위한 자동차 준비</span>
        <h2 id="maqueen-guide-title">마퀸 자동차 코딩, 화면으로 따라 하기</h2>
        <p>
          새 프로젝트를 만들고 마퀸 확장을 추가한 뒤, A 버튼으로 출발하고 B
          버튼이나 가까운 장애물 감지로 멈추는 코드를 구성해요. 제공된 MakeCode
          화면 9개를 차례대로 살펴봅니다.
        </p>
        <a
          className="primary maqueen-guide-link"
          href="https://makecode.microbit.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          MakeCode 열기 <ExternalLink size={16} aria-hidden="true" />
        </a>
        <nav
          className="maqueen-guide-jumps"
          aria-label="마퀸 코딩 안내 바로 가기"
        >
          <a href="#maqueen-scene-1">① 프로젝트·확장</a>
          <a href="#maqueen-scene-6">⑥ 코드 해설</a>
          <a href="#maqueen-scene-7">⑦ 다운로드</a>
        </nav>
      </div>
      <p className="maqueen-guide-source">
        제공된 실제 MakeCode 화면을 사용한 안내입니다. 메뉴 이름·확장 버전은
        달라질 수 있으며, 이 안내의 실물 주행은 아직 검증하지 않았습니다.
      </p>
      <div className="notice">
        <strong>같은 모터 설정값이 곧 등속운동은 아니에요.</strong>
        <br />
        화면의 255는 모터 구동 설정값이며 cm/s가 아닙니다. 이 코드는 실제 속력을
        측정해 일정하게 유지하는 제어를 하지 않습니다. 바닥·배터리·부착한 LED
        무게에 따라 달라지는 실제 속력을 거리와 시간으로 확인해야 합니다.
      </div>
      <ol className="maqueen-scenes">
        <Scene
          number={1}
          title="새 프로젝트 열기"
          caption="MakeCode 첫 화면의 새 프로젝트"
        >
          <p>
            MakeCode 홈페이지의 <strong>새 프로젝트</strong>를 선택합니다. 이전
            프로젝트 카드와 구분해 이번 실험에 사용할 새 작업을 시작하세요.
          </p>
        </Scene>
        <Scene
          number={2}
          title="프로젝트 이름 정하기"
          caption="프로젝트 이름을 입력하고 생성"
        >
          <p>
            이름을 <strong>등속운동</strong>처럼 알아보기 쉽게 입력하고{" "}
            <strong>생성</strong>을 누릅니다. 모둠 이름이나 실험 날짜를 덧붙이면
            나중에 파일을 찾기 쉬워요.
          </p>
        </Scene>
        <Scene
          number={3}
          title="확장 메뉴 열기"
          caption="블록 목록에서 확장 선택"
        >
          <p>
            새 편집 화면에는 <strong>시작하면</strong>과{" "}
            <strong>무한반복</strong> 블록이 있습니다. 왼쪽 목록의{" "}
            <strong>확장</strong>을 눌러 마퀸 모터와 초음파 센서 블록을
            추가합니다.
          </p>
          <p>
            왼쪽 micro:bit 화면은 시뮬레이터입니다. 아이콘이 보이는 것만으로
            실제 자동차의 전진·정지 동작까지 확인된 것은 아니에요.
          </p>
        </Scene>
        <Scene
          number={4}
          title="maqueen 확장 찾기"
          caption="maqueen 검색 결과와 여러 장비용 확장"
        >
          <p>
            검색창에 <code>maqueen</code>을 입력합니다. 첨부 화면은{" "}
            <strong>maqueen</strong> 확장을 선택하는 흐름입니다.
          </p>
          <p>
            <strong>
              Maqueen, Maqueen Plus 등 실제 자동차 모델에 맞는 확장
            </strong>
            인지 확인하세요. 검색 결과의 이름이 비슷하다고 서로 바꿔 쓰지
            않습니다.
          </p>
        </Scene>
        <Scene
          number={5}
          title="추가된 블록 분류 확인"
          caption="Maqueen v4·v5 분류가 추가된 화면"
        >
          <p>
            왼쪽 목록에 마퀸 관련 분류가 생겼는지 확인합니다. 제공 화면에는{" "}
            <strong>Maqueen v4</strong>와 <strong>Maqueen v5</strong>가 함께
            보입니다.
          </p>
          <p>
            두 분류를 모두 써야 한다는 뜻은 아닙니다. 실제 장비와 맞는 버전의
            모터·초음파 블록을 사용하고, 사용한 확장 이름과 버전을 기록하세요.
          </p>
        </Scene>
        <li id="maqueen-scene-6" className="maqueen-scene maqueen-code-scene">
          <div className="maqueen-scene-copy">
            <span className="maqueen-scene-number" aria-hidden="true">
              06
            </span>
            <h3>출발과 정지 코드 읽기</h3>
            <p>
              이 장면의 코드는 네 부분으로 나뉩니다. 각 블록이 언제 실행되는지
              연결해 보세요.
            </p>
          </div>
          <SceneImage
            number={6}
            caption="시작하면·A 버튼·무한반복·B 버튼으로 구성한 코드"
          />
          <div className="maqueen-code-explanations">
            <article>
              <span className="maqueen-code-label">시작하면</span>
              <h4>준비 상태를 아이콘으로 표시</h4>
              <p>
                프로그램이 시작되면 하트 아이콘을 표시합니다. 하트는 장치 연결
                성공 표시가 아닙니다.{" "}
                <strong>
                  이 화면의 시작 블록에는 모터 정지 명령이 없습니다.
                </strong>{" "}
                실제 실험용으로 구성할 때는 시작 블록에 양쪽 모터 정지를 추가해
                확인하세요.
              </p>
            </article>
            <article>
              <span className="maqueen-code-label">A 버튼을 누를 때</span>
              <h4>앞을 확인하고 전진</h4>
              <p>
                초음파 거리 측정값이{" "}
                <strong>5cm보다 작으면 전체 모터 정지</strong>, 그렇지 않으면{" "}
                <strong>전체 모터 · 정회전 · 설정값 255</strong>를 실행합니다.
                정확히 5cm인 경우도 ‘아니면’에 해당합니다.
              </p>
            </article>
            <article>
              <span className="maqueen-code-label">무한반복</span>
              <h4>가까운 장애물을 계속 확인</h4>
              <p>
                초음파 측정값이 <strong>5cm 미만</strong>이 되면 전체 모터를
                정지합니다. 여기에 전진시키는 ‘아니면’ 블록은 없으므로, 장애물이
                사라져도 자동으로 다시 출발하지 않습니다. 경로를 확인하고 A를
                다시 눌러요.
              </p>
            </article>
            <article>
              <span className="maqueen-code-label">B 버튼을 누를 때</span>
              <h4>버튼으로 정지</h4>
              <p>
                B 버튼을 눌렀다 놓아 이벤트가 실행되면{" "}
                <strong>전체 모터 정지</strong>를 실행합니다. 이 화면에는 준비
                시간이나 일정 시간이 지난 뒤 자동으로 멈추는 블록은 없습니다. B
                정지는 잠금 기능이 아니므로 A를 다시 누르면 조건에 따라 출발할
                수 있습니다.
              </p>
            </article>
          </div>
          <div className="maqueen-code-notes">
            <p>
              <strong>정회전은 모터 명령의 방향 이름입니다.</strong> 자동차를
              실제로 놓았을 때 LED가 고정 센서를 향하면서 센서에서 멀어지는지
              확인하세요.
            </p>
            <p>
              <strong>5cm는 화면의 조건 예시입니다.</strong> 실제 제동 거리나
              충돌 방지 여유를 보장하는 값이 아니므로 낮은 모터 설정부터
              출발·정지를 확인하고 실험 경로에 맞게 정합니다.
            </p>
            <p>
              <strong>초음파 센서는 자동차 앞의 장애물 거리를 봅니다.</strong>{" "}
              별빛 실험의 고정 밝기 센서와 LED 사이 거리를 직접 재는 값으로
              사용하지 않습니다.
            </p>
          </div>
        </li>
        <Scene
          number={7}
          title="다운로드 메뉴 열기"
          caption="다운로드 버튼 옆 점 세 개 메뉴"
        >
          <p>
            코드를 구성한 뒤 화면 아래 <strong>다운로드</strong> 버튼 옆의{" "}
            <strong>점 세 개(…)</strong> 메뉴를 엽니다. 다음 장면에서는 파일로
            저장하는 방법을 선택합니다.
          </p>
        </Scene>
        <Scene
          number={8}
          title="파일로 다운로드 선택"
          caption="장치 연결과 파일로 다운로드를 구분"
        >
          <p>
            메뉴에서 <strong>파일로 다운로드</strong>를 선택하면 프로그램을{" "}
            <code>.hex</code> 파일로 저장할 수 있습니다.
          </p>
          <p>
            <strong>장치 연결</strong>은 브라우저에서 micro:bit를 연결하는 별도
            경로입니다. 첨부 화면은 파일을 내려받는 순서를 보여 줍니다.
          </p>
        </Scene>
        <Scene
          number={9}
          title="HEX 파일 확인하고 micro:bit에 옮기기"
          caption="브라우저에 내려받은 .hex 파일"
        >
          <p>
            브라우저 다운로드 목록에서 <code>.hex</code> 파일이 저장됐는지
            확인합니다. 화면의 파일 이름은 예시이며 프로젝트 이름에 따라
            달라집니다.
          </p>
          <p>
            <strong>다운로드 완료는 보드 전송 완료가 아닙니다.</strong> 데이터
            통신이 가능한 USB 케이블로 micro:bit를 연결하고, 저장한 파일을
            컴퓨터의 <strong>MICROBIT 드라이브</strong>에 복사합니다. 전송
            표시가 끝난 뒤 실제 장비에서 동작을 확인하세요.
          </p>
          <a
            href="https://makecode.microbit.org/device/usb"
            target="_blank"
            rel="noopener noreferrer"
          >
            MakeCode 공식 프로그램 전송 안내 ↗
          </a>
        </Scene>
      </ol>
      <section
        className="maqueen-speed-check"
        aria-labelledby="maqueen-speed-check-title"
      >
        <h3 id="maqueen-speed-check-title">
          출발한 뒤에는 실제로 등속인지 확인해요
        </h3>
        <ol>
          <li>
            시작 블록에 모터 정지를 추가하고, 바퀴를 들고 A 출발·B 정지·장애물
            감지 후 정지를 먼저 확인합니다. 정지 후 저절로 다시 출발하지
            않는지도 봅니다.
          </li>
          <li>
            안전한 바닥에 같은 간격의 표시를 하고, 각 구간을 지나는 데 걸린
            시간을 여러 번 측정합니다. 배터리와 LED 부착 상태를 같게 유지합니다.
          </li>
          <li>
            구간마다 <strong>속력 = 이동 거리 ÷ 걸린 시간</strong>을 계산합니다.
            출발 직후와 멈추는 구간을 제외하고 속력이 비슷한 구간을 분석에
            사용합니다.
          </li>
          <li>
            4차시 <strong>속력 확인·실험</strong>에서 실제 측정한 속력과 시작
            거리, 주행 기준 시점을 기록합니다. 모터 설정값 255를 속력 칸에 옮겨
            적지 않습니다.
          </li>
        </ol>
      </section>
    </section>
  );
}
