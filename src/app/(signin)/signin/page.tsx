import Content from "@/components/mui-template/signup-side/components/Content";
import SignInCard from "@/components/mui-template/signup-side/components/SignInCard";
import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import { VariantType } from "notistack";
import { SignInCardMode } from "@/components/mui-template/signup-side/types/SignInCardMode";

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
  }>;
}) {
  const { mail, migrated } = await searchParams;
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
  ];
  return (
    <>
      <TemporarySnackProvider snacks={snacks} />
      <Content mode={SignInCardMode.SignIn} />
      <SignInCard mode={SignInCardMode.SignIn} />
    </>
  );
}
