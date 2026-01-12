import { getUsersList } from "@/lib/resources/Users";
import { Stack, Typography } from "@mui/material";
import MembersDataGrid from "@/components/DataGrids/Member";
import { forbidden } from "next/navigation";

export const metadata = {
  title: "メンバー申請一覧",
  description: "メンバー申請の一覧ページ",
};

export default async function Page() {
  const users = await getUsersList();
  if (users.length != 0) {
    if (!("isSuspended" in users[0])) forbidden();
  }
  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5">メンバー申請一覧</Typography>
        <Typography variant="body1">メンバー申請一覧です。</Typography>
      </Stack>
      <MembersDataGrid rows={users} beforeJoined />
    </Stack>
  );
}
