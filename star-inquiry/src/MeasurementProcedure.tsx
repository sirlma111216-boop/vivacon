import { SmartImage } from "./SmartImage";

const steps = [
  {
    title: "1. 교실 불을 끄고 LED를 켜요",
    text: "자동차가 지나갈 길을 비운 뒤 교실 불을 끄고, 자동차 뒤쪽 LED를 켜요. 측정이 끝날 때까지 교실 조명과 LED 밝기를 그대로 유지해요.",
    src: "/assets/hardware/illustrations/08-dark-observation.png",
    width: 1448, height: 1086, alt: "교실 조명을 줄이고 자동차 뒤쪽 LED를 켠 설명용 그림",
  },
  {
    title: "2. 센서와 LED를 가까이 놓고 수집을 시작해요",
    text: "아래부터는 장비 배치를 잘 볼 수 있도록 불을 켜고 찍은 사진이에요. 실제 측정에서는 불을 끈 상태를 유지해요. 센서의 빛을 받는 면과 LED를 거의 맞닿을 만큼 가까이 마주 놓되, 서로 닿지는 않게 해요. 센서를 그 자리에 고정하고 이지온에서 ‘수집 시작’을 눌러요. 값이 최댓값에 계속 머물면 간격을 조금 넓혀요.",
    src: "/assets/hardware/reference-photos/미디어 (42).jpeg",
    width: 1247, height: 1663, alt: "수집을 시작하기 전 LED와 센서를 가까이 마주 놓은 배치",
  },
  {
    title: "3. 자동차를 출발시키고 계속 측정해요",
    text: "A 버튼을 눌러 자동차를 출발시켜요. 센서는 움직이지 않고, LED가 센서를 향한 채 자동차만 일정한 속력으로 멀어지게 해요. 이지온은 계속 밝기 값을 수집해요.",
    src: "/assets/hardware/reference-photos/미디어 (43).jpeg",
    width: 1247, height: 1663, alt: "고정된 센서에서 LED 자동차가 멀어지는 실험",
  },
  {
    title: "4. 장애물 앞에서 멈출 때까지 수집해요",
    text: "자동차가 앞의 장애물을 감지해 멈출 때까지 수집을 이어가요. 자동차가 멈춘 뒤 이지온의 ‘수집 중지’를 눌러요. 장애물 앞에서 멈추지 않으면 B 버튼으로 멈춰요.",
    src: "/assets/hardware/reference-photos/미디어 (40).jpeg",
    width: 1247, height: 1663, alt: "장애물 앞에 도착한 자동차와 출발 자리에 고정한 센서",
  },
];

export function MeasurementProcedure() {
  return <section className="hardware-manual" aria-label="밝기 측정 순서">
    {steps.map((step, index) => <article className="card" key={step.src}>
      <h2>{step.title}</h2>
      <p>{step.text}</p>
      <figure className="hardware-main-image">
        <SmartImage src={step.src} width={step.width} height={step.height} alt={step.alt} loading="lazy" style={{ width: "100%", maxHeight: "540px", objectFit: "contain" }} />
        {index === 0 && <figcaption>설명용 그림</figcaption>}
      </figure>
    </article>)}
  </section>;
}
