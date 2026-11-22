import { Monitor } from "lucide-react";

// 1024px 미만(Tailwind 4의 max-[1024px]는 width < 1024px)에서는 레이아웃을 보장하지 않으므로 안내 화면으로 덮는다 (명세 9장 8단계).
// CSS만으로 동작해 서버 렌더·첫 화면에서도 깜빡임 없이 보인다.
export default function SmallScreenNotice() {
  return (
    <div
      role="alertdialog"
      aria-labelledby="small-screen-title"
      className="fixed inset-0 z-[100] hidden flex-col items-center justify-center bg-bg px-6 text-center max-[1024px]:flex"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-card bg-surface text-text-sub">
        <Monitor aria-hidden size={26} strokeWidth={1.7} />
      </span>
      <h1 id="small-screen-title" className="mt-5 text-[22px] font-bold text-text">
        PC에서 이용해 주세요
      </h1>
      <p className="mt-2 text-[15px] leading-[1.6] text-text-sub">
        이 프로토타입은 1024px 이상 화면에 맞춰 만들었어요.
      </p>
    </div>
  );
}
