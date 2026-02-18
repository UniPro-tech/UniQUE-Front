import AnnouncementCreateForm from "@/components/Forms/AnnouncementCreateForm";
import { Stack, Typography, Breadcrumbs, Link } from "@mui/material";
import Session from "@/types/Session";
import { hasPermission } from "@/lib/permissions";
import { PermissionBitsFields } from "@/types/Permission";
import { forbidden } from "next/navigation";

export const metadata = {
  title: "お知らせ新規作成",
  description: "新しいお知らせを作成します",
};

export default async function Page() {
  const session = await Session.get();
  if (!session) return <div>ログインが必要です</div>;

  const canCreate = await hasPermission(
    PermissionBitsFields.ANNOUNCEMENT_CREATE,
  );
  if (!canCreate) return forbidden();

  return (
    <Stack spacing={3}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/dashboard/announcements">
          お知らせ管理
        </Link>
        <Typography sx={{ color: "text.primary" }}>新規作成</Typography>
      </Breadcrumbs>

      <Stack>
        <Typography variant="h4" gutterBottom>
          お知らせ新規作成
        </Typography>
        <Typography variant="body2" color="text.secondary">
          公開するお知らせを作成します。
        </Typography>
      </Stack>

      <AnnouncementCreateForm />
    </Stack>
  );
}
