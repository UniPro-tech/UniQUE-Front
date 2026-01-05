import { getSession } from "@/lib/Session";
import { getUsersList } from "@/lib/Users";
import { Stack, Typography } from "@mui/material";
import MembersDataGrid from "@/components/DataGrids/Member";

export default async function Page() {
  //TODO: RBAC
  const users = await getUsersList(true);
  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5">メンバー申請一覧</Typography>
        <Typography variant="body1">メンバー申請一覧です。</Typography>
      </Stack>
      <MembersDataGrid rows={users} canUpdate={true} beforeJoined />
    </Stack>
  );
}
