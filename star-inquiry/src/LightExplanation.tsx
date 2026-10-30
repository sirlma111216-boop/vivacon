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
      <figure className="light-original-diagram">
        <img
          src="/assets/astronomy/distance-brightness-original.png"
          width="1117"
          height="583"
          loading="lazy"
          alt="거리 1배, 2배, 3배에서 같은 빛이 각각 1칸, 4칸, 9칸에 퍼지고 한 칸의 밝기가 1배, 1/4배, 1/9배가 되는 관계를 보여 주는 제공 그림"
        />
      </figure>
      <p>거리 1·2·3배 → 빛이 퍼지는 면적 1·4·9배 → 한 칸의 밝기 1·1/4·1/9배</p>
      <p>
        이 관계를 <strong>‘밝기는 거리의 제곱에 반비례한다’</strong>고 말합니다.
        같은 별을 서로 다른 거리에서 비교할 때의 관계예요.
      </p>
      <div className="lesson-video">
        <h3>영상으로 이어서 살펴봐요</h3>
        <p>
          영상에서 광원과 거리를 어떻게 바꾸는지 살펴보고, 위 그림과 연결해
          설명해 보세요.
        </p>
        <iframe
          src="https://www.youtube-nocookie.com/embed/wmQ-tinG0uU"
          title="거리와 밝기 이해를 돕는 교사 제공 영상"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
        <p className="muted">
          재생되지 않으면{" "}
          <a
            href="https://www.youtube.com/watch?v=wmQ-tinG0uU"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube에서 보기 ↗
          </a>
        </p>
      </div>
    </section>
  );
}
