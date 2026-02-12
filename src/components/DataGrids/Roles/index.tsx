import { PlainRole, Role } from "@/types/Role";

export default async function RolesDataGrid({
  rows,
}: {
  rows?: PlainRole[] | Role[];
}) {
  if (!rows) {
    const fetched = await Role.getAllRoles();
    rows = fetched.map((role) => role.toPlainObject());
  } else {
    rows = rows.map((role) =>
      role instanceof Role ? role.toPlainObject() : role,
    );
  }
  const RolesDataGridClient = (await import("./Client")).default;
  return <RolesDataGridClient rows={rows as PlainRole[]} />;
}
