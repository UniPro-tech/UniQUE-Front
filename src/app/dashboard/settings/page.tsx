import AccountSettingsCard from "@/components/Pages/Settings/Cards/Account";
import ConsentSettingsCard from "@/components/Pages/Settings/Cards/Consent";
import SecuritySettingsCard from "@/components/Pages/Settings/Cards/Security";
import SocialAccountsSettingsCard from "@/components/Pages/Settings/Cards/SocialAccounts";
import Session from "@/types/Session";
import { Stack, Typography } from "@mui/material";
import { VariantType } from "notistack";
import TemporarySnackProvider, {
  SnackbarData,
} from "@/components/TemporarySnackProvider";

export const metadata = {
  title: "アカウント設定",
  description: "ユーザーアカウントの各種設定を管理するページ",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    oauth?: string;
    status?: VariantType;
    reason?: "conflict";
  }>;
}) {
  const { oauth, status, reason } = await searchParams;
  const session = await Session.get();
  const user = session ? session.user.convertPlain() : null;
  const snacks: SnackbarData[] = [
    ...(oauth
      ? reason === "conflict"
        ? [
            {
              message: `OAuth連携: このアカウントは既に連携されています。`,
              variant: status || "info",
            },
          ]
        : [
            {
              message: `OAuth連携: ${oauth} の連携が ${
                status === "success" ? "成功" : "失敗"
              }しました。`,
              variant: status || "info",
            },
          ]
      : []),
  ];
  return (
    <Stack spacing={4}>
      <TemporarySnackProvider snacks={snacks} />
      <Stack>
        <Typography variant="h4" component={"h2"}>
          アカウント設定
        </Typography>
        <Typography variant="body1">
          ここではアカウントの各種設定を行うことができます。
        </Typography>
      </Stack>
      {user && (
        <>
          <AccountSettingsCard user={user} />
          <SecuritySettingsCard user={user} />
          <SocialAccountsSettingsCard user={user} />
          <ConsentSettingsCard />
        </>
      )}
    </Stack>
  );
}
