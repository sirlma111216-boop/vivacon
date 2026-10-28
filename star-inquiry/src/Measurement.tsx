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
import { ExperimentIllustration, type Prediction } from "./Learning";
import { Maqueen } from "./Maqueen";
import { EzOnEntry } from "./EzOnGuide";
import { download, type AppState } from "./state";
type Props = {
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
  onOpenEzOn,
  step,
  state,
  setNote,
  setRuns,
  setMode,
  prediction,
}: Props) {
  const run = state.runs.find((r) => r.id === state.activeRunId) || null;
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
        "설정을 저장하지 않았습니다. 시작 거리·속력·포화 상한은 0보다 크게, 주행 시점은 0 이상으로 입력하세요.",
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
      else
        setMessage(
          "숫자를 비워 둘 수 없습니다. 이전의 유효한 설정을 유지합니다.",
        );
      return;
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      setMessage("유효한 숫자를 입력하세요. 이전 설정을 유지합니다.");
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
          ? "현재 연습 실험의 모형 속력 적용을 해제했습니다. 거리 변환이 중지됩니다."
          : "현재 실험의 속력 적용을 해제했습니다. 시간 기록은 보존하고 거리 변환을 중지합니다.",
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
  const buildRun = (mode = state.mode): Run => ({
    id: uid(),
    name: `${mode === "practice" ? "연습 " : ""}실험 ${state.runs.length + 1}`,
    repeat: state.runs.length + 1,
    mode,
    samples: [],
    ambient: Number(note("ambient", "0")),
    startDistance: Number(
      note("startDistance", note("design.startDistance", "20")),
    ),
    linear: mode === "practice",
    unit: mode === "practice" ? "상대 밝기" : "센서 원시값",
    ...(mode === "practice" ? { speed: 12 } : {}),
  });
  const newRun = (mode = state.mode) => {
    const r = buildRun(mode);
    if (
      !Number.isFinite(r.ambient) ||
      !Number.isFinite(r.startDistance) ||
      r.startDistance <= 0
    ) {
      setMessage(
        "주변광은 유효한 숫자, 시작 거리는 0보다 큰 숫자로 입력하세요.",
      );
      return null;
    }
    setRuns([...state.runs, r], r.id);
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
      setMessage(
        "시작 거리는 0보다 큰 값이어야 하며 주변광은 유효한 숫자여야 합니다.",
      );
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
      setMessage("원본 기록을 보존합니다. 새 실험을 만든 뒤 기록하세요.");
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
          parsed.errors.join("\n") || "유효한 데이터가 없습니다.",
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
          "CSV의 실험 메타데이터가 올바르지 않습니다. 반복 횟수·주변광·거리 설정을 확인하세요.",
        );
      setRuns([...stateRef.current.runs, r], r.id);
      setMode(mode);
      setMessage(
        `CSV ${parsed.samples.length}행 불러옴${mode === "practice" ? " · 연습 데이터 출처 보존" : ""}. ${parsed.errors.join(" · ")} 원문도 함께 보존했습니다.`,
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
      setMessage("유효한 측정값·시간을 입력하세요. 거리는 0보다 커야 합니다.");
      return;
    }
    const r = run ?? buildRun("manual");
    if (!validateRun(r) || r.startDistance <= 0) {
      setMessage("새 실험의 시작 거리와 주변광 설정을 확인하세요.");
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
    setNote("manualTime", String(Number(t) + 1));
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
      "작성자별 설명을 별도 기록으로 보존했습니다. 아래 초안을 수정해도 저장된 설명은 바뀌지 않습니다.",
    );
  };
  if (step === 0)
    return (
      <>
        <ExperimentIllustration />
        <EzOnEntry onOpen={onOpenEzOn} />
        <div className="card">
          <h3>실험 전, 함께 확인해요</h3>
          <p>
            센서 연결은 컴퓨터에서, 자동차 조작은 micro:bit에서 합니다. 두
            장치는 자동으로 동기화되지 않습니다.
          </p>
          <div className="check-list">
            {[
              "센서를 고정하고 LED를 자동차에 단단히 붙였다",
              "광원과 센서의 높이를 맞췄다",
              "센서를 향한 LED가 오른쪽으로 멀어지게 놓았다",
              "바닥에 거리를 표시하고 떨어질 위험을 없앴다",
              "USB 케이블이 주행을 방해하지 않는다",
            ].map((v, i) => (
              <label key={v}>
                <input
                  type="checkbox"
                  checked={note(`safety${i}`) === "true"}
                  onChange={(e) =>
                    setNote(`safety${i}`, String(e.target.checked))
                  }
                />
                {v}
              </label>
            ))}
          </div>
        </div>
      </>
    );
  if (step === 1) return <Maqueen notes={state.notes} setNote={setNote} />;
  return (
    <>
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
          {live !== null && `· 센서 최근 수신 ${live.toFixed(2)}`}
        </span>
      </div>
      {step === 2 && <EzOnEntry onOpen={onOpenEzOn} />}
      {step === 2 && (
        <div className="card">
          <div className="eyebrow">CONNECT & CALIBRATE</div>
          <h2>센서를 연결하고, 주변광을 확인해요</h2>
          <div className="mode-options">
            {(
              [
                ["serial", "실물 센서"],
                ["manual", "CSV · 수동 입력"],
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
            <>
              <p className="notice">
                연동 구조 구현 완료 / 실제 기기 검증 전. 이지메이커 보드의
                정확한 펌웨어·채널·단위를 교사가 확인해야 합니다.
              </p>
              <p>{support.message}</p>
              <details>
                <summary>교사용 연결 세부 설정</summary>
                <p>
                  공개 클라이언트의 115200은 참고값입니다. 내 보드의 설정을
                  확인한 뒤 입력하세요. 채널 번호는 수신 프레임의 0부터 시작하는
                  열 번호이며 물리 포트 번호가 아닙니다.
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
                  내 보드가 숫자 CSV 줄바꿈 프레임을 전송하며 속도와 채널을
                  확인했다
                </label>
                <p>
                  초기화·요청 명령은 확인되지 않아 보내지 않습니다. 실제 포트를
                  확인하기 전 배선도는 제공하지 않습니다.
                </p>
                {note("physicalPort") && (
                  <p className="notice">
                    교사 확인 기록: 밝기 센서 → {note("physicalPort")} →{" "}
                    {note("board") || "기록한 유선보드"} → USB → 컴퓨터. 핀별
                    배선은 공식 보드 설명서를 확인하세요.
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
            </>
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
                CSV 열 이름: <code>time,raw,distance</code> (시간 s, 측정값,
                거리 cm). 거리는 생략할 수 있습니다.
              </p>
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
          <h3>보정 순서</h3>
          <ol>
            <li>수신값이 실제로 변하는지 확인합니다.</li>
            <li>LED를 끄고 주변광을 기록합니다.</li>
            <li>LED를 켜고 시작 거리에서 값과 포화 여부를 확인합니다.</li>
          </ol>
          <div className="grid-2">
            {field("ambient", "LED를 끈 주변광 값", "0", "number")}
            {field(
              "startDistance",
              "시작 거리 (cm, 0보다 크게)",
              note("design.startDistance", "20"),
              "number",
            )}
          </div>
          <button disabled={recording} onClick={() => newRun()}>
            이 설정으로 새 실험 만들기
          </button>
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
          <h3>자동차의 실제 속력 확인</h3>
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
            onApply={(v) => patch({ speed: v })}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={note("uniform") === "true"}
              onChange={(e) => setUniform(e.target.checked)}
            />
            직선으로 멀어지며 분석 구간에서 속력이 대체로 일정함을 확인했다
          </label>
          <label className="field">
            거리 표식 통과 시각 / 가속·정지 구간 기록
            <textarea
              value={note("motionEvidence")}
              onChange={(e) => setNote("motionEvidence", e.target.value)}
              placeholder="예: 40cm 표식 2.1s, 60cm 표식 3.8s. 출발 후 0.5s는 가속 구간."
            />
          </label>
        </div>
      )}
      {run && (
        <div className="card experiment-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                {step === 4
                  ? "EXPLAIN · 근거로 설명하기"
                  : "OBSERVE · 측정 기록"}
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
              <small>주변광</small>
              <strong>
                {run.ambient}
                <em>{run.unit}</em>
              </strong>
            </div>
            <div>
              <small>주행 기준 시점</small>
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
                  주행 시작 표시
                </button>
                <button disabled={recording} onClick={() => newRun()}>
                  <Plus size={16} />새 반복 실험
                </button>
              </div>
              <div className="grid-2">
                <label className="field">
                  주행 기준 시점 직접 지정 (s)
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
                정규화 기준점
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
                  양수인 보정 밝기와 확인된 거리가 있는 점이 필요합니다. 거리를
                  직접 입력하거나 실제 속력·주행 기준 시점을 확인하세요.
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
            <summary>보정·선형성·분석 설정</summary>
            <div className="grid-2">
              <label className="field">
                주변광
                <input
                  type="number"
                  disabled={recording}
                  value={run.ambient}
                  onChange={(e) => updateNumeric("ambient", e.target.value)}
                />
              </label>
              <label className="field">
                확인한 포화 상한값 (미확인 시 비워둠)
                <input
                  type="number"
                  value={run.saturation ?? ""}
                  onChange={(e) =>
                    updateNumeric("saturation", e.target.value, true)
                  }
                />
              </label>
              <label className="field">
                검증된 단위 또는 값 종류
                <select
                  value={run.unit}
                  onChange={(e) => patch({ unit: e.target.value })}
                >
                  <option>센서 원시값</option>
                  <option>상대 밝기</option>
                  <option>lx</option>
                </select>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={run.linear}
                  onChange={(e) => patch({ linear: e.target.checked })}
                />
                단위와 빛의 세기에 대한 선형성을 검증했다
              </label>
            </div>
            <label className="field">
              단위·선형성 확인 근거
              <textarea
                value={note(`linearEvidence-${run.id}`)}
                onChange={(e) =>
                  setNote(`linearEvidence-${run.id}`, e.target.value)
                }
              />
            </label>
            <p>
              원시값의 선형성이 확인되지 않으면 등급 환산을 하지 않습니다.
              보정값이 0 이하면 임의의 양수로 바꾸지 않습니다.
            </p>
          </details>
          {step !== 4 &&
            (run.mode === "manual" ? (
              <details open>
                <summary>거리·측정값 수동 입력</summary>
                <div className="grid-3">
                  {field("manualTime", "경과 시간 (s)", "0", "number")}
                  {field(
                    "manualDistance",
                    "직접 확인한 거리 (cm)",
                    "",
                    "number",
                  )}
                  {field("manualRaw", "원본 측정값", "", "number")}
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
              원본 데이터와 분석 제외 사유 ({run.samples.length}개)
            </summary>
            <p>
              제외 이유를 입력하면 분석에서만 제외합니다. 원본 행은 그대로
              남습니다.
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>시간(s)</th>
                    <th>거리(cm)</th>
                    <th>원본</th>
                    <th>보정값</th>
                    <th>상태</th>
                    <th>분석 제외 사유</th>
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
                            ? "포화"
                            : (corrected(s, run) ?? 0) <= 0
                              ? "0 이하 · 계산 제외"
                              : s.excluded
                                ? "분석 제외"
                                : "유효"}
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
            원본·보정 데이터 CSV
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
                {normalize(run, reference).length}개 유효한 점으로 비교합니다.
                이상적인 모형은 같은 광원·방향·조건을 가정합니다.
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
                  "주변광·광원 방향·속력·센서 특성은 어떤 영향을 주었나요?",
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
                  작성자별 설명 보존하기
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
                  <summary>보존된 설명 {records.length}개</summary>
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
                        {new Date(r.savedAt).toLocaleString("ko-KR")} · 최초
                        예상과 별도 보존
                      </small>
                    </blockquote>
                  ))}
                </details>
              )}
            </>
          )}
        </div>
      )}
      {!run && step !== 2 && (
        <div className="card empty-state">
          <h3>아직 측정 기록이 없어요</h3>
          <p>장비 없이 연습 데이터를 불러오거나 새 실험을 만들어 시작하세요.</p>
          <div className="button-row">
            <button className="primary" onClick={practice}>
              연습 데이터로 체험하기
            </button>
            <button onClick={() => newRun("manual")}>수동 입력 시작</button>
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
  onApply,
}: {
  notes: Record<string, string>;
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
          평균 {avg.toFixed(2)} cm/s · 표준편차 {deviation.toFixed(2)} cm/s ·{" "}
          {speeds.length}회
          <button
            disabled={notes.uniform !== "true"}
            onClick={() => onApply(avg)}
          >
            확인한 속력을 실험에 적용
          </button>
        </>
      ) : (
        "거리와 시간에 각각 0보다 큰 값을 입력하면 실제 속력을 계산합니다."
      )}
    </div>
  );
}
