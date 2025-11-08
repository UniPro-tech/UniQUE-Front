import { getSession } from "@/lib/Session";
import { getUsersList } from "@/lib/Users";
import { Stack, Typography } from "@mui/material";
import MembersDataGrid from "./datagrid";

export default async function Page() {
  const session = await getSession();
  const user = session!.user;
  const users = await getUsersList(false);
  console.log(users);
  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5">ユーザー一覧</Typography>
        <Typography variant="body1">UniProjectのメンバー一覧</Typography>
      </Stack>
      <MembersDataGrid rows={users} isRoot={false} />
    </Stack>
  );
}
