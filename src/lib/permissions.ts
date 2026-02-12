"use server";
import Session from "@/types/Session";
import { PermissionBitsFields } from "@/types/Permission";
import { AuthorizationErrors } from "@/types/Errors/AuthorizationErrors";
import type { RoleDTO } from "@/types/Role";

/**
 * 現在のユーザーのロールを取得
 */
export async function getCurrentUserRoles(): Promise<RoleDTO[]> {
  const session = await Session.get();
  if (!session) {
    return [];
  }
  
  try {
    return await session.user.getRoles();
  } catch (err) {
    if (err !== AuthorizationErrors.AccessDenied) {
      throw err;
    }
    return [];
  }
}

/**
 * 権限チェック関数
 * @param requiredFlag - 必要な権限フラグ
 * @param userRoles - ユーザーのロール一覧（省略時は自動取得）
 * @returns 権限があればtrue、なければfalse
 */
export async function hasPermission(
  requiredFlag: PermissionBitsFields,
  userRoles?: RoleDTO[]
): Promise<boolean> {
  const roles = userRoles ?? (await getCurrentUserRoles());
  return roles.some((role) => (role.permissionBitmask ?? 0) & requiredFlag);
}

/**
 * 権限がない場合にエラーをスロー
 * @param requiredFlag - 必要な権限フラグ
 * @param userRoles - ユーザーのロール一覧（省略時は自動取得）
 */
export async function requirePermission(
  requiredFlag: PermissionBitsFields,
  userRoles?: RoleDTO[]
): Promise<void> {
  const hasPerm = await hasPermission(requiredFlag, userRoles);
  if (!hasPerm) {
    throw AuthorizationErrors.AccessDenied;
  }
}
