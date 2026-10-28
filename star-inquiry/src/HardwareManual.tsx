import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Expand,
  X,
} from "lucide-react";
import { hardwareSteps } from "./hardwareManualData";
import "./hardware-manual.css";

type HardwareImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
};
const photoDescriptions = [
  "마퀸 전면과 마이크로비트 장착 방향",
  "마퀸 뒤쪽 건전지 홀더 아래 전원 스위치를 가리킨 원본 사진",
  "전원을 켠 마퀸 전면",
  "전원을 켠 마퀸 전면의 다른 각도",
  "마이크로비트 앞면 왼쪽 A 버튼을 누르는 모습",
  "마퀸 앞쪽 초음파 센서와 장애물 배치",
  "뒤쪽 원형 LED와 앞쪽 장애물을 함께 보여 주는 배치",
  "주변 조명을 줄인 상태의 뒤쪽 LED",
  "주변 조명을 줄인 상태에서 위쪽으로 본 자동차",
  "뒤쪽 독립 LED와 세 개의 건전지",
  "어두운 환경의 자동차 전면 지시등과 뒤쪽 LED",
  "어두운 환경의 자동차 전면을 다른 각도에서 본 모습",
  "밝기 센서와 이지메이커 보드, USB 케이블, 센서 연결선",
  "이지메이커 보드 A0 물리 포트의 연결 확대",
  "이지메이커 보드 A0 물리 포트의 연결 확대, 사진 38과 중복",
  "멀리 있는 자동차 뒤쪽 LED와 밝기 센서의 정렬",
  "Light V2.0 중앙 평면 수광부와 흰색 전용 커넥터",
  "가까이 있는 자동차 뒤쪽 LED와 밝기 센서의 정렬",
  "멀리 있는 LED와 센서의 정렬을 다른 각도에서 본 모습",
  "밝기 센서에서 A0 보드, USB 허브를 거쳐 노트북으로 이어지는 연결",
  "마이크로비트 앞면의 LED 배열, A/B 버튼과 금색 접점",
  "마이크로비트 뒷면의 USB, 리셋 버튼, 배터리 단자",
  "자동차에 부착하기 전 켜진 독립 원형 LED",
  "마이크로비트 장착을 마친 마퀸 전면",
];
const landscapePhotos = new Set([33, 34, 37, 38, 39, 41, 44, 45, 46, 47, 48]);

function photo(number: number): HardwareImage {
  const landscape = landscapePhotos.has(number);
  return {
    src: `/assets/hardware/reference-photos/미디어 (${number}).jpeg`,
    width: landscape ? 1663 : 1247,
    height: landscape ? 1247 : 1663,
    alt: photoDescriptions[number - 25],
    label: `원본 사진 ${number}`,
  };
}
function illustration(order: number): HardwareImage {
  const step = hardwareSteps[order - 1];
  return {
    src: `/assets/hardware/${step.image}`,
    width: order === 7 ? 1173 : order === 11 ? 1167 : 1448,
    height: order === 7 ? 888 : order === 11 ? 860 : 1086,
    alt: step.alt,
    label: "사진 기반 생성 삽화 · 설명용",
  };
}
function referencePhotos(order: number) {
  return hardwareSteps[order - 1].references.map((path) =>
    photo(Number(path.match(/\((\d+)\)/)?.[1])),
  );
}
const clampStep = (value: number) =>
  Math.max(1, Math.min(12, Math.trunc(value) || 1));

export function HardwareEntry({
  onOpen,
  title = "장비 사용 설명서",
}: {
  onOpen: () => void;
  title?: string;
}) {
  return (
    <section className="hardware-entry" aria-label={title}>
      <BookOpen size={26} aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        <p>
          실물 사진과 그림으로 장착 방향, 뒤쪽 LED, 센서 A0 연결과 실험 배치를
          확인해요.
        </p>
      </div>
      <button className="primary" onClick={onOpen}>
        12단계 안내 열기 <ArrowRight size={17} aria-hidden="true" />
      </button>
    </section>
  );
}

