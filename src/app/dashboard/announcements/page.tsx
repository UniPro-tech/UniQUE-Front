import AnnouncementsList from "@/components/Lists/AnnouncementsList";
import { Stack, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { hasPermission } from "@/lib/permissions";
import { PermissionBitsFields } from "@/types/Permission";
import { Announcement } from "@/classes/Announcement";

export const metadata = {
  title: "アナウンス一覧",
  description: "アナウンスの一覧です。",
};

export default async function Page() {
  const anns = (await Announcement.getAll()).map((a) => a.toJson());

  const [canCreate, canUpdate, canDelete, canPin] = await Promise.all([
    hasPermission(PermissionBitsFields.ANNOUNCEMENT_CREATE),
    hasPermission(PermissionBitsFields.ANNOUNCEMENT_UPDATE),
    hasPermission(PermissionBitsFields.ANNOUNCEMENT_DELETE),
    hasPermission(PermissionBitsFields.ANNOUNCEMENT_PIN),
  ]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography variant="h5">アナウンス一覧</Typography>
          <Typography variant="body2" color="text.secondary">
            アナウンスの一覧です。
          </Typography>
        </Stack>
        {canCreate && (
          <Link
            href="/dashboard/announcements/new"
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" startIcon={<AddIcon />}>
              新規作成
            </Button>
          </Link>
        )}
      </Stack>

      <AnnouncementsList
        initial={anns}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canPin={canPin}
      />
    </Stack>
  );
}
