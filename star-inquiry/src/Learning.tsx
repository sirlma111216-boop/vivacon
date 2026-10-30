import type { ReactNode } from "react";
import {
  canConvertMagnitude,
  corrected,
  distanceFor,
  magnitudeDelta,
  validSamples,
  type Run,
} from "./domain";
import { DataChart } from "./DataChart";
import { SmartImage } from "./SmartImage";
import { LightExplanation } from "./LightExplanation";
import { resources, safeExternalUrl } from "./Resources";
import "./learning.css";

export type Prediction = {
  author: string;
  reason: string;
  points: { x: number; y: number }[];
  savedAt: string;
};

type LearningProps = {
  onOpenHardware: (step?: number) => void;
  lesson: 3 | 5;
  step: number;
  notes: Record<string, string>;
  setNote: (key: string, value: string) => void;
  prediction: Prediction | null;
  onPrediction: (prediction: Prediction) => void;
  run: Run | null;
  reveal: boolean;
};

function Header({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="learning-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
}

function parseRecord(value?: string): Record<string, string> | null {
  if (!value) return null;
  try {
    const item = JSON.parse(value);
    return item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      Object.values(item).every((v) => typeof v === "string")
      ? item
      : null;
  } catch {
    return null;
  }
}

function DiagramFrame({
  children,
  label,
  kind = "",
}: {
  children: ReactNode;
  label: string;
  kind?: string;
}) {
  return (
    <div className={`diagram-frame ${kind}`}>
      <div
        className="diagram-scroll"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {children}
      </div>
      <p className="diagram-scroll-hint">
        그림을 좌우로 밀어 축과 설명을 확인하세요.
      </p>
    </div>
  );
}

export function ExperimentPlanDiagram() {
  return (
    <div className="experiment-plan-diagram">
      <DiagramFrame
        label="센서는 그대로 두고 LED 자동차만 멀어지는 실험 계획"
        kind="equipment-frame"
      >
        <svg
          className="equipment-diagram"
          viewBox="0 0 720 200"
          role="img"
          aria-label="왼쪽 센서는 고정하고, 오른쪽 자동차는 센서에서 멀어집니다. 자동차 뒤의 LED는 계속 센서를 향합니다. 처음 거리는 센서에서 LED까지 직접 잽니다."
        >
          <defs>
            <marker
              id="plan-move-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0 0 L6 3 L0 6" fill="#f8c84d" />
            </marker>
            <marker
              id="plan-light-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0 0 L6 3 L0 6" fill="#93c5fd" />
            </marker>
          </defs>
          <path d="M55 130 H665" stroke="#64748b" strokeWidth="2" />
          <rect
            x="55"
            y="70"
            width="80"
            height="55"
            rx="10"
            fill="#1d2c50"
            stroke="#93c5fd"
            strokeWidth="2"
          />
          <circle cx="125" cy="90" r="8" fill="#93c5fd" />
          <text x="95" y="48" textAnchor="middle">
            고정 센서
          </text>
          <rect
            x="410"
            y="85"
            width="95"
            height="34"
            rx="10"
            fill="#334155"
            stroke="#f8c84d"
            strokeWidth="2"
          />
          <circle cx="430" cy="123" r="9" fill="#94a3b8" />
          <circle cx="485" cy="123" r="9" fill="#94a3b8" />
          <rect x="410" y="75" width="16" height="22" rx="3" fill="#f8c84d" />
          <text x="460" y="55" textAnchor="middle">
            LED 자동차
          </text>
          <path
            d="M400 90 H155"
            stroke="#93c5fd"
            strokeWidth="2"
            strokeDasharray="6 5"
            markerEnd="url(#plan-light-arrow)"
          />
          <text x="275" y="68" textAnchor="middle">
            빛은 센서 쪽으로
          </text>
          <path
            d="M530 97 H650"
            stroke="#f8c84d"
            strokeWidth="3"
            markerEnd="url(#plan-move-arrow)"
          />
          <text x="590" y="72" textAnchor="middle">
            이동 방향
          </text>
          <path
            d="M135 151 H410 M135 145 V157 M410 145 V157"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <text x="273" y="183" textAnchor="middle">
            처음 거리: 직접 재기
          </text>
        </svg>
      </DiagramFrame>
    </div>
  );
}

function StellarIntro({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`stellar-intro ${compact ? "compact" : ""}`}>
      <div>
        <span className="eyebrow">5차시 · 별의 밝기 설명하기</span>
        <h2>별의 밝기를 등급으로 읽다</h2>
        <p>측정한 밝기에서 겉보기 등급과 절대 등급까지</p>
      </div>
      <SmartImage
        src="/assets/astronomy/lesson5-stellar-magnitude.png"
        width="1672"
        height="941"
        loading="lazy"
        alt=""
      />
      <small>별빛을 표현한 설명용 그림</small>
    </section>
  );
}

function PredictionGraph({ points }: { points: { x: number; y: number }[] }) {
  const pointString = points
    .map((p) => `${65 + (p.x - 1) * 120},${270 - p.y * 2.1}`)
    .join(" ");
  return (
    <DiagramFrame label="거리와 밝기 예상 그래프" kind="prediction-frame">
      <svg
        className="prediction-graph"
        viewBox="0 0 610 325"
        role="img"
        aria-label={`거리별 예상 밝기: ${points.map((p) => `${p.x}배에서 ${p.y}%`).join(", ")}`}
      >
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1="65"
              y1={270 - v * 2.1}
              x2="545"
              y2={270 - v * 2.1}
              stroke="#2c3757"
              strokeDasharray={v === 0 ? undefined : "3 5"}
            />
            <text x="53" y={275 - v * 2.1} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <line x1="65" y1="50" x2="65" y2="270" stroke="#94a3b8" />
        <line x1="65" y1="270" x2="555" y2="270" stroke="#94a3b8" />
        <text x="65" y="27">
          예상 밝기 (처음 = 100)
        </text>
        <text x="545" y="317" textAnchor="end">
          거리 (시작 거리의 배수)
        </text>
        {points.map((p) => (
          <text key={p.x} x={65 + (p.x - 1) * 120} y="292" textAnchor="middle">
            {p.x}배
          </text>
        ))}
        <polyline
          points={pointString}
          fill="none"
          stroke="#f8c84d"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <circle
            key={p.x}
            cx={65 + (p.x - 1) * 120}
            cy={270 - p.y * 2.1}
            r="6"
            fill="#f8c84d"
            stroke="#111833"
            strokeWidth="2"
          />
        ))}
      </svg>
    </DiagramFrame>
  );
}

