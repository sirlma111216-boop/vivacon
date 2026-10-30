export function LightExplanation() {
  return (
    <section
      className="card light-explanation"
      aria-labelledby="light-rule-title"
    >
      <h3 id="light-rule-title">같은 빛이 더 넓게 퍼지기 때문이에요</h3>
      <p>
        같은 별에서 나온 빛은 멀리 갈수록 더 넓은 면적에 퍼집니다. 그래서 같은
        크기의 한 칸이 받는 빛은 줄어들어요.
      </p>
      <div
        className="light-formula"
        aria-label="눈에 보이는 별의 밝기는 별까지의 거리의 제곱에 반비례합니다"
      >
        <span>눈에 보이는 별의 밝기</span>
        <span aria-hidden="true">∝</span>
        <span className="light-fraction">
          <span>1</span>
          <span>
            (별까지의 거리)<sup>2</sup>
          </span>
        </span>
      </div>
      <p className="muted">
        ∝는 ‘비례한다’는 뜻이에요. 거리가 2배가 되면 밝기는 2 × 2로 나눈 1/4배가
        됩니다.
      </p>
      <div
        className="light-rule-scroll"
        role="region"
        aria-label="거리 1배·2배·3배에서 빛이 퍼지는 면적 비교"
        tabIndex={0}
      >
        <svg
          viewBox="0 0 960 410"
          role="img"
          aria-labelledby="light-rule-diagram-title"
        >
          <title id="light-rule-diagram-title">
            같은 양의 빛이 거리 1배에서 한 칸, 2배에서 네 칸, 3배에서 아홉 칸에
            퍼져 한 칸의 밝기가 1, 1/4, 1/9배가 됩니다.
          </title>
          <path
            d="M65 265 L835 130 M65 265 H835"
            stroke="#aabbd6"
            strokeWidth="2"
            strokeDasharray="7 6"
          />
          <path
            d="M65 241 L72 257 L89 258 L76 269 L80 286 L65 277 L50 286 L54 269 L41 258 L58 257 Z"
            fill="#f8c84d"
          />
          <text x="65" y="221" textAnchor="middle" fill="#edf3ff" fontSize="24">
            별
          </text>
          {[1, 2, 3].map((d, i) => {
            const x = 65 + d * 210,
              size = d * 45,
              top = 265 - size;
            return (
              <g key={d}>
                <rect
                  x={x}
                  y={top}
                  width={size}
                  height={size}
                  fill="#24527a"
                  stroke="#b9dcff"
                  strokeWidth="2"
                />
                {Array.from({ length: d * d }, (_, n) => (
                  <rect
                    key={n}
                    x={x + (n % d) * 45 + 1}
                    y={top + Math.floor(n / d) * 45 + 1}
                    width="43"
                    height="43"
                    fill="#f8c84d"
                    fillOpacity={1 / (d * d)}
                    stroke="#b9dcff"
                  />
                ))}
                <text
                  x={x + size / 2}
                  y={top - 22}
                  textAnchor="middle"
                  fill="#f8c84d"
                  fontSize="25"
                >
                  밝기 {d === 1 ? "1" : `1/${d * d}`}배
                </text>
                <text
                  x={x + size / 2}
                  y="295"
                  textAnchor="middle"
                  fill="#d7e6fc"
                  fontSize="22"
                >
                  {d * d}칸에 퍼짐
                </text>
                <path
                  d={`M65 ${330 + i * 32} H${x} M65 ${324 + i * 32} V${336 + i * 32} M${x} ${324 + i * 32} V${336 + i * 32}`}
                  stroke="#aabbd6"
                  strokeWidth="2"
                />
                <text x={x + 12} y={338 + i * 32} fill="#edf3ff" fontSize="23">
                  거리 {d}배
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p>거리 1·2·3배 → 빛이 퍼지는 면적 1·4·9배 → 한 칸의 밝기 1·1/4·1/9배</p>
      <p>
        이 관계를 <strong>‘밝기는 거리의 제곱에 반비례한다’</strong>고 말합니다.
        같은 별을 서로 다른 거리에서 비교할 때의 관계예요.
      </p>
    </section>
  );
}
