import { useEffect, useRef, useState } from "react";
import {
  Play,
  Square,
  Flag,
  Upload,
  Plus,
  Download,
  Radio,
  Unplug,
} from "lucide-react";
import {
  createPracticeRun,
  parseCsv,
  exportCsv,
  corrected,
  distanceFor,
  normalize,
  isSaturated,
  validSamples,
  validateRun,
  type Run,
} from "./domain";
import { SerialConnection, supportStatus } from "./serial";
import { DataChart } from "./DataChart";
import type { Prediction } from "./Learning";
import { ExperimentPrep } from "./ExperimentPrep";
import { HardwareSectionContent } from "./HardwareManual";
import { measurementSetup } from "./measurementSetup";
import { Maqueen } from "./Maqueen";
import { download, type AppState } from "./state";
type Props = {
  onOpenHardware: (step?: number) => void;
  onOpenEzOn: () => void;
  step: number;
  state: AppState;
  setNote: (k: string, v: string) => void;
  setRuns: (runs: Run[], active?: string) => void;
  setMode: (m: AppState["mode"]) => void;
  prediction: Prediction | null;
};
const uid = () => crypto.randomUUID();
const MAX_SAMPLES = 5000,
  MAX_SECONDS = 600;
type ExplanationRecord = {
  id: string;
  author: string;
  runId: string;
  mode: string;
  compare: string;
  evidence: string;
  error: string;
  improve: string;
  savedAt: string;
};
function explanationRecords(value: string): ExplanationRecord[] {
  try {
    const data = JSON.parse(value);
    return Array.isArray(data)
      ? data.filter(
          (r) =>
            r &&
            typeof r === "object" &&
            [
              "id",
              "author",
              "runId",
              "mode",
              "compare",
              "evidence",
              "error",
              "improve",
              "savedAt",
            ].every((k) => typeof r[k] === "string"),
        )
      : [];
  } catch {
    return [];
  }
}
export function Measurement({
  onOpenHardware,
  onOpenEzOn,
  step,
  state,
  setNote,
  setRuns,
  setMode,
  prediction,
}: Props) {
  const run = state.runs.find((r) => r.id === state.activeRunId) || null;
  const unitLabel = run?.unit === "센서 원시값" ? "센서가 읽은 값" : run?.unit;
  const stateRef = useRef(state);
  stateRef.current = state;
  const [recording, setRecording] = useState(false),
    [status, setStatus] = useState("disconnected"),
    [message, setMessage] = useState(""),
    [live, setLive] = useState<number | null>(null),
    [axis, setAxis] = useState<"time" | "distance" | "inverse">("time");
  const serial = useRef<SerialConnection | null>(null),
    started = useRef(0),
    record = useRef(false),
    lastReceived = useRef(0);
  const support = supportStatus();
  const note = (k: string, v = "") => state.notes[k] ?? v;
  const setup = measurementSetup(state.notes, state.mode);
  const patch = (changes: Partial<Run>) => {
    if (!run) return;
    const updated = { ...run, ...changes };
    if (
      !validateRun(updated) ||
      updated.startDistance <= 0 ||
      (updated.speed !== undefined && updated.speed <= 0) ||
      (updated.startTime !== undefined && updated.startTime < 0) ||
      (updated.saturation !== undefined && updated.saturation <= 0)
    ) {
      setMessage(
        "시작 거리·속력·센서 최댓값은 0보다 크게, 출발 시각은 0 이상으로 입력하세요.",
      );
      return;
    }
    setRuns(state.runs.map((r) => (r.id === run.id ? updated : r)));
  };
  const updateNumeric = (
    key: "ambient" | "startDistance" | "startTime" | "saturation",
    value: string,
    optional = false,
  ) => {
    if (value.trim() === "") {
      if (optional) patch({ [key]: undefined });
      else setMessage("숫자를 입력하세요. 비워 두면 이전 값을 사용합니다.");
      return;
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      setMessage("숫자로 입력하세요. 이전 값을 유지합니다.");
      return;
    }
    patch({ [key]: numeric });
  };
  const setUniform = (confirmed: boolean) => {
    setNote("uniform", String(confirmed));
    if (!confirmed && run) {
      patch({ speed: undefined });
      setMessage(
        run.mode === "practice"
          ? "연습 속력 사용을 해제했습니다. 거리를 계산하려면 속력을 다시 적용하세요."
          : "속력 사용을 해제했습니다. 시간 기록은 남고, 거리 계산은 멈춥니다.",
      );
    }
  };
  const field = (
    key: string,
    label: string,
    defaultValue = "",
    type = "text",
  ) => (
    <label className="field">
      {label}
      <input
        type={type}
        value={note(key, defaultValue)}
        onChange={(e) => setNote(key, e.target.value)}
      />
    </label>
  );
  const buildRun = (mode = state.mode): Run => {
    const settings = measurementSetup(state.notes, mode);
    return {
      id: uid(),
      name: `${mode === "practice" ? "연습 " : ""}실험 ${state.runs.length + 1}`,
      repeat: state.runs.length + 1,
      mode,
      samples: [],
      ambient: settings.ambient,
      startDistance: settings.startDistance,
      linear: mode === "practice",
      unit: mode === "practice" ? "상대 밝기" : "센서 원시값",
      ...(settings.speed !== undefined ? { speed: settings.speed } : {}),
    };
  };
  const newRun = (mode = state.mode) => {
    const r = buildRun(mode);
    if (
      !Number.isFinite(r.ambient) ||
      !Number.isFinite(r.startDistance) ||
      r.startDistance <= 0 ||
      !Number.isFinite(setup.interval) ||
      setup.interval <= 0
    ) {
      setMessage(
        "주변빛은 숫자로, 시작 거리와 기록 간격은 0보다 크게 입력하세요.",
      );
      return null;
    }
    setRuns([...state.runs, r], r.id);
    setNote(`recordInterval-${r.id}`, String(setup.interval));
    setMessage(
      step === 2
        ? "새 실험을 만들었습니다. 아래 ‘다음’을 눌러 측정을 이어 가세요."
        : "새 실험을 만들었습니다. 이 화면에서 측정하거나 값을 입력하세요.",
    );
    return r;
  };
  const addFrame = (raw: number | null, source: "serial" | "practice") => {
    const current = stateRef.current;
    const r = current.runs.find((r) => r.id === current.activeRunId);
    if (!r || !record.current || r.mode !== source) return;
    const t = (performance.now() - started.current) / 1000;
    if (r.samples.length >= MAX_SAMPLES || t >= MAX_SECONDS) {
      record.current = false;
      setRecording(false);
      setMessage(
        "최대 5,000개 또는 10분에 도달해 기록을 자동 중지했습니다. 원본을 저장하고 새 반복 실험을 시작하세요.",
      );
      return;
    }
    const updated = {
      ...r,
      samples: [
        ...r.samples,
        {
          id: uid(),
          t,
          raw,
          saturated:
            raw !== null && r.saturation !== undefined && raw >= r.saturation,
        },
      ],
    };
    const runs = current.runs.map((v) => (v.id === r.id ? updated : v));
    stateRef.current = { ...current, runs };
    setRuns(runs);
  };
  useEffect(
    () => () => {
      record.current = false;
      void serial.current?.disconnect();
    },
    [],
  );
  useEffect(() => {
    if (record.current) {
      record.current = false;
      setRecording(false);
      setMessage(
        "활동 단계를 이동하여 기록을 중지했습니다. 원본 값은 저장되어 있습니다.",
      );
    }
  }, [step]);
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      const current = stateRef.current;
      const r = current.runs.find((v) => v.id === current.activeRunId);
      if (r?.mode === "practice") {
        const t = (performance.now() - started.current) / 1000;
        const distance =
          r.startDistance +
          (r.speed ?? 12) * Math.max(0, t - (r.startTime ?? t));
        addFrame(
          r.ambient +
            900 * (20 / distance) ** 2 * (1 + 0.025 * Math.sin(t * 4)),
          "practice",
        );
      } else if (
        r?.mode === "serial" &&
        performance.now() - lastReceived.current > 2000
      ) {
        addFrame(null, "serial");
        lastReceived.current = performance.now();
        if (record.current)
          setMessage("2초 이상 수신 없음 · 누락 구간을 기록했습니다.");
      }
    }, 250);
    return () => clearInterval(id);
  }, [recording]);
  const connect = async () => {
    setMessage("");
    try {
      await serial.current?.disconnect();
      serial.current = new SerialConnection({
        onFrame: (f) => {
          lastReceived.current = performance.now();
          setLive(f.raw);
          addFrame(f.raw, "serial");
        },
        onState: (s) => {
          setStatus(s);
          if (s === "disconnected" || s === "error") {
            record.current = false;
            setRecording(false);
          }
        },
        onError: (m) => setMessage(String(m)),
      });
      await serial.current.connect({
        baudRate: Number(note("baud")),
        channel: Number(note("channel")),
        protocolConfirmed: note("protocolConfirmed") === "true",
      });
    } catch (e) {
      setMessage(String(e));
    }
  };
  const start = () => {
    if (!run) return;
    if (
      !Number.isFinite(run.startDistance) ||
      run.startDistance <= 0 ||
      !Number.isFinite(run.ambient)
    ) {
      setMessage("시작 거리는 0보다 크게, 주변빛은 숫자로 입력하세요.");
      return;
    }
    if (run.mode === "serial" && status !== "connected") {
      setMessage("센서를 먼저 연결하세요.");
      return;
    }
    if (run.mode === "manual") {
      setMessage("수동 입력은 아래 표 또는 CSV 불러오기를 사용하세요.");
      return;
    }
    if (run.samples.length) {
      setMessage("이미 기록이 있습니다. 새 실험을 만들어 측정하세요.");
      return;
    }
    started.current = performance.now();
    lastReceived.current = performance.now();
    record.current = true;
    setRecording(true);
    setMessage("기록 중 · 실제 자동차 출발 시 주행 시작 표시를 누르세요.");
  };
  const stop = () => {
    record.current = false;
    setRecording(false);
    setMessage("기록을 중지했습니다. 원본 값이 저장되었습니다.");
  };
  const importCSV = async (file: File) => {
    try {
      if (recording) throw new Error("측정을 중지한 뒤 CSV를 불러오세요.");
      if (file.size > 10_000_000)
        throw new Error("10MB 이하 CSV를 선택하세요.");
      const originalCsv = await file.text();
      if (record.current)
        throw new Error(
          "측정 중에는 불러올 수 없습니다. 기록을 먼저 중지하세요.",
        );
      const parsed = parseCsv(originalCsv);
      if (!parsed.samples.length)
        throw new Error(
          parsed.errors.join("\n") || "읽을 수 있는 측정값이 없습니다.",
        );
      if (parsed.samples.length > MAX_SAMPLES)
        throw new Error(
          "한 실험에는 최대 5,000행까지 불러옵니다. 파일을 나누어 불러오세요.",
        );
      const mode = parsed.mode ?? "manual";
      const r: Run = {
        ...buildRun(mode),
        ...parsed.metadata,
        name: parsed.metadata?.name || file.name,
        mode,
        samples: parsed.samples,
        originalCsv,
      };
      if (!validateRun(r))
        throw new Error(
          "CSV에 저장된 실험 정보가 올바르지 않습니다. 반복 횟수·주변빛·거리 값을 확인하세요.",
        );
      setRuns([...stateRef.current.runs, r], r.id);
      setMode(mode);
      setMessage(
        `CSV ${parsed.samples.length}행을 불러왔습니다${mode === "practice" ? " · 연습 데이터" : ""}. ${parsed.errors.join(" · ")}`,
      );
    } catch (e) {
      setMessage(String(e));
    }
  };
  const sampleAdd = () => {
    if (recording) {
      setMessage("측정 중에는 수동 값을 추가할 수 없습니다. 먼저 중지하세요.");
      return;
    }
    if (run && run.mode !== "manual") {
      setMessage(
        "센서·연습 기록에는 수동 값을 추가하지 않습니다. 별도의 수동 입력 실험을 만들어 주세요.",
      );
      return;
    }
    const raw = note("manualRaw").trim(),
      t = note("manualTime", "0").trim(),
      d = note("manualDistance").trim();
    if (
      !raw ||
      !Number.isFinite(Number(raw)) ||
      !Number.isFinite(Number(t)) ||
      Number(t) < 0 ||
      (d && (!Number.isFinite(Number(d)) || Number(d) <= 0))
    ) {
      setMessage(
        "측정값과 시간을 숫자로 입력하세요. 거리는 0보다 커야 합니다.",
      );
      return;
    }
    const r = run ?? buildRun("manual");
    if (!validateRun(r) || r.startDistance <= 0) {
      setMessage("새 실험의 시작 거리와 주변빛 값을 확인하세요.");
      return;
    }
    if (r.samples.length >= MAX_SAMPLES) {
      setMessage("최대 5,000개에 도달했습니다. 새 반복 실험을 만들어 주세요.");
      return;
    }
    const s = {
      id: uid(),
      t: Number(t),
      raw: Number(raw),
      ...(d ? { distance: Number(d) } : {}),
      saturated: r.saturation !== undefined && Number(raw) >= r.saturation,
    };
    const updated = { ...r, samples: [...r.samples, s] };
    setRuns(
      run
        ? state.runs.map((v) => (v.id === r.id ? updated : v))
        : [...state.runs, updated],
      r.id,
    );
    const interval = Number(note(`recordInterval-${r.id}`, "1"));
    setNote(
      "manualTime",
      String(
        Number(
          (
            Number(t) +
            (interval > 0 && Number.isFinite(interval) ? interval : 1)
          ).toFixed(6),
        ),
      ),
    );
    setMessage("측정값을 추가했습니다.");
  };
  const practice = () => {
    const r = createPracticeRun();
    r.name = `연습 실험 ${state.runs.length + 1}`;
    r.repeat = state.runs.length + 1;
    setRuns([...state.runs, r], r.id);
    setMode("practice");
    setMessage("연습 데이터를 추가했습니다. 실제 측정 결과가 아닙니다.");
  };
  const possibleReferences = run
    ? validSamples(run).filter((s) => distanceFor(s, run)! > 0)
    : [];
  const reference =
    possibleReferences.find((s) => s.id === note(`reference-${run?.id}`))?.id ||
    possibleReferences[0]?.id ||
    "";
  const records = explanationRecords(note("explanationRecords", "[]"));
  const saveExplanation = () => {
    if (
      !run ||
      !note("explainAuthor").trim() ||
      !note("explainEvidence").trim()
    )
      return;
    const entry: ExplanationRecord = {
      id: uid(),
      author: note("explainAuthor").trim(),
      runId: run.id,
      mode: run.mode,
      compare: note("explainCompare"),
      evidence: note("explainEvidence"),
      error: note("explainError"),
      improve: note("explainImprove"),
      savedAt: new Date().toISOString(),
    };
    setNote("explanationRecords", JSON.stringify([...records, entry]));
    setMessage(
      "설명을 저장했습니다. 다른 사람의 설명도 따로 저장할 수 있어요.",
    );
  };
  const sensorConnection = (
    <>
      <p>
        보드를 USB로 연결하세요. 선생님과 아래 연결 설정을 입력한 뒤 ‘센서
        연결’을 누릅니다.
      </p>
      {(!support.supported || !support.secure) && (
        <p className="notice">{support.message}</p>
      )}
      <details>
        <summary>교사용 센서 연결 설정</summary>
        <p>
          실제 기기 연동은 검증 전입니다. 보드의 펌웨어·전송 형식·단위를 확인해
          입력하세요. 사진의 A0는 물리 포트이며 통신 채널과는 다릅니다.
        </p>
        <p>
          공개 클라이언트의 115200은 참고값입니다. 내 보드의 설정을 확인한 뒤
          입력하세요. 채널 번호는 수신 프레임의 0부터 시작하는 열 번호이며 물리
          포트 번호가 아닙니다.
        </p>
        <div className="grid-2">
          {field("baud", "확인한 통신 속도 (baud)", "", "number")}
          {field("channel", "확인한 밝기 채널 열 번호", "", "number")}
          {field("board", "보드 / 펌웨어 버전")}
          {field("physicalPort", "직접 확인한 물리 포트")}
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={note("protocolConfirmed") === "true"}
            onChange={(e) =>
              setNote("protocolConfirmed", String(e.target.checked))
            }
          />
          숫자 CSV·줄바꿈 전송 형식과 통신 속도·채널 확인 완료
        </label>
        {note("physicalPort") && (
          <p className="notice">
            교사 확인 기록: 밝기 센서 → {note("physicalPort")} →{" "}
            {note("board") || "기록한 유선보드"} → USB → 컴퓨터. 핀별 배선은
            공식 보드 설명서를 확인하세요.
          </p>
        )}
      </details>
      <div className="button-row">
        <button
          className="primary"
          disabled={
            !support.supported ||
            !support.secure ||
            status === "connected" ||
            note("protocolConfirmed") !== "true" ||
            !note("baud") ||
            !note("channel")
          }
          onClick={connect}
        >
          <Radio size={16} />
          센서 연결
        </button>
        <button
          onClick={() => serial.current?.disconnect()}
          disabled={status !== "connected"}
        >
          <Unplug size={16} />
          연결 해제
        </button>
      </div>
      {status === "connected" && (
        <div className="notice">
          <p>
            센서가 지금 읽은 값:{" "}
            <strong>{live?.toFixed(2) ?? "아직 값이 오지 않았어요"}</strong>
          </p>
          <button
            disabled={live === null || recording}
            onClick={() => live !== null && setNote("ambient", String(live))}
          >
            LED를 끈 뒤, 이 값을 주변빛으로 사용
          </button>
        </div>
      )}
    </>
  );
  const runSetupFields = (
    <>
      <div className="grid-3">
        {field("ambient", "LED를 껐을 때의 값", "0", "number")}
        {field(
          "startDistance",
          "LED와 센서 사이 시작 거리 (cm)",
          note("design.startDistance", "20"),
          "number",
        )}
        {field(
          "measureInterval",
          "계획한 기록 간격 (초)",
          note("design.interval", "0.2"),
          "number",
        )}
      </div>
      <p className="muted">
        3차시에서 정한 거리와 간격을 가져왔어요. 간격은 직접 입력할 때 다음
        시각에 더해집니다. 센서의 전송 간격은 보드 코드에서 정하며, 실제 측정
        시각을 그대로 기록합니다.
      </p>
    </>
  );
  if (step === 0)
    return (
      <ExperimentPrep
        notes={state.notes}
        onOpenHardware={onOpenHardware}
        onOpenEzOn={onOpenEzOn}
      />
    );
  if (step === 1) return <Maqueen notes={state.notes} setNote={setNote} />;
  return (
    <>
      {step === 2 && <HardwareSectionContent section="connection" />}
      {step === 3 && <HardwareSectionContent section="measurement" />}
      <div className="measurement-status" role="status">
        <span>
          <Radio size={16} />
          기록 방식:{" "}
          {(run?.mode ?? state.mode) === "practice"
            ? "연습 데이터"
            : (run?.mode ?? state.mode) === "serial"
              ? "실물 센서"
              : "수동 / CSV 입력"}
        </span>
        <span>
          {status === "connected" ? "✓ 센서 연결됨" : "○ 센서 연결 안 됨"}
        </span>
        <span className={recording ? "recording" : ""}>
          {recording ? "● 측정 기록 중" : "○ 기록 대기"}{" "}
          {live !== null && `· 지금 읽은 값 ${live.toFixed(2)}`}
        </span>
      </div>
      {step === 2 && (
        <div className="card">
          <div className="eyebrow">측정 준비</div>
          <h2>밝기를 어떻게 기록할까요?</h2>
          <div className="mode-options">
            {(
              [
                ["serial", "실물 센서"],
                ["manual", "파일 · 직접 입력"],
                ["practice", "연습 데이터"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                className={state.mode === v ? "selected" : ""}
                onClick={() => {
                  if (recording) stop();
                  setMode(v);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {state.mode === "serial" ? (
            sensorConnection
          ) : state.mode === "practice" ? (
            <>
              <p>
                장비 없이 수업을 체험할 수 있습니다. 그래프·표·보고서에 모두
                연습 데이터로 표시됩니다.
              </p>
              <button className="primary" onClick={practice}>
                완성된 연습 데이터 불러오기
              </button>
            </>
          ) : (
            <>
              <p>
                저장한 CSV 파일을 불러오거나 측정한 값을 직접 입력할 수 있어요.
              </p>
              <details>
                <summary>불러올 파일의 형식</summary>
                <p>
                  CSV 열 이름은 <code>time,raw,distance</code>입니다. 순서대로
                  시간(s), 센서가 읽은 값, 거리(cm)이며 거리는 생략할 수 있어요.
                </p>
              </details>
              <label className="file-button">
                <Upload size={16} />
                CSV 불러오기
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    if (e.target.files?.[0]) void importCSV(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                onClick={() =>
                  download(
                    "측정-입력-양식.csv",
                    "time,raw,distance\n0,900,20\n1,450,30\n",
                    "text/csv;charset=utf-8",
                  )
                }
              >
                CSV 입력 양식
              </button>
            </>
          )}
          <h3>LED를 끈 값부터 기록해요</h3>
          <ol>
            <li>센서에 비추는 빛을 바꿔 값이 달라지는지 봅니다.</li>
            <li>LED를 끄고 주변빛만 있을 때의 값을 입력합니다.</li>
            <li>
              LED를 켰을 때 값이 최댓값에 계속 붙어 있으면 거리를 늘립니다.
            </li>
          </ol>
          {runSetupFields}
          <button disabled={recording} onClick={() => newRun()}>
            이 설정으로 새 실험 만들기
          </button>
          {run && run.mode === state.mode && (
            <p className="notice">
              ‘{run.name}’을 준비했어요. 시작 거리 {run.startDistance}cm, LED를
              끈 값 {run.ambient}입니다. 아래 ‘다음’을 눌러 측정으로 갑니다.
            </p>
          )}
          <details>
            <summary>이지온으로 수집하려면</summary>
            <div className="button-row">
              <button onClick={onOpenEzOn}>
                이지온에서 직접 수집하는 방법
              </button>
            </div>
          </details>
          {run && run.mode !== state.mode && (
            <p className="notice">
              입력 방식 선택은 새 실험에 적용됩니다. 현재 선택된 기록의 출처는{" "}
              {run.mode === "practice"
                ? "연습 데이터"
                : run.mode === "serial"
                  ? "실물 센서"
                  : "수동·CSV 입력"}
              입니다.
            </p>
          )}
        </div>
      )}
      {step === 3 && (
        <div className="card">
          <h3>측정과 기록 순서</h3>
          {run?.mode === "manual" || (!run && state.mode === "manual") ? (
            <ol className="instructions">
              <li>LED를 끈 값과 시작 거리를 입력하고 새 실험을 만듭니다.</li>
              <li>
                거리별로 잰 값과 시각을 아래 입력칸에 적고 ‘측정값 추가’를
                누릅니다.
              </li>
              <li>기록을 다 넣으면 아래 ‘다음’을 눌러 예상과 비교합니다.</li>
            </ol>
          ) : (
            <ol className="instructions">
              <li>
                아래에서 자동차의 실제 속력을 구한 뒤 ‘측정 시작’을 누릅니다.
              </li>
              <li>
                자동차 A 버튼을 누르고, 움직이기 시작할 때 ‘자동차 출발 표시’를
                누릅니다.
              </li>
              <li>
                정한 거리까지 가면 자동차 B 버튼과 앱의 ‘중지’를 누릅니다.
              </li>
              <li>
                기록이 남았는지 보고 아래 ‘다음’을 눌러 예상과 비교합니다.
              </li>
            </ol>
          )}
          {(run?.mode ?? state.mode) === "practice" && (
            <p className="muted">
              연습 모드에서는 실제 자동차 대신 ‘자동차 출발 표시’를 눌러요.
            </p>
          )}
        </div>
      )}
      {step === 3 && !run && (
        <div className="card">
          <h3>먼저, 이번 실험의 기록을 만들어요</h3>
          <label className="field">
            기록 방법
            <select
              value={state.mode}
              onChange={(event) =>
                setMode(event.target.value as AppState["mode"])
              }
            >
              <option value="manual">직접 잰 값 입력</option>
              <option value="serial">실물 센서로 기록</option>
              <option value="practice">장비 없이 연습</option>
            </select>
          </label>
          {state.mode === "serial" && sensorConnection}
          {runSetupFields}
          <div className="button-row">
            <button className="primary" onClick={() => newRun()}>
              이 설정으로 새 실험 만들기
            </button>
            {state.mode === "practice" && (
              <button onClick={practice}>완성된 연습 데이터 사용</button>
            )}
          </div>
        </div>
      )}
      {step === 3 && run?.mode === "serial" && status !== "connected" && (
        <div className="card">
          <h3>센서를 연결하면 측정을 시작할 수 있어요</h3>
          {sensorConnection}
        </div>
      )}
      {step === 3 && (
        <div className="card">
          <h3>자동차가 얼마나 빠르게 움직이나요?</h3>
          <p>
            모터 설정값 255는 cm/s가 아닙니다. 알려진 거리와 걸린 시간을 3회
            측정하세요.
          </p>
          <div className="speed-grid">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <strong>{i + 1}회</strong>
                {field(`speedDistance${i}`, "이동 거리 (cm)", "", "number")}
                {field(`speedTime${i}`, "걸린 시간 (s)", "", "number")}
              </div>
            ))}
          </div>
          <SpeedResult
            notes={state.notes}
            hasRun={Boolean(run)}
            onApply={(v) => patch({ speed: v })}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={note("uniform") === "true"}
              onChange={(e) => setUniform(e.target.checked)}
            />
            속력이 일정한 구간의 기록 사용
          </label>
          <label className="field">
            거리 표식을 지난 시각, 빨라지거나 멈춘 구간
            <textarea
              value={note("motionEvidence")}
              onChange={(e) => setNote("motionEvidence", e.target.value)}
              placeholder="예: 40cm 표식 2.1s, 60cm 표식 3.8s. 출발 후 0.5s는 가속 구간."
            />
          </label>
        </div>
      )}
      {run && step >= 3 && (
        <div className="card experiment-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                {step === 4 ? "측정한 값으로 설명하기" : "밝기 측정"}
              </div>
              <h2>
                {step === 4
                  ? "나의 예상과 측정은 어떻게 달랐을까?"
                  : "멀어지는 빛을 기록해요"}
              </h2>
            </div>
            <span className="badge">
              {run.mode === "practice"
                ? "연습 데이터"
                : run.mode === "manual"
                  ? "직접 입력"
                  : "센서 수신"}
            </span>
          </div>
          <div className="grid-2">
            <label className="field">
              비교할 실험
              <select
                disabled={recording}
                value={run.id}
                onChange={(e) => setRuns(state.runs, e.target.value)}
              >
                {state.runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.mode === "practice" ? "[연습] " : ""}
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              실험 이름
              <input
                disabled={recording}
                value={run.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </label>
          </div>
          <div className="stat-grid">
            <div>
              <small>기록한 점</small>
              <strong>
                {run.samples.length}
                <em>개</em>
              </strong>
            </div>
            <div>
              <small>
                {run.mode === "practice" ? "연습 모형 속력" : "실제 속력"}
              </small>
              <strong>
                {run.speed?.toFixed(2) || "미확인"}
                <em>{run.speed ? "cm/s" : ""}</em>
              </strong>
            </div>
            <div>
              <small>주변빛만 있을 때</small>
              <strong>
                {run.ambient}
                <em>{unitLabel}</em>
              </strong>
            </div>
            <div>
              <small>자동차 출발 시각</small>
              <strong>
                {run.startTime?.toFixed(2) ?? "미지정"}
                <em>{run.startTime !== undefined ? "s" : ""}</em>
              </strong>
            </div>
          </div>
          <p className="muted">
            한 번에 최대 5,000개·10분 기록합니다. 다른 활동 단계로 이동하면
            기록을 중지합니다.
          </p>
          {step !== 4 && (
            <>
              <div className="button-row">
                <button
                  className="primary"
                  disabled={recording || run.mode === "manual"}
                  onClick={start}
                >
                  <Play size={16} />
                  측정 시작
                </button>
                <button disabled={!recording} onClick={stop}>
                  <Square size={16} />
                  중지
                </button>
                <button
                  disabled={!recording}
                  onClick={() =>
                    patch({
                      startTime: (performance.now() - started.current) / 1000,
                    })
                  }
                >
                  <Flag size={16} />
                  자동차 출발 표시
                </button>
                <button disabled={recording} onClick={() => newRun(run.mode)}>
                  <Plus size={16} />새 반복 실험
                </button>
              </div>
              <div className="grid-2">
                <label className="field">
                  자동차가 출발한 시각 (s)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={run.startTime ?? ""}
                    onChange={(e) =>
                      updateNumeric("startTime", e.target.value, true)
                    }
                  />
                </label>
                <label className="field">
                  시작 거리 (cm)
                  <input
                    type="number"
                    min="0.1"
                    disabled={recording}
                    value={run.startDistance}
                    onChange={(e) =>
                      updateNumeric("startDistance", e.target.value)
                    }
                  />
                </label>
              </div>
            </>
          )}
          {step === 4 ? (
            <>
              <label className="field">
                기준으로 삼을 밝기
                <select
                  value={reference}
                  onChange={(e) =>
                    setNote(`reference-${run.id}`, e.target.value)
                  }
                >
                  {possibleReferences.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.t.toFixed(2)}s · {distanceFor(s, run)?.toFixed(1)}cm ·{" "}
                      {corrected(s, run)?.toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
              {reference ? (
                <DataChart
                  run={run}
                  analysis
                  prediction={prediction}
                  referenceId={reference}
                />
              ) : (
                <p className="notice">
                  주변빛을 뺀 값이 0보다 크고, 거리를 알 수 있는 기록이
                  필요해요. 거리를 직접 입력하거나 속력과 자동차 출발 시각을
                  입력하세요.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="button-row">
                <button
                  className={axis === "time" ? "selected" : ""}
                  onClick={() => setAxis("time")}
                >
                  시간–측정값
                </button>
                <button
                  className={axis === "distance" ? "selected" : ""}
                  disabled={!run.samples.some((s) => distanceFor(s, run)! > 0)}
                  onClick={() => setAxis("distance")}
                >
                  거리–밝기
                </button>
                <button
                  className={axis === "inverse" ? "selected" : ""}
                  disabled={!run.samples.some((s) => distanceFor(s, run)! > 0)}
                  onClick={() => setAxis("inverse")}
                >
                  밝기와 1/r²
                </button>
              </div>
              <DataChart run={run} others={state.runs} axis={axis} />
            </>
          )}
          <details>
            <summary>주변빛 값과 센서 설정</summary>
            <div className="grid-2">
              <label className="field">
                LED를 껐을 때의 값
                <input
                  type="number"
                  disabled={recording}
                  value={run.ambient}
                  onChange={(e) => updateNumeric("ambient", e.target.value)}
                />
              </label>
              <label className="field">
                센서가 읽을 수 있는 최댓값 (모르면 비워 둠)
                <input
                  type="number"
                  value={run.saturation ?? ""}
                  onChange={(e) =>
                    updateNumeric("saturation", e.target.value, true)
                  }
                />
              </label>
              <label className="field">
                선생님이 확인한 값의 종류
                <select
                  value={run.unit}
                  onChange={(e) => patch({ unit: e.target.value })}
                >
                  <option value="센서 원시값">센서가 읽은 값</option>
                  <option>상대 밝기</option>
                  <option value="lx">조도 (lx, 검증한 경우만)</option>
                </select>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={run.linear}
                  onChange={(e) => patch({ linear: e.target.checked })}
                />
                밝기와 비례하고 단위를 확인한 센서값 (교사용)
              </label>
            </div>
            <label className="field">
              검사 방법과 결과 (교사용)
              <textarea
                value={note(`linearEvidence-${run.id}`)}
                onChange={(e) =>
                  setNote(`linearEvidence-${run.id}`, e.target.value)
                }
              />
            </label>
            <p>
              밝기와 센서값이 비례하고 단위가 확인된 경우에만 등급을 계산합니다.
              주변빛을 뺀 값이 0 이하면 계산에서 뺍니다.
            </p>
          </details>
          {step !== 4 &&
            (run.mode === "manual" ? (
              <details open>
                <summary>거리·측정값 수동 입력</summary>
                <div className="grid-3">
                  {field("manualTime", "경과 시간 (s)", "0", "number")}
                  {field("manualDistance", "직접 잰 거리 (cm)", "", "number")}
                  {field("manualRaw", "센서가 읽은 값", "", "number")}
                </div>
                <button onClick={sampleAdd}>
                  <Plus size={16} />
                  측정값 추가
                </button>
              </details>
            ) : (
              <button
                disabled={recording}
                onClick={() => {
                  const created = newRun("manual");
                  if (created) setMode("manual");
                }}
              >
                별도의 수동 입력 실험 만들기
              </button>
            ))}
          <details open={step === 4}>
            <summary>
              측정 기록과 비교에서 뺄 값 ({run.samples.length}개)
            </summary>
            <p>
              비교에서 빼고 싶은 값에는 이유를 적으세요. 처음 기록은 남습니다.
            </p>
            <p className="muted">
              표가 화면보다 넓으면 좌우로 스크롤해 모든 열을 확인하세요.
            </p>
            <div
              className="table-scroll"
              role="region"
              aria-label="측정 원본 데이터 표"
              tabIndex={0}
            >
              <table className="measurement-table">
                <thead>
                  <tr>
                    <th>시간(s)</th>
                    <th>거리(cm)</th>
                    <th>센서가 읽은 값</th>
                    <th>주변빛을 뺀 값</th>
                    <th>상태</th>
                    <th>비교에서 빼는 이유</th>
                  </tr>
                </thead>
                <tbody>
                  {run.samples.map((s) => (
                    <tr key={s.id}>
                      <td>{s.t.toFixed(2)}</td>
                      <td>{distanceFor(s, run)?.toFixed(2) ?? "미확인"}</td>
                      <td>{s.raw?.toFixed(2) ?? "누락"}</td>
                      <td>{corrected(s, run)?.toFixed(2) ?? "계산 불가"}</td>
                      <td>
                        {s.raw === null
                          ? "누락"
                          : isSaturated(s, run)
                            ? "센서 최댓값에 도달"
                            : (corrected(s, run) ?? 0) <= 0
                              ? "0 이하 · 계산 제외"
                              : s.excluded
                                ? "비교에서 제외"
                                : "사용"}
                      </td>
                      <td>
                        <input
                          aria-label={`${s.t}초 제외 사유`}
                          value={s.excluded ?? ""}
                          onChange={(e) =>
                            patch({
                              samples: run.samples.map((v) =>
                                v.id === s.id
                                  ? { ...v, excluded: e.target.value }
                                  : v,
                              ),
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <button
            onClick={() =>
              download(
                `${run.mode === "practice" ? "연습데이터-" : ""}${run.name}.csv`,
                exportCsv(run),
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download size={16} />
            측정값 파일로 저장 (CSV)
          </button>
          {run.originalCsv !== undefined && (
            <button
              onClick={() =>
                download(
                  `${run.mode === "practice" ? "연습데이터-" : ""}불러온-원문-${run.name}.csv`,
                  run.originalCsv!,
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Download size={16} />
              불러온 CSV 원문 저장
            </button>
          )}
          {step === 4 && (
            <>
              <div className="notice">
                {normalize(run, reference).length}개 기록으로 비교합니다. 이론
                그래프는 같은 광원과 방향, 같은 주변 조건에서의 밝기입니다.
              </div>
              {field("explainAuthor", "설명을 기록하는 사람 또는 모둠 별칭")}
              {[
                [
                  "explainCompare",
                  "최초 예상과 관찰은 어디에서 같고 달랐나요?",
                ],
                [
                  "explainEvidence",
                  "거리와 밝기의 관계를 어떤 데이터로 설명할 수 있나요?",
                ],
                [
                  "explainError",
                  "주변빛, LED 방향, 자동차 속력은 결과에 어떤 영향을 주었나요?",
                ],
                ["explainImprove", "다음 실험에서 무엇을 개선할까요?"],
              ].map(([key, label]) => (
                <label className="field" key={key}>
                  {label}
                  <textarea
                    value={note(key)}
                    onChange={(e) => setNote(key, e.target.value)}
                  />
                </label>
              ))}
              <div className="button-row">
                <button
                  className="primary"
                  disabled={
                    !note("explainAuthor").trim() ||
                    !note("explainEvidence").trim()
                  }
                  onClick={saveExplanation}
                >
                  내 설명 저장
                </button>
                <button
                  onClick={() =>
                    [
                      "explainAuthor",
                      "explainCompare",
                      "explainEvidence",
                      "explainError",
                      "explainImprove",
                    ].forEach((key) => setNote(key, ""))
                  }
                >
                  다른 구성원 설명 작성
                </button>
              </div>
              {records.length > 0 && (
                <details>
                  <summary>저장한 설명 {records.length}개</summary>
                  {records.map((r) => (
                    <blockquote key={r.id}>
                      <strong>
                        {r.author} ·{" "}
                        {r.mode === "practice"
                          ? "연습 데이터"
                          : "직접 입력·센서 기록"}
                      </strong>
                      <p>{r.evidence}</p>
                      <small>
                        {new Date(r.savedAt).toLocaleString("ko-KR")}
                      </small>
                    </blockquote>
                  ))}
                </details>
              )}
            </>
          )}
        </div>
      )}
      {!run && step === 4 && (
        <div className="card empty-state">
          <h3>아직 측정 기록이 없어요</h3>
          <p>장비 없이 연습 데이터를 불러오거나 새 실험을 만들어 시작하세요.</p>
          <div className="button-row">
            <button className="primary" onClick={practice}>
              연습 데이터로 체험하기
            </button>
          </div>
        </div>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </>
  );
}
function SpeedResult({
  notes,
  hasRun,
  onApply,
}: {
  notes: Record<string, string>;
  hasRun: boolean;
  onApply: (v: number) => void;
}) {
  const speeds = [0, 1, 2].flatMap((i) => {
    const distance = Number(notes[`speedDistance${i}`]),
      time = Number(notes[`speedTime${i}`]);
    return Number.isFinite(distance) &&
      Number.isFinite(time) &&
      distance > 0 &&
      time > 0 &&
      Number.isFinite(distance / time)
      ? [distance / time]
      : [];
  });
  const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const deviation = Math.sqrt(
    speeds.reduce((s, v) => s + (v - avg) ** 2, 0) / speeds.length,
  );
  return (
    <div className="notice">
      {speeds.length ? (
        <>
          {speeds.length}회 측정한 평균 속력: {avg.toFixed(2)} cm/s
          <button
            disabled={!hasRun || notes.uniform !== "true"}
            onClick={() => onApply(avg)}
          >
            이 속력으로 거리 계산
          </button>
          {!hasRun && (
            <p>위에서 새 실험을 만들면 이 속력을 적용할 수 있어요.</p>
          )}
          {hasRun && notes.uniform !== "true" && (
            <p>
              세 번의 속력이 비슷하면 아래 ‘속력이 일정한 구간의 기록 사용’을
              선택하세요.
            </p>
          )}
          <details>
            <summary>속력 측정값 비교</summary>
            <p>
              {speeds
                .map((speed, i) => `${i + 1}회 ${speed.toFixed(2)} cm/s`)
                .join(" · ")}
            </p>
            <p>속력이 흩어진 정도(표준편차): {deviation.toFixed(2)} cm/s</p>
          </details>
        </>
      ) : (
        "거리와 시간에 각각 0보다 큰 값을 입력하면 실제 속력을 계산합니다."
      )}
    </div>
  );
}
