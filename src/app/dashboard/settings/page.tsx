import AccountSettingsCard from "@/components/Pages/Settings/Cards/Account";
import SecuritySettingsCard from "@/components/Pages/Settings/Cards/Security";
import SocialAccountsSettingsCard from "@/components/Pages/Settings/Cards/SocialAccounts";
import { getSession } from "@/lib/Session";
import { Stack, Typography } from "@mui/material";

export default async function Page() {
  const session = await getSession();
  const user = session!.user;
  return (
    <Stack spacing={4}>
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
