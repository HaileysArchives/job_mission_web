import Link from "next/link";
import { Search, User } from "lucide-react";

type HeaderProps = {
  /** job: 공고 상세(가운데 메뉴 + 검색), mission: 미션·결과(“직무 미션” 표시, 프로필만) */
  variant?: "job" | "mission";
};

const NAV_ITEMS = ["채용", "기업정보", "커뮤니티"];

function Logo() {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-navy"
    >
      <span className="h-[15px] w-[15px] rounded-[3px] bg-white" />
    </span>
  );
}

function ProfileButton() {
  return (
    <button
      type="button"
      aria-label="프로필"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-sub"
    >
      <User size={18} strokeWidth={1.8} />
    </button>
  );
}

export default function Header({ variant = "job" }: HeaderProps) {
  const isMission = variant === "mission";

  return (
    <header className="h-header w-full border-b border-border bg-bg">
      <div
        className={`relative mx-auto flex h-full items-center justify-between px-6 ${
          isMission ? "max-w-mission" : "max-w-job"
        }`}
      >
        <div className="flex items-center">
          <Link
            href="/jobs/performance-marketing"
            className="flex items-center gap-2.5"
          >
            <Logo />
            <span className="text-[17px] font-bold tracking-[-0.02em] text-text">
              커리어 플랫폼
            </span>
          </Link>
          {isMission && (
            <>
              <span aria-hidden className="mx-4 h-4 w-px bg-border" />
              <span className="text-[14px] font-medium text-text-muted">
                직무 미션
              </span>
            </>
          )}
        </div>

        {!isMission && (
          <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                className="text-[15px] font-bold text-text"
              >
                {item}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {!isMission && (
            <button
              type="button"
              aria-label="검색"
              className="flex h-9 w-9 items-center justify-center text-text-sub"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>
          )}
          <ProfileButton />
        </div>
      </div>
    </header>
  );
}
