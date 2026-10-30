import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { SmartImage } from "./SmartImage";
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
        <SmartImage
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
          A 버튼으로 출발하고 B 버튼이나 앞의 장애물로 멈추는 프로그램을
          만들어요.
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
        제공된 MakeCode 화면입니다. 메뉴 이름은 버전에 따라 달라질 수 있어요.
      </p>
      <ol className="maqueen-scenes">
        <Scene
          number={1}
          title="새 프로젝트 열기"
          caption="MakeCode 첫 화면의 새 프로젝트"
        >
          <p>
            MakeCode 홈페이지에서 <strong>새 프로젝트</strong>를 선택해요.
          </p>
        </Scene>
        <Scene
          number={2}
          title="프로젝트 이름 정하기"
          caption="프로젝트 이름을 입력하고 생성"
        >
          <p>
            어떤 프로그램인지 알아보기 쉬운 이름을 입력하고{" "}
            <strong>생성</strong>을 눌러요.
          </p>
          <p>
            예: <strong>등속운동</strong>, <strong>앞으로 가는 자동차</strong>,{" "}
            <strong>출발하고 멈추는 마퀸</strong>,{" "}
            <strong>별빛 실험 자동차</strong>,{" "}
            <strong>빛을 싣고 가는 자동차</strong>
          </p>
          <p>마음에 드는 이름을 고르거나 직접 지어도 좋아요.</p>
        </Scene>
        <Scene
          number={3}
          title="확장 메뉴 열기"
          caption="블록 목록에서 확장 선택"
        >
          <p>
            왼쪽 목록의 <strong>확장</strong>을 눌러 마퀸의 모터와 초음파 센서
            블록을 추가해요.
          </p>
        </Scene>
        <Scene
          number={4}
          title="maqueen 확장 찾기"
          caption="maqueen 검색 결과와 여러 장비용 확장"
        >
          <p>
            검색창에 <code>maqueen</code>을 입력하고 내 자동차 모델에 맞는
            확장을 골라요. 이 화면에서는 <strong>maqueen</strong>을 선택해요.
            Maqueen Plus는 다른 모델용이에요.
          </p>
        </Scene>
        <Scene
          number={5}
          title="추가된 블록 분류 확인"
          caption="Maqueen v4·v5 분류가 추가된 화면"
        >
          <p>
            왼쪽에 <strong>Maqueen v4</strong>와 <strong>Maqueen v5</strong>가
            보여요. 내 장비에 맞는 버전의 모터·초음파 블록을 사용해요.
          </p>
        </Scene>
        <li id="maqueen-scene-6" className="maqueen-scene maqueen-code-scene">
          <div className="maqueen-scene-copy">
            <span className="maqueen-scene-number" aria-hidden="true">
              06
            </span>
            <h3>출발과 정지 코드 읽기</h3>
            <p>아래 네 블록을 화면처럼 배치해요.</p>
          </div>
          <SceneImage
            number={6}
            caption="시작하면·A 버튼·무한반복·B 버튼으로 구성한 코드"
          />
          <div className="maqueen-code-explanations">
            <article>
              <span className="maqueen-code-label">시작하면</span>
              <h4>하트 표시</h4>
              <p>
                프로그램이 시작되면 하트가 떠요. 실험용 코드에는 여기에도
                <strong> 전체 모터 정지</strong>를 넣어 처음에 바퀴가 멈춰
                있도록 해요.
              </p>
            </article>
            <article>
              <span className="maqueen-code-label">A 버튼을 누를 때</span>
              <h4>앞을 확인하고 전진</h4>
              <p>
                초음파 센서가 읽은 거리가{" "}
                <strong>5cm 미만이면 전체 모터 정지</strong>, 아니면{" "}
                <strong>전체 모터 · 정회전 · 설정값 255</strong>로 움직여요.
              </p>
            </article>
            <article>
              <span className="maqueen-code-label">무한반복</span>
              <h4>가까운 장애물을 계속 확인</h4>
              <p>
                앞의 거리가 <strong>5cm 미만</strong>이면 멈춰요. 장애물을
                치워도 저절로 출발하지 않으므로, 다시 움직일 때는 A를 눌러요.
              </p>
            </article>
            <article>
              <span className="maqueen-code-label">B 버튼을 누를 때</span>
              <h4>버튼으로 정지</h4>
              <p>
                B 버튼을 눌렀다 놓으면 <strong>전체 모터가 멈춰요.</strong>
              </p>
            </article>
          </div>
          <div className="maqueen-code-notes">
            <p>LED가 고정된 밝기 센서를 향한 채 자동차가 멀어지도록 놓아요.</p>
            <p>
              처음에는 모터 설정값을 낮춰 넓은 바닥에서 출발·정지를 시험해요.
              탁자 끝에서는 시험하지 않아요. 초음파 센서가 재는 앞쪽 장애물
              거리는 실험에서 재는 LED–밝기 센서 거리와 달라요.
            </p>
          </div>
        </li>
        <Scene
          number={7}
          title="다운로드 메뉴 열기"
          caption="다운로드 버튼 옆 점 세 개 메뉴"
        >
          <p>
            화면 아래 <strong>다운로드</strong> 버튼 옆의{" "}
            <strong>점 세 개(…)</strong>를 눌러요.
          </p>
        </Scene>
        <Scene
          number={8}
          title="파일로 다운로드 선택"
          caption="장치 연결과 파일로 다운로드를 구분"
        >
          <p>
            <strong>파일로 다운로드</strong>를 선택해 프로그램을{" "}
            <code>.hex</code> 파일로 저장해요.
          </p>
        </Scene>
        <Scene
          number={9}
          title="HEX 파일 확인하고 micro:bit에 옮기기"
          caption="브라우저에 내려받은 .hex 파일"
        >
          <p>
            USB 데이터 케이블로 micro:bit를 컴퓨터에 연결해요. 내려받은{" "}
            <code>.hex</code> 파일을 컴퓨터의 <strong>MICROBIT 드라이브</strong>
            에 복사하고 전송이 끝날 때까지 기다려요.
          </p>
          <aside
            className="maqueen-transfer-important"
            aria-label="중요: 프로그램 전송 후 HEX 파일이 보이지 않는 이유"
          >
            <strong>중요 · HEX 파일이 안 보여도 걱정하지 마세요!</strong>
            <p>
              파일이 복사되는 듯하다가 마이크로비트가 깜빡이고, MICROBIT
              드라이브나 열린 창이 잠깐 사라졌다 다시 나타날 수 있어요.
              프로그램을 넣고 다시 시작하는 정상적인 과정입니다. 전송이 끝날
              때까지 USB를 빼지 마세요.
            </p>
            <p>
              다시 드라이브를 열었을 때 <code>.hex</code> 파일이 보이지 않는
              것도 정상이에요. USB 메모리처럼 파일을 보관하는 것이 아니라,{" "}
              <strong>
                파일 속 프로그램을 마이크로비트 내부에 설치하기 때문
              </strong>
              입니다. 파일이 안 보인다고 다시 복사할 필요는 없어요.
            </p>
            <p>
              하트 표시 등 만든 프로그램이 실행되는지 확인한 뒤 다음 과정으로
              가세요. <code>FAIL.TXT</code>가 생기거나 오류 표시가 나타나면
              선생님과 확인해요.
            </p>
            <a
              href="https://support.microbit.org/support/solutions/articles/19000067847-why-does-the-hex-file-disappear-when-i-transfer-it-to-the-micro-bit-"
              target="_blank"
              rel="noopener noreferrer"
            >
              micro:bit 공식 안내 · HEX 파일이 보이지 않는 이유 ↗
            </a>
          </aside>
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
        <h3 id="maqueen-speed-check-title">실제 속력은 거리와 시간으로 재요</h3>
        <ol>
          <li>
            바닥에 같은 간격의 표시를 하고 각 구간을 지나는 데 걸린 시간을 재요.
          </li>
          <li>
            <strong>속력 = 이동 거리 ÷ 걸린 시간</strong>으로 계산해요. 출발
            직후와 멈출 때를 빼고 속력이 비슷한 구간을 실험에 사용해요.
          </li>
          <li>
            <strong>255는 모터 설정값</strong>이에요. 속력 칸에는 실제로 잰 값을
            넣어요.
          </li>
        </ol>
      </section>
      <details className="maqueen-guide-details">
        <summary>교사용 코드 참고</summary>
        <ul>
          <li>
            첨부 화면의 시작 블록에는 하트만 있고 모터 정지 명령은 없습니다.
            실험용 코드에는 시작 시 전체 모터 정지를 추가합니다. 화면의 아이콘은
            실제 주행 검증 결과가 아닙니다.
          </li>
          <li>
            조건은 5cm 미만이므로 정확히 5cm일 때는 A 버튼의 ‘아니면’으로
            진행합니다. 이 값은 실제 제동 거리를 보장하지 않습니다.
          </li>
          <li>
            무한반복에는 전진시키는 ‘아니면’이 없습니다. B 정지는 잠금 기능이
            아니므로 A를 다시 누르면 출발할 수 있습니다. 첨부 코드에는 준비
            시간과 일정 시간 뒤 정지 기능이 없습니다.
          </li>
          <li>
            모터 설정이 같아도 바닥·배터리·LED 무게에 따라 실제 속력이
            달라집니다. 이 코드는 속력을 측정해 일정하게 유지하는 제어를 하지
            않습니다. 실물 주행은 수업 전에 별도로 시험합니다.
          </li>
        </ul>
      </details>
    </section>
  );
}
