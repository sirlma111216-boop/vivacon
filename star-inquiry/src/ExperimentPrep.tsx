import { HardwareSectionContent } from "./HardwareManual";

export function ExperimentPrep(_props: {
  notes: Record<string, string>;
  onOpenHardware: (step?: number) => void;
  onOpenEzOn: () => void;
}) {
  return (
    <section className="experiment-prep">
      <div className="learning-heading">
        <h2>멀어지는 빛, 눈으로 본 것과 센서로 잰 값은 어떨까요?</h2>
        <p>
          지난 시간에는 거리가 멀어질 때의 밝기를 예상하고, LED 자동차를 만들었어요.
          오늘은 실제 밝기 값을 모아 우리의 예상과 비교해 볼 거예요.
        </p>
      </div>
      <section className="card lesson-video" aria-labelledby="real-light-experiment">
        <span className="eyebrow">실제 실험 영상으로 시작하기</span>
        <h3 id="real-light-experiment">멀어지는 빛을 센서로 재면?</h3>
        <p>아래 재생 버튼을 눌러 광원과 밝기 센서로 측정하는 실제 실험을 보세요.</p>
        <iframe
          src="https://www.youtube-nocookie.com/embed/_KHNZTxwA6Q?rel=0&playsinline=1"
          title="PASCO 실제 실험 영상: 거리에 따른 빛의 세기 측정"
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <p className="muted">PASCO scientific · Inverse Square Law · 영어 영상</p>
        <h4>이 장면에 주목해요</h4>
        <ul>
          <li>빛을 내는 곳과 센서 사이의 거리를 어떻게 바꾸나요?</li>
          <li>거리가 달라질 때 측정값과 그래프는 어떻게 달라지나요?</li>
        </ul>
        <p>영상에서는 PASCO 장비로 빛을 재요. 우리는 이지메이커의 밝기 센서를 고정하고 LED 자동차를 움직여, 같은 질문을 실험해 볼 거예요.</p>
        <p className="muted"><a href="https://www.pasco.com/resources/video/_KHNZTxwA6Q" target="_blank" rel="noopener noreferrer">영상 출처 · PASCO 공식 자료 ↗</a></p>
      </section>
      <section className="card" aria-labelledby="ezmaker-introduction">
        <h3 id="ezmaker-introduction">오늘 빛을 재는 도구, 이지메이커</h3>
        <p>이지메이커는 센서로 주변의 변화를 측정하고, 그 값을 컴퓨터로 보내는 도구예요. 오늘은 밝기 센서를 연결해 자동차의 LED 빛을 재요.</p>
        <ul className="instructions">
          <li><strong>밝기 센서</strong>는 빛을 받아 밝기에 따라 달라지는 값을 만들어요.</li>
          <li><strong>이지메이커 보드</strong>는 센서와 컴퓨터를 연결하고, 센서가 읽은 값을 전달해요.</li>
          <li><strong>이지온</strong>은 컴퓨터에서 그 값을 모아 표와 그래프로 보여 주는 웹사이트예요.</li>
        </ul>
        <p>마이크로비트는 자동차를 움직이고, 이지메이커는 빛을 재요. 센서는 한곳에 고정하고 자동차만 움직일 거예요.</p>
      </section>
      <section className="card">
        <h3>오늘 알아볼 것</h3>
        <p><strong>같은 LED가 멀어질 때, 센서가 기록한 밝기는 어떻게 달라질까요?</strong></p>
        <p>지난 시간에 그린 예상 그래프를 떠올려 보세요. 오늘 얻은 그래프와 어떤 점이 같고 다른지 살펴볼 거예요.</p>
      </section>
    </section>
  );
}

export function ExperimentPreparation() {
  return (
    <>
      <HardwareSectionContent section="kit" />
      <div className="card">
        <h3>오늘은 이렇게 진행해요</h3>
        <ol className="instructions">
          <li>
            <strong>자동차 준비</strong> · 3차시에서 만든 자동차의 출발·정지를
            시험하고 실제 속력을 재요.
          </li>
          <li>
            <strong>이지온 연결</strong> · 밝기 센서를 보드에 꽂고, 이지온에서
            센서 프로그램을 업로드해요.
          </li>
          <li>
            <strong>측정하고 저장</strong> · 이지온에서 수집하며 자동차를
            출발시키고, 그래프를 본 뒤 파일을 내려받아요.
          </li>
          <li>
            <strong>가져와 비교</strong> · 내려받은 파일을 이 앱으로 가져와 처음
            예상과 비교하고 설명해요.
          </li>
        </ol>
        <p className="notice">
          자동차가 떨어지지 않는 바닥에서 실험하세요. 주행 전에 B 버튼으로
          멈추는지 시험합니다.
        </p>
      </div>
    </>
  );
}