const designFields: [string, string, string][] = [
  [
    "hypothesis",
    "멀어지면 밝기는 어떻게 달라질까요?",
    "우리 모둠의 예상을 한 문장으로 적어요.",
  ],
  [
    "control",
    "공정하게 비교하려면 무엇을 같게 할까요?",
    "같게 유지할 조건을 1~2개만 적어요.",
  ],
];

const checks = [
  "자동차가 센서에서 멀어지도록 배치했다.",
  "이동 중에도 LED는 센서를 향한다.",
  "시작 거리가 0보다 크다.",
  "주변광을 따로 측정할 계획이 있다.",
  "실제 속력과 주행 시작 시점을 확인할 계획이 있다.",
  "같은 조건으로 반복 측정할 계획이 있다.",
];

const quiz = [
  {
    question: "겉보기 등급이 1인 별과 6인 별 중 더 밝게 보이는 별은?",
    choices: ["1등급인 별", "6등급인 별", "숫자만으로 비교할 수 없다"],
    correct: 0,
    feedback: [
      "맞아요. 같은 종류의 등급에서는 숫자가 작을수록 밝아요.",
      "등급은 숫자가 커질수록 어두워져요. 1등급이 6등급보다 밝게 보입니다.",
      "겉보기 등급은 지구에서 보이는 별의 밝기를 숫자로 나타낸 것이에요. 1등급이 더 밝습니다.",
    ],
  },
  {
    question: "5등급 차이는 밝기 몇 배 차이일까요?",
    choices: ["5배", "약 12.5배", "정확히 100배"],
    correct: 2,
    feedback: [
      "등급 차이가 5라고 밝기 차이도 5배인 것은 아니에요. 5등급 차이는 100배입니다.",
      "한 등급 차이마다 약 2.512배를 다시 곱해요. 5등급 차이에서는 100배가 됩니다.",
      "맞아요. 한 등급의 비는 약 2.512배, 5등급의 비는 정확히 100배예요.",
    ],
  },
  {
    question: "빛이 고르게 퍼지는 모형에서, 같은 광원이 10배 멀어지면?",
    choices: [
      "밝기 1/10, 1등급 어두워짐",
      "밝기 1/100, 5등급 어두워짐",
      "밝기 1/100, 5등급 밝아짐",
    ],
    correct: 1,
    feedback: [
      "밝기는 거리의 제곱에 반비례해요. 거리가 10배면 밝기는 10×10, 즉 100으로 나눈 만큼이 됩니다.",
      "맞아요. 빛이 받는 면적에 퍼지므로 밝기는 1/100, 등급은 5만큼 커져요.",
      "밝기가 작아지면 더 어두워지고 등급 숫자는 커져요. +5는 5등급 어두워졌다는 뜻입니다.",
    ],
  },
  {
    question: "별을 모두 10pc에 놓았다고 생각하는 까닭은?",
    choices: [
      "거리의 영향을 같게 하여 별 자체의 밝기를 비교하려고",
      "모든 별의 실제 거리가 10pc이기 때문에",
      "10pc가 10광년과 같기 때문에",
    ],
    correct: 0,
    feedback: [
      "맞아요. 절대 등급은 거리를 10pc로 통일해 비교하는 약속이에요.",
      "별의 실제 거리는 서로 달라요. 10pc는 비교를 위해 정한 공통 거리입니다.",
      "pc와 광년은 다른 거리 단위예요. 10pc는 약 32.6광년입니다.",
    ],
  },
];

/** Human-readable labels shared with the printable report. */
export const NOTE_LABELS: Record<string, string> = {
  connection: "앞선 수업과 연결한 생각",
  predictionAuthor: "예상 작성자 (초안)",
  predictionReason: "예상 근거 (초안)",
  theoryDistance: "빛 퍼짐 모형에서 선택한 거리 배수",
  theoryObservation: "이론 모형을 탐구한 뒤 달라진 생각",
  ...Object.fromEntries(
    designFields.map(([key, label]) => [`design.${key}`, label]),
  ),
  "design.startDistance": "설계한 시작 거리 (cm)",
  "design.travelDistance": "설계한 이동 구간 (cm)",
  "design.interval": "설계한 측정 간격 (초)",
  "design.repeats": "계획한 반복 횟수",
  ...Object.fromEntries(
    checks.map((label, i) => [`designCheck${i}`, `설계 점검: ${label}`]),
  ),
  ...Object.fromEntries(
    [1, 2, 3, 4, 5].map((d, i) => [
      `predictionPoint${i}`,
      `예상 초안: 거리 ${d}배의 밝기 (%)`,
    ]),
  ),
  designReflection: "예상과 다른 실험 결과의 의미",
  magnitudeIntro: "밝기 차이를 표현하는 약속에 대한 생각",
  magnitudeGuess: "1등급과 6등급의 밝기 비 예상 (초안)",
  magnitudeReason: "등급 예상의 근거 (초안)",
  magnitudePrediction: "보존된 등급–밝기 비 최초 예상",
  gradeA: "비교 모형: 별 A의 등급",
  gradeB: "비교 모형: 별 B의 등급",
  magnitudeObservation: "등급 가상실험 관찰",
  magnitudeExplanation: "등급 차이와 밝기 비 설명",
  magnitudeExternalDone: "등급 가상실험 직접 완료 표시",
  magnitudeReference: "상대 등급 기준점의 기록 ID",
  magnitudeTarget: "상대 등급 비교점의 기록 ID",
  modelBrightness: "이상적 모형에서 선택한 밝기 비",
  relativeMagnitudeExplanation: "기준 대비 상대 등급 변화 설명",
  absolutePrediction: "보존된 같은 거리 비교 최초 예상",
  absoluteGuess: "같은 거리 비교 예상과 이유 (초안)",
  starDistance: "가상 별까지의 거리 (pc)",
  absoluteGrade: "가상 별의 절대 등급",
  absoluteObservation: "10pc에서 비교한 관찰",
  absoluteExplanation: "절대 등급이 필요한 이유",
  absoluteExternalDone: "겉보기·절대 등급 활동 직접 완료 표시",
  ...Object.fromEntries(
    quiz.map((q, i) => [`quiz${i}`, `형성평가 ${i + 1}: ${q.question}`]),
  ),
  quizSubmitted: "형성평가 응답 제출",
  reflectionAuthor: "최종 설명 작성자 별칭",
  reflectionBefore: "처음에는 이렇게 생각했다",
  reflectionObserved: "실험과 가상실험에서 관찰했다",
  reflectionAfter: "이제는 근거를 들어 이렇게 설명한다",
  explainAuthor: "관찰 후 설명 작성자 별칭",
  explanationRecords: "작성자별 보존된 관찰 후 설명",
};

