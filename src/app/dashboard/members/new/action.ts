"use server";

import User, { CreateUserRequest } from "@/types/User";
import { redirect } from "next/navigation";

export interface CreateMemberFormData {
  customId: string;
  email: string;
  password?: string;
  displayName?: string;
  status?: string;
  externalEmail?: string;
  affiliationPeriod?: string;
}

export async function createMember(
  data: CreateMemberFormData,
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const req: CreateUserRequest = {
      custom_id: data.customId,
      email: data.email,
      password: data.password || undefined,
      external_email: data.externalEmail || undefined,
      affiliation_period: data.affiliationPeriod || undefined,
      status: data.status || undefined,
      profile: data.displayName
        ? { display_name: data.displayName }
        : undefined,
    };

    const user = await User.create(req);
    return { success: true, userId: user.id };
  } catch (err) {
    console.error("Member creation failed:", err);
    return { success: false, error: "ユーザーの作成に失敗しました" };
  }
}

export async function redirectToMemberList() {
  redirect("/dashboard/members");
}
