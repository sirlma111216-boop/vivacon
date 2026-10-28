import { useState } from "react";

export function buildMaqueenCode(
  speed = 255,
  preparationMs = 2000,
  drivingMs = 3000,
) {
  return `// DFRobot pxt-maqueen / Maqueen Lite ROB0148 계열 예시
// 장착 보드·확장 버전 및 실제 정지 반응은 교사가 검증하세요.
let motorSetting = ${speed}
let readyMs = ${preparationMs}
let driveMs = ${drivingMs}
let phase = 0 // 0: 정지, 1: 준비, 2: 주행
let startsAt = 0
let stopsAt = 0
maqueen.motorStop(maqueen.Motors.All)

input.onButtonPressed(Button.A, function () {
    if (phase == 0 && !input.buttonIsPressed(Button.B)) {
        startsAt = input.runningTime() + readyMs
        stopsAt = startsAt + driveMs
        phase = 1
    }
})
input.onButtonPressed(Button.B, function () {
    phase = 0
})

basic.forever(function () {
    // B를 놓기 전에도 매 반복에서 눌림을 확인합니다.
    // 모터 명령은 이 짧은 반복문에서만 보냅니다.
    let now = input.runningTime()
    if (input.buttonIsPressed(Button.B)) {
        phase = 0
    }
    if (phase != 0 && now >= stopsAt) {
        phase = 0
    }
    if (phase == 1 && now >= startsAt) {
        phase = 2
    }
    if (phase == 2) {
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, motorSetting)
    } else {
        maqueen.motorStop(maqueen.Motors.All)
    }
    basic.pause(10)
})`;
}

