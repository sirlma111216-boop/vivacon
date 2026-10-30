import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, BookOpen, Code2, Expand, X } from "lucide-react";
import {
  hardwareSections,
  hardwareSteps,
  sectionForHardwareStep,
  type HardwareSectionKey,
} from "./hardwareManualData";
import { SmartImage } from "./SmartImage";
import "./hardware-manual.css";

type HardwareImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
  rotate?: boolean;
};
const photoDescriptions = [
  "마퀸 앞쪽과 마이크로비트를 꽂은 방향",
  "자동차 뒤쪽 건전지 홀더 아래 전원 스위치",
  "전원을 켠 마퀸 앞쪽",
  "전원을 켠 마퀸 앞쪽의 다른 모습",
  "마이크로비트 앞면 왼쪽 A 버튼을 누르는 모습",
  "자동차 앞쪽 초음파 센서와 장애물",
  "뒤쪽 원형 LED와 앞쪽 장애물을 함께 놓은 모습",
  "주변 조명을 줄인 상태의 뒤쪽 LED",
  "주변 조명을 줄인 상태에서 위에서 본 자동차",
  "뒤쪽 원형 LED와 세 개의 건전지",
  "어두운 곳에서 켠 자동차 지시등과 뒤쪽 LED",
  "어두운 곳에서 다른 방향으로 본 자동차 앞쪽",
  "밝기 센서, 이지메이커 보드, USB 케이블과 연결선",
  "이지메이커 보드의 A0 연결 자리를 가까이 본 모습",
  "이지메이커 보드의 A0에 연결선을 꽂은 모습",
  "멀리 있는 LED와 밝기 센서의 높이·방향을 맞춘 모습",
  "밝기 센서 가운데 빛을 받는 곳과 흰색 연결 자리",
  "가까이 있는 LED와 밝기 센서의 높이·방향을 맞춘 모습",
  "LED와 센서가 마주 보는 모습을 다른 방향에서 본 사진",
  "밝기 센서에서 A0 보드, USB 허브를 거쳐 노트북으로 연결한 모습",
  "마이크로비트 앞면의 LED, A·B 버튼과 금색 부분",
  "마이크로비트 뒷면의 USB, 리셋 버튼과 배터리 연결 자리",
  "자동차에 달기 전 켜진 원형 LED",
  "마이크로비트를 꽂은 자동차 앞쪽",
];
const landscapePhotos = new Set([33, 34, 37, 38, 39, 41, 44, 45, 46, 47, 48]);

function photo(number: number): HardwareImage {
  const landscape = landscapePhotos.has(number);
  return {
    src: `/assets/hardware/reference-photos/미디어 (${number}).jpeg`,
    width: landscape ? 1663 : 1247,
    height: landscape ? 1247 : 1663,
    alt: photoDescriptions[number - 25],
    label: `실물 사진 ${number}`,
    rotate: number === 32,
  };
}
function illustration(order: number): HardwareImage {
  const step = hardwareSteps.find((item) => item.order === order)!;
  return {
    src: `/assets/hardware/${step.image}`,
    width: order === 7 ? 1173 : order === 11 ? 1167 : 1448,
    height: order === 7 ? 888 : order === 11 ? 860 : 1086,
    alt: step.alt,
    label: "설명용 생성 그림",
  };
}

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
        <p>자동차 준비부터 센서 연결, 측정 자리까지 실물 사진으로 살펴봐요.</p>
      </div>
      <button className="primary" onClick={onOpen}>
        장비 안내 열기 <ArrowRight size={17} aria-hidden="true" />
      </button>
    </section>
  );
}