/** Values stay unchanged in JSON; this only formats the visible/printed report. */
export function learningNoteValue(key: string, value: string): string {
  if (key === "explanationRecords") {
    try {
      const records = JSON.parse(value);
      if (Array.isArray(records))
        return records
          .filter(
            (r) =>
              r &&
              typeof r === "object" &&
              typeof r.author === "string" &&
              typeof r.evidence === "string",
          )
          .map(
            (r) =>
              `${r.author} · ${r.mode === "practice" ? "연습 데이터" : "직접 입력·센서 기록"}\n예상과 관찰 비교: ${typeof r.compare === "string" ? r.compare : ""}\n근거를 든 설명: ${r.evidence}\n오차: ${typeof r.error === "string" ? r.error : ""}\n개선: ${typeof r.improve === "string" ? r.improve : ""}\n저장: ${typeof r.savedAt === "string" ? new Date(r.savedAt).toLocaleString("ko-KR") : ""}`,
          )
          .join("\n\n");
    } catch {}
    return value;
  }
  if (key === "magnitudePrediction" || key === "absolutePrediction") {
    const record = parseRecord(value);
    if (!record) return value;
    return `${record.guess || ""}${key === "magnitudePrediction" ? "배" : ""}${record.reason ? ` · 근거: ${record.reason}` : ""}${record.savedAt ? ` · 저장: ${new Date(record.savedAt).toLocaleString("ko-KR")}` : ""}`;
  }
  const q = /^quiz([0-3])$/.exec(key);
  if (q) return quiz[Number(q[1])].choices[Number(value)] ?? value;
  if (
    /^designCheck\d$/.test(key) ||
    ["magnitudeExternalDone", "absoluteExternalDone", "quizSubmitted"].includes(
      key,
    )
  )
    return value === "yes" ? "직접 확인함" : "아직 확인하지 않음";
  return value;
}

