"use server";

import { Application, CreateApplicationRequest } from "@/types/Application";

export interface CreateApplicationFormData {
  name: string;
  clientSecret: string;
  userId: string;
  description: string;
  websiteUrl: string;
  privacyPolicyUrl: string;
}

export async function createApplication(
  data: CreateApplicationFormData,
): Promise<{ success: boolean; error?: string; applicationId?: string }> {
  try {
    if (!data.name.trim()) {
      return {
        success: false,
        error: "アプリケーション名を入力してください",
      };
    }

    if (!data.clientSecret.trim()) {
      return {
        success: false,
        error: "クライアントシークレットを生成してください",
      };
    }

    const request: CreateApplicationRequest = {
      name: data.name,
      client_secret: data.clientSecret,
      user_id: data.userId,
      description: data.description || undefined,
      website_url: data.websiteUrl || undefined,
      privacy_policy_url: data.privacyPolicyUrl || undefined,
    };

    const application = await Application.create(request);

    return { success: true, applicationId: application.id };
  } catch (error) {
    console.error("Application creation failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "アプリケーションの作成に失敗しました",
    };
  }
}
