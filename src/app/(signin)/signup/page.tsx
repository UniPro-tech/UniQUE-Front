import Complete from "@/components/mui-template/signup-side/components/Complete";
import Content from "@/components/mui-template/signup-side/components/Content";
import SignInCard from "@/components/mui-template/signup-side/components/SignInCard";
import { SignInCardMode } from "@/components/mui-template/signup-side/types/SignInCardMode";
import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import { verifyEmailCode } from "@/lib/EmailVerification";
import { getUserById } from "@/lib/resources/Users";
import {
  AuthenticationErrorCodes,
  getAuthenticationErrorSnackbarData,
} from "@/types/Errors/AuthenticationErrors";
import {
  AuthServerErrorCodes,
  getAuthServerErrorSnackbarData,
} from "@/types/Errors/AuthServerErrors";
import {
  FormRequestErrorCodes,
  getFormRequestErrorSnackbarData,
} from "@/types/Errors/FormRequestErrors";
import {
  getResourceApiErrorSnackbarData,
  ResourceApiErrorCodes,
} from "@/types/Errors/ResourceApiErrors";
import { redirect } from "next/navigation";

export const metadata = {
  title: "メンバー登録申請",
  description:
    "UniQUEのサインアップページです。UniProjectメンバーになるための申請を行います。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    error?:
      | AuthenticationErrorCodes
      | FormRequestErrorCodes
      | AuthServerErrorCodes
      | ResourceApiErrorCodes;
    oauth?: string;
    status?: string;
    completed?: boolean;
  }>;
}) {
  const { code, error, oauth, status, completed } = await searchParams;
  const snackbars: SnackbarData[] = [];

  if (error) {
    if (error.startsWith("A")) {
      snackbars.push(
        getAuthenticationErrorSnackbarData(error as AuthenticationErrorCodes)
      );
    } else if (error.startsWith("F")) {
      snackbars.push(
        getFormRequestErrorSnackbarData(error as FormRequestErrorCodes)
      );
    } else if (error.startsWith("D")) {
      snackbars.push(
        getAuthServerErrorSnackbarData(error as AuthServerErrorCodes)
      );
    } else if (error.startsWith("R")) {
      snackbars.push(
        getResourceApiErrorSnackbarData(error as ResourceApiErrorCodes)
      );
    }
  }

  if (oauth === "discord" && status === "success") {
    snackbars.push({
      message: "Discordアカウントの連携に成功しました。",
      variant: "success" as const,
    });
  } else if (oauth === "discord" && status === "error") {
    snackbars.push({
      message: "Discordアカウントの連携に失敗しました。",
      variant: "error" as const,
    });
  }
  if (code) {
    const validatedRes = await verifyEmailCode(code);
    if (validatedRes) {
      const userId = validatedRes.user_id;
      const user = await getUserById(userId);
      if (!user) {
        redirect(
          "/signup?error=" +
            AuthenticationErrorCodes.InvalidEmailVerificationCode
        );
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
      redirect(
        "/signup?error=" + AuthenticationErrorCodes.InvalidEmailVerificationCode
      );
    }
  }
  return (
    <>
      <TemporarySnackProvider snacks={snackbars} />
      {completed ? (
        <Complete />
      ) : (
        <>
          <Content mode={SignInCardMode.SignUp} />
          <SignInCard mode={SignInCardMode.SignUp} />
        </>
      )}
    </>
  );
}
