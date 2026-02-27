import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { VariantType } from "notistack";
import AuthenticationPage, {
  AuthorizationPageMode,
} from "@/components/Pages/Authentication/Client";
import TemporarySnackProvider, {
  type SnackbarData,
} from "@/components/TemporarySnackProvider";
import {
  type AuthenticationErrorCodes,
  getAuthenticationErrorSnackbarData,
} from "@/errors/AuthenticationErrors";
import {
  type AuthServerErrorCodes,
  getAuthServerErrorSnackbarData,
} from "@/errors/AuthServerErrors";
import {
  type FormRequestErrorCodes,
  getFormRequestErrorSnackbarData,
} from "@/errors/FormRequestErrors";
import {
  type FrontendErrorCodes,
  getFrontendErrorSnackbarData,
} from "@/errors/FrontendErrors";
import {
  getResourceApiErrorSnackbarData,
  type ResourceApiErrorCodes,
} from "@/errors/ResourceApiErrors";

export const metadata = {
  title: "メンバー登録申請",
  description:
    "UniQUEのサインアップページです。UniProjectメンバーになるための申請を行います。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
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
  const { migration, error, signouted } = await searchParams;
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

  const cookieStore = await cookies();
  if (
    !cookieStore.has("pending_mfa_user") ||
    !cookieStore.has("pending_mfa_remember")
  ) {
    redirect("/signin");
  }
  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <AuthenticationPage
        initFormState={{
          username: cookieStore.get("pending_mfa_user")?.value || "",
          rememberMe: cookieStore.get("pending_mfa_remember")?.value === "1",
        }}
        mode={AuthorizationPageMode.MFA}
      />
    </>
  );
}
