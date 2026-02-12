import Complete from "@/components/mui-template/signup-side/components/Complete";
import Content from "@/components/mui-template/signup-side/components/Content";
import SignInCard from "@/components/mui-template/signup-side/components/SignInCard";
import { SignInCardMode } from "@/components/mui-template/signup-side/types/SignInCardMode";
import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
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
  FrontendErrorCodes,
  getFrontendErrorSnackbarData,
} from "@/types/Errors/FrontendErrors";
import {
  getResourceApiErrorSnackbarData,
  ResourceApiErrorCodes,
} from "@/types/Errors/ResourceApiErrors";

export const metadata = {
  title: "メンバー登録申請",
  description:
    "UniQUEのサインアップページです。UniProjectメンバーになるための申請を行います。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    error?:
      | AuthenticationErrorCodes
      | FormRequestErrorCodes
      | AuthServerErrorCodes
      | ResourceApiErrorCodes
      | FrontendErrorCodes;
    oauth?: string;
    status?: string;
    completed?: boolean;
    name?: string;
    email?: string;
    username?: string;
  }>;
}) {
  const { error, oauth, status, completed, name, email, username } =
    await searchParams;
  const snackbars: SnackbarData[] = [];

  if (error) {
    if (error.startsWith("A")) {
      snackbars.push(
        getAuthenticationErrorSnackbarData(error as AuthenticationErrorCodes),
      );
    } else if (error.startsWith("F")) {
      snackbars.push(
        getFormRequestErrorSnackbarData(error as FormRequestErrorCodes),
      );
    } else if (error.startsWith("D")) {
      snackbars.push(
        getAuthServerErrorSnackbarData(error as AuthServerErrorCodes),
      );
    } else if (error.startsWith("R")) {
      snackbars.push(
        getResourceApiErrorSnackbarData(error as ResourceApiErrorCodes),
      );
    } else if (error.startsWith("E")) {
      snackbars.push(getFrontendErrorSnackbarData(error as FrontendErrorCodes));
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

  return (
    <>
      <TemporarySnackProvider snacks={snackbars} />
      {completed ? (
        <Complete />
      ) : (
        <>
          <Content mode={SignInCardMode.SignUp} />
          <SignInCard
            mode={SignInCardMode.SignUp}
            initialFormValues={{ name, email, username }}
          />
        </>
      )}
    </>
  );
}
