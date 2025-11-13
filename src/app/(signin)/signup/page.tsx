import Content from "@/components/mui-template/signup-side/components/Content";
import SignInCard from "@/components/mui-template/signup-side/components/SignInCard";
import { SignInCardMode } from "@/components/mui-template/signup-side/types/SignInCardMode";
import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import { verifyEmailCode } from "@/lib/EmailVerification";
import { getUserById } from "@/lib/Users";
import { redirect } from "next/navigation";

enum ErrorType {
  InvalidVerificationCode = "invalid_verification_code",
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    error?: string;
    oauth?: string;
    status?: string;
  }>;
}) {
  const { code, error, oauth, status } = await searchParams;
  const snackbars =
    error === ErrorType.InvalidVerificationCode
      ? ([
          { message: "無効な認証コードです。", variant: "error" as const },
        ] as SnackbarData[])
      : oauth === "discord" && status === "success"
      ? ([
          {
            message: "Discordアカウントの連携に成功しました。",
            variant: "success" as const,
          },
        ] as SnackbarData[])
      : oauth === "discord" && status === "error"
      ? ([
          {
            message: "Discordアカウントの連携に失敗しました。",
            variant: "error" as const,
          },
        ] as SnackbarData[])
      : [];
  if (code) {
    const validatedRes = await verifyEmailCode(code);
    if (validatedRes) {
      const userId = validatedRes.user_id;
      const user = await getUserById(userId);
      if (!user) {
        redirect("/signup?error=invalid_verification_code");
      }
      return (
        <>
          <Content mode={SignInCardMode.SignUpEmailValidated} />
          <SignInCard
            mode={SignInCardMode.SignUpEmailValidated}
            user={user}
            code={code}
          />
        </>
      );
    } else {
      redirect("/signup?error=invalid_verification_code");
    }
  }
  return (
    <>
      <TemporarySnackProvider snacks={snackbars} />
      <Content mode={SignInCardMode.SignUp} />
      <SignInCard mode={SignInCardMode.SignUp} />
    </>
  );
}
