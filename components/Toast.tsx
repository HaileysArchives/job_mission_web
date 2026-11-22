"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 간단한 하단 토스트. useToast()로 show(message)를 받아 쓴다. */
export function useToast(duration = 2400) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toast = (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-btn bg-navy px-5 py-3 text-[14px] font-medium text-white transition-all duration-200 ${
        message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {message}
    </div>
  );

  return { show, toast };
}
