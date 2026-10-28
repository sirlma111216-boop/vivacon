export type HardwareStep = {
  order: number;
  title: string;
  image: string;
  references: number[];
  primaryPhoto?: number;
  equipment?: string[];
  instruction: string;
  alt: string;
};

export type HardwareSectionKey = "kit" | "car" | "connection" | "measurement";
export type HardwareSection = {
  id: HardwareSectionKey;
  title: string;
  summary: string;
  orders: number[];
  teacherNotes: string[];
};

export const hardwareSections: HardwareSection[] = [
  {
    id: "kit",
    title: "준비물",
    summary: "자동차와 빛을 재는 장비를 준비해요.",
    orders: [1],
    teacherNotes: [
      "자동차와 뒤쪽 LED는 전원이 서로 다릅니다. USB 허브는 컴퓨터에 연결 자리가 부족할 때만 사용합니다.",
    ],
  },
  {
    id: "car",
    title: "자동차 준비",
    summary: "마이크로비트와 LED를 달고, 출발과 정지 방법을 알아봐요.",
    orders: [2, 3, 4, 5, 6, 7],
    teacherNotes: [
      "뒤쪽 원형 LED가 실험용 광원입니다. 자동차의 빨간 LED·파란 지시등과 구분하세요. LED 스위치와 고정 방법은 실제 제품을 보고 정합니다.",
      "초음파의 5cm는 자동차 앞쪽과 장애물 사이의 비교 기준입니다. 실제 제동 거리를 보장하지 않으며, 탁자 끝의 낭떠러지도 감지하지 못할 수 있습니다.",
      "A를 누른 시각은 측정 기록에 따로 표시합니다. 자동차와 밝기 센서가 자동으로 같은 시각에 시작되는 것은 아닙니다.",
    ],
  },
  {
    id: "connection",
    title: "센서·컴퓨터 연결",
    summary: "밝기 센서 → A0 → USB → 컴퓨터 순서로 연결해요.",
    orders: [8, 9, 10],
    teacherNotes: [
      "센서에 맞는 전용 연결선을 사용합니다.",
      "A0는 제공된 실물 사진으로 확인한 물리 연결 자리입니다. 통신 프레임의 채널 번호·값 단위·선형성은 별도로 검증해야 합니다. 확인되지 않은 센서값에 lux를 붙이지 않습니다.",
      "충전만 가능한 USB 케이블은 데이터가 전달되지 않습니다. 보드 전원 스위치는 실제 제품 안내에 따라 사용합니다.",
    ],
  },
  {
    id: "measurement",
    title: "측정 자리",
    summary: "센서는 고정하고, 자동차가 멀어질 길을 만들어요.",
    orders: [11, 12],
    teacherNotes: [
      "손으로 센서를 든 사진은 방향을 보여 주는 예시입니다. 실제 측정에서는 센서를 고정하고, 자동차가 케이블을 끌고 가지 않게 합니다.",
      "빛이 나오는 곳부터 센서가 빛을 받는 곳까지 줄자로 잽니다.",
      "모터 설정 255는 실제 속력이 아닙니다. 같은 시간 동안 간 거리를 반복해서 재어 속력이 거의 일정한 구간을 사용합니다. 출발·정지 구간은 따로 구분합니다.",
      "LED를 가리거나 비췄을 때 값이 바뀌는지 살펴봅니다. 더 밝게 해도 최댓값에서 멈춰 있다면 센서가 측정할 수 있는 범위를 넘은 것일 수 있습니다. 자동차 지시등·모니터·탁자 반사도 영향을 줄 수 있습니다.",
    ],
  },
];

