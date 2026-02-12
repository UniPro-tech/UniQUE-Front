import { Role } from "@/types/Role";
import PermissionsPanelClient from "./Client";

export default async function PermissionsPanel({ role }: { role: Role }) {
  return (
    <PermissionsPanelClient
      role={role.toPlainObject()}
      permissionBitmask={role.permissionBitmask}
    />
  );
}
