import Content from "@/components/mui-template/signup-side/components/Content";
import SignInCard from "@/components/mui-template/signup-side/components/SignInCard";
import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import { VariantType } from "notistack";
import { SignInCardMode } from "@/components/mui-template/signup-side/types/SignInCardMode";
import {
  AuthenticationErrorCodes,
  getAuthenticationErrorSnackbarData,
} from "@/types/Errors/AuthenticationErrors";
import {
  FormRequestErrorCodes,
  getFormRequestErrorSnackbarData,
} from "@/types/Errors/FormRequestErrors";
import {
  getAuthServerErrorSnackbarData,
  AuthServerErrorCodes,
} from "@/types/Errors/AuthServerErrors";
import {
  FrontendErrorCodes,
  getFrontendErrorSnackbarData,
} from "@/types/Errors/FrontendErrors";

export const metadata = {
  title: "サインイン",
  description: "UniQUEのサインインページです。UniQUEにサインインします。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    mail?: string;
    migrated?: string;
    signouted?: string;
    redirect?: string;
    error?:
      | AuthenticationErrorCodes
      | FormRequestErrorCodes
      | AuthServerErrorCodes
      | FrontendErrorCodes;
  }>;
}) {
  const { mail, migrated, error, signouted, redirect } = await searchParams;
  const snacks: SnackbarData[] = [
    ...(signouted
      ? [
          {
            message: `サインアウトしました。`,
            variant: "success" as VariantType,
          },
        ]
      : []),
    ...(mail
      ? [
          {
            message: `メール認証を送信しました。メールをご確認ください。`,
            variant: "success" as VariantType,
          },
        ]
      : []),
    ...(migrated
      ? [
          {
            message: `アカウントの移行が完了しました。サインインしてください。`,
            variant: "success" as VariantType,
          },
        ]
      : []),
    ...(error?.startsWith("A")
      ? [getAuthenticationErrorSnackbarData(error as AuthenticationErrorCodes)]
      : error?.startsWith("F")
        ? [getFormRequestErrorSnackbarData(error as FormRequestErrorCodes)]
        : error?.startsWith("D")
          ? [getAuthServerErrorSnackbarData(error as AuthServerErrorCodes)]
          : error?.startsWith("E")
            ? [getFrontendErrorSnackbarData(error as FrontendErrorCodes)]
            : []),
  ];
  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <Content mode={SignInCardMode.SignIn} />
      <SignInCard mode={SignInCardMode.SignIn} redirect={redirect} />
    </>
  );
}
