import type { Run } from "./domain";
import { DataChart } from "./DataChart";
import "./run-comparison.css";

export function RunComparison({ run, notes, setNote }: { run: Run; notes: Record<string, string>; setNote: (key: string, value: string) => void }) {
  const key = `comparison.${run.id}.`;
  const field = (name: string, label: string) => <label className="field">{label}<textarea value={notes[key + name] ?? ""} onChange={e => setNote(key + name, e.target.value)} /></label>;
  const reference = (square: boolean) => <figure><h3>{square ? "B · 거리의 제곱에 반비례" : "A · 거리에 반비례"}</h3><img src={`/assets/comparison/${square ? "inverse-square" : "inverse"}.png`} width="650" height="583" alt={square ? "사용자 제공 y=1/x² 그래프" : "사용자 제공 y=1/x 그래프"} style={{ width: "100%", height: "auto" }} /><figcaption>가로축: 거리 · 세로축: 밝기</figcaption></figure>;
  return <section className="card">
    <h2>내가 측정한 그래프는 어느 쪽에 가까울까요?</h2>
    <p>{run.name} · {run.samples.length}개의 저장된 측정값{run.mode === "practice" ? " · 연습 데이터" : ""}</p>
    <div className="run-comparison-grid">{reference(false)}<div><h3>우리 실험의 측정 그래프</h3><DataChart run={run} axis="time" /></div>{reference(true)}</div>
    <p className="notice">가운데는 시간에 따른 측정값, 양옆은 거리에 따른 밝기예요. 자동차가 일정하게 움직인 구간의 전체적인 모양만 비교하세요. 축과 시작 거리가 다르므로 모양만으로 두 관계를 정확히 구분하거나 실험의 성공·실패를 단정할 수는 없어요.</p>
    <fieldset><legend>어느 쪽과 더 비슷한가요?</legend><div className="button-row">{["A에 가까워요", "B에 가까워요", "둘 다 다르거나 판단하기 어려워요"].map(v => <button key={v} aria-pressed={notes[key + "shape"] === v} className={notes[key + "shape"] === v ? "selected" : ""} onClick={() => setNote(key + "shape", v)}>{v}</button>)}</div></fieldset>
    <label className="field">우리 실험을 어떻게 판단했나요?<select value={notes[key + "judgment"] ?? ""} onChange={e => setNote(key + "judgment", e.target.value)}><option value="">선택하세요</option><option>밝기가 줄어드는 경향을 관찰했어요</option><option>다시 측정해 보고 싶어요</option><option>판단하기 어려워요</option></select></label>
    {field("reason", "그래프의 어떤 부분을 보고 그렇게 생각했나요?")}
    {notes[key + "judgment"] && notes[key + "judgment"] !== "밝기가 줄어드는 경향을 관찰했어요" && <><p>센서나 LED의 방향, 주변 조명, 자동차의 움직임, 센서값이 최댓값에 머문 구간을 살펴보세요.</p>{field("error", "어떤 점이 결과에 영향을 주었을까요?")}{field("improve", "다시 한다면 무엇을 어떻게 바꿀까요?")}</>}
    <p className="muted">선택과 글은 이 기기에 자동으로 저장돼요.</p>
  </section>;
}
