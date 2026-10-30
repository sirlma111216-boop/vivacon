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
          LED 자동차가 멀어질 때 밝기 센서의 값을 이지온으로 모으고, 그 파일을
          가져와 처음 예상과 비교합니다.
        </p>
      </div>
      <div className="card prep-plan">
        <h3>지난 시간에 정한 우리 모둠의 계획</h3>
        <p>같은 LED가 멀어질 때 밝기가 어떻게 달라지는지 살펴봐요.</p>
        <dl>
          <div>
            <dt>우리 모둠의 예상</dt>
            <dd>
              {notes["design.hypothesis"] ||
                "지난 시간에 이야기한 예상을 떠올려요."}
            </dd>
          </div>
          <div>
            <dt>같게 유지할 조건</dt>
            <dd>
              {notes["design.control"] ||
                "LED의 밝기와 방향, 센서 위치, 교실 조명"}
            </dd>
          </div>
        </dl>
      </div>
      <HardwareSectionContent section="kit" />
      <div className="card">
        <h3>오늘은 이렇게 진행해요</h3>
        <ol className="instructions">
          <li>
            <strong>자동차 준비</strong> · 마이크로비트와 LED를 붙이고 주행
            프로그램을 넣은 뒤, 실제 속력을 재요.
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
