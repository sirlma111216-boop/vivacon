type Props = { onVisit: (lesson: 3 | 4 | 5, step: number) => void };

export function CourseReview({ onVisit }: Props) {
  const lessons = [
    { lesson: 3 as const, title: "거리와 밝기를 예상하고 자동차 만들기", summary: "같은 광원도 멀어지면 어둡게 보여요. 센서는 고정하고 LED 자동차가 멀어지는 실험을 준비했어요.", links: [[1, "내 예상 그래프"], [2, "거리와 밝기 · 그림과 영상"], [4, "MakeCode와 자동차 만들기"]] },
    { lesson: 4 as const, title: "센서로 측정하고 그래프 비교하기", summary: "이지메이커 센서와 이지온으로 밝기 변화를 기록했어요. 우리 그래프를 예상과 비교하고, 다른 결과가 나왔다면 실험 조건을 살펴봤어요.", links: [[1, "이지메이커 도구"], [2, "이지온 연결"], [3, "측정 순서와 저장"], [4, "우리 그래프와 결과 비교"]] },
    { lesson: 5 as const, title: "별의 밝기를 등급으로 설명하기", summary: "등급 숫자가 작을수록 밝아요. 겉보기 등급은 지구에서 보이는 밝기, 절대 등급은 별을 모두 10pc에 놓았을 때의 밝기를 나타내요.", links: [[1, "비상교과서 · 밝기와 전구 활동"], [3, "겉보기·절대 등급 비교"], [4, "5차시 핵심 정리"]] },
  ];
  return <div className="learning-section">
    <header className="learning-heading"><span className="eyebrow">1~5차시 전체 복습</span><h2>돌에 새긴 별에서, 우리가 측정한 별빛까지</h2><p>다섯 시간 동안 이어 온 탐구를 돌아봐요. 다시 보고 싶은 활동을 누르면 해당 화면으로 이동해요.</p></header>
    <section className="card"><span className="eyebrow">1차시 · Night Code 1395</span><h3>옛사람들은 별을 어떻게 기록했을까요?</h3><p>천상열차분야지도를 살펴보고, 별을 서로 다른 크기로 새긴 까닭을 생각했어요.</p><p><strong>돌에 새긴 별의 크기가 실제 별의 크기를 뜻할까요?</strong> 처음 떠올렸던 생각을 돌아봐요.</p><a className="secondary" href="https://nc1395.labbitory.com/" target="_blank" rel="noopener noreferrer">천상열차분야지도 다시 보기 ↗</a><p className="muted">새 탭에서 열립니다. ‘천상열차분야지도가 뭘까요?’와 ‘왜 크기를 다르게 새겼을까요?’ 장면을 찾아보세요.</p></section>
    <section className="card"><span className="eyebrow">2차시 · Night Code 1395</span><h3>별의 크기와 밝기를 자료로 비교했어요</h3><p>지도에 새겨진 별을 재고, 실제 밝기와 비교해 그래프로 나타냈어요. 생각만으로 답하지 않고 자료에서 근거를 찾았어요.</p><a className="secondary" href="https://nc1395.labbitory.com/" target="_blank" rel="noopener noreferrer">측정과 그래프 활동 다시 보기 ↗</a><p className="muted">새 탭에서 ‘측정하기’ → ‘내가 잰 값과 실제 밝기’ → ‘점으로 나타내 봅시다’를 찾아보세요. 그 사이트에 저장한 기록은 같은 기기·브라우저에서 확인할 수 있어요.</p></section>
    {lessons.map(item => <section className="card" key={item.lesson}><span className="eyebrow">{item.lesson}차시</span><h3>{item.title}</h3><p>{item.summary}</p><div className="share-actions">{item.links.map(([step, label]) => <button className="secondary" key={step} onClick={() => onVisit(item.lesson, Number(step))}>{label} →</button>)}</div></section>)}
    <section className="notice"><h3>다섯 차시를 연결하는 한 가지 생각</h3><p>별이 밝게 보이는 까닭을 알려면, 별이 내는 빛과 별까지의 거리를 함께 생각해야 해요. 우리는 옛 기록을 관찰하고, 직접 측정한 자료와 비교하며 그 까닭을 설명했어요.</p></section>
  </div>;
}
