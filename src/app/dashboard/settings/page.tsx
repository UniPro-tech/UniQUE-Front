import AccountSettingsCard from "@/components/Pages/Settings/Cards/Account";
import SecuritySettingsCard from "@/components/Pages/Settings/Cards/Security";
import SocialAccountsSettingsCard from "@/components/Pages/Settings/Cards/SocialAccounts";
import { getSession } from "@/lib/Session";
import { Stack, Typography } from "@mui/material";
import { VariantType } from "notistack";
import ParamSnacks from "./paramSnacks";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    oauth?: string;
    status?: VariantType;
  }>;
}) {
  const { oauth, status } = await searchParams;
  const session = await getSession();
  const user = session!.user;
  const snacks = [
    ...(oauth
      ? [
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
      <ParamSnacks snacks={snacks} />
      <Stack>
        <Typography variant="h4" component={"h2"}>
          アカウント設定
        </Typography>
        <Typography variant="body1">
          ここではアカウントの各種設定を行うことができます。
        </Typography>
      </Stack>
      <AccountSettingsCard user={user} />
      <SecuritySettingsCard user={user} />
      <SocialAccountsSettingsCard user={user} />
    </Stack>
  );
}
