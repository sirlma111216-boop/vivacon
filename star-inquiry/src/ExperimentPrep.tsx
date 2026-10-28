import { HardwareSectionContent } from "./HardwareManual";

export function ExperimentPrep({
  notes,
}: {
  notes: Record<string, string>;
  onOpenHardware: (step?: number) => void;
  onOpenEzOn: () => void;
}) {
  return (
    <section className="experiment-prep">
      <div className="learning-heading">
        <h2>세운 계획대로, 이제 빛을 재어 봐요</h2>
        <p>
          자동차와 센서를 준비한 뒤, 자동차가 멀어질 때 밝기가 어떻게 바뀌는지
          기록합니다.
        </p>
      </div>
      <div className="card prep-plan">
        <h3>지난 시간에 정한 우리 모둠의 계획</h3>
        <p>
          {notes["design.question"] ||
            "자동차가 멀어지면 LED의 밝기는 어떻게 달라질까요?"}
        </p>
        <dl>
          <div>
            <dt>처음 거리</dt>
            <dd>
              {notes["design.startDistance"]
                ? `${notes["design.startDistance"]} cm`
                : "줄자로 재어 정해요"}
            </dd>
          </div>
          <div>
            <dt>움직일 거리</dt>
            <dd>
              {notes["design.travelDistance"]
                ? `${notes["design.travelDistance"]} cm`
                : "바닥에 표시해요"}
            </dd>
          </div>
          <div>
            <dt>반복할 횟수</dt>
            <dd>
              {notes["design.repeats"]
                ? `${notes["design.repeats"]}회`
                : "모둠에서 정해요"}
            </dd>
          </div>
        </dl>
      </div>
      <HardwareSectionContent section="kit" />
      <div className="card">
        <h3>다음 화면부터 차례로 해 봐요</h3>
        <ol className="instructions">
          <li>
            자동차에 마이크로비트와 LED를 붙이고 주행 프로그램을 준비해요.
          </li>
          <li>센서를 컴퓨터에 연결하고 밝기를 기록할 방법을 골라요.</li>
          <li>거리와 시간을 잰 뒤, 자동차가 멀어질 때 밝기를 기록해요.</li>
          <li>처음 예상과 측정한 그래프를 비교해요.</li>
        </ol>
        <p className="notice">
          자동차가 떨어지지 않는 바닥에서 실험하세요. 주행 전에 B 버튼으로
          멈추는지 시험합니다.
        </p>
      </div>
    </section>
  );
}
