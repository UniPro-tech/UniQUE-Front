import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "メールアドレス認証",
  description: "外部メールアドレスの認証を行います。",
};

export default async function EmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  // このページは廃止され、統一エンドポイント /email-verify にリダイレクト
  if (code) {
    redirect(`/email-verify?code=${code}`);
  }

  redirect("/dashboard/settings");
}
