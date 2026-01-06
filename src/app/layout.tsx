import { Metadata, Viewport } from "next";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
