import { useEffect, useState } from "react";
import "./light-drive-intro.css";

export function LightDriveIntro() {
  const [distance, setDistance] = useState(1);
  const [moving, setMoving] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [explored, setExplored] = useState(false);
  useEffect(() => {
    if (!moving) return;
    const timer = window.setInterval(() => {
      setDistance(value => Math.min(3, value + 0.02));
      setExplored(true);
    }, 60);
    return () => window.clearInterval(timer);
  }, [moving]);
  useEffect(() => { if (distance >= 3) setMoving(false); }, [distance]);
  const brightness = 100 / (distance * distance);
  const carX = 240 + (distance - 1) * 180;
  return <section className="card light-drive-intro" aria-labelledby="light-drive-title">
    <span className="eyebrow">움직여 보는 빛 실험 · 3분</span>
    <h3 id="light-drive-title">LED는 그대로인데, 센서 쪽 빛은?</h3>
    <p>‘자동차 출발’을 누르거나 거리 막대를 움직여 보세요. 왼쪽 센서가 받는 빛에 주목해요.</p>
    <svg viewBox="0 0 800 300" role="img" aria-label={`고정 센서에서 LED 자동차가 ${distance.toFixed(1)}배 거리에 있습니다. 센서가 받는 빛은 처음의 ${brightness.toFixed(0)}퍼센트입니다.`}>
      <rect width="800" height="300" rx="20" fill="#080d24" />
      <path d={`M${carX} 154 L112 80 L112 222 Z`} fill="#f8c84d" opacity=".09" />
      <path d={`M${carX} 154 H112`} stroke="#f8c84d" strokeDasharray="8 8" opacity=".65" />
      <text x="45" y="45" fill="#dbeafe" fontSize="22">움직이지 않는 센서</text>
      <rect x="65" y="105" width="65" height="90" rx="12" fill="#1d2c50" stroke="#93c5fd" strokeWidth="3" />
      <circle cx="100" cy="150" r="23" fill="#f8c84d" opacity={brightness / 100} />
      <path d="M100 198 V235 M70 235 H130" stroke="#93c5fd" strokeWidth="6" />
      <g transform={`translate(${carX},0)`}>
        <rect x="0" y="140" width="120" height="55" rx="12" fill="#334155" stroke="#f8c84d" strokeWidth="3" />
        <rect x="-5" y="132" width="18" height="35" rx="5" fill="#f8c84d" />
        <circle cx="28" cy="202" r="14" fill="#94a3b8" /><circle cx="95" cy="202" r="14" fill="#94a3b8" />
        <text x="55" y="110" textAnchor="middle" fill="#f8c84d" fontSize="22">LED 자동차</text>
      </g>
      <path d="M295 58 H665 L650 48 M665 58 L650 68" stroke="#f8c84d" strokeWidth="3" fill="none" />
      <text x="420" y="43" fill="#dbeafe" fontSize="20">멀어지는 방향</text>
      <text x="270" y="270" fill="#dbeafe" fontSize="22">빛은 계속 센서를 향해요 ←</text>
    </svg>
    <div className="light-drive-controls">
      <button className="primary" onClick={() => { if (distance >= 3) setDistance(1); setMoving(!moving); }}>{moving ? "잠깐 멈추기" : "자동차 출발"}</button>
      <button onClick={() => { setMoving(false); setDistance(1); setShowValue(false); setExplored(false); }}>처음으로</button>
      <label>센서와 LED 사이 거리 <strong>{distance.toFixed(1)}배</strong>
        <input aria-label="센서와 LED 사이 거리" type="range" min="1" max="3" step="0.01" value={distance} onChange={event => { setMoving(false); setDistance(Number(event.target.value)); setExplored(true); }} />
      </label>
    </div>
    <p><strong>자동차가 멀어질 때 센서의 노란빛은 어떻게 달라졌나요?</strong> 짝과 한마디씩 이야기해요.</p>
    <button disabled={!explored} onClick={() => setShowValue(!showValue)} aria-expanded={showValue}>{showValue ? "밝기 값 접기" : "모형 속 밝기 값 보기"}</button>
    {showValue && <div className="light-drive-reading">
      <label htmlFor="model-brightness">처음 밝기를 100으로 놓으면 <strong>{brightness.toFixed(1)}</strong></label>
      <meter id="model-brightness" min="0" max="100" value={brightness}>{brightness.toFixed(1)}</meter>
      <p>이제 실제 자동차와 센서에서도 이런 변화가 나타나는지 측정해 봐요.</p>
    </div>}
    <p className="muted">거리의 제곱에 반비례하는 관계를 표현한 모형입니다. 실제 센서 측정값이 아니며, 화면의 색은 빛의 변화를 나타냅니다.</p>
  </section>;
}
