import Content, {
  ContentMode,
} from "@/components/mui-template/signup-side/components/Content";
import SignInCard, {
  SignInCardMode,
} from "@/components/mui-template/signup-side/components/SignInCard";
import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import { verifyEmailCode } from "@/lib/EmailVerification";
import { redirect, RedirectType } from "next/navigation";

enum ErrorType {
  InvalidVerificationCode = "invalid_verification_code",
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;
  const snackbars =
    error === ErrorType.InvalidVerificationCode
      ? ([
          { message: "無効な認証コードです。", variant: "error" as const },
        ] as SnackbarData[])
      : [];
  if (code) {
    const validatedRes = await verifyEmailCode(code);
    if (validatedRes) {
      return (
        <>
          <Content mode={ContentMode.SignUpEmailValidated} />
          <SignInCard mode={SignInCardMode.SignInEmailValidated} />
        </>
      );
    } else {
      redirect("/signup?error=invalid_verification_code");
    }
  }
  return (
    <>
      <TemporarySnackProvider snacks={snackbars} />
      <Content mode={ContentMode.SignUp} />
      <SignInCard mode={SignInCardMode.SignUp} />
    </>
  );
}
