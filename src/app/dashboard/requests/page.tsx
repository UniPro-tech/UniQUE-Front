import { getUsersList } from "@/lib/resources/Users";
import { Stack, Typography } from "@mui/material";
import MembersDataGrid from "@/components/DataGrids/Member";
import { rejectRegistApplyAction } from "@/components/Dialogs/actions/rejectRegistApplyAction";
import { requirePermission } from "@/lib/permissions";
import { PermissionBitsFields } from "@/types/Permission";
import { AuthorizationErrors } from "@/types/Errors/AuthorizationErrors";
import { redirect } from "next/navigation";

export const metadata = {
  title: "メンバー申請一覧",
  description: "メンバー申請の一覧ページです。",
};

export default async function Page() {
  try {
    await requirePermission(PermissionBitsFields.USER_READ);
  } catch (err) {
    if (err === AuthorizationErrors.AccessDenied) {
      redirect("/dashboard?error=access_denied");
    }
    throw err;
  }

  const users = await getUsersList({ filterPendingApplicants: true });
  const rows = users.map((u) => u.convertPlain());
  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5">メンバー申請一覧</Typography>
        <Typography variant="body1">メンバー申請一覧です。</Typography>
      </Stack>
      <MembersDataGrid
        rows={rows}
        beforeJoined
        rejectAction={rejectRegistApplyAction}
      />
    </Stack>
  );
}
