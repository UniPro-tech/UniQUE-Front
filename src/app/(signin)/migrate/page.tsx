import Content from "@/components/mui-template/signup-side/components/Content";
import SignInCard from "@/components/mui-template/signup-side/components/SignInCard";
import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";
import { VariantType } from "notistack";
import { SignInCardMode } from "@/components/mui-template/signup-side/types/SignInCardMode";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    mail?: string;
  }>;
}) {
  const { mail } = await searchParams;
  const snacks: SnackbarData[] = [
    ...(mail
      ? [
          {
            message: `メール認証を送信しました。メールをご確認ください。`,
            variant: "success" as VariantType,
          },
        ]
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
