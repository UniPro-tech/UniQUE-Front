import Announcement from "@/types/Announcement";
import AnnouncementEditForm from "@/components/Forms/AnnouncementEditForm";
import { Stack, Typography } from "@mui/material";
import { hasPermission } from "@/lib/permissions";
import { PermissionBitsFields } from "@/types/Permission";
import { forbidden } from "next/navigation";

export const metadata = {
  title: "お知らせ編集",
  description: "お知らせの編集ページ",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const canEdit = await hasPermission(PermissionBitsFields.ANNOUNCEMENT_UPDATE);
  if (!canEdit) return forbidden();
  const ann = await Announcement.getById(id);
  const a = ann.toPlainObject();

  return (
    <Stack spacing={3}>
      <Typography variant="h5">お知らせ編集</Typography>
      <AnnouncementEditForm
        id={a.id}
        initial={{ title: a.title, content: a.content, isPinned: !!a.isPinned }}
      />
    </Stack>
  );
}
