import { Role } from "@/types/Role";
import { User } from "@/types/User";
import RoleUsersDataGridClient from "./Client";
import { use } from "react";

export default function RoleUsersDataGrid({ role }: { role: Role }) {
  const users = use(role.getUsers());
  const rows = users.map((user) => user.convertPlain()) as
    | User[]
    | User<"Simple">[];
  return <RoleUsersDataGridClient rows={rows} role={role.toPlainObject()} />;
}
