export type HardwareStep = {
  order: number;
  title: string;
  image: string;
  references: string[];
  instruction: string;
  check: string;
  alt: string;
  status: string;
};
export const hardwareSteps: HardwareStep[] = [
  {
    order: 1,
    title: "준비물 확인",
    image: "illustrations/01-sensor-kit.png",
    references: [
      "reference-photos/미디어 (37).jpeg",
      "reference-photos/미디어 (47).jpeg",
      "reference-photos/미디어 (25).jpeg",
    ],
    instruction:
      "마퀸·마이크로비트·독립 LED·이지메이커 보드·밝기 센서·센서 연결선·USB 데이터 케이블·노트북을 준비한다.",
    check:
      "자동차 전원과 LED 전원은 별개다. USB 허브는 노트북 단자에 맞춰 준비한다.",
    alt: "준비물 확인 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 2,
    title: "마이크로비트 앞뒤 확인",
    image: "illustrations/02-microbit-front-back.png",
    references: [
      "reference-photos/미디어 (45).jpeg",
      "reference-photos/미디어 (46).jpeg",
    ],
    instruction:
      "LED 25개와 A/B 버튼이 있는 면이 앞면이다. 뒤에는 USB·리셋·배터리 단자와 부품이 있다.",
    check: "뒷면 리셋 버튼은 주행 A버튼과 다르다.",
    alt: "마이크로비트 앞뒤 확인 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 3,
    title: "마이크로비트 꽂기",
    image: "illustrations/03-insert-microbit.png",
    references: [
      "reference-photos/미디어 (45).jpeg",
      "reference-photos/미디어 (48).jpeg",
      "reference-photos/미디어 (25).jpeg",
    ],
    instruction:
      "전원을 끈 상태에서 금색 접점을 아래로 하여 슬롯에 바르게 꽂는다. LED와 A/B 버튼 면은 초음파 센서가 있는 자동차 앞쪽을 향한다.",
    check: "앞뒤 방향과 슬롯 정렬을 확인하고 억지로 밀지 않는다.",
    alt: "마이크로비트 꽂기 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 4,
    title: "뒤쪽 LED 부착",
    image: "illustrations/04-rear-led.png",
    references: [
      "reference-photos/미디어 (47).jpeg",
      "reference-photos/미디어 (31).jpeg",
      "reference-photos/미디어 (34).jpeg",
    ],
    instruction:
      "원형 독립 LED를 자동차 뒤쪽, 사진처럼 마이크로비트 후면 쪽에 고정한다. 빛은 자동차 뒤쪽의 밝기 센서를 향한다.",
    check:
      "차체의 빨간 LED나 파란 지시등과 실험 광원을 구분한다. LED의 정확한 스위치 동작·접착 수단은 사진만으로 확정하지 않는다.",
    alt: "뒤쪽 LED 부착 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 5,
    title: "자동차 전원 켜기",
    image: "illustrations/05-power-switch.png",
    references: [
      "reference-photos/미디어 (26).jpeg",
      "reference-photos/미디어 (27).jpeg",
    ],
    instruction:
      "뒤쪽 건전지 홀더 아래에 있는 자동차 전원 스위치를 확인하고 켠다.",
    check:
      "전면 P0 단자와 전원 스위치를 혼동하지 않는다. 스위치 이동 방향은 실제 표시와 원본 사진으로 확인한다.",
    alt: "자동차 전원 켜기 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 6,
    title: "A버튼으로 주행 시작",
    image: "illustrations/06-press-a.png",
    references: [
      "reference-photos/미디어 (29).jpeg",
      "reference-photos/미디어 (27).jpeg",
      "reference-photos/미디어 (28).jpeg",
    ],
    instruction:
      "교사가 준비한 주행 프로그램을 먼저 넣은 후, 앞면을 정면에서 보았을 때 왼쪽 A버튼을 눌러 출발한다.",
    check:
      "A버튼 주행은 프로그램이 있어야 동작한다. 모터 설정 255는 실제 속력 단위가 아니다.",
    alt: "A버튼으로 주행 시작 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 7,
    title: "초음파 정지 확인",
    image: "illustrations/07-obstacle-stop.png",
    references: [
      "reference-photos/미디어 (30).jpeg",
      "reference-photos/미디어 (31).jpeg",
    ],
    instruction:
      "자동차 앞쪽 초음파 센서와 장애물 사이 거리를 확인하며 정지 조건을 사전 시험한다. 제공된 코드는 센서가 읽은 값이 5cm 미만일 때 정지 명령을 보낸다.",
    check:
      "5cm는 프로그램의 비교 기준이며 실제 제동 거리 보장이 아니다. 사진에서 길이를 읽지 않는다. LED–밝기 센서 사이 거리와 다르며 탁자 추락 방지 기능도 아니다.",
    alt: "초음파 정지 확인 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 8,
    title: "밝기 센서에 연결선 꽂기",
    image: "illustrations/09-sensor-connector.png",
    references: ["reference-photos/미디어 (41).jpeg"],
    instruction:
      "밝기 센서의 흰색 커넥터 모양을 맞춰 전용 다선 연결선을 끝까지 꽂는다.",
    check:
      "금속 핀별 배선을 추측하지 않는다. 일반 브레드보드 점퍼선으로 바꿔 그리지 않는다.",
    alt: "밝기 센서에 연결선 꽂기 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 9,
    title: "보드 A0 연결",
    image: "illustrations/10-board-a0.png",
    references: [
      "reference-photos/미디어 (39).jpeg",
      "reference-photos/미디어 (38).jpeg",
      "reference-photos/미디어 (37).jpeg",
    ],
    instruction: "연결선 반대쪽을 이지메이커 보드의 아날로그 입력 A0에 꽂는다.",
    check:
      "사진에서 확인된 물리 포트는 A0다. 통신 프레임의 채널 번호·값 단위·선형성은 별도 검증 대상이다.",
    alt: "보드 A0 연결 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 10,
    title: "노트북 USB 연결",
    image: "illustrations/11-usb-laptop.png",
    references: ["reference-photos/미디어 (44).jpeg"],
    instruction:
      "보드의 USB 단자에서 데이터 케이블을 연결한다. 사진처럼 필요하면 USB 허브를 거쳐 노트북에 연결한다.",
    check:
      "허브는 선택 사항이다. 기기에 맞는 케이블을 사용하고 충전 전용 케이블 문제를 점검한다. 사진만으로 보드 전원 스위치 위치의 필수 상태를 단정하지 않는다.",
    alt: "노트북 USB 연결 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 11,
    title: "실험 배치와 정렬",
    image: "illustrations/12-measurement-layout.png",
    references: [
      "reference-photos/미디어 (40).jpeg",
      "reference-photos/미디어 (42).jpeg",
      "reference-photos/미디어 (43).jpeg",
      "reference-photos/미디어 (44).jpeg",
    ],
    instruction:
      "밝기 센서는 움직이지 않게 고정하고 수광부가 뒤쪽 LED를 향하게 한다. LED와 수광부 중심의 높이를 맞춘다. 자동차 앞쪽은 센서에서 멀어지는 방향이다.",
    check:
      "거리는 LED 발광면과 센서 수광부 사이로 정한다. 손으로 든 사진은 방향 참고이며 본 측정은 센서를 고정한다. 그림 속 거리는 축척이 아니다.",
    alt: "실험 배치와 정렬 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
  {
    order: 12,
    title: "소등 후 측정",
    image: "illustrations/08-dark-observation.png",
    references: [
      "reference-photos/미디어 (32).jpeg",
      "reference-photos/미디어 (33).jpeg",
      "reference-photos/미디어 (35).jpeg",
      "reference-photos/미디어 (36).jpeg",
    ],
    instruction:
      "주변 조명 조건을 일정하게 정한다. 가능하면 주변광을 줄이고 배치를 확인한다. LED를 끈 배경값과 켠 상태를 기록한다.",
    check:
      "자동차 지시등·모니터·탁자 반사도 측정에 영향을 줄 수 있다. 사진 밝기는 조도 값이 아니다. 출발·정지 구간과 반복 측정을 구분한다.",
    alt: "소등 후 측정 단계 설명용 사진 기반 삽화",
    status:
      "photo-referenced illustration; compare exact hardware details with reference photos",
  },
];
