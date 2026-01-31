import { PlainRole, Role } from "@/types/Role";

export default async function RolesDataGrid({
  rows,
}: {
  rows?: PlainRole[] | Role[];
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
  const RolesDataGridClient = (await import("./Client")).default;
  return <RolesDataGridClient rows={rows as PlainRole[]} />;
}