export const hardwareSteps: HardwareStep[] = [
  {
    order: 1,
    title: "이 장비들을 준비해요",
    image: "illustrations/01-sensor-kit.png",
    references: [37, 47, 25],
    instruction: "자동차와 빛을 재는 장비를 준비해요.",
    equipment: [
      "마퀸 자동차·마이크로비트·건전지",
      "자동차 뒤에 달 원형 LED",
      "이지메이커 보드·밝기 센서·전용 연결선",
      "노트북·USB 데이터 케이블",
      "거리를 잴 줄자·시간을 잴 시계",
    ],
    alt: "자동차, 센서, 연결선과 컴퓨터를 보여 주는 준비물 설명용 그림",
  },
  {
    order: 2,
    title: "마이크로비트 앞면을 찾아요",
    image: "illustrations/02-microbit-front-back.png",
    references: [45, 46],
    primaryPhoto: 45,
    instruction:
      "작은 LED 25개와 A·B 버튼이 있는 쪽이 앞면이에요. 뒤쪽의 리셋 버튼은 출발 버튼 A와 달라요.",
    alt: "마이크로비트의 앞면과 뒷면을 보여 주는 설명용 그림",
  },
  {
    order: 3,
    title: "전원을 끄고 마이크로비트를 꽂아요",
    image: "illustrations/03-insert-microbit.png",
    references: [45, 48, 25],
    primaryPhoto: 48,
    instruction:
      "금색 부분을 아래로 향하게 꽂아요. LED와 A·B 버튼이 있는 면은 자동차 앞쪽의 둥근 초음파 센서를 향해요. 잘 들어가지 않으면 방향을 살펴보고, 억지로 밀지 않아요.",
    alt: "마이크로비트를 마퀸에 꽂는 방향을 보여 주는 설명용 그림",
  },
  {
    order: 4,
    title: "자동차 뒤에 LED를 달아요",
    image: "illustrations/04-rear-led.png",
    references: [47, 31, 34],
    primaryPhoto: 31,
    instruction:
      "원형 LED를 자동차 뒤에 단단히 고정해요. LED의 빛이 나오는 쪽은 자동차 뒤에 놓을 밝기 센서를 향하게 해요.",
    alt: "자동차 뒤쪽에 원형 LED를 고정한 설명용 그림",
  },
  {
    order: 5,
    title: "프로그램을 넣은 뒤 전원을 켜요",
    image: "illustrations/05-power-switch.png",
    references: [26, 27],
    primaryPhoto: 26,
    instruction:
      "출발·정지 프로그램을 마이크로비트에 먼저 넣어요. 자동차 뒤쪽 건전지 홀더 아래의 전원 스위치를 실제 표시를 보며 켜요.",
    alt: "자동차 전원 스위치를 찾는 설명용 그림",
  },
  {
    order: 6,
    title: "A로 출발하고 B로 멈춰요",
    image: "illustrations/06-press-a.png",
    references: [29, 27, 28],
    primaryPhoto: 29,
    instruction:
      "제공된 프로그램에서는 앞면 왼쪽 A 버튼을 누르면 출발하고, 오른쪽 B 버튼을 누르면 멈춰요. 넓은 바닥에서 먼저 짧게 움직여 보고 멈춰 보세요.",
    alt: "마이크로비트 앞면의 A 버튼을 누르는 설명용 그림",
  },
  {
    order: 7,
    title: "앞의 장애물을 만나면 멈추는지 봐요",
    image: "illustrations/07-obstacle-stop.png",
    references: [30, 31],
    primaryPhoto: 30,
    instruction:
      "제공된 코드는 자동차 앞쪽 초음파 센서가 장애물까지 5cm 미만으로 읽으면 정지해요. 멈추지 않으면 B 버튼으로 세우세요. 탁자 끝에서는 시험하지 않아요.",
    alt: "자동차 앞쪽 초음파 센서와 장애물의 관계를 보여 주는 설명용 그림",
  },
  {
    order: 8,
    title: "밝기 센서에 연결선을 꽂아요",
    image: "illustrations/09-sensor-connector.png",
    references: [41],
    primaryPhoto: 41,
    instruction:
      "센서의 흰색 연결 자리에 모양을 맞춰 전용 연결선을 꽂아요. 센서 가운데 평평한 면이 빛을 받는 곳이에요.",
    alt: "밝기 센서의 연결선과 빛을 받는 면을 보여 주는 설명용 그림",
  },
  {
    order: 9,
    title: "반대쪽은 보드의 A0에 꽂아요",
    image: "illustrations/10-board-a0.png",
    references: [39, 38, 37],
    primaryPhoto: 39,
    instruction:
      "연결선의 다른 쪽은 이지메이커 보드에서 A0라고 적힌 자리에 꽂아요. 센서 이름이 아니라 보드에 적힌 A0 표시를 찾아요.",
    alt: "이지메이커 보드의 A0 연결 자리를 보여 주는 설명용 그림",
  },
  {
    order: 10,
    title: "USB로 컴퓨터와 연결해요",
    image: "illustrations/11-usb-laptop.png",
    references: [44],
    primaryPhoto: 44,
    instruction:
      "보드와 노트북을 USB 데이터 케이블로 연결해요. USB 허브는 필요할 때만 사용해요.",
    alt: "이지메이커 보드에서 USB 케이블을 거쳐 노트북에 연결하는 설명용 그림",
  },
  {
    order: 11,
    title: "센서는 고정하고 LED와 마주 보게 해요",
    image: "illustrations/12-measurement-layout.png",
    references: [40, 42, 43, 44],
    instruction:
      "센서를 왼쪽에 고정하고 LED와 센서의 높이·방향을 맞춰요. 자동차는 LED가 센서를 향한 채 오른쪽으로 멀어지게 놓아요.",
    alt: "왼쪽 고정 센서와 오른쪽으로 멀어지는 LED 자동차를 보여 주는 실험 배치 설명용 그림",
  },
  {
    order: 12,
    title: "주변 빛을 일정하게 하고 측정해요",
    image: "illustrations/08-dark-observation.png",
    references: [32, 33, 35, 36],
    primaryPhoto: 32,
    instruction:
      "LED를 끈 상태에서 주변 빛의 값을 먼저 기록해요. 그다음 LED를 켜고, 실험하는 동안 교실 조명을 같은 상태로 유지해요.",
    alt: "주변 빛을 줄이고 자동차 뒤쪽 LED를 켠 설명용 그림",
  },
];

export function sectionForHardwareStep(step: number) {
  return (
    hardwareSections.find((section) => section.orders.includes(step)) ??
    hardwareSections[0]
  );
}