export function Maqueen({
  notes,
  setNote,
}: {
  notes: Record<string, string>;
  setNote: (key: string, value: string) => void;
}) {
  const [copyState, setCopyState] = useState("");
  const speed = Number(notes["car.speed"] ?? "255");
  const prep = Number(notes["car.prep"] ?? "2");
  const duration = Number(notes["car.duration"] ?? "3");
  const valid =
    Number.isInteger(speed) &&
    speed >= 0 &&
    speed <= 255 &&
    Number.isFinite(prep) &&
    prep >= 0 &&
    prep <= 30 &&
    Number.isFinite(duration) &&
    duration > 0 &&
    duration <= 30;
  const code = valid
    ? buildMaqueenCode(
        speed,
        Math.round(prep * 1000),
        Math.round(duration * 1000),
      )
    : "";
  const checks = [
    "전원을 켜자마자 양쪽 모터가 멈춘다.",
    "A 버튼 후 준비 시간을 지나 양쪽 모터가 같은 설정으로 전진한다.",
    "준비 시간에 B를 누르면 나중에도 출발하지 않는다.",
    "주행 중 B를 누르면 멈추고 저절로 다시 출발하지 않는다.",
    "정해진 주행 시간이 지나면 자동으로 멈춘다.",
    "바닥에서 직진 여부와 이동 거리를 확인했다.",
  ];
  return (
    <section className="card">
      <span className="badge">4차시 · 자동차 설정 · 8분</span>
      <h2>자동차는 MakeCode에서 준비해요</h2>
      <p>
        센서를 연결하는 일과 자동차를 움직이는 일은 별개의 작업이에요. 이 앱은
        자동차에 프로그램을 자동 업로드하지 않습니다.
      </p>
      <div className="grid-2">
        <label className="field">
          사용하는 마퀸
          <select
            value={notes["car.hardware"] ?? "unknown"}
            onChange={(event) => setNote("car.hardware", event.target.value)}
          >
            <option value="unknown">아직 버전을 확인하지 못했어요</option>
            <option value="lite">Maqueen Lite / ROB0148 계열</option>
            <option value="other">Plus·Lite V5 등 다른 버전</option>
          </select>
        </label>
        <label className="field">
          micro:bit 및 확장 버전 기록
          <input
            value={notes["car.version"] ?? ""}
            onChange={(event) => setNote("car.version", event.target.value)}
            placeholder="보드 V1/V2, 확장 이름·버전"
          />
        </label>
      </div>
      <div className="notice">
        아래 예시는 DFRobot <code>pxt-maqueen</code>의 <code>motorRun</code>·
        <code>motorStop</code>을 사용하는 Lite/ROB0148 계열 기준입니다. 다른
        하드웨어는 해당 공식 안내의 모터 블록으로 바꿔야 합니다. 실물 주행 검증
        전입니다.
      </div>
      <div className="grid-2">
        <label className="field">
          양쪽 모터 구동 설정값 (0~255)
          <input
            type="number"
            min={0}
            max={255}
            step={1}
            value={notes["car.speed"] ?? "255"}
            onChange={(event) => setNote("car.speed", event.target.value)}
          />
        </label>
        <label className="field">
          준비 시간 (초)
          <input
            type="number"
            min={0}
            max={30}
            step={0.5}
            value={notes["car.prep"] ?? "2"}
            onChange={(event) => setNote("car.prep", event.target.value)}
          />
        </label>
        <label className="field">
          자동 정지까지 주행 시간 (초)
          <input
            type="number"
            min={0.1}
            max={30}
            step={0.1}
            value={notes["car.duration"] ?? "3"}
            onChange={(event) => setNote("car.duration", event.target.value)}
          />
        </label>
        <label className="field">
          실험 전 확인 사항
          <input
            value={notes["car.conditions"] ?? ""}
            onChange={(event) => setNote("car.conditions", event.target.value)}
            placeholder="배터리, 바닥, LED 부착 상태"
          />
        </label>
      </div>
      <p>
        <strong>255는 cm/s가 아니에요.</strong> 모터의 구동 설정값입니다.
        처음에는 교실 경로에 맞춰 낮춰 시험하고, 이동 거리와 시간을 따로 재어
        실제 속력을 구하세요. 배터리·바닥·부하에 따라 달라져요.
      </p>
      <ol className="instructions">
        <li>
          MakeCode에서 새 프로젝트를 열고, 확장 메뉴에{" "}
          <code>https://github.com/DFRobot/pxt-maqueen</code>을 입력합니다.
        </li>
        <li>
          시작할 때 「motor all stop」, A 버튼에 준비·정지 시각 기록, B 버튼에
          정지 상태 전환을 구성합니다.
        </li>
        <li>
          「계속 반복」에서 B 눌림 → 종료 시각 → 출발 시각 순서로 확인하고,
          「motor all move Forward at speed」 또는 「motor all stop」을
          실행합니다.
        </li>
        <li>
          긴 기다리기 블록 대신 짧은 반복을 사용합니다. 준비 중 B를 누른 뒤
          뒤늦게 출발하지 않는지 점검하세요.
        </li>
      </ol>
      <a
        className="primary"
        href="https://makecode.microbit.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        MakeCode 열기 ↗
      </a>
      <details>
        <summary>설정값이 반영된 JavaScript 코드 보기</summary>
        {!valid ? (
          <p role="alert">
            모터 설정은 0~255의 정수, 준비 시간은 0~30초, 주행 시간은 0초 초과
            30초 이하로 입력해 주세요.
          </p>
        ) : (
          <>
            <pre
              style={{
                overflowX: "auto",
                whiteSpace: "pre",
                padding: "1rem",
                borderRadius: "12px",
                background: "#080d24",
                fontSize: ".85rem",
              }}
            >
              <code>{code}</code>
            </pre>
            <button
              className="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  setCopyState("코드를 복사했습니다.");
                } catch {
                  setCopyState(
                    "자동 복사가 제한되어 있어요. 위 코드를 직접 선택해 복사해 주세요.",
                  );
                }
              }}
            >
              코드 복사
            </button>
            <p role="status">{copyState}</p>
          </>
        )}
        <p className="muted">
          버튼 반응과 실제 제동 시간은 기기에서 확인해야 해요. 긴 준비 대기
          때문에 정지 명령이 묻히지 않도록 상태와 시각을 사용합니다. 검증되지
          않은 HEX 파일은 제공하지 않습니다.
        </p>
      </details>
      <h3>바퀴를 들고 먼저 점검한 뒤, 안전한 바닥에서 확인하세요</h3>
      {checks.map((check, index) => (
        <label className="check-row" key={check}>
          <input
            type="checkbox"
            checked={notes[`car.check.${index}`] === "true"}
            onChange={(event) =>
              setNote(`car.check.${index}`, String(event.target.checked))
            }
          />{" "}
          {check}
        </label>
      ))}
      <details>
        <summary>교사용 공식 근거</summary>
        <p>
          <a
            href="https://wiki.dfrobot.com/rob0148-en/docs/20849"
            target="_blank"
            rel="noopener noreferrer"
          >
            DFRobot Maqueen Lite 모터 제어 안내
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/DFRobot/pxt-maqueen/blob/master/maqueen.ts"
            target="_blank"
            rel="noopener noreferrer"
          >
            공식 확장 소스: 블록과 0~255 범위
          </a>{" "}
          ·{" "}
          <a
            href="https://makecode.microbit.org/reference/input/button-is-pressed"
            target="_blank"
            rel="noopener noreferrer"
          >
            MakeCode 버튼 눌림 확인
          </a>
        </p>
        <p>
          2026-10-28 공개 문서 확인. 확장 현재 소스에는 Maqueen v4/v5 항목이
          함께 있으므로 실제 장비·블록 버전을 기록한 뒤 사용하세요.
        </p>
      </details>
    </section>
  );
}
