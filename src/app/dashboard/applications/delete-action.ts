"use server";

import { Application } from "@/types/Application";

export async function deleteApplicationById(
  appId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const app = await Application.getApplicationById(appId);
    await app.delete();
    return { success: true };
  } catch (err) {
    console.error("Failed to delete application:", err);
    return { success: false, error: "アプリケーションの削除に失敗しました" };
  }
}
