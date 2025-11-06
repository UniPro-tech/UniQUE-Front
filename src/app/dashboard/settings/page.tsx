import AccountSettingsCard from "@/components/Pages/Settings/Cards/Account";
import { getSession } from "@/lib/Session";
import { Stack, Typography } from "@mui/material";

export default async function Page() {
  const session = await getSession();
  const user = session!.user;
  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5">アカウント設定</Typography>
        <Typography variant="body1">
          ここではアカウントの各種設定を行うことができます。
        </Typography>
      </Stack>
      <AccountSettingsCard user={user} />
    </Stack>
  );
}
