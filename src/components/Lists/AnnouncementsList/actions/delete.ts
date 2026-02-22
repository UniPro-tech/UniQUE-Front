"use server";

import { Announcement } from "@/classes/Announcement";

export const deleteAnnouncement = async (formData: FormData) => {
  const announcementId = formData.get("announcementId") as string;

  const announce = await Announcement.getById(announcementId);

  if (!announce) {
    return { success: false, message: "お知らせが見つかりません" };
  }

  await announce.delete();
  return { success: true, message: "削除しました" };
};
