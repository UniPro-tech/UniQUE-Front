import { Role } from "@/types/Role";
import PermissionsPanelClient from "./Client";

export default async function PermissionsPanel({ role }: { role: Role }) {
  const permissions = await role.getPermissions();

  return (
    <PermissionsPanelClient
      role={role.toPlainObject()}
      permissions={permissions}
    />
  );
}