export function HardwareManual({
  notes,
  setNote,
  initialStep = 1,
  onOpenCarCode,
}: {
  notes: Record<string, string>;
  setNote: (key: string, value: string) => void;
  initialStep?: number;
  onOpenCarCode?: () => void;
}) {
  const [active, setActive] = useState(() => clampStep(initialStep));
  const [expanded, setExpanded] = useState<HardwareImage | null>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const photoDialog = useRef<HTMLDialogElement>(null);
  const viewerTitle = useId();
  const step = hardwareSteps[active - 1];
  const done = hardwareSteps.filter(
    (item) => notes[`hardware.check.${item.order}`] === "true",
  ).length;
  const primaryImage =
    active === 5 ? photo(26) : active === 10 ? photo(44) : illustration(active);
  const originals = referencePhotos(active);
  const confirmed = notes[`hardware.check.${active}`] === "true";

  useEffect(() => {
    setActive(clampStep(initialStep));
    if (initialStep > 1)
      requestAnimationFrame(() => {
        detailHeading.current?.focus({ preventScroll: true });
        detailHeading.current?.scrollIntoView({ block: "start" });
      });
  }, [initialStep]);
  useEffect(() => {
    if (expanded) photoDialog.current?.showModal();
    else photoDialog.current?.close();
  }, [expanded]);

  const go = (order: number) => {
    setActive(clampStep(order));
    requestAnimationFrame(() => {
      detailHeading.current?.focus({ preventScroll: true });
      detailHeading.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };
  const imageButton = (item: HardwareImage, compact = false) => (
    <figure
      className={compact ? "hardware-photo-card" : "hardware-main-image"}
      key={item.src}
    >
      <button
        className="hardware-image-button"
        onClick={() => setExpanded(item)}
        aria-label={`${item.alt} 확대 보기`}
      >
        <img
          src={item.src}
          width={item.width}
          height={item.height}
          alt={item.alt}
          loading="lazy"
          decoding="async"
        />
        <span>
          <Expand size={15} aria-hidden="true" /> 확대 보기
        </span>
      </button>
      <figcaption>
        {item.label}
        {compact && (
          <>
            <br />
            {item.alt}
          </>
        )}
      </figcaption>
    </figure>
  );

  return (
    <section className="hardware-manual" aria-label="실험 장비 사용 설명서">
      <div className="hardware-intro">
        <span className="badge">실물 사진 24장 · 설명용 삽화 12장</span>
        <h3>실제 장비를 보며, 하나씩 확인해요.</h3>
        <p>
          그림은 구조를 이해하는 데 쓰고, 단자·버튼·방향은 원본 사진과 실제
          장비를 기준으로 확인합니다. 생성 삽화의 작은 글씨와 부품 모양을
          회로도나 핀 배선 근거로 쓰지 않아요.
        </p>
        <p className="hardware-route">
          <strong>진행 순서</strong> 준비·장착·LED → 코드 업로드 → 전원 →
          센서·USB → 정렬 → 주행 사전 시험 → 주변광 → 측정
        </p>
      </div>

      <div className="hardware-code-check">
        <div>
          <Code2 size={21} aria-hidden="true" />
          <h3>자동차 전원을 켜기 전에, 코드부터 확인해요.</h3>
        </div>
        <p>
          A 버튼 시작·B 버튼 정지·초음파 정지는 해당 프로그램을 올려야
          동작합니다. 첨부된 블록 코드는 초음파 값이 <strong>5cm 미만</strong>
          이면 멈추도록 되어 있어요. 다른 코드를 썼다면 그 코드의 실제 동작을
          확인하세요.
        </p>
        {onOpenCarCode && (
          <button onClick={onOpenCarCode}>
            마퀸 코드 장면별 안내 <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        <label className="check-row">
          <input
            type="checkbox"
            checked={notes["hardware.codeLoaded"] === "true"}
            onChange={(event) =>
              setNote("hardware.codeLoaded", String(event.target.checked))
            }
          />{" "}
          내가 사용할 프로그램을 micro:bit에 올리고 동작을 직접 확인했다.
        </label>
        <small>
          체크는 나의 확인 기록입니다. 앱이 코드 업로드나 기기 연결을 자동
          검사한 결과가 아닙니다.
        </small>
      </div>

      <div className="hardware-overview-heading">
        <h3>12단계 찾아보기</h3>
        <span>{done} / 12 직접 확인</span>
      </div>
      <nav className="hardware-overview" aria-label="장비 사용 설명서 단계">
        {hardwareSteps.map((item) => (
          <button
            key={item.order}
            className={active === item.order ? "current" : ""}
            aria-current={active === item.order ? "step" : undefined}
            onClick={() => go(item.order)}
          >
            <span className="hardware-step-icon">
              {notes[`hardware.check.${item.order}`] === "true" ? (
                <Check size={17} aria-label="확인 완료" />
              ) : (
                String(item.order).padStart(2, "0")
              )}
            </span>
            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      <article
        className="hardware-detail"
        aria-labelledby="hardware-detail-title"
      >
        <div className="hardware-detail-header">
          <span className="eyebrow">
            STEP {String(active).padStart(2, "0")} / 12
          </span>
          <span className={confirmed ? "hardware-confirmed" : "muted"}>
            {confirmed ? "✓ 직접 확인함" : "확인 전"}
          </span>
        </div>
        <h3 id="hardware-detail-title" ref={detailHeading} tabIndex={-1}>
          {step.title}
        </h3>
        <p className="hardware-instruction">{step.instruction}</p>
        {(active === 5 || active === 6 || active === 7) &&
          notes["hardware.codeLoaded"] !== "true" && (
            <p className="notice">
              전원·주행 시험에 앞서 프로그램 업로드와 정지 동작을 확인하세요.
              위의 코드 확인 항목에 기록할 수 있어요.
            </p>
          )}
        {imageButton(primaryImage)}
        {(active === 5 || active === 10) && (
          <p className="hardware-image-note">
            이 단계는 작은 스위치·연결을 확인할 수 있도록 원본 사진을 먼저 보여
            줍니다. 사진을 눌러 확대해 보세요.
          </p>
        )}
        <div className="hardware-check-note">
          <strong>이 부분을 확인해요</strong>
          <p>{step.check}</p>
          {active === 6 && (
            <p>
              앞쪽 초음파 센서는 고정된 밝기 센서에서 멀어지는 방향, 뒤쪽 독립
              LED는 밝기 센서를 향하게 합니다. A를 누른 시각은 측정 기록에서
              따로 표시하며 자동차와 센서는 자동 동기화되지 않습니다.
            </p>
          )}
          {active === 7 && (
            <p>
              초음파가 읽는 <strong>자동차 앞쪽–장애물 거리</strong>와 빛 실험의{" "}
              <strong>LED 발광면–센서 수광부 거리</strong>는 서로 달라요.
              장애물로 멈춘 이후의 데이터는 주행 구간과 구분합니다.
            </p>
          )}
          {active === 8 && (
            <p>
              <strong>Light V2.0 중앙의 평면 수광부</strong>가 LED를 바라봐야
              합니다. EZMaker 로고가 있는 뒷면으로 빛을 받지 않도록 앞뒤를
              확인하세요.
            </p>
          )}
          {active === 9 && (
            <p>
              A0는 제공 사진으로 확인한 물리 연결입니다. 통신 프레임의 채널
              번호를 0이라고 자동 가정하거나 원시값에 lux를 붙이지 않습니다.
            </p>
          )}
          {active === 11 && (
            <p>
              센서 케이블은 이지메이커 보드에 연결하고 센서를 고정합니다.
              자동차에 끌려가게 연결하지 않아요. 시작 거리는 0보다 크게 정하고
              실제 줄자로 발광면과 수광부 사이를 잽니다.
            </p>
          )}
          {active === 12 && (
            <p>
              LED를 가리거나 비춰 값이 반응하는지 확인하고, 최댓값에 붙는 포화
              상태를 점검합니다. 모터 설정 255를 속력으로 쓰지 않고 같은 시간
              동안 이동한 거리를 반복해서 재어 등속 구간을 정하세요.
            </p>
          )}
        </div>
        <label className="hardware-completion">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) =>
              setNote(`hardware.check.${active}`, String(event.target.checked))
            }
          />
          <span>
            실제 장비에서 이 단계의 설명과 확인 사항을 직접 점검했어요.
          </span>
        </label>
        <small className="hardware-check-caption">
          완료 표시는 이 브라우저의 학습 기록에 저장됩니다.
        </small>

        <details
          className="hardware-references"
          key={active}
          open={active === 9}
        >
          <summary>원본 사진 함께 보기 · {originals.length}장</summary>
          <div className="hardware-photo-grid">
            {originals.map((item) => imageButton(item, true))}
          </div>
        </details>
        {(active === 5 || active === 10) && (
          <details className="hardware-references">
            <summary>설명용 생성 삽화 보기</summary>
            {imageButton(illustration(active))}
            <p className="muted">
              그림과 실제 사진의 작은 부품·표기가 다르면 사진과 장비를 기준으로
              확인하세요.
            </p>
          </details>
        )}

        <div className="hardware-pagination">
          <button disabled={active === 1} onClick={() => go(active - 1)}>
            <ArrowLeft size={16} aria-hidden="true" /> 이전
          </button>
          <span>{active} / 12</span>
          <button
            className="primary"
            disabled={active === 12}
            onClick={() => go(active + 1)}
          >
            다음 <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </article>

      <details className="hardware-all-photos">
        <summary>원본 사진 전체 보기 · 24장</summary>
        <p className="muted">
          여러 각도·소등 사진과 중복 사진 38·39를 함께 보관했습니다. 사진 밝기나
          화면 속 크기로 조도·거리를 계산하지 않습니다.
        </p>
        <div className="hardware-photo-grid">
          {photoDescriptions.map((_, index) =>
            imageButton(photo(index + 25), true),
          )}
        </div>
      </details>

      <dialog
        ref={photoDialog}
        className="hardware-photo-viewer"
        aria-labelledby={viewerTitle}
        onCancel={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setExpanded(null);
        }}
      >
        {expanded && (
          <>
            <div className="hardware-viewer-header">
              <h3 id={viewerTitle}>{expanded.label}</h3>
              <button
                aria-label="확대 사진 닫기"
                onClick={() => setExpanded(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="hardware-viewer-body">
              <img
                src={expanded.src}
                width={expanded.width}
                height={expanded.height}
                alt={expanded.alt}
                loading="lazy"
              />
              <p>{expanded.alt}</p>
              <a href={expanded.src} target="_blank" rel="noopener noreferrer">
                원본 파일을 새 탭에서 보기 ↗
              </a>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
