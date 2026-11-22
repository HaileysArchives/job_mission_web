import type { Metadata } from "next";
import "./globals.css";
import SmallScreenNotice from "@/components/SmallScreenNotice";

export const metadata: Metadata = {
  title: "커리어 플랫폼 · 직무 미션",
  description: "채용공고에서 10분 만에 실제 직무 과제를 체험해 보는 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <SmallScreenNotice />
      </body>
    </html>
  );
}
