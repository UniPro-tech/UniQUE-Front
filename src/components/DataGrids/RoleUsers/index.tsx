import { Role } from "@/types/Role";
import type { UserDTO } from "@/types/User";
import RoleUsersDataGridClient from "./Client";
import { use } from "react";

export default function RoleUsersDataGrid({ role }: { role: Role }) {
  const users = use(role.getUsers());
  const rows: UserDTO[] = users.map((user) => user.convertPlain());
  return <RoleUsersDataGridClient rows={rows} role={role.toPlainObject()} />;
}
