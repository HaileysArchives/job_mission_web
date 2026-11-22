import Header from "@/components/Header";

// 1단계(세팅) 확인용 임시 페이지. 8단계 마무리 때 삭제한다.

const COLORS: [string, string][] = [
  ["bg-bg", "bg #FFFFFF"],
  ["bg-surface", "surface #F4F5F8"],
  ["bg-border", "border #E6E8EC"],
  ["bg-text", "text #111318"],
  ["bg-text-sub", "text-sub #5B606B"],
  ["bg-text-muted", "text-muted #9AA0AA"],
  ["bg-navy", "navy #1D202F"],
  ["bg-accent", "accent #E3704F"],
  ["bg-accent-soft", "accent-soft #FDF4F1"],
  ["bg-accent-green", "accent-green #3A9B82"],
  ["bg-up-bg", "up-bg #E8F5EC"],
  ["bg-down-bg", "down-bg #FCEBEC"],
  ["bg-success", "success #2E9E5B"],
  ["bg-success-bg", "success-bg #EEF7F2"],
];

export default function SetupPreview() {
  return (
    <div className="min-h-screen bg-bg">
      <p className="px-6 pt-4 text-label font-medium text-text-muted">
        Header — 공고 상세 (variant=&quot;job&quot;)
      </p>
      <Header variant="job" />

      <p className="px-6 pt-8 text-label font-medium text-text-muted">
        Header — 미션·결과 (variant=&quot;mission&quot;)
      </p>
      <Header variant="mission" />

      <div className="mx-auto max-w-job px-6 py-10">
        <h2 className="text-card-title text-text">색상 토큰</h2>
        <div className="mt-4 grid grid-cols-7 gap-3">
          {COLORS.map(([cls, name]) => (
            <div key={name}>
              <div className={`h-14 rounded-card border border-border ${cls}`} />
              <p className="mt-1.5 text-label font-medium text-text-sub">{name}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-card-title text-text">타이포그래피 (Pretendard)</h2>
        <div className="mt-4 space-y-3">
          <p className="text-job-title text-text">퍼포먼스 마케팅 신입사원</p>
          <p className="text-card-title text-text">8월 채널별 광고 성과</p>
          <p className="text-question text-text">
            <span className="mr-1.5 text-accent">Q.</span>다음 달 광고 예산을 추가
            배분한다면 어느 채널을 선택하시겠습니까?
          </p>
          <p className="text-body font-medium text-text">
            Q3에 광고비를 30% 늘렸는데 매출 성장은 오히려 둔화됐어요.
          </p>
          <p className="text-caption font-medium text-text-muted">경력 · 학력 · 근무형태 · 마감일</p>
        </div>

        <h2 className="mt-10 text-card-title text-text">형태</h2>
        <div className="mt-4 flex items-center gap-3">
          <span className="rounded-tag bg-surface px-3 py-1.5 text-caption font-medium text-text-sub">신입</span>
          <span className="rounded-tag bg-navy px-3 py-1.5 text-caption font-bold text-white">D-12</span>
          <button className="rounded-btn bg-navy px-6 py-3 text-body font-bold text-white">입사지원 하기</button>
          <button className="rounded-btn bg-accent px-6 py-3 text-body font-bold text-white">10분 체험 시작 →</button>
          <span className="rounded-full border border-border bg-surface px-4 py-2 text-caption font-medium text-text-sub">소요시간 약 3분</span>
        </div>
      </div>
    </div>
  );
}
