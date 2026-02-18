"use server";

import Announcement, { CreateAnnouncementRequest } from "@/types/Announcement";

export interface CreateAnnouncementFormData {
  title: string;
  content: string;
  isPinned?: boolean;
}

export async function createAnnouncement(
  data: CreateAnnouncementFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.title || !data.title.trim()) {
      return { success: false, error: "タイトルを入力してください" };
    }
    if (!data.content || !data.content.trim()) {
      return { success: false, error: "本文を入力してください" };
    }

    const req: CreateAnnouncementRequest = {
      title: data.title,
      content: data.content,
      is_pinned: data.isPinned,
    };

    await Announcement.create(req);

    return { success: true };
  } catch (err) {
    console.error("Announcement creation failed:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "お知らせの作成に失敗しました",
    };
  }
}