export function HardwareSectionContent({
  section: sectionKey,
  orders,
  title,
  hideTitle = false,
  onOpenCarCode,
  includeAllPhotos = false,
}: {
  section: HardwareSectionKey;
  orders?: number[];
  title?: string;
  hideTitle?: boolean;
  onOpenCarCode?: () => void;
  includeAllPhotos?: boolean;
}) {
  const [expanded, setExpanded] = useState<HardwareImage | null>(null);
  const photoDialog = useRef<HTMLDialogElement>(null);
  const viewerTitle = useId();
  const sectionTitle = useId();
  const section =
    hardwareSections.find((item) => item.id === sectionKey) ??
    hardwareSections[0];
  const items = section.orders
    .filter((order) => !orders || orders.includes(order))
    .map((order) => hardwareSteps.find((item) => item.order === order)!);

  useEffect(() => {
    if (expanded && !photoDialog.current?.open)
      photoDialog.current?.showModal();
    else if (!expanded) photoDialog.current?.close();
  }, [expanded]);

  const imageButton = (item: HardwareImage, compact = false) =>
    /(?:미디어 \((?:27|28|30)\)\.jpeg|05-power-switch\.png|06-press-a\.png)$/.test(item.src) ? null : (
    <figure
      className={compact ? "hardware-photo-card" : "hardware-main-image"}
      key={item.src}
    >
      <button
        className={`hardware-image-button${item.rotate ? " hardware-photo-rotated" : ""}`}
        onClick={() => setExpanded(item)}
        aria-label={`${item.alt} 확대 보기`}
      >
        <SmartImage
          key={item.src}
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
        {compact && ` · ${item.alt}`}
      </figcaption>
    </figure>
  );

  return (
    <section className="hardware-manual hardware-section-content">
      <section
        className="hardware-section"
        aria-labelledby={hideTitle ? undefined : sectionTitle}
        key={section.id}
      >
        {!hideTitle && (
          <header className="hardware-section-heading">
            <h3 id={sectionTitle}>{title ?? section.title}</h3>
            {!title && <p>{section.summary}</p>}
          </header>
        )}

        {section.id === "car" && onOpenCarCode && (
          <div className="hardware-code-link">
            <Code2 size={22} aria-hidden="true" />
            <p>
              A 버튼 출발·B 버튼 정지를 사용하려면 해당 프로그램을 먼저 넣어야
              해요.
            </p>
            <button onClick={onOpenCarCode}>
              마퀸 코딩 방법 <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="hardware-topics">
          {items.map((item) => (
            <article className="hardware-topic" key={item.order}>
              <h4>{item.title}</h4>
              <p>{item.instruction}</p>
              {item.equipment && (
                <ul className="hardware-kit-list">
                  {item.equipment.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              )}
              <div className="hardware-step-photos">
                {(!item.primaryPhoto || item.order === 2) && imageButton(illustration(item.order))}
                {(item.order === 2
                  ? [45]
                  : item.order === 3
                  ? [48]
                  : item.order === 4
                    ? [47]
                    : item.order === 7
                      ? [34]
                    : [
                        ...new Set([
                          ...(item.primaryPhoto ? [item.primaryPhoto] : []),
                          ...item.references,
                        ]),
                      ]
                ).filter((number) => ![27, 28, 30].includes(number)).map((number) => (
                  <div className="hardware-step-detail" key={number}>
                    <p>
                      {number === 45
                        ? "마이크로비트 아래쪽 금색 부분을 마퀸의 연결 자리에 꽂아요. 자동차 전원은 꺼 두세요."
                        : number === 47
                        ? "먼저 원형 LED를 켜서 빛이 나오는 쪽을 찾아요."
                        : number === 31
                          ? "LED를 자동차 뒤쪽에 고정하고, 빛이 센서를 향하도록 놓아요."
                          : number === 34
                            ? "자동차 앞에 장애물을 놓고, 가까이 가면 멈추는지 살펴봐요."
                            : photoDescriptions[number - 25]}
                    </p>
                    {imageButton(photo(number))}
                    {item.order === 4 && number === 47 && (
                      <>
                        <p>이 LED를 자동차 뒤쪽에 아래 그림처럼 고정해요. 빛이 자동차 뒤를 향하게 해요.</p>
                        {imageButton(illustration(4))}
                      </>
                    )}
                  </div>
                ))}
                {item.primaryPhoto && ![2, 3, 4, 5, 6, 7].includes(item.order) && (
                  <div className="hardware-step-detail">
                    <p>{item.alt.replace("설명용 그림", "설명 그림")}</p>
                    {imageButton(illustration(item.order))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <details className="hardware-extra">
          <summary>교사용 참고</summary>
          <ul>
            {section.teacherNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </details>
      </section>

      {includeAllPhotos && (
        <details className="hardware-extra hardware-all-photos">
          <summary>실물 사진 전체 보기 · 24장</summary>
          <div className="hardware-photo-grid">
            {photoDescriptions.map((_, index) =>
              imageButton(photo(index + 25), true),
            )}
          </div>
        </details>
      )}

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
              <div
                className={
                  expanded.rotate ? "hardware-photo-rotated" : undefined
                }
              >
                <SmartImage
                  key={expanded.src}
                  src={expanded.src}
                  width={expanded.width}
                  height={expanded.height}
                  alt={expanded.alt}
                  loading="eager"
                />
              </div>
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

export function HardwareManual({
  initialStep = 1,
  onOpenCarCode,
}: {
  notes?: Record<string, string>;
  setNote?: (key: string, value: string) => void;
  initialStep?: number;
  onOpenCarCode?: () => void;
}) {
  const [active, setActive] = useState<HardwareSectionKey>(
    () => sectionForHardwareStep(initialStep).id,
  );
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setActive(sectionForHardwareStep(initialStep).id);
    if (initialStep > 1)
      requestAnimationFrame(() => {
        content.current?.focus({ preventScroll: true });
        content.current?.scrollIntoView({ block: "start" });
      });
  }, [initialStep]);
  function go(id: HardwareSectionKey) {
    setActive(id);
    requestAnimationFrame(() => {
      content.current?.focus({ preventScroll: true });
      content.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }
  return (
    <section className="hardware-manual" aria-label="실험 장비 사용 설명서">
      <div className="hardware-intro">
        <h3>사진으로 보는 실험 준비</h3>
        <p>
          그림은 설명용입니다. 부품 모양과 연결 자리는 실물 사진을 기준으로 봐
          주세요.
        </p>
      </div>
      <nav className="hardware-sections" aria-label="장비 안내 목차">
        {hardwareSections.map((item) => (
          <button
            key={item.id}
            className={active === item.id ? "current" : ""}
            aria-current={active === item.id ? "true" : undefined}
            onClick={() => go(item.id)}
          >
            {item.title}
          </button>
        ))}
      </nav>
      <div className="hardware-selected-section" ref={content} tabIndex={-1}>
        <HardwareSectionContent
          key={active}
          section={active}
          onOpenCarCode={onOpenCarCode}
          includeAllPhotos
        />
      </div>
    </section>
  );
}
