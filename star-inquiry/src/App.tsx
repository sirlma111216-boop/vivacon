import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  FlaskConical,
  HelpCircle,
  Home,
  Monitor,
  NotebookPen,
  Orbit,
  Settings2,
  Sparkles,
  Upload,
  Usb,
  Wrench,
  X,
} from "lucide-react";
import {
  Learning,
  NOTE_LABELS,
  learningNoteValue,
  type Prediction,
} from "./Learning";
import { Measurement } from "./Measurement";
import { EzOnEntry, EzOnGuide } from "./EzOnGuide";
import { HardwareEntry, HardwareManual } from "./HardwareManual";
import { SmartImage } from "./SmartImage";
import { Resources, resources } from "./Resources";
import { DataChart } from "./DataChart";
import {
  createPracticeRun,
  validateBackup,
  exportCsv,
  corrected,
  distanceFor,
  normalize,
  type Run,
} from "./domain";
import {
  download,
  initialState,
  STORAGE_KEY,
  type AppState,
  practiceLabel,
} from "./state";
const lessons = {
  3: {
    title: "예상하고 설계하기",
    poe: "예상",
    description: "나의 생각에서 실험으로",
    steps: [
      "앞선 수업 연결",
      "나의 예상 그래프",
      "거리와 빛의 세기",
      "실험 설계",
      "자동차 만들기·코딩",
    ],
    times: [3, 5, 7, 5, 25],
  },
  4: {
    title: "측정하고 설명하기",
    poe: "관찰",
    description: "움직이는 광원을 따라",
    steps: [
      "오늘의 실험",
      "주행·속력 확인",
      "이지온 연결",
      "측정하고 저장",
      "가져와 비교",
    ],
    times: [5, 10, 8, 10, 12],
  },
  5: {
    title: "별의 등급으로 읽기",
    poe: "설명",
    description: "측정에서 별의 밝기까지",
    steps: [
      "실험 다시 보기",
      "등급과 밝기 비",
      "밝기를 등급으로",
      "겉보기·절대 등급",
      "확인과 성찰",
    ],
    times: [5, 12, 8, 12, 8],
  },
};
function readState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const value = JSON.parse(raw);
      if (validateBackup(value)) return { ...initialState, ...value };
    }
  } catch {}
  return initialState;
}
export default function App() {
  const [state, setState] = useState<AppState>(readState),
    [panel, setPanel] = useState<
      "help" | "teacher" | "resources" | "records" | "ezon" | "hardware" | null
    >(null),
    [hardwareStep, setHardwareStep] = useState(1),
    [saveStatus, setSaveStatus] = useState("이 기기에 저장됨"),
    [toast, setToast] = useState(""),
    [report, setReport] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const activeRun = state.runs.find((r) => r.id === state.activeRunId) || null;
  const lesson = lessons[state.lesson];
  useEffect(() => {
    // Scale rem-based navigation, guides, fields and diagrams together.
    document.documentElement.style.fontSize = {
      small: "100%",
      normal: "112.5%",
      large: "131.25%",
    }[state.fontSize];
  }, [state.fontSize]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveStatus("이 기기에 저장됨");
    } catch {
      setSaveStatus("저장 공간 부족 · JSON 백업 필요");
    }
  }, [state]);
  useEffect(() => {
    if (panel) {
      dialog.current?.showModal();
      if (panel === "ezon" || panel === "hardware")
        dialog.current?.scrollTo({ top: 0 });
    } else dialog.current?.close();
  }, [panel]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(id);
  }, [toast]);
  const patch = (v: Partial<AppState>) => setState((s) => ({ ...s, ...v }));
  const openHardware = (step = 1) => {
    setHardwareStep(step);
    setPanel("hardware");
  };
  const setNote = (k: string, v: string) =>
    setState((s) => ({ ...s, notes: { ...s.notes, [k]: v } }));
  const go = (l: 3 | 4 | 5, step = 0) => {
    if (l === 3 && step > 1 && !state.prediction) {
      step = 1;
      setToast("이론을 보기 전에 나의 예상과 이유를 먼저 저장하세요.");
    }
    if (l === 5 && step > 1 && !state.notes.magnitudePrediction) {
      step = 1;
      setToast("밝기 비 예상과 이유를 먼저 저장하세요.");
    }
    if (l === 5 && step > 3 && !state.notes.absolutePrediction) {
      step = 3;
      setToast("같은 거리에서 비교할 때의 예상을 먼저 저장하세요.");
    }
    patch({ home: false, lesson: l, step });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => heading.current?.focus(), 20);
  };
  const next = () => {
    if (state.lesson === 3 && state.step === 1 && !state.prediction) {
      setToast("예상 그래프와 이유를 먼저 저장하세요.");
      return;
    }
    if (
      state.lesson === 5 &&
      ((state.step === 1 && !state.notes.magnitudePrediction) ||
        (state.step === 3 && !state.notes.absolutePrediction))
    ) {
      setToast("관찰하기 전에 처음 예상을 먼저 저장하세요.");
      return;
    }
    const completed = Array.from(
      new Set([...state.completed, `${state.lesson}-${state.step}`]),
    );
    patch({ completed });
    if (state.step < 4) go(state.lesson, state.step + 1);
    else if (state.lesson < 5) go((state.lesson + 1) as 4 | 5, 0);
    else {
      setPanel("records");
      setToast("탐구를 마쳤어요. 보고서와 백업을 저장하세요.");
    }
  };
  const onPrediction = (p: Prediction) =>
    setState((s) =>
      s.prediction
        ? s
        : { ...s, prediction: p, predictions: [...s.predictions, p] },
    );
  const practice = () => {
    const r = createPracticeRun();
    patch({
      runs: [...state.runs, r],
      activeRunId: r.id,
      mode: "practice",
      home: false,
      lesson: 4,
      step: 4,
    });
    setToast("연습 데이터입니다. 나의 최초 예상은 3차시에서 따로 기록하세요.");
  };
  const backup = () =>
    download(
      "별빛탐구-백업.json",
      JSON.stringify(state, null, 2),
      "application/json",
    );
  const restore = async (file: File) => {
    try {
      if (file.size > 20_000_000)
        throw new Error("20MB 이하의 백업 파일을 선택하세요.");
      const data = JSON.parse(await file.text());
      if (!validateBackup(data))
        throw new Error("백업 형식이나 측정값이 올바르지 않습니다.");
      download(
        "복원전-자동백업.json",
        JSON.stringify(state, null, 2),
        "application/json",
      );
      setState({ ...initialState, ...data });
      setToast("JSON 백업을 복원했습니다. 복원 전 기록도 파일로 저장했습니다.");
      setPanel(null);
    } catch (e) {
      setToast(String(e));
    }
  };
  const shareText = () => {
    const text = `별빛의 거리를 재다\n${practiceLabel(state.runs)}\n수업: ${state.notes.classCode || "-"} / 모둠: ${state.notes.group || "-"}\n최초 예상: ${state.predictions.map((p) => `${p.author}: ${p.reason}`).join("\n")}\n관찰 후 설명: ${state.notes.explainEvidence || ""}\n${Object.entries(
      state.notes,
    )
      .filter(([k]) => /reflect|reflection/i.test(k))
      .map(([, v]) => v)
      .join("\n")}\n이 기록은 파일로 공유하며 샘보드에 자동 게시되지 않습니다.`;
    download("샘보드-공유용-탐구기록.txt", text);
  };
  const noteInput = (k: string, label: string, placeholder = "") => (
    <label className="field">
      {label}
      <input
        value={state.notes[k] || ""}
        onChange={(e) => setNote(k, e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
  return (
    <div className={`app font-${state.fontSize}`}>
      <a className="skip-link" href="#activity">
        활동으로 바로 가기
      </a>
      <header className="topbar">
        <button className="brand" onClick={() => patch({ home: true })}>
          <span className="brand-mark">
            <Sparkles size={22} />
          </span>
          <span>
            <b>별빛 탐구실</b>
            <small>예상 · 관찰 · 설명</small>
          </span>
        </button>
        <div className="top-actions">
          <span className="save-status">
            <span className="status-dot" />
            {saveStatus}
          </span>
          <div className="font-switch" aria-label="글자 크기">
            {(["small", "normal", "large"] as const).map((v, i) => (
              <button
                key={v}
                aria-label={`글자 ${["작게", "보통", "크게"][i]}`}
                aria-pressed={state.fontSize === v}
                onClick={() => patch({ fontSize: v })}
              >
                가
              </button>
            ))}
          </div>
          <button
            className="icon-button"
            aria-label="도움말"
            onClick={() => setPanel("help")}
          >
            <HelpCircle size={20} />
          </button>
          <button
            className="teacher-button"
            onClick={() => setPanel("teacher")}
          >
            <Settings2 size={17} />
            교사용 안내
          </button>
        </div>
      </header>
      <nav className="lesson-nav" aria-label="차시 선택">
        <div className="lesson-links">
          {([3, 4, 5] as const).map((l) => (
            <button
              className={!state.home && state.lesson === l ? "active" : ""}
              key={l}
              onClick={() => go(l)}
            >
              <span>{l}차시</span>
              <span>{lessons[l].title}</span>
              {state.completed.filter((v) => v.startsWith(`${l}-`)).length ===
                5 && <Check size={16} />}
            </button>
          ))}
        </div>
        <div className="quick-links">
          <button onClick={() => openHardware()}>
            <Wrench size={16} />
            장비 사용 설명서
          </button>
          <button onClick={() => setPanel("ezon")}>
            <Usb size={16} />
            이지온 측정 안내
          </button>
          <button onClick={() => setPanel("resources")}>
            <BookOpen size={16} />
            학습 자료
          </button>
          <button onClick={() => setPanel("records")}>
            <NotebookPen size={16} />
            나의 기록
          </button>
        </div>
      </nav>
      {state.runs.some((r) => r.mode === "practice") && (
        <div className="practice-banner">
          ◈ 연습 데이터 포함 · 실제 측정 결과와 구분하여 표시·내보내기합니다.
        </div>
      )}
      {state.home ? (
        <main id="activity" className="home-main">
          <section className="hero">
            <SmartImage
              className="hero-art"
              src="/assets/astronomy/hero-star-inquiry.png"
              width="1672"
              height="941"
              alt=""
              loading="eager"
              fetchPriority="high"
            />
            <div className="hero-overlay" />
            <div className="hero-content">
              <div className="eyebrow">
                <span className="mini-star">✦</span> 별빛 탐구실 · 별과 우주
                탐구
              </div>
              <h1>
                별빛의 거리를 <span>재다</span>
              </h1>
              <p className="hero-description">
                예상하고, 측정하고, 별의 밝기를 설명하는 3~5차시 탐구
              </p>
              <p className="hero-question">
                같은 빛도 멀어지면 어두워질까? 우리의 실험에서 별의 비밀을
                찾아보세요.
              </p>
              <div className="button-row">
                <button
                  className="primary hero-cta"
                  onClick={() => go(state.lesson, state.step)}
                >
                  {state.completed.length ? "이어서 탐구하기" : "탐구 시작하기"}
                  <ArrowRight size={18} />
                </button>
                <button className="hero-demo" onClick={practice}>
                  <PlayIcon />
                  연습 데이터로 체험
                </button>
              </div>
              <div className="hero-meta">
                <span>
                  <Monitor size={14} />
                  장비 없이도 체험 가능
                </span>
                <span>3개 차시 · 각 45분</span>
              </div>
            </div>
            <span className="hero-caption">
              별지도를 모티프로 한 설명용 그림
            </span>
          </section>
          <section className="journey">
            <div className="section-heading">
              <div>
                <div className="eyebrow">탐구의 흐름</div>
                <h2>생각에서 시작해, 근거로 설명하기</h2>
              </div>
              <span className="muted">예상 → 관찰 → 설명</span>
            </div>
            <div className="journey-grid">
              {([3, 4, 5] as const).map((l, i) => {
                const Icon = [NotebookPen, FlaskConical, Orbit][i];
                return (
                  <button
                    key={l}
                    className="journey-card"
                    onClick={() => go(l)}
                  >
                    <div className="journey-top">
                      <span className="journey-icon">
                        <Icon size={23} />
                      </span>
                      <span className="lesson-number">0{i + 1}</span>
                    </div>
                    <span className="eyebrow">
                      {l}차시 · {lessons[l].poe}
                    </span>
                    <h3>{lessons[l].title}</h3>
                    <p>{lessons[l].description}</p>
                    <div className="journey-bottom">
                      <span>5개 활동 · 45분</span>
                      <ArrowRight size={18} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
          <HardwareEntry onOpen={() => openHardware()} />
          <EzOnEntry onOpen={() => setPanel("ezon")} />
          <section className="home-note">
            <a
              href="https://nc1395.labbitory.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              1~2차시 다시 보기 ↗
            </a>
          </section>
        </main>
      ) : (
        <>
          <nav className="step-nav" aria-label="활동 단계">
            {lesson.steps.map((s, i) => (
              <button
                key={s}
                className={state.step === i ? "current" : ""}
                aria-current={state.step === i ? "step" : undefined}
                onClick={() => {
                  if (state.lesson === 3 && i > 1 && !state.prediction) {
                    setToast("먼저 나의 예상과 이유를 저장하세요.");
                    go(3, 1);
                  } else go(state.lesson, i);
                }}
              >
                <span className="step-circle">
                  {state.completed.includes(`${state.lesson}-${i}`) ? (
                    <Check size={14} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span>{s}</span>
              </button>
            ))}
          </nav>
          <main id="activity" className="activity-main">
            <div className="activity-heading">
              <div>
                <div className="eyebrow">
                  {state.lesson}차시 / {lesson.poe}
                </div>
                <h1 ref={heading} tabIndex={-1}>
                  {lesson.steps[state.step]}
                </h1>
              </div>
              <span className="time-chip">◷ {lesson.times[state.step]}분</span>
            </div>
            {state.lesson === 4 ? (
              <Measurement
                onOpenHardware={openHardware}
                onOpenEzOn={() => setPanel("ezon")}
                step={state.step}
                state={state}
                setNote={setNote}
                setRuns={(runs, active) =>
                  setState((s) => ({
                    ...s,
                    runs,
                    activeRunId: active ?? s.activeRunId,
                  }))
                }
                setMode={(mode) => patch({ mode })}
                prediction={state.prediction}
              />
            ) : (
              <Learning
                onOpenHardware={openHardware}
                lesson={state.lesson}
                step={state.step}
                notes={state.notes}
                setNote={setNote}
                prediction={state.prediction}
                onPrediction={onPrediction}
                run={activeRun}
                reveal={state.reveal}
              />
            )}
          </main>
          <footer className="step-footer">
            <button
              disabled={state.lesson === 3 && state.step === 0}
              onClick={() =>
                state.step > 0
                  ? go(state.lesson, state.step - 1)
                  : go((state.lesson - 1) as 3 | 4, 4)
              }
            >
              <ArrowLeft size={16} />
              이전
            </button>
            <span>
              <strong>{state.step + 1}</strong> / 5{" "}
              <span className="footer-stage">· {lesson.steps[state.step]}</span>
            </span>
            <button className="primary" onClick={next}>
              {state.lesson === 5 && state.step === 4 ? "탐구 마무리" : "다음"}
              <ArrowRight size={16} />
            </button>
          </footer>
        </>
      )}
      <footer className="site-footer">
        <span>
          별빛 탐구실 <span className="footer-dot">✦</span> 별빛의 거리를 재다
        </span>
        <span>
          기록은 이 브라우저에 저장됩니다. 다른 기기에는 기록 파일로 옮겨
          주세요.
        </span>
      </footer>
      <dialog
        ref={dialog}
        className="panel"
        aria-labelledby="panel-title"
        onCancel={() => setPanel(null)}
      >
        <div className="panel-header">
          <h2 id="panel-title">
            {panel === "hardware"
              ? "실험 장비 사용 설명서"
              : panel === "ezon"
                ? "이지온으로 측정하기"
                : panel === "teacher"
                  ? "교사용 안내"
                  : panel === "resources"
                    ? "학습 자료 모음"
                    : panel === "records"
                      ? "우리의 탐구 기록"
                      : "탐구 도움말"}
          </h2>
          <button
            className="icon-button"
            aria-label="패널 닫기"
            onClick={() => setPanel(null)}
          >
            <X />
          </button>
        </div>
        <div className="panel-body">
          {panel === "hardware" && (
            <HardwareManual
              notes={state.notes}
              setNote={setNote}
              initialStep={hardwareStep}
              onOpenCarCode={() => {
                setPanel(null);
                go(4, 1);
              }}
            />
          )}
          {panel === "ezon" && <EzOnGuide />}
          {panel === "help" && (
            <>
              <h3>예상 → 관찰 → 설명</h3>
              <ol className="help-steps">
                <li>3차시에서 처음 생각과 그래프를 저장해요.</li>
                <li>
                  4차시에서 이지온으로 측정하고, 내려받은 파일을 가져와
                  비교해요.
                </li>
                <li>5차시에서 별의 등급을 탐구하고 보고서를 저장해요.</li>
              </ol>
              <p>
                처음 예상은 수정하지 않고 보존합니다. 관찰 후 설명에 달라진
                생각을 기록하세요.
              </p>
              <h3>기록은 어디에 있나요?</h3>
              <p>
                이 기기의 이 브라우저에만 저장됩니다. 시크릿 모드 종료나
                브라우저 데이터 삭제 시 사라질 수 있으니 JSON 백업을 저장하세요.
                모둠 간에는 파일로 공유합니다.
              </p>
              <h3>장비가 없나요?</h3>
              <button
                className="primary"
                onClick={() => {
                  practice();
                  setPanel(null);
                }}
              >
                연습 데이터로 체험하기
              </button>
            </>
          )}
          {(panel === "records" || panel === "teacher") && (
            <>
              <div className="notice">
                {practiceLabel(state.runs)} · 자동 클라우드 동기화 없음
              </div>
              <h3>모둠 정보</h3>
              <div className="grid-2">
                {noteInput("classCode", "수업 코드", "예: 3학년-별빛")}
                {noteInput("group", "모둠 별칭", "예: 북두칠성")}
                {["실험", "자동차", "기록", "분석"].map((r, i) => (
                  <div key={r}>{noteInput(`role${i}`, `${r} 담당 (별칭)`)}</div>
                ))}
              </div>
              <h3>개인의 최초 예상</h3>
              {state.predictions.length ? (
                state.predictions.map((p, i) => (
                  <blockquote key={i}>
                    <strong>{p.author}</strong>
                    <p>{p.reason}</p>
                    <small>
                      {new Date(p.savedAt).toLocaleString("ko-KR")} · 원본 보존
                    </small>
                  </blockquote>
                ))
              ) : (
                <p>3차시에서 최초 예상을 저장해 주세요.</p>
              )}
              {state.prediction && (
                <button
                  onClick={() => {
                    patch({
                      prediction: null,
                      notes: {
                        ...state.notes,
                        predictionAuthor: "",
                        predictionReason: "",
                        predictionPoint0: "100",
                        predictionPoint1: "80",
                        predictionPoint2: "60",
                        predictionPoint3: "40",
                        predictionPoint4: "20",
                      },
                    });
                    setPanel(null);
                    go(3, 1);
                  }}
                >
                  다른 구성원의 예상 추가하기
                </button>
              )}
              <div className="button-row">
                <button className="primary" onClick={backup}>
                  <Download size={16} />
                  기록 파일 저장 (JSON)
                </button>
                <label className="file-button">
                  <Upload size={16} />
                  기록 파일 불러오기
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) void restore(e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  onClick={() => {
                    setReport(true);
                    setPanel(null);
                  }}
                >
                  인쇄용 탐구 보고서
                </button>
                <button onClick={shareText}>샘보드 공유용 텍스트</button>
              </div>
              {state.runs.map((r) => (
                <p key={r.id}>
                  {r.mode === "practice" ? "[연습 데이터] " : ""}
                  {r.name} · {r.samples.length}개{" "}
                  <button
                    onClick={() =>
                      download(
                        `${r.mode === "practice" ? "연습데이터-" : ""}${r.name}.csv`,
                        exportCsv(r),
                        "text/csv;charset=utf-8",
                      )
                    }
                  >
                    CSV 저장
                  </button>
                </p>
              ))}
            </>
          )}
          {panel === "teacher" && (
            <>
              <p className="notice">
                교사용 패널은 인증·보안 기능이 아닙니다. 학생도 열 수 있습니다.
              </p>
              <h3>학습 흐름 조절</h3>
              <label className="check">
                <input
                  type="checkbox"
                  checked={state.reveal}
                  onChange={(e) => patch({ reveal: e.target.checked })}
                />
                형성평가 피드백 공개 허용
              </label>
              <p>
                정답은 학생이 응답을 제출한 뒤 피드백과 함께 제공합니다. 처음
                예상은 공개 여부와 관계없이 먼저 기록합니다.
              </p>
              <div className="button-row">
                {([3, 4, 5] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      go(l);
                      setPanel(null);
                    }}
                  >
                    {l}차시로 이동
                  </button>
                ))}
                <button onClick={practice}>연습 데이터 생성</button>
              </div>
              <h3>45분 수업 운영</h3>
              {([3, 4, 5] as const).map((l) => (
                <p key={l}>
                  <strong>
                    {l}차시 · {lessons[l].title}
                  </strong>
                  <br />
                  {lessons[l].steps
                    .map((v, i) => `${v} ${lessons[l].times[i]}분`)
                    .join(" → ")}
                </p>
              ))}
              <h3>오개념을 되묻기</h3>
              <ul>
                <li>“밝으면 가깝다” → 광원 자체의 빛도 같을까요?</li>
                <li>
                  “255는 속력이다” → 줄자와 시계로 실제 이동을 확인했나요?
                </li>
                <li>“5등급은 5배” → 등급은 일정한 비로 달라집니다.</li>
                <li>“절대 등급은 10광년” → 기준은 10pc, 약 32.6광년입니다.</li>
              </ul>
              <Resources notes={state.notes} setNote={setNote} teacher />
            </>
          )}
          {panel === "resources" && (
            <Resources notes={state.notes} setNote={setNote} teacher={false} />
          )}
        </div>
      </dialog>
      {report && (
        <div className="report-overlay">
          <div className="report-toolbar">
            <button onClick={() => window.print()}>
              보고서 인쇄 / PDF 저장
            </button>
            <button onClick={() => setReport(false)}>닫기</button>
          </div>
          <article className="print-report">
            <h1>별빛의 거리를 재다</h1>
            <p>3~5차시 통합 탐구 보고서 · {practiceLabel(state.runs)}</p>
            <p>
              수업 코드: {state.notes.classCode || "-"} · 모둠:{" "}
              {state.notes.group || "-"}
            </p>
            <h2>1. 최초 예상 (수정 전 기록)</h2>
            {state.predictions.map((p, i) => (
              <section key={i}>
                <h3>{p.author}</h3>
                <p>{p.reason}</p>
                <p>
                  {p.points
                    .map((v) => `거리 ${v.x}배: 밝기 ${v.y}%`)
                    .join(" / ")}
                </p>
              </section>
            ))}
            <h2>2. 설계·관찰·설명·성찰 기록</h2>
            {Object.entries(state.notes)
              .filter(
                ([key, value]) =>
                  value.trim() &&
                  !/^(?:design\.(?:question|ambientPlan|speedPlan|errors|startDistance|travelDistance|interval|repeats)$|designReflection$|safety\d|designCheck\d|car\.check\.|hardware\.check\.|hardware\.codeLoaded$)|^resource\..*\.complete$/.test(
                    key,
                  ),
              )
              .map(([k, v]) => (
                <p key={k}>
                  <strong>{reportLabel(k)}</strong>: {learningNoteValue(k, v)}
                </p>
              ))}
            <h2>3. 실험 원본과 분석</h2>
            {state.runs.map((r) => (
              <section key={r.id}>
                <h3>
                  {r.mode === "practice" ? "[연습 데이터] " : ""}
                  {r.name}
                </h3>
                <p>
                  주변 빛의 값 {r.ambient} / 처음 거리 {r.startDistance}cm /
                  속력 {r.speed ?? "아직 측정하지 않음"}cm/s / 출발 시각{" "}
                  {r.startTime ?? "아직 기록하지 않음"}s / 단위 {r.unit}
                </p>
                <DataChart run={r} />
                <DataChart
                  run={r}
                  analysis
                  prediction={state.prediction}
                  referenceId={
                    state.notes["reference-" + r.id] ||
                    r.samples.find(
                      (s) =>
                        (corrected(s, r) ?? 0) > 0 &&
                        !s.excluded &&
                        !s.saturated &&
                        (distanceFor(s, r) ?? 0) > 0,
                    )?.id
                  }
                />
                <h4>기준 밝기와 비교한 결과</h4>
                <p>
                  선택 기준점:{" "}
                  {state.notes["reference-" + r.id] || "첫 유효 거리·밝기 점"}
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>거리 cm</th>
                      <th>상대 밝기</th>
                      <th>이론</th>
                      <th>상대 등급 변화</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalize(
                      r,
                      state.notes["reference-" + r.id] ||
                        r.samples.find(
                          (s) =>
                            (corrected(s, r) ?? 0) > 0 &&
                            !s.excluded &&
                            !s.saturated &&
                            (distanceFor(s, r) ?? 0) > 0,
                        )?.id ||
                        "",
                    ).map((p) => (
                      <tr key={p.id}>
                        <td>{p.distance.toFixed(2)}</td>
                        <td>{p.relative.toFixed(4)}</td>
                        <td>{p.theory.toFixed(4)}</td>
                        <td>
                          {p.deltaMagnitude?.toFixed(3) ??
                            "등급으로 바꿀 수 없는 값"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h4>원본 데이터</h4>
                <table>
                  <thead>
                    <tr>
                      <th>시간 s</th>
                      <th>거리 cm</th>
                      <th>원본</th>
                      <th>보정</th>
                      <th>상태·제외 사유</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.samples.map((s) => (
                      <tr key={s.id}>
                        <td>{s.t.toFixed(2)}</td>
                        <td>{distanceFor(s, r)?.toFixed(2) ?? "-"}</td>
                        <td>{s.raw ?? "누락"}</td>
                        <td>{corrected(s, r)?.toFixed(2) ?? "-"}</td>
                        <td>
                          {s.saturated ? "포화 " : ""}
                          {s.excluded ||
                            ((corrected(s, r) ?? 0) <= 0 ? "계산 제외" : "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
            <p>연습 데이터와 실제 측정값은 구분해서 사용하세요.</p>
          </article>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
function PlayIcon() {
  return <span className="play-outline">▷</span>;
}
function reportLabel(key: string) {
  const names: Record<string, string> = {
    classCode: "수업 코드",
    group: "모둠",
    explainCompare: "예상과 관찰 비교",
    explainEvidence: "관찰 후 설명과 근거",
    explainError: "오차 원인",
    explainImprove: "개선 계획",
    motionEvidence: "거리 표식과 운동 구간",
    ambient: "주변광",
    startDistance: "시작 거리",
  };
  if (NOTE_LABELS[key]) return NOTE_LABELS[key];
  if (key.startsWith("resource.")) {
    const [, id, part] = key.split(".");
    return (
      (resources.find((r) => r.id === id)?.title || "자료") +
      " · " +
      ((
        {
          observation: "관찰",
          complete: "직접 완료",
          url: "링크",
          hidden: "숨김",
        } as Record<string, string>
      )[part] || part)
    );
  }
  return (
    names[key] ||
    (
      {
        explainAuthor: "설명 작성자",
        explanationRecords: "작성자별 보존 설명",
        uniform: "등속 조건 확인",
        "ezon.range": "이지온 측정 범위",
        "ezon.ledOnValue": "LED를 켠 시작 자리의 값",
        reflectionAuthor: "성찰 작성자",
      } as Record<string, string>
    )[key] ||
    key
  );
}
