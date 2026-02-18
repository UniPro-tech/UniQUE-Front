import { Metadata, Viewport } from "next";
import BirthdateGuard from "@/components/BirthdateGuard";
import Session from "@/types/Session";
import { generateCSRFToken } from "@/lib/CSRF";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "UniQUE - デジタル創作サークルUniProject メンバーズポータル",
    template: "%s | UniQUE",
  },
  description:
    "デジタル創作サークルUniProjectのメンバーズポータルサイトです。ここでメンバー登録を行ったり、各種サービスにアクセスできます。",
  applicationName: "UniQUE",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1f8ae1",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await Session.get();
  const birthdate = session?.user?.profile?.birthdate || "";
  const mustSetBirthdate = Boolean(session && !birthdate);
  const csrfToken = session ? generateCSRFToken(session.userId) : "";

  return (
    <html lang="ja">
      <body className={`antialiased`}>
        {children}
        <BirthdateGuard
          mustSetBirthdate={mustSetBirthdate}
          csrfToken={csrfToken}
          initialBirthdate={birthdate}
        />
      </body>
    </html>
  );
}
