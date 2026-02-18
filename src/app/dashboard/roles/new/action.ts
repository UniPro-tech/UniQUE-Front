"use server";

import { Role, CreateRoleRequest } from "@/types/Role";
import { redirect } from "next/navigation";

export interface CreateRoleFormData {
  customId: string;
  name: string;
  description: string;
  permissionBitmask: bigint;
  isDefault?: boolean;
  assignExisting?: boolean;
}

export async function createRole(
  data: CreateRoleFormData,
): Promise<{ success: boolean; error?: string; roleId?: string }> {
  try {
    const request: CreateRoleRequest = {
      custom_id: data.customId,
      name: data.name,
      description: data.description || undefined,
      permission_bitmask: data.permissionBitmask,
      is_default: data.isDefault,
      assign_to_existing: data.assignExisting,
    };

    const role = await Role.create(request);

    return { success: true, roleId: role.id };
  } catch (error) {
    console.error("Role creation failed:", error);
    return {
      success: false,
      error: "ロールの作成に失敗しました",
    };
  }
}

export async function redirectToRoleList() {
  redirect("/dashboard/roles");
}
