import { Stack, Typography } from "@mui/material";
import MembersDataGrid from "@/components/DataGrids/Members";
import { PermissionBitsFields } from "@/constants/Permission";
import { requirePermission } from "@/libs/permissions";
import { User } from "@/classes/User";
import { UserStatus } from "@/classes/types/User";

export const metadata = {
  title: "メンバー申請一覧",
  description: "メンバー申請の一覧ページです。",
};

export default async function Page() {
  await requirePermission(PermissionBitsFields.USER_READ);

  const users = await User.getAll();
  const rows = users
    .map((u) => u.toJson())
    .filter((u) => u.status === UserStatus.ESTABLISHED);
  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5">メンバー申請一覧</Typography>
        <Typography variant="body1">メンバー申請一覧です。</Typography>
      </Stack>
      <MembersDataGrid rows={rows} beforeJoined />
    </Stack>
  );
}
