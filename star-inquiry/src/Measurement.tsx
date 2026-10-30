import { useState } from "react";
import { Upload, Plus, Download, FileSpreadsheet } from "lucide-react";
import {
  createPracticeRun,
  exportCsv,
  corrected,
  distanceFor,
  normalize,
  isSaturated,
  validSamples,
  validateRun,
  type Run,
} from "./domain";
import { parseMeasurementCsv } from "./ezonCsv";
import { DataChart } from "./DataChart";
import type { Prediction } from "./Learning";
import { ExperimentPrep } from "./ExperimentPrep";
import { HardwareSectionContent } from "./HardwareManual";
import { measurementSetup } from "./measurementSetup";
import { EzOnLinks, EzOnSteps, EzOnTroubleshooting } from "./EzOnGuide";
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
const MAX_SAMPLES = 5000;
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
const sourceLabel = (mode: Run["mode"]) =>
  mode === "practice"
    ? "연습 데이터"
    : mode === "serial"
      ? "이지온 측정"
      : "직접 입력";
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
  const [message, setMessage] = useState(""),
    [axis, setAxis] = useState<"time" | "distance" | "inverse">("time");
  const note = (k: string, v = "") => state.notes[k] ?? v;
  const setup = measurementSetup(state.notes, "serial");
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
    key: "ambient" | "startDistance" | "startTime" | "saturation" | "speed",
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
  const buildRun = (mode: Run["mode"]): Run => {
    const settings = measurementSetup(state.notes, mode);
    return {
      id: uid(),
      name: `${sourceLabel(mode)} ${state.runs.length + 1}`,
      repeat: state.runs.length + 1,
      mode,
      samples: [],
      ambient: settings.ambient,
      startDistance: settings.startDistance,
      linear: mode === "practice",
      unit: mode === "practice" ? "상대 밝기" : "센서 원시값",
      ...(settings.speed !== undefined
        ? { speed: Math.round(settings.speed * 100) / 100 }
        : {}),
      ...(settings.saturation !== undefined
        ? { saturation: settings.saturation }
        : {}),
    };
  };
  const setupProblem = (r: Run) =>
    !Number.isFinite(r.ambient)
      ? "‘LED를 껐을 때의 값’을 숫자로 적어 주세요. (3단계)"
      : !Number.isFinite(r.startDistance) || r.startDistance <= 0
        ? "처음 거리를 0보다 큰 숫자로 적어 주세요. (4단계)"
        : null;
  const manualRun = () => {
    const r = buildRun("manual");
    const problem = setupProblem(r);
    if (problem) {
      setMessage(problem);
      return;
    }
    setRuns([...state.runs, r], r.id);
    setMode("manual");
    setMessage("직접 입력할 실험을 만들었어요. 아래 입력칸에 값을 적어요.");
  };
  const importFile = async (file: File) => {
    try {
      if (file.size > 10_000_000)
        throw new Error("10MB 이하 CSV를 선택하세요.");
      const originalCsv = await file.text();
      const parsed = parseMeasurementCsv(originalCsv);
      if (!parsed.samples.length)
        throw new Error(
          parsed.errors.join("\n") || "읽을 수 있는 측정값이 없습니다.",
        );
      if (parsed.samples.length > MAX_SAMPLES)
        throw new Error(
          "한 실험에는 최대 5,000행까지 불러옵니다. 이지온에서 수집 시간을 줄여 다시 내려받으세요.",
        );
      const mode = parsed.mode ?? "manual";
      const base = buildRun(mode);
      const r: Run = {
        ...base,
        ...parsed.metadata,
        name: parsed.metadata?.name || base.name,
        mode,
        samples: parsed.samples,
        originalCsv,
      };
      const problem = setupProblem(r);
      if (problem) throw new Error(problem);
      if (!validateRun(r))
        throw new Error(
          "파일의 실험 정보가 올바르지 않습니다. 반복 횟수·주변빛·거리 값을 확인하세요.",
        );
      setRuns([...state.runs, r], r.id);
      setMode(mode);
      const columns =
        parsed.sensorColumns && parsed.sensorColumns.length > 1
          ? ` 센서 열 ${parsed.sensorColumns.length}개 중 ‘${parsed.sensorColumn}’을 가져왔어요.`
          : "";
      setMessage(
        `‘${file.name}’에서 ${parsed.samples.length}개 기록을 가져왔어요.${columns} ${parsed.errors.join(" · ")}`,
      );
    } catch (e) {
      setMessage(String(e instanceof Error ? e.message : e));
    }
  };
  const sampleAdd = () => {
    if (!run || run.mode !== "manual") {
      setMessage("먼저 ‘직접 입력 실험 만들기’를 눌러 주세요.");
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
    if (run.samples.length >= MAX_SAMPLES) {
      setMessage("최대 5,000개에 도달했습니다. 새 실험을 만들어 주세요.");
      return;
    }
    const s = {
      id: uid(),
      t: Number(t),
      raw: Number(raw),
      ...(d ? { distance: Number(d) } : {}),
      saturated: run.saturation !== undefined && Number(raw) >= run.saturation,
    };
    setRuns(
      state.runs.map((v) =>
        v.id === run.id ? { ...run, samples: [...run.samples, s] } : v,
      ),
    );
    const interval = setup.interval > 0 ? setup.interval : 1;
    setNote("manualTime", String(Number((Number(t) + interval).toFixed(6))));
    setMessage("측정값을 추가했습니다.");
  };
  const practice = () => {
    const r = createPracticeRun();
    r.name = `연습 데이터 ${state.runs.length + 1}`;
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
  const status = message && (
    <p className="notice" role="status">
      {message}
    </p>
  );

  if (step === 0)
    return (
      <ExperimentPrep
        notes={state.notes}
        onOpenHardware={onOpenHardware}
        onOpenEzOn={onOpenEzOn}
      />
    );
  if (step === 1)
    return (
      <>
        <div className="notice">
          3차시에서 만든 자동차를 준비하세요. LED 고정 상태를 보고, 바닥에서 A로
          출발하고 B로 멈추는지 짧게 시험해요.
        </div>
        <div className="card">
          <div className="eyebrow">자동차 준비 마무리</div>
          <h2>자동차는 1초에 몇 cm 움직일까요?</h2>
          <p>
            모터 설정값 255는 cm/s가 아닙니다. 줄자로 정한 거리를 자동차가
            지나가는 시간을 3번 재어 실제 속력을 구해요. 이 속력으로 4차시
            뒤에서 시간을 거리로 바꿉니다.
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
          <SpeedResult notes={state.notes} />
          <label className="check">
            <input
              type="checkbox"
              checked={note("uniform") === "true"}
              onChange={(e) => setNote("uniform", String(e.target.checked))}
            />
            세 번의 속력이 비슷해요. 이 평균 속력을 측정에 사용할게요.
          </label>
        </div>
      </>
    );
  if (step === 2)
    return (
      <>
        <HardwareSectionContent section="connection" />
        <div className="card">
          <div className="eyebrow">이지온 준비</div>
          <h2>이지온에서 밝기 센서 프로그램을 보드에 넣어요</h2>
          <p>
            새 탭에서 이지온을 열고 아래 순서대로 블록을 만들어 보드에
            업로드합니다. 이 화면은 그대로 두고 돌아와요.
          </p>
          <EzOnLinks />
          <EzOnSteps part="setup" />
        </div>
        <div className="card">
          <div className="eyebrow">연결 확인</div>
          <h2>센서가 빛에 반응하는지 확인해요</h2>
          <ol className="instructions">
            <li>
              이지온 <strong>데이터 분석 → 보드 연결</strong>에서 보드를 고르고{" "}
              <strong>수집 시작</strong>을 눌러요.
            </li>
            <li>센서를 손으로 가렸다 떼며 센서 1 값이 바뀌는지 봐요.</li>
            <li>
              LED를 끄고 값을 적은 뒤, LED를 켜서 시작 자리에 두었을 때 값을
              적어요.
            </li>
            <li>
              <strong>수집 중지</strong>와 <strong>데이터 초기화</strong>로 시험
              기록을 지워요.
            </li>
          </ol>
          <label className="field">
            블록에서 고른 측정 범위
            <select
              value={note("ezon.range", "100")}
              onChange={(e) => setNote("ezon.range", e.target.value)}
            >
              <option value="100">0~100</option>
              <option value="1023">0~1023</option>
            </select>
          </label>
          <div className="grid-2">
            {field("ambient", "LED를 껐을 때 센서 1 값", "0", "number")}
            {field(
              "ezon.ledOnValue",
              "LED를 켠 시작 자리의 센서 1 값",
              "",
              "number",
            )}
          </div>
          <SaturationHint
            range={Number(note("ezon.range", "100"))}
            value={note("ezon.ledOnValue")}
          />
          <EzOnTroubleshooting />
        </div>
        {status}
      </>
    );
  if (step === 3)
    return (
      <>
        <HardwareSectionContent section="measurement" />
        <div className="card">
          <div className="eyebrow">한 번 측정하기</div>
          <h2>이지온으로 수집하고 파일로 저장해요</h2>
          <ol className="instructions">
            <li>
              LED가 센서를 향하게 자동차를 시작 자리에 두고, 처음 거리를 줄자로
              잽니다.
            </li>
            <li>
              이지온에서 <strong>수집 시작</strong>을 누르고 2~3초 기다려요.
            </li>
            <li>
              자동차 <strong>A 버튼</strong>을 눌러 출발시켜요. 기록 담당은
              출발한 순간 이지온 표의 수집시간을 적어 둡니다.
            </li>
            <li>
              정한 거리까지 가면 <strong>B 버튼</strong>으로 멈추고 이지온{" "}
              <strong>수집 중지</strong>를 눌러요.
            </li>
            <li>
              그래프를 <strong>X축 수집시간, Y축 센서 1</strong>로 보고, 빛이
              어떻게 바뀌었는지 확인해요.
            </li>
            <li>
              <strong>데이터 다운로드</strong>로 CSV 파일을 저장해요. 반복할
              때마다 <strong>데이터 초기화</strong> 후 처음부터 다시 합니다.
            </li>
          </ol>
          <div className="grid-2">
            {field(
              "startDistance",
              "LED와 센서 사이 처음 거리 (cm)",
              note("design.startDistance", "20"),
              "number",
            )}
            {field(
              "design.repeats",
              "반복할 횟수",
              note("design.repeats", "3"),
              "number",
            )}
          </div>
          <label className="field">
            회차별 메모 (출발한 수집시간, 멈춘 위치, 특이한 점)
            <textarea
              value={note("motionEvidence")}
              onChange={(e) => setNote("motionEvidence", e.target.value)}
              placeholder="예: 1회 – 23:03:36.1에 출발, 80cm에서 멈춤. 2회 – 출발이 늦어 다시 함."
            />
          </label>
          <p className="muted">
            내려받은 파일 이름은 바꾸지 않아도 돼요. 몇 번째 측정인지 메모와
            함께 기억해 두세요.
          </p>
        </div>
        <div className="card">
          <div className="eyebrow">이지온 화면 안내</div>
          <h2>수집, 그래프, 내려받기</h2>
          <EzOnSteps part="collect" />
        </div>
        {status}
      </>
    );
  return (
    <>
      <div className="card">
        <div className="eyebrow">① 파일 가져오기</div>
        <h2>이지온에서 내려받은 파일을 가져와요</h2>
        <p>
          반복한 횟수만큼 파일을 하나씩 가져옵니다. 수집시간은 첫 기록부터 지난
          초로 바뀌고, 센서 1 값은 그대로 보존됩니다.
        </p>
        <div className="button-row">
          <label className="file-button primary">
            <Upload size={16} />
            이지온 파일 가져오기
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                if (e.target.files?.[0]) void importFile(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="muted">
          가져올 때 함께 기록하는 값: 처음 거리{" "}
          {Number.isFinite(setup.startDistance) ? setup.startDistance : "?"}cm ·
          LED를 껐을 때 값{" "}
          {Number.isFinite(setup.ambient) ? setup.ambient : "?"} · 실제 속력{" "}
          {setup.speed !== undefined
            ? `${setup.speed.toFixed(2)}cm/s`
            : "미확인 (2단계)"}
          . 가져온 뒤 아래에서 고칠 수 있어요.
        </p>
        <details>
          <summary>파일이 없거나 장비가 없을 때</summary>
          <div className="button-row">
            <button onClick={practice}>연습 데이터로 체험</button>
            <button onClick={manualRun}>
              <Plus size={16} />
              직접 입력 실험 만들기
            </button>
            <button
              onClick={() =>
                download(
                  "측정-입력-양식.csv",
                  "time,raw,distance\n0,900,20\n1,450,30\n",
                  "text/csv;charset=utf-8",
                )
              }
            >
              <FileSpreadsheet size={16} />
              CSV 입력 양식
            </button>
          </div>
          <p className="muted">
            별빛 탐구실에서 저장한 CSV도 같은 ‘이지온 파일 가져오기’ 버튼으로
            다시 불러올 수 있어요.
          </p>
        </details>
      </div>
      {status}
      {run ? (
        <>
          <div className="card experiment-card">
            <div className="section-heading">
              <div>
                <div className="eyebrow">② 기록 확인</div>
                <h2>가져온 기록에 출발 시각을 표시해요</h2>
              </div>
              <span className="badge">{sourceLabel(run.mode)}</span>
            </div>
            <div className="grid-2">
              <label className="field">
                살펴볼 실험
                <select
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
            <p className="muted">
              시간–측정값 그래프에서 값이 줄어들기 시작한 시각, 또는 메모한 출발
              시각을 ‘첫 기록부터 지난 초’로 적어요. 출발 시각·처음 거리·실제
              속력이 모두 있어야 거리–밝기 그래프가 열립니다.
            </p>
            <div className="grid-3">
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
                처음 거리 (cm)
                <input
                  type="number"
                  min="0.1"
                  value={run.startDistance}
                  onChange={(e) =>
                    updateNumeric("startDistance", e.target.value)
                  }
                />
              </label>
              <label className="field">
                실제 속력 (cm/s)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={run.speed ?? ""}
                  onChange={(e) => updateNumeric("speed", e.target.value, true)}
                />
              </label>
            </div>
            {run.mode === "manual" && (
              <details open>
                <summary>거리·측정값 직접 입력</summary>
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
            )}
            <details>
              <summary>주변빛 값과 센서 설정</summary>
              <div className="grid-2">
                <label className="field">
                  LED를 껐을 때의 값
                  <input
                    type="number"
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
                밝기와 센서값이 비례하고 단위가 확인된 경우에만 등급을
                계산합니다. 주변빛을 뺀 값이 0 이하면 계산에서 뺍니다.
              </p>
            </details>
            <details>
              <summary>
                측정 기록과 비교에서 뺄 값 ({run.samples.length}개)
              </summary>
              <p>
                출발 전 대기 구간처럼 비교에서 빼고 싶은 값에는 이유를 적으세요.
                처음 기록은 남습니다.
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
            <div className="button-row">
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
                정리한 기록 저장 (CSV)
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
                  가져온 원본 파일 저장
                </button>
              )}
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">③ 예상과 비교</div>
            <h2>나의 예상과 측정은 어떻게 달랐을까?</h2>
            <label className="field">
              기준으로 삼을 밝기
              <select
                value={reference}
                onChange={(e) => setNote(`reference-${run.id}`, e.target.value)}
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
              <>
                <DataChart
                  run={run}
                  analysis
                  prediction={prediction}
                  referenceId={reference}
                />
                <div className="notice">
                  {normalize(run, reference).length}개 기록으로 비교합니다. 이론
                  그래프는 같은 광원과 방향, 같은 주변 조건에서의 밝기입니다.
                </div>
              </>
            ) : (
              <p className="notice">
                주변빛을 뺀 값이 0보다 크고, 거리를 알 수 있는 기록이 필요해요.
                위에서 출발 시각과 실제 속력을 적어 주세요.
              </p>
            )}
            {field("explainAuthor", "설명을 기록하는 사람 또는 모둠 별칭")}
            {[
              ["explainCompare", "최초 예상과 관찰은 어디에서 같고 달랐나요?"],
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
                      {r.author} · {sourceLabel(r.mode as Run["mode"])}
                    </strong>
                    <p>{r.evidence}</p>
                    <small>{new Date(r.savedAt).toLocaleString("ko-KR")}</small>
                  </blockquote>
                ))}
              </details>
            )}
          </div>
        </>
      ) : (
        <div className="card empty-state">
          <h3>아직 가져온 기록이 없어요</h3>
          <p>
            이지온에서 내려받은 파일을 가져오세요. 장비가 없으면 연습 데이터로
            체험할 수 있어요.
          </p>
          <div className="button-row">
            <button onClick={practice}>연습 데이터로 체험하기</button>
          </div>
        </div>
      )}
    </>
  );
}
function SaturationHint({ range, value }: { range: number; value: string }) {
  const reading = Number(value);
  if (value.trim() === "" || !Number.isFinite(reading)) return null;
  return reading >= range ? (
    <p className="notice">
      시작 자리의 값이 최댓값 {range}에 닿았어요. 센서가 더 밝은 빛을 구분하지
      못하므로 처음 거리를 늘리거나 LED 밝기를 낮춰 다시 확인하세요.
    </p>
  ) : (
    <p className="muted">
      시작 자리의 값이 최댓값 {range}보다 작아 밝기 변화를 기록할 수 있어요.
    </p>
  );
}
function SpeedResult({ notes }: { notes: Record<string, string> }) {
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
