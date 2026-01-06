import { getUsersList } from "@/lib/Users";
import { Link, Stack, Typography } from "@mui/material";
import MembersDataGrid from "@/components/DataGrids/Member";

export const metadata = {
  title: "ユーザー一覧",
  description: "UniProjectのメンバー一覧ページ",
};

export default async function Page() {
  const users = await getUsersList(true);
  // TODO: RBAC
  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5">ユーザー一覧</Typography>
        <Typography variant="body1">
          UniProjectのメンバー一覧です。
          <br />
          メンバー申請者はここに表示されません。{" "}
          <Link href="/dashboard/requests">メンバー申請一覧</Link>
        </Typography>
      </Stack>
      <MembersDataGrid rows={users} canUpdate={true} />
    </Stack>
  );
}
