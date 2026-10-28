export type Resource = {
  id: string;
  title: string;
  source: string;
  lesson: string;
  purpose: string;
  task: string;
  url: string;
  login: string;
  verified: string;
};

export const resources: Resource[] = [
  {
    id: "distance",
    title: "밝기로 구하는 별까지의 거리",
    source: "비바샘 · 2015 개정",
    lesson: "3차시",
    purpose: "앞선 수업과 연결할 참고 자료",
    task: "밝게 보이는 이유를 빛의 양과 거리로 나누어 적어 보세요.",
    url: "https://www.vivasam.com/viewer/main.popup?contentId=252423&contentGubun=CN030",
    login: "로그인 필요 확인",
    verified:
      "로그인 안내까지 확인 · 본문과 재생 내용 미확인. 제목은 교사 제공 정보입니다.",
  },
  {
    id: "light",
    title: "별의 밝기 실험",
    source: "비바샘 · 2015 개정",
    lesson: "3·4차시",
    purpose: "거리와 밝기 실험을 설계할 때 참고",
    task: "우리 실험과 같은 조건, 다른 조건을 기록하세요.",
    url: "https://www.vivasam.com/viewer/main.popup?contentId=252447&contentGubun=CN030",
    login: "로그인 필요 확인",
    verified:
      "로그인 안내까지 확인 · 재생과 본문 미확인. 제목은 교사 제공 정보입니다.",
  },
  {
    id: "video",
    title: "겉보기 등급과 절대 등급 관련 영상",
    source: "비바샘 · 2015 개정",
    lesson: "5차시",
    purpose: "등급 개념의 보충 설명용",
    task: "같은 거리에서 별을 비교해야 하는 이유를 설명하세요.",
    url: "https://www.vivasam.com/viewer/main.popup?contentId=252374&contentGubun=CN030",
    login: "로그인 화면 이동 확인",
    verified:
      "정확한 영상 제목·재생 내용 미확인 · 교사가 재생 후 사용 여부를 결정하세요.",
  },
  {
    id: "simulation",
    title: "별의 밝기와 등급 가상실험",
    source: "비상교육 · 2015 개정",
    lesson: "5차시",
    purpose: "별의 밝기, 전구 개수, 겉보기·절대 등급 비교",
    task: "1등급과 6등급을 놓고 전구 개수로 비교한 뒤 관찰을 기록하세요. 다음 탭에서 같은 10pc 거리의 비교를 살펴보세요.",
    url: "https://dn.vivasam.com/VS/MS/SCN/106314/zip/contents/%5B%EB%B9%84%EC%83%81%EA%B5%90%EC%9C%A1%5D%20%EC%A4%91%EB%93%B1_%EA%B3%BC%ED%95%99%203_7-1-2_%EB%B3%84%EC%9D%98%20%EB%B0%9D%EA%B8%B0%EC%99%80%20%EB%93%B1%EA%B8%89%28%EA%B0%80%EC%83%81%EC%8B%A4%ED%97%98%29/index.html",
    login: "이번 확인에서는 로그인 없이 실행",
    verified:
      "직접 조작 확인: 두 별 배치, 전구 비교 100개/1개, 겉보기·절대 등급 탭과 10pc 표시. 모든 조합의 동작을 검증한 것은 아닙니다.",
  },
  {
    id: "lab22",
    title: "과학 가상 실험실",
    source: "비바샘 · 2022 개정",
    lesson: "3·5차시",
    purpose: "22개정 과학 2(임태훈) → Ⅷ. 별과 우주 자료 찾기",
    task: "교과 개념 「8-1-2_별의 등급과 밝기」와 추가 탐구 「별의 밝기와 등급」을 교사와 찾아본 뒤, 확인한 내용을 기록하세요.",
    url: "https://v.vivasam.com/themeplace/sciencelab/main.do",
    login: "내부 자료는 로그인 후 확인 필요",
    verified:
      "공개 첫 화면·교과서 선택 항목 확인 · 신규 자료 내부 기능과 실행은 미확인",
  },
  {
    id: "qr",
    title: "과학 2 QR 콘텐츠",
    source: "비바샘 · 2022 개정",
    lesson: "3·5차시",
    purpose: "272쪽 도입·빛의 세기 탐구, 278쪽 정리 자료 찾기",
    task: "확인한 쪽과 자료 이름을 적고 우리 탐구와의 연결점을 기록하세요.",
    url: "https://viewer.vivasam.com/qrviewer/viewer.html?qrcode=106582_5p_1_ST",
    login: "뷰어 외 내부 자료 로그인 여부 미확인",
    verified:
      "QR 뷰어와 가로 화면 안내 확인 · 자료별 재생 미확인. 쪽 정보는 교사 제공 기준입니다.",
  },
  {
    id: "quiz",
    title: "8-1 중단원 5분 정리 문제",
    source: "비바샘 · 2022 개정",
    lesson: "5차시",
    purpose: "겉보기 등급·절대 등급과 10pc 관계 확인",
    task: "두 번째 문항을 풀고, 등급의 관계를 거리와 연결한 이유를 기록하세요.",
    url: "https://viewer.vivasam.com/VS/MS/SCN/106582/qr/quiz/8-1/index.html",
    login: "이번 확인에서는 로그인 없이 실행",
    verified: "시작 화면 및 두 번째 문항 주제 확인",
  },
  {
    id: "samboard",
    title: "샘보드",
    source: "비바샘",
    lesson: "3~5차시",
    purpose: "예상–관찰–설명 공유",
    task: "보고서의 공유용 텍스트와 그래프를 내보내 교사가 지정한 보드에 직접 올리세요.",
    url: "https://samboard.vivasam.com/landing",
    login: "실제 보드의 접근 권한은 교사가 확인",
    verified:
      "안내 페이지 주소 확인 · 보드 게시 미실행. 교사가 실제 보드 URL로 바꿀 수 있습니다.",
  },
  {
    id: "teacherVideo",
    title: "교사 실험 참고 영상",
    source: "교사 제공 · YouTube",
    lesson: "3·4차시",
    purpose: "교사가 제공한 실험 영상 참고",
    task: "직접 확인한 장비 배치와 실험 조건을 적으세요.",
    url: "https://www.youtube.com/watch?v=wmQ-tinG0uU",
    login: "로그인·연령·브라우저 제한 미확인",
    verified: "재생 내용 미확인",
  },
];

