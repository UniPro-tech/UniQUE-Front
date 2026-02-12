"use server";

import { User, UserDTO } from "@/types/User";
import { Role } from "@/types/Role";

export async function getAllUsers(): Promise<UserDTO[]> {
  try {
    const users = await User.list();
    return users.map((u) => u.convertPlain());
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function assignUserToRole(
  roleId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const role = await Role.getRoleById(roleId);
    await role.assignUser(userId);
    return { success: true };
  } catch (error) {
    console.error("Failed to assign user to role:", error);
    return {
      success: false,
      error: "ユーザーの割り当てに失敗しました",
    };
  }
}

export async function unassignUserFromRole(
  roleId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const role = await Role.getRoleById(roleId);
    await role.unassignUser(userId);
    return { success: true };
  } catch (error) {
    console.error("Failed to unassign user from role:", error);
    return {
      success: false,
      error: "ユーザーの割り当て解除に失敗しました",
    };
  }
}
