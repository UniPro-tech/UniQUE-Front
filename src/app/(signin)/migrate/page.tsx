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

export const metadata = {
  title: "アカウント移行",
  description:
    "UniQUEのアカウント移行ページです。UniQUE完成以前のメンバーの情報を移行します。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    mail?: string;
    error?: AuthenticationErrorCodes | FormRequestErrorCodes;
  }>;
}) {
  const { mail, error } = await searchParams;
  const snacks: SnackbarData[] = [
    ...(mail
      ? [
          {
            message: `メール認証を送信しました。メールをご確認ください。`,
            variant: "success" as VariantType,
          },
        ]
      : []),
    ...(error?.startsWith("A")
      ? [getAuthenticationErrorSnackbarData(error as AuthenticationErrorCodes)]
      : error?.startsWith("F")
      ? [getFormRequestErrorSnackbarData(error as FormRequestErrorCodes)]
      : []),
  ];
  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <Content mode={SignInCardMode.Migrate} />
      <SignInCard mode={SignInCardMode.Migrate} />
    </>
  );
}