export function safeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function Resources({
  notes,
  setNote,
  teacher,
}: {
  notes: Record<string, string>;
  setNote: (key: string, value: string) => void;
  teacher: boolean;
}) {
  return (
    <section aria-labelledby="resource-title">
      <h2 id="resource-title">탐구 자료실</h2>
      <p className="muted">
        필요한 자료를 골라 새 탭에서 열어 보세요. 일부 자료는 비바샘 로그인이
        필요합니다.
      </p>
      <div className="resource-grid">
        {resources
          .filter(
            (item) => teacher || notes[`resource.${item.id}.hidden`] !== "true",
          )
          .map((item) => {
            const key = `resource.${item.id}`;
            const url = notes[`${key}.url`] ?? item.url;
            const valid = safeExternalUrl(url);
            return (
              <article className="card resource-card" key={item.id}>
                <span className="badge">{item.lesson}</span>
                <h3>{item.title}</h3>
                <p className="muted">{item.source}</p>
                <p>{item.purpose}</p>
                {valid ? (
                  <a
                    className="secondary"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    원본 자료 열기 ↗
                  </a>
                ) : (
                  <p role="alert">
                    올바른 http 또는 https 주소를 입력해 주세요.
                  </p>
                )}
                <details>
                  <summary>살펴볼 질문 · 메모 남기기</summary>
                  <p>
                    <strong>돌아와서 할 활동: </strong>
                    {item.task}
                  </p>
                  <label className="field">
                    관찰 기록
                    <textarea
                      value={notes[`${key}.observation`] ?? ""}
                      onChange={(event) =>
                        setNote(`${key}.observation`, event.target.value)
                      }
                      placeholder="직접 관찰한 내용을 적어 주세요."
                      rows={3}
                    />
                  </label>
                </details>
                {teacher && (
                  <details>
                    <summary>교사용 확인 상태와 링크 설정</summary>
                    <p>
                      <strong>로그인:</strong> {item.login}
                    </p>
                    <p>
                      <strong>2026-10-28 확인:</strong> {item.verified}
                    </p>
                    <label className="field">
                      원본 링크 수정
                      <input
                        type="url"
                        value={url}
                        onChange={(event) =>
                          setNote(`${key}.url`, event.target.value)
                        }
                        aria-invalid={!valid}
                      />
                    </label>
                    {url !== item.url && (
                      <p className="notice">
                        수정한 주소의 내용·로그인·재생 상태는 다시 확인해야
                        합니다.
                      </p>
                    )}
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={notes[`${key}.hidden`] === "true"}
                        onChange={(event) =>
                          setNote(`${key}.hidden`, String(event.target.checked))
                        }
                      />{" "}
                      학생 자료실에서 숨기기
                    </label>
                  </details>
                )}
              </article>
            );
          })}
      </div>
    </section>
  );
}