export function Learning({
  lesson,
  step,
  notes,
  setNote,
  prediction,
  onPrediction,
  run,
  reveal,
}: LearningProps) {
  const text = (key: string, label: string, placeholder = "", rows = 3) => (
    <label className="field">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={notes[key] || ""}
        onChange={(e) => setNote(key, e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
  const input = (
    key: string,
    label: string,
    placeholder = "",
    type = "text",
    min?: number,
  ) => (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        min={min}
        step={type === "number" ? "any" : undefined}
        value={notes[key] || ""}
        onChange={(e) => setNote(key, e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
  const simulationUrl =
    notes["resource.simulation.url"] ??
    resources.find((r) => r.id === "simulation")!.url;
  const externalActivity =
    notes["resource.simulation.hidden"] === "true" ? (
      <p className="notice">이 수업에서는 아래의 모형으로 활동합니다.</p>
    ) : (
      <div className="external-activity">
        {safeExternalUrl(simulationUrl) ? (
          <a
            className="secondary"
            href={simulationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            비바샘에서 더 살펴보기 ↗
          </a>
        ) : (
          <span className="notice">
            외부 자료 주소를 교사에게 확인해 주세요.
          </span>
        )}
        <p className="muted">선택 자료 · 새 탭에서 열립니다.</p>
      </div>
    );

  if (lesson === 3 && step === 0)
    return (
      <div className="learning-section">
        <Header
          eyebrow="앞선 수업 떠올리기 · 5분"
          title="밝게 보인다는 건, 무엇일까?"
        >
          천상열차분야지도의 별 표현과 밝기 등급을 떠올려 봅시다.
        </Header>
        <div className="question-callout">
          별이 밝게 보이는 까닭은{" "}
          <strong>빛을 많이 내기 때문일까, 우리에게 가깝기 때문일까?</strong>
        </div>
        <div className="grid-2">
          <article className="concept-tile">
            <span className="concept-number">01</span>
            <h3>빛을 내는 물체, 광원</h3>
            <p>같은 거리에 있어도, 빛을 더 많이 내는 광원이 밝게 보여요.</p>
          </article>
          <article className="concept-tile">
            <span className="concept-number">02</span>
            <h3>광원까지의 거리</h3>
            <p>같은 광원도 관찰하는 위치가 달라지면 밝기가 달라져요.</p>
          </article>
        </div>
        {text(
          "connection",
          "두 까닭을 어떻게 구분해서 확인할 수 있을까요?",
          "앞선 수업에서 떠올린 생각을 자유롭게 적으세요.",
        )}
        <p className="notice">
          밝게 보인다는 사실 하나만으로 그 별이 가까운지 단정할 수는 없어요.
        </p>
        <section
          className="card lesson-video"
          aria-labelledby="flashlight-video-title"
        >
          <h3 id="flashlight-video-title">
            영상으로 살펴보기 · 손전등의 밝기 비교하기
          </h3>
          <video
            controls
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            playsInline
            preload="metadata"
            aria-label="비상교육 손전등의 밝기 비교하기 실험 영상"
            onContextMenu={(event) => event.preventDefault()}
          >
            <source
              src="/assets/videos/visang-flashlight-comparison.mp4"
              type="video/mp4"
            />
            이 브라우저에서는 영상을 재생할 수 없습니다.
          </video>
          <p className="muted">
            비상교육 · 중등 과학 3 · 손전등의 밝기 비교하기
          </p>
        </section>
      </div>
    );

  if (lesson === 3 && (step === 1 || (step === 2 && !prediction))) {
    const points =
      prediction?.points ||
      [1, 2, 3, 4, 5].map((x, i) => ({
        x,
        y: Number(notes[`predictionPoint${i}`] ?? [100, 80, 60, 40, 20][i]),
      }));
    const setPreset = (ys: number[]) =>
      ys.forEach((y, i) => setNote(`predictionPoint${i}`, String(y)));
    return (
      <div className="learning-section">
        <Header eyebrow="예상하기 · 8분" title="나의 예상 그래프">
          같은 LED가 일정한 속력으로 멀어지면 센서가 측정하는 밝기는 어떻게
          달라질까요?
        </Header>
        {step === 2 && (
          <p className="notice">
            모형을 보기 전에 여기서 예상 그래프와 까닭을 저장하세요.
          </p>
        )}
        <div className="grid-2 prediction-layout">
          <div className="plot-panel">
            <div className="plot-heading">
              <strong>거리–밝기 예상</strong>
              <span className="badge">
                {prediction ? "저장한 예상" : "실험 전 예상"}
              </span>
            </div>
            <PredictionGraph points={points} />
            <p className="muted">
              처음 밝기를 100으로 놓았을 때의 예상이에요. 아직 관찰한 결과는
              아닙니다.
            </p>
          </div>
          <div>
            {prediction ? (
              <div className="saved-prediction">
                <h3>저장한 예상</h3>
                <p>
                  <strong>{prediction.author}</strong>
                </p>
                <blockquote>{prediction.reason}</blockquote>
                <small>
                  {new Date(prediction.savedAt).toLocaleString("ko-KR")}
                </small>
              </div>
            ) : (
              <>
                <p>
                  모양을 고른 뒤 점의 높이를 직접 바꿔 보세요. 어느 모양도 정답
                  표시가 아닙니다.
                </p>
                <div className="preset-buttons">
                  <button onClick={() => setPreset([100, 80, 60, 40, 20])}>
                    고르게 감소
                  </button>
                  <button onClick={() => setPreset([100, 25, 11, 6, 4])}>
                    처음에 크게 감소
                  </button>
                  <button onClick={() => setPreset([100, 100, 100, 100, 100])}>
                    변화 없음
                  </button>
                </div>
                <div className="point-controls">
                  {points.map((p, i) => (
                    <label key={p.x}>
                      <span>{p.x}배 거리</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        aria-label={`${p.x}배 거리의 예상 밝기`}
                        value={p.y}
                        onChange={(e) =>
                          setNote(`predictionPoint${i}`, e.target.value)
                        }
                      />
                      <output>{p.y}</output>
                    </label>
                  ))}
                </div>
                {input(
                  "predictionAuthor",
                  "기록한 사람 또는 모둠 별칭",
                  "예: 분석 담당 / 은하 모둠",
                )}
                {text(
                  "predictionReason",
                  "이렇게 예상한 까닭 (필수)",
                  "빛이 퍼지는 모습이나 경험을 근거로 설명해 보세요.",
                )}
                <button
                  className="primary"
                  disabled={
                    !notes.predictionReason?.trim() ||
                    !notes.predictionAuthor?.trim()
                  }
                  onClick={() =>
                    onPrediction({
                      author: notes.predictionAuthor.trim(),
                      reason: notes.predictionReason.trim(),
                      points,
                      savedAt: new Date().toISOString(),
                    })
                  }
                >
                  예상 저장
                </button>
                <p className="muted">
                  실험 후와 비교할 수 있도록, 저장한 예상은 바꾸지 않습니다.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (lesson === 3 && step === 2) {
    const distance = Math.max(
      1,
      Math.min(10, Number(notes.theoryDistance || 2)),
    );
    const area = distance * distance;
    return (
      <div className="learning-section">
        <Header
          eyebrow="모형 관찰하기 · 8분"
          title="멀어질수록, 더 넓게 퍼지는 빛"
        >
          같은 양의 빛이 고르게 퍼진다고 생각해 봅시다. 거리를 바꾸며 한 칸이
          받는 빛의 양을 비교해 보세요.
        </Header>
        <div className="grid-2">
          <div className="light-model">
            <DiagramFrame label="거리에 따른 빛의 퍼짐 모형" kind="light-frame">
              <svg
                viewBox="0 0 540 290"
                role="img"
                aria-label={`거리 ${distance}배에서 빛을 받는 면적은 ${area}배, 단위 면적당 밝기는 ${area}분의 1입니다.`}
              >
                <circle cx="50" cy="145" r="15" fill="#f8c84d" />
                <path
                  d={`M65 145 L${160 + distance * 29} ${145 - distance * 11} L${160 + distance * 29} ${145 + distance * 11} Z`}
                  fill="#f8c84d"
                  fillOpacity=".10"
                  stroke="#f8c84d"
                />
                <rect
                  x={150 + distance * 29}
                  y={145 - distance * 11}
                  width="16"
                  height={distance * 22}
                  fill="#f8c84d"
                  fillOpacity=".4"
                />
                <line
                  x1="65"
                  y1="260"
                  x2={160 + distance * 29}
                  y2="260"
                  stroke="#93c5fd"
                />
                <text x="50" y="185" textAnchor="middle">
                  같은 광원
                </text>
                <text x="280" y="283" textAnchor="middle">
                  거리 {distance}배
                </text>
              </svg>
            </DiagramFrame>
          </div>
          <div>
            <label className="field">
              <span>
                거리를 바꿔 보세요 <strong>{distance}배</strong>
              </span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={distance}
                onChange={(e) => {
                  setNote("theoryDistance", e.target.value);
                  setNote("theoryExplored", "true");
                }}
              />
            </label>
            <div className="metric-pair">
              <div>
                <small>빛이 퍼지는 면적</small>
                <strong>
                  {area}
                  <span>배</span>
                </strong>
              </div>
              <div>
                <small>같은 크기 한 칸의 밝기</small>
                <strong>1/{area}</strong>
              </div>
            </div>
            <div
              className="light-grid"
              style={{
                gridTemplateColumns: `repeat(${distance},16px)`,
                gridAutoRows: "16px",
                width: "max-content",
                height: "auto",
              }}
              aria-label={`${area}개의 같은 면적에 나누어진 빛`}
            >
              {Array.from({ length: area }, (_, i) => (
                <span key={i} style={{ opacity: Math.max(0.18, 1 / area) }} />
              ))}
            </div>
            <p className="muted">
              같은 양의 빛을 더 넓은 면적이 나누어 받아요. 칸은 같은 크기의
              면적을 뜻하며 색의 진하기는 이해를 돕는 표현입니다.
            </p>
          </div>
        </div>
        <div className="ratio-strip">
          {[1, 2, 3, 10].map((d) => (
            <button
              key={d}
              className={distance === d ? "selected" : ""}
              onClick={() => {
                setNote("theoryDistance", String(d));
                setNote("theoryExplored", "true");
              }}
            >
              <span>거리 {d}배</span>
              <strong>{d === 1 ? "밝기 1" : `밝기 1/${d * d}`}</strong>
            </button>
          ))}
        </div>
        <p className="muted">
          거리 1배·2배·3배를 눌러 한 칸의 밝기를 비교한 뒤, 아래에서 이유를
          알아보세요.
        </p>
        <button
          className="primary"
          disabled={notes.theoryExplored !== "true"}
          onClick={() =>
            setNote(
              "theoryExplanationOpen",
              notes.theoryExplanationOpen === "true" ? "false" : "true",
            )
          }
          aria-expanded={notes.theoryExplanationOpen === "true"}
        >
          {notes.theoryExplanationOpen === "true"
            ? "설명 접기"
            : "왜 이렇게 될까? · 공식과 그림으로 정리"}
        </button>
        {notes.theoryExplored === "true" &&
          notes.theoryExplanationOpen === "true" && <LightExplanation />}
        {text(
          "theoryObservation",
          "처음 예상과 비교해 새로 알게 된 점",
          "예상 그래프와 모형이 어떻게 같거나 다른가요?",
        )}
      </div>
    );
  }

  if (lesson === 3 && step === 3)
    return (
      <div className="learning-section">
        <Header
          eyebrow="실험 계획하기 · 15분"
          title="어떻게 공정하게 비교할까?"
        >
          거리 때문에 밝기가 달라지는지 알아보려면, 다른 조건은 같게 두어야
          합니다. 무엇을 바꾸고 무엇을 기록할지 정해 보세요.
        </Header>
        <ExperimentPlanDiagram />
        <div className="plan-conditions">
          <div>
            <h3>바꿀 것</h3>
            <p>LED와 센서 사이의 거리</p>
          </div>
          <div>
            <h3>살펴볼 것</h3>
            <p>센서가 기록하는 밝기 값</p>
          </div>
          <div>
            <h3>같게 할 것</h3>
            <p>LED의 밝기와 방향, 센서의 위치, 교실 조명</p>
          </div>
        </div>
        <div className="grid-2">
          {designFields.map(([key, label, placeholder]) => (
            <div key={key}>{text(`design.${key}`, label, placeholder)}</div>
          ))}
        </div>
        <p className="notice">
          실험할 때 센서는 고정하고 자동차만 멀어지게 해요. LED는 계속 센서를
          향하게 합니다. 거리와 측정 설정은 다음 시간에 장비를 놓으며 정해요.
        </p>
      </div>
    );

  if (lesson === 3 && step === 4) {
    return (
      <div className="learning-section">
        <Header eyebrow="계획 정리하기 · 9분" title="우리 계획을 한눈에 보기">
          거리와 밝기를 어떻게 비교할지 모둠의 계획을 읽어 보세요.
        </Header>
        <article className="design-summary">
          <dl>
            <dt>알아볼 것</dt>
            <dd>같은 LED가 멀어질 때 밝기가 어떻게 달라지는지 살펴봅니다.</dd>
            <dt>우리 모둠의 예상</dt>
            <dd>
              {notes["design.hypothesis"] ||
                "멀어질 때 밝기가 어떻게 달라질지 이야기해 보세요."}
            </dd>
            <dt>같게 유지할 조건</dt>
            <dd>
              {notes["design.control"] ||
                "LED의 밝기와 방향, 센서 위치, 교실 조명을 같게 유지해요."}
            </dd>
          </dl>
        </article>
        <h3>다음 시간에는 이렇게 살펴봐요</h3>
        <ol className="instructions">
          <li>LED와 센서를 마주 보게 놓아요.</li>
          <li>자동차가 멀어질 때 밝기 값을 모아요.</li>
          <li>그래프가 어떻게 변하는지 보고 우리 예상과 비교해요.</li>
        </ol>
      </div>
    );
  }

  if (lesson === 5 && step === 0)
    return (
      <div className="learning-section">
        <StellarIntro />
        <Header
          eyebrow="실험 돌아보기 · 5분"
          title="우리 실험에서 무엇을 발견했나요?"
        >
          거리와 밝기를 함께 살펴봤어요. 밝기가 얼마나 달라졌는지 숫자로 표현해
          봅시다.
        </Header>
        <div className="grid-2">
          <article className="concept-tile">
            <h3>4차시 실험 기록</h3>
            <p>
              {run
                ? `${run.name} · ${run.samples.length}개 기록`
                : "4차시에서 실험 데이터를 먼저 남겨 주세요."}
            </p>
            {run?.mode === "practice" && (
              <span className="badge">연습 데이터</span>
            )}
            <p className="muted">
              기록한 값과 비교에 쓰지 않은 이유는 4차시 ‘가져와 비교’에서 볼 수
              있어요.
            </p>
          </article>
          <article className="concept-tile">
            <h3>관찰 뒤의 설명</h3>
            <blockquote>
              {notes.explainEvidence ||
                notes.explainCompare ||
                "4차시에서 적은 설명을 떠올리고 아래에 정리해 보세요."}
            </blockquote>
          </article>
        </div>
        {run && (
          <DataChart
            run={run}
            prediction={prediction}
            analysis={validSamples(run).some((s) => distanceFor(s, run)! > 0)}
            referenceId={notes[`reference-${run.id}`]}
          />
        )}
        {text(
          "magnitudeIntro",
          "밝기 차이를 숫자로 나타내려면 어떤 약속이 필요할까요?",
          "등급 숫자가 커질 때 밝기는 어떻게 달라졌나요?",
        )}
      </div>
    );

  if (lesson === 5 && step === 1) {
    const sealed = parseRecord(notes.magnitudePrediction);
    const gradeA = Number(notes.gradeA || 1),
      gradeB = Number(notes.gradeB || 6),
      gap = Math.abs(gradeA - gradeB),
      ratio = Math.pow(100, gap / 5);
    return (
      <div className="learning-section">
        <Header
          eyebrow="예상 → 관찰 → 설명 · 12분"
          title="한 등급 차이는 얼마나 다를까?"
        >
          등급은 별의 밝기를 나타내는 숫자이며, 숫자가 작을수록 밝습니다. 두
          별의 밝기가 몇 배 차이 나는지 예상해 보세요.
        </Header>
        {!sealed ? (
          <div className="prediction-box">
            {input(
              "magnitudeGuess",
              "1등급 별은 6등급 별보다 몇 배 밝을까요?",
              "나의 예상",
              "number",
              0,
            )}
            {text(
              "magnitudeReason",
              "그렇게 예상한 까닭",
              "등급 숫자와 밝기 차이를 연결해 생각해 보세요.",
            )}
            <button
              className="primary"
              disabled={
                !Number.isFinite(Number(notes.magnitudeGuess)) ||
                !(Number(notes.magnitudeGuess) > 0) ||
                !notes.magnitudeReason?.trim()
              }
              onClick={() =>
                setNote(
                  "magnitudePrediction",
                  JSON.stringify({
                    guess: notes.magnitudeGuess,
                    reason: notes.magnitudeReason,
                    savedAt: new Date().toISOString(),
                  }),
                )
              }
            >
              예상 저장
            </button>
          </div>
        ) : (
          <>
            <div className="notice">
              <strong>✓ 처음 예상: {sealed.guess}배</strong>
              <p>{sealed.reason}</p>
            </div>
            {externalActivity}
            <p>
              아래에서 두 별의 등급을 바꾸며 전구 개수를 비교하세요. 등급 차이가
              커질수록 밝기 차이는 어떻게 달라지나요?
            </p>
            <section className="bulb-model">
              <div className="grid-2">
                <label className="field">
                  <span>별 A의 등급</span>
                  <select
                    value={gradeA}
                    onChange={(e) => setNote("gradeA", e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6].map((v) => (
                      <option key={v} value={v}>
                        {v}등급
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>별 B의 등급</span>
                  <select
                    value={gradeB}
                    onChange={(e) => setNote("gradeB", e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6].map((v) => (
                      <option key={v} value={v}>
                        {v}등급
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="bulb-result">
                <strong>{gap}등급 차이</strong>
                <span>
                  {gap === 0
                    ? "밝기가 같아요"
                    : `${gradeA < gradeB ? "A" : "B"}가 ${gap === 5 ? "정확히 100" : `약 ${ratio.toFixed(3)}`}배 밝아요`}
                </span>
              </p>
              <div className="bulb-comparison">
                <div>
                  <h4>어두운 별의 밝기를 전구 1개로</h4>
                  <span className="single-bulb" aria-label="전구 1개">
                    ●
                  </span>
                </div>
                <div>
                  <h4>
                    밝은 별의 밝기: 전구{" "}
                    {ratio.toFixed(gap === 5 || gap === 0 ? 0 : 3)}개 분량
                  </h4>
                  <div
                    className="bulb-grid"
                    role="img"
                    aria-label={`전구 약 ${ratio.toFixed(3)}개 분량의 밝기. 점 하나는 밝기의 비교 단위이며 실제 별이 아닙니다.`}
                  >
                    {Array.from({ length: 100 }, (_, i) => (
                      <span
                        key={i}
                        className={i < ratio ? "lit" : ""}
                        style={
                          i < ratio && i + 1 > ratio
                            ? { opacity: ratio - i }
                            : undefined
                        }
                      >
                        ●
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="muted">
                전구 개수는 밝기가 몇 배인지 나타냅니다. 옅은 점은 전구 한
                개보다 적은 양의 빛을 뜻해요.
              </p>
            </section>
            <p className="notice">
              1등급 차이는 약 <strong>2.512배</strong> (중학교에서는 약 2.5배),
              5등급 차이는 <strong>정확히 100배</strong>입니다. 2.5⁵이 정확히
              100인 것은 아니에요.
            </p>
            {text(
              "magnitudeObservation",
              "등급과 전구 개수를 비교해 알게 된 점",
              "선택한 두 등급과 전구 개수를 근거로 적으세요.",
            )}
            {text(
              "magnitudeExplanation",
              "처음 예상과 비교해서 설명해요",
              "등급 차이와 밝기 비는 어떤 관계인가요?",
            )}
          </>
        )}
      </div>
    );
  }

  if (lesson === 5 && step === 2) {
    const eligible = run ? validSamples(run) : [];
    const knownUnit = !!run && canConvertMagnitude(run);
    const enabled = knownUnit && eligible.length > 0;
    const reference =
      eligible.find(
        (s) =>
          s.id === (notes.magnitudeReference || notes[`reference-${run?.id}`]),
      ) || eligible[0];
    const target =
      eligible.find((s) => s.id === notes.magnitudeTarget) ||
      eligible[eligible.length - 1];
    const measuredRatio =
      enabled && run && reference && target
        ? corrected(target, run)! / corrected(reference, run)!
        : null;
    const measuredDelta =
      enabled && run && reference && target
        ? magnitudeDelta(corrected(target, run)!, corrected(reference, run)!)
        : null;
    const modelRatio = Number(notes.modelBrightness || 0.01),
      modelDelta = -2.5 * Math.log10(modelRatio);
    const resultLabel = (delta: number) =>
      Math.abs(delta) < 1e-9
        ? "기준과 같은 밝기"
        : `${Math.abs(delta).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}등급 ${delta > 0 ? "어두워짐" : "밝아짐"}`;
    return (
      <div className="learning-section">
        <Header
          eyebrow="밝기 차이 설명하기 · 8분"
          title="밝기 차이를 등급 차이로 바꿔 볼까요?"
        >
          측정값 하나를 기준으로 고른 뒤, 다른 값이 얼마나 밝거나 어두운지
          비교합니다.
        </Header>
        <p className="notice">
          기준보다 몇 등급 밝거나 어두워졌는지를 <strong>상대 등급 변화</strong>
          라고 해요. 여기서는 LED의 밝기 차이를 계산합니다.
        </p>
        <div className="grid-2">
          <section className="concept-tile">
            <h3>우리 실험값으로 계산</h3>
            {run?.mode === "practice" && (
              <span className="badge">연습 데이터</span>
            )}
            {!enabled && (
              <p className="notice">
                {!run
                  ? "먼저 4차시 실험을 선택해 주세요."
                  : !run.linear || !knownUnit
                    ? "이 센서의 숫자를 밝기로 바꿀 기준을 아직 확인하지 않았어요. 선생님이 확인한 뒤 계산할 수 있습니다. 계산 모형에서는 바로 비교할 수 있어요."
                    : "비교에 쓸 수 있는 측정값이 없습니다. 4차시에서 기록을 살펴보세요."}
              </p>
            )}
            <label className="field">
              <span>기준으로 삼을 측정값</span>
              <select
                disabled={!enabled}
                value={reference?.id || ""}
                onChange={(e) => setNote("magnitudeReference", e.target.value)}
              >
                {eligible.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {i + 1}번 · 주변 빛을 뺀 값{" "}
                    {((s.raw || 0) - (run?.ambient || 0)).toFixed(2)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>비교할 측정값</span>
              <select
                disabled={!enabled}
                value={target?.id || ""}
                onChange={(e) => setNote("magnitudeTarget", e.target.value)}
              >
                {eligible.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {i + 1}번 · 주변 빛을 뺀 값{" "}
                    {((s.raw || 0) - (run?.ambient || 0)).toFixed(2)}
                  </option>
                ))}
              </select>
            </label>
            {measuredDelta !== null && (
              <div className="calculation-result">
                <small>기준 밝기의 {measuredRatio!.toPrecision(4)}배</small>
                <strong>{resultLabel(measuredDelta)}</strong>
                <span>
                  등급 숫자의 변화 {measuredDelta >= 0 ? "+" : ""}
                  {measuredDelta.toFixed(3)}
                </span>
              </div>
            )}
          </section>
          <section className="concept-tile">
            <h3>계산 모형으로 비교하기</h3>
            <span className="badge">실험값이 아닌 계산 예시</span>
            <label className="field">
              <span>기준 밝기의 몇 배인가요?</span>
              <select
                value={modelRatio}
                onChange={(e) => setNote("modelBrightness", e.target.value)}
              >
                <option value="0.01">1/100 (100분의 1)</option>
                <option value={Math.pow(10, -0.4)}>약 1/2.512</option>
                <option value="1">같은 밝기 (1배)</option>
                <option value="100">100배</option>
              </select>
            </label>
            <div className="calculation-result">
              <small>기준과 비교한 등급 차이</small>
              <strong>{resultLabel(modelDelta)}</strong>
              <span>
                {modelDelta >= 0 ? "+" : ""}
                {modelDelta.toFixed(1)}
              </span>
            </div>
            <p>
              빛이 고르게 퍼지는 모형에서 같은 광원이 10배 멀어지면, 밝기는
              1/100이 되어 5등급 어두워져요.
            </p>
          </section>
        </div>
        <details className="teacher-formula">
          <summary>교사용 계산 원리 펼치기</summary>
          <p>
            실험의 원시값(센서가 처음 기록한 숫자)에서 주변광을 빼 보정합니다.
            단위와 선형성(센서값이 빛의 세기에 비례하는지)을 확인한 자료만
            등급으로 환산합니다. 보정 후 0 이하인 값, 누락·포화·분석 제외 값은
            계산에서 빼되 원본은 보존합니다. LED의 상대 등급 변화는 실제 별의
            겉보기·절대 등급을 측정한 결과가 아닙니다.
          </p>
          <p>
            Δm = −2.5 log₁₀(B / B기준). B는 주변광을 뺀 양수 값이며, 단위와 빛의
            세기에 대한 선형성이 확인되어야 합니다. 양의 변화는 더 어두워짐,
            음의 변화는 더 밝아짐을 뜻합니다.
          </p>
        </details>
        {text(
          "relativeMagnitudeExplanation",
          "몇 배 밝거나 어두워지면, 등급은 얼마나 달라지나요?",
          "기준보다 밝기가 1/100이 되면…",
        )}
      </div>
    );
  }

  if (lesson === 5 && step === 3) {
    const sealed = parseRecord(notes.absolutePrediction);
    const distance = Math.max(
        1,
        Math.min(100, Number(notes.starDistance || 10)),
      ),
      absolute = Number(notes.absoluteGrade || 2),
      apparent = absolute + 5 * Math.log10(distance / 10);
    return (
      <div className="learning-section">
        <Header
          eyebrow="예상 → 관찰 → 설명 · 12분"
          title="모든 별을 같은 거리에 놓는다면?"
        >
          가까워서 밝아 보이는 것과 별 자체가 밝은 것을 어떻게 구분할까요?
        </Header>
        <p className="muted">
          pc(파섹)는 별까지의 먼 거리를 나타내는 단위입니다. 1pc는 약
          3.26광년이며, 10pc는 약 32.6광년입니다.
        </p>
        {!sealed ? (
          <div className="prediction-box">
            {text(
              "absoluteGuess",
              "별들의 밝기를 공정하게 비교하려면 거리를 어떻게 해야 할까요?",
              "나의 예상과 이유를 적어 주세요.",
            )}
            <button
              className="primary"
              disabled={!notes.absoluteGuess?.trim()}
              onClick={() =>
                setNote(
                  "absolutePrediction",
                  JSON.stringify({
                    guess: notes.absoluteGuess,
                    savedAt: new Date().toISOString(),
                  }),
                )
              }
            >
              예상 저장
            </button>
          </div>
        ) : (
          <>
            <div className="notice">
              <strong>저장한 예상</strong>
              <p>{sealed.guess}</p>
            </div>
            {externalActivity}
            <p>
              아래 모형에서 같은 별을 가까이 또는 멀리 옮겨 보세요. 지금
              거리에서의 등급과 10pc에서의 등급을 비교합니다.
            </p>
            <div className="grid-2">
              <article className="concept-tile">
                <span className="badge">지구에서 보이는 밝기</span>
                <h3>겉보기 등급</h3>
                <p>
                  지구에서 보이는 밝기를 나타내는 숫자예요. 별이 내는 빛의 양뿐
                  아니라 얼마나 멀리 있는지도 영향을 줍니다.
                </p>
              </article>
              <article className="concept-tile">
                <span className="badge">10pc로 거리를 통일</span>
                <h3>절대 등급</h3>
                <p>
                  별을 모두 같은 10pc 거리에 놓았다고 할 때의 등급이에요. 거리의
                  영향을 같게 해서 별 자체의 밝기를 비교합니다.
                </p>
              </article>
            </div>
            <section className="distance-model">
              <div className="grid-2">
                <label className="field">
                  <span>가상 별까지의 거리: {distance}pc</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={distance}
                    onChange={(e) => setNote("starDistance", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>이 별을 10pc에 놓았을 때의 등급</span>
                  <select
                    value={absolute}
                    onChange={(e) => setNote("absoluteGrade", e.target.value)}
                  >
                    {[-3, 0, 2, 5, 8].map((n) => (
                      <option key={n} value={n}>
                        {n}등급
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <DiagramFrame
                label="10pc 기준과 가상 별까지의 거리 축"
                kind="distance-frame"
              >
                <svg
                  viewBox="0 0 700 180"
                  role="img"
                  aria-label={`가상 별의 거리 ${distance}pc, 지금 거리에서의 겉보기 등급 ${apparent.toFixed(2)}, 10pc에서의 절대 등급 ${absolute}. 10pc 기준선을 거리 축에 표시합니다.`}
                >
                  <line
                    x1="60"
                    y1="95"
                    x2="640"
                    y2="95"
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                  {[0, 10, 25, 50, 75, 100].map((d) => (
                    <g key={d}>
                      <line
                        x1={60 + d * 5.8}
                        x2={60 + d * 5.8}
                        y1="88"
                        y2="102"
                        stroke="#94a3b8"
                      />
                      <text x={60 + d * 5.8} y="126" textAnchor="middle">
                        {d}pc
                      </text>
                    </g>
                  ))}
                  <circle cx="60" cy="95" r="10" fill="#93c5fd" />
                  <text x="60" y="155" textAnchor="middle">
                    지구
                  </text>
                  <line
                    x1="118"
                    y1="25"
                    x2="118"
                    y2="110"
                    stroke="#f8c84d"
                    strokeDasharray="4 4"
                  />
                  <text x="118" y="18" textAnchor="middle">
                    10pc 기준
                  </text>
                  <circle
                    cx={60 + distance * 5.8}
                    cy="95"
                    r="8"
                    fill="#f8c84d"
                  />
                  <text
                    x={Math.min(620, Math.max(75, 60 + distance * 5.8))}
                    y="65"
                    textAnchor="middle"
                  >
                    가상 별
                  </text>
                </svg>
              </DiagramFrame>
              <div className="metric-pair">
                <div>
                  <small>겉보기 등급 · 지금 거리</small>
                  <strong>{apparent.toFixed(2)}</strong>
                </div>
                <div>
                  <small>절대 등급 · 10pc 거리</small>
                  <strong>{absolute.toFixed(2)}</strong>
                </div>
              </div>
              <div className="ratio-strip">
                {[5, 10, 50].map((d) => (
                  <button
                    key={d}
                    className={distance === d ? "selected" : ""}
                    onClick={() => setNote("starDistance", String(d))}
                  >
                    {d}pc에서 비교
                  </button>
                ))}
              </div>
              <p className="notice">
                {distance === 10
                  ? "10pc에서는 겉보기 등급과 절대 등급이 같아요."
                  : distance < 10
                    ? "10pc보다 가까우면 더 밝게 보여서, 겉보기 등급의 숫자가 절대 등급보다 작아져요."
                    : "10pc보다 멀면 더 어둡게 보여서, 겉보기 등급의 숫자가 절대 등급보다 커져요."}
              </p>
              <p className="muted">
                점은 별의 위치만 나타냅니다. 이 모형은 우주의 먼지가 빛을 가리는
                효과를 제외하고, 거리의 영향만 비교합니다.
              </p>
              <details className="teacher-formula">
                <summary>교사용 · 거리와 등급의 관계</summary>
                <p>
                  m − M = 5 log₁₀(d / 10). m은 겉보기 등급, M은 절대 등급, d는
                  pc 단위 거리입니다. 이 모형에서는 먼지 등에 의해 빛이 줄어드는
                  소광을 무시합니다. 점의 크기는 별의 지름이나 밝기를 나타내지
                  않습니다.
                </p>
              </details>
            </section>
            {text(
              "absoluteObservation",
              "거리를 바꾸며 관찰한 점",
              "거리가 달라질 때 겉보기 등급과 절대 등급은 각각 어떻게 되었나요?",
            )}
            {text(
              "absoluteExplanation",
              "절대 등급이 필요한 이유",
              "처음 예상과 관찰의 차이도 설명해 보세요.",
            )}
          </>
        )}
      </div>
    );
  }

  if (lesson === 5 && step === 4) {
    const submitted = notes.quizSubmitted === "yes";
    const complete = quiz.every(
      (_, i) => notes[`quiz${i}`] !== undefined && notes[`quiz${i}`] !== "",
    );
    const exportReflection = () => {
      const label = run?.mode === "practice" ? "연습 데이터" : "학습 기록";
      const output = [
        `별빛의 거리를 재다 · ${label}`,
        `설명 작성자: ${notes.reflectionAuthor || prediction?.author || "미기록"}`,
        `최초 예상 (${prediction?.author || "미기록"}): ${prediction?.reason || "미기록"}`,
        `처음에는 ${notes.reflectionBefore || ""}`,
        `실험과 모형에서 ${notes.reflectionObserved || ""}`,
        `이제는 ${notes.reflectionAfter || ""}`,
        "이 자료는 자동 게시되지 않습니다. 원할 때 교사가 정한 샘보드에 직접 공유하세요.",
      ].join("\n\n");
      const url = URL.createObjectURL(
        new Blob([output], { type: "text/plain;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `별빛탐구-${label}-샘보드.txt`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    return (
      <div className="learning-section">
        <Header eyebrow="정리하기 · 8분" title="내 생각은 어떻게 달라졌을까?">
          네 가지 질문으로 확인하고, 증거를 담아 내 설명을 완성해 보세요.
        </Header>
        <div className="quiz-list">
          {quiz.map((q, i) => (
            <fieldset className="quiz-question" key={q.question}>
              <legend>
                <span>{String(i + 1).padStart(2, "0")}</span> {q.question}
              </legend>
              {q.choices.map((choice, j) => (
                <label key={choice}>
                  <input
                    type="radio"
                    name={`quiz-${i}`}
                    value={j}
                    checked={notes[`quiz${i}`] === String(j)}
                    onChange={() => {
                      setNote(`quiz${i}`, String(j));
                      setNote("quizSubmitted", "");
                    }}
                  />
                  {choice}
                </label>
              ))}
              {submitted && reveal && notes[`quiz${i}`] !== undefined && (
                <p
                  className={`quiz-feedback ${Number(notes[`quiz${i}`]) === q.correct ? "correct" : "reconsider"}`}
                >
                  <strong>
                    {Number(notes[`quiz${i}`]) === q.correct
                      ? "정답"
                      : "다시 살펴보기"}
                  </strong>{" "}
                  {q.feedback[Number(notes[`quiz${i}`])]}
                </p>
              )}
            </fieldset>
          ))}
        </div>
        <button
          className="primary"
          disabled={!complete}
          onClick={() => setNote("quizSubmitted", "yes")}
        >
          내 답 확인하기
        </button>
        {submitted && !reveal && (
          <p className="notice">
            답을 저장했습니다. 선생님이 해설을 공개하면 설명을 볼 수 있어요.
          </p>
        )}
        <div className="reflection-fields">
          {input(
            "reflectionAuthor",
            "설명을 기록하는 사람 또는 모둠 별칭",
            prediction?.author || "예: 분석 담당 / 은하 모둠",
          )}
          {text(
            "reflectionBefore",
            "처음에는 ___라고 생각했다.",
            "최초 예상의 생각을 돌아보세요.",
          )}
          {text(
            "reflectionObserved",
            "실험과 모형에서 ___를 관찰했다.",
            "수치나 비교 결과를 근거로 적으세요.",
          )}
          {text(
            "reflectionAfter",
            "이제는 ___라는 근거로 ___라고 설명한다.",
            "거리, 밝기, 등급을 연결하여 설명해 보세요.",
          )}
        </div>
        <div className="share-actions">
          <button className="secondary" onClick={exportReflection}>
            샘보드 공유용 글 저장 ↓
          </button>
          <p className="muted">
            파일을 저장한 후 교사가 지정한 보드에 직접 올립니다. 자동 게시하지
            않습니다.
          </p>
        </div>
        <StellarIntro compact />
      </div>
    );
  }
  return null;
}
