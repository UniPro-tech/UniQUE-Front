"use server";

import Session from "@/types/Session";
import { revalidatePath } from "next/cache";

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  websiteUrl?: string;
  twitterHandle?: string;
  birthdateVisible?: boolean;
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const session = await Session.get();
    if (!session) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    const user = session.user;

    // プロフィール情報を更新
    user.profile = {
      ...user.profile,
      displayName: data.displayName,
      bio: data.bio,
      websiteUrl: data.websiteUrl,
      twitterHandle: data.twitterHandle,
      birthdateVisible: data.birthdateVisible,
    };

    await user.save();

    // ページを再検証してキャッシュをクリア
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "プロフィールを更新しました",
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: "プロフィールの更新に失敗しました",
    };
  }
}
