import { Role } from "@/types/Role";
import { PlainUser } from "@/types/User";
import RoleUsersDataGridClient from "./Client";
import { use } from "react";

export default function RoleUsersDataGrid({ role }: { role: Role }) {
  const users = use(role.getUsers());
  const rows: PlainUser[] = users.map((user) => user.convertPlain());
  return (
    <RoleUsersDataGridClient
      rows={rows as PlainUser[]}
      role={role.toPlainObject()}
    />
  );
}
