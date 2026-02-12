"use server";

import { Role } from "@/types/Role";

export interface UpdateRoleFormData {
  customId: string;
  name: string;
  description: string;
  permissionBitmask: number;
}

export async function updateRole(
  roleId: string,
  data: UpdateRoleFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const role = await Role.getRoleById(roleId);

    role.customId = data.customId;
    role.name = data.name;
    role.description = data.description;
    role.permissionBitmask = data.permissionBitmask;

    await role.save();

    return { success: true };
  } catch (error) {
    console.error("Role update failed:", error);
    return {
      success: false,
      error: "ロールの更新に失敗しました",
    };
  }
}
