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
import {
  FrontendErrorCodes,
  getFrontendErrorSnackbarData,
} from "@/types/Errors/FrontendErrors";

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
    error?:
      | AuthenticationErrorCodes
      | FormRequestErrorCodes
      | AuthServerErrorCodes
      | ResourceApiErrorCodes
      | FrontendErrorCodes;
    name?: string;
    email?: string;
    period?: string;
    username?: string;
  }>;
}) {
  const { mail, error, name, email, period, username } = await searchParams;
  const snacks: SnackbarData[] = [];

  if (mail) {
    snacks.push({
      message: `メール認証を送信しました。メールをご確認ください。`,
      variant: "success" as VariantType,
    });
  }

  if (error) {
    if (error.startsWith("A")) {
      snacks.push(
        getAuthenticationErrorSnackbarData(error as AuthenticationErrorCodes),
      );
    } else if (error.startsWith("F")) {
      snacks.push(
        getFormRequestErrorSnackbarData(error as FormRequestErrorCodes),
      );
    } else if (error.startsWith("D")) {
      snacks.push(
        getAuthServerErrorSnackbarData(error as AuthServerErrorCodes),
      );
    } else if (error.startsWith("R")) {
      snacks.push(
        getResourceApiErrorSnackbarData(error as ResourceApiErrorCodes),
      );
    } else if (error.startsWith("E")) {
      snacks.push(
        getFrontendErrorSnackbarData(error as FrontendErrorCodes),
      );
    }
  }
  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <Content mode={SignInCardMode.Migrate} />
      <SignInCard
        mode={SignInCardMode.Migrate}
        initialFormValues={{ name, email, period, username }}
      />
    </>
  );
}
