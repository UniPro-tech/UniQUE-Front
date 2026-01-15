import { PlainRole, Role } from "@/types/Role";

export default async function RolesDataGrid({
  rows,
  canUpdate,
}: {
  rows?: PlainRole[] | Role[];
  canUpdate?: boolean;
}) {
  if (!rows) {
    // fetch roles from API
    rows = await Role.getAllRoles();
    rows = rows.map((role) => role.toPlainObject());
  }
  if (Array.isArray(rows) && rows.some((role) => role instanceof Role)) {
    rows = rows.map((role) =>
      role instanceof Role ? role.toPlainObject() : role
    );
  }
  if (canUpdate) {
    const session = await import("@/types/Session").then((mod) =>
      mod.Session.get()
    );
    const permissionText = (await session?.user.getPermissions())?.permissions;
    canUpdate =
      permissionText?.includes("ROLE_MANAGE") ||
      permissionText?.includes("PERMISSION_MANAGE");
  }
  const RolesDataGridClient = (await import("./Client")).default;
  return (
    <RolesDataGridClient
      rows={rows as PlainRole[]}
      canUpdate={canUpdate as boolean}
    />
  );
}
