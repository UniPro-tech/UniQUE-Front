import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import { VariantType } from "notistack";
import {
  AuthenticationErrorCodes,
  getAuthenticationErrorSnackbarData,
} from "@/errors/AuthenticationErrors";
import {
  AuthServerErrorCodes,
  getAuthServerErrorSnackbarData,
} from "@/errors/AuthServerErrors";
import {
  FormRequestErrorCodes,
  getFormRequestErrorSnackbarData,
} from "@/errors/FormRequestErrors";
import {
  getResourceApiErrorSnackbarData,
  ResourceApiErrorCodes,
} from "@/errors/ResourceApiErrors";
import {
  FrontendErrorCodes,
  getFrontendErrorSnackbarData,
} from "@/errors/FrontendErrors";
import AuthenticationPage, {
  AuthorizationFormState,
} from "@/components/Pages/Authentication/Client";
import { AuthorizationPageMode } from "@/components/Pages/Authentication";

export const metadata = {
  title: "アカウント移行",
  description:
    "UniQUEのアカウント移行ページです。UniQUE完成以前のメンバーの情報を移行します。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    username?: string;
    email?: string;
    externalEmail?: string;
    agreeToTerms?: string;
    rememberMe?: string;
    migration?: string;
    signouted?: string;
    error?:
      | AuthenticationErrorCodes
      | FormRequestErrorCodes
      | AuthServerErrorCodes
      | FrontendErrorCodes
      | ResourceApiErrorCodes;
  }>;
}) {
  const {
    migration,
    error,
    signouted,
    name,
    username,
    email,
    externalEmail,
    agreeToTerms,
    rememberMe,
  } = await searchParams;
  const initState: AuthorizationFormState = {
    name,
    username,
    email,
    externalEmail,
    agreeToTerms: agreeToTerms === "1",
    rememberMe: rememberMe === "1",
  };
  const snacks: SnackbarData[] = [
    ...(signouted
      ? [
          {
            message: `サインアウトしました。`,
            variant: "success" as VariantType,
          },
        ]
      : []),
    ...(migration
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
            : error?.startsWith("R")
              ? [
                  getResourceApiErrorSnackbarData(
                    error as ResourceApiErrorCodes,
                  ),
                ]
              : []),
  ];
  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <AuthenticationPage
        initFormState={initState}
        mode={AuthorizationPageMode.Migration}
      />
    </>
  );
}
