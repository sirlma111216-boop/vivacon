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
      <section className="card" aria-labelledby="lesson4-opening">
        <span className="eyebrow">먼저 눈으로 살펴보기 · 3분</span>
        <h3 id="lesson4-opening">같은 LED인데, 밝기가 달라 보일까요?</h3>
        <p>자동차의 모터 전원은 끄고 LED만 켜요. 흰 종이를 한곳에 세우고 LED의 빛을 비춰 보세요. LED를 눈에 직접 비추지 않아요.</p>
        <ol className="instructions">
          <li>종이 가까이에 LED를 놓고, 종이에 비친 빛을 봐요.</li>
          <li>LED의 밝기 설정과 방향은 그대로 두고, 종이에서 조금 멀리 옮겨요.</li>
          <li>종이에 비친 빛의 밝기가 어떻게 달라 보이는지 짝과 이야기해요.</li>
        </ol>
        <div className="question-callout">
          어두워졌다는 것은 보여도, <strong>얼마나 달라졌는지 눈만으로 알 수 있을까요?</strong>
        </div>
        <details>
          <summary>이야기한 뒤, 오늘의 실험과 연결하기</summary>
          <p>눈으로 밝기의 차이를 느낄 수 있지만, 얼마나 달라졌는지 정확히 비교하기는 어려워요. 오늘은 종이 대신 밝기 센서를 고정하고 LED 자동차를 멀어지게 해요. 센서가 기록한 값을 그래프로 나타내면 변화하는 모습을 비교할 수 있어요.</p>
        </details>
      </section>
      <section className="card">
        <h3>오늘 알아볼 것</h3>
        <p><strong>같은 LED가 멀어질 때, 센서가 기록한 밝기는 어떻게 달라질까요?</strong></p>
        <p>지난 시간에 그린 예상 그래프를 떠올려 보세요. 오늘 얻은 그래프와 어떤 점이 같고 다른지 살펴볼 거예요.</p>
      </section>
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
    </section>
  );
}
