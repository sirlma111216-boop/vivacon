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
      <section className="card lesson-video" aria-labelledby="night-sky-opening">
        <span className="eyebrow">실제 밤하늘 영상으로 시작하기</span>
        <h3 id="night-sky-opening">이 많은 별 중, 어떤 별이 눈에 띄나요?</h3>
        <p>칠레 라 실라 천문대의 밤하늘이에요. 재생한 뒤 마음에 드는 장면에서 멈춰 보세요.</p>
        <video controls playsInline loop preload="metadata" aria-label="ESO Through the night: 라 실라 천문대에서 촬영한 별과 은하수 영상">
          <source src="/assets/videos/eso-through-the-night.mp4" type="video/mp4" />
          이 브라우저에서는 영상을 재생할 수 없습니다.
        </video>
        <p className="muted">Through the night · 7초 반복 재생 · 밤하늘의 움직임을 빠르게 보여 주는 실제 촬영 영상</p>
        <p className="muted">Credit: <a href="https://www.hq.eso.org/public/videos/la_silla_horalek_1/" target="_blank" rel="noopener noreferrer">ESO/P. Horálek</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · 원본 영상</p>
        <div className="question-callout"><strong>유난히 눈에 띄는 별은 왜 밝게 보일까요?</strong> 지난 시간에 떠올린 까닭을 짝과 이야기해요.</div>
        <p>별을 직접 가까이 옮겨 볼 수는 없어요. 오늘은 별 대신 같은 LED를 사용해, 거리가 달라질 때 밝기가 어떻게 변하는지 알아봐요.</p>
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
