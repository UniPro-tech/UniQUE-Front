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
    error?:
      | AuthenticationErrorCodes
      | FormRequestErrorCodes
      | AuthServerErrorCodes;
  }>;
}) {
  const { mail, migrated, error } = await searchParams;
  const snacks: SnackbarData[] = [
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
      : []),
  ];
  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <Content mode={SignInCardMode.SignIn} />
      <SignInCard mode={SignInCardMode.SignIn} />
    </>
  );
}
