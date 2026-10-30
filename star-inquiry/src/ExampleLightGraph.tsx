export function ExampleLightGraph() {
  const value = (t: number) => 3 + 87 / (1 + Math.max(0, Math.min(8, t - 1)) * 0.4) ** 2;
  const x = (t: number) => 80 + t * 68;
  const y = (v: number) => 350 - v * 3;
  const points = Array.from({ length: 201 }, (_, i) => {
    const t = i / 20;
    return `${x(t)},${y(value(t))}`;
  }).join(" ");
  return <figure style={{ margin: "20px 0" }}>
    <svg viewBox="0 0 840 440" role="img" aria-label="예시 그래프. 출발 전 밝기가 유지되다가 출발 후 빠르게 줄고 점차 완만해지며, 9초에 자동차가 멈춘 뒤 일정하게 유지됩니다." style={{ width: "100%", height: "auto", background: "#fff", borderRadius: 12 }}>
      <text x="420" y="32" textAnchor="middle" fontSize="22" fill="#111833">자동차가 멀어질 때의 밝기 변화 · 예시</text>
      {[0,20,40,60,80,100].map(v => <g key={v}><path d={`M80 ${y(v)} H760`} stroke="#dbe2ea" /><text x="65" y={y(v)+6} textAnchor="end" fontSize="18" fill="#334155">{v}</text></g>)}
      {[0,2,4,6,8,10].map(t => <g key={t}><path d={`M${x(t)} 50 V350`} stroke="#e2e8f0" /><text x={x(t)} y="380" textAnchor="middle" fontSize="18" fill="#334155">{t}</text></g>)}
      <path d="M80 50 V350 H760" fill="none" stroke="#334155" strokeWidth="2" />
      <polyline points={points} fill="none" stroke="#1265ad" strokeWidth="4" />
      {[1,9].map(t => <path key={t} d={`M${x(t)} 50 V350`} stroke="#a16207" strokeDasharray="6 6" />)}
      <text x={x(1)+10} y="95" fontSize="19" fill="#854d0e">출발</text>
      <text x={x(9)-10} y="260" textAnchor="end" fontSize="19" fill="#854d0e">장애물 앞에서 정지</text>
      <text x="425" y="418" textAnchor="middle" fontSize="20" fill="#111833">수집 시작 후 시간 (초)</text>
      <text transform="translate(24 205) rotate(-90)" textAnchor="middle" fontSize="20" fill="#111833">센서 1 밝기 값 (0~100)</text>
    </svg>
    <figcaption>실제 측정값이 아닌 설명용 예시입니다. 시간과 숫자를 똑같이 맞출 필요는 없어요. 실제 그래프에는 주변 빛과 센서 특성에 따른 차이나 작은 흔들림이 나타날 수 있어요.</figcaption>
  </figure>;
}
