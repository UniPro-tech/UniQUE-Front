import RoleUsersDataGridClient from "./Client";
import { use } from "react";
import { UserData } from "@/classes/types/User";
import { Role } from "@/classes/Role";

export default function RoleUsersDataGrid({ role }: { role: Role }) {
  const users = use(role.getUsers());
  const rows: UserData[] = users.map((user) => user.toJson());
  return <RoleUsersDataGridClient rows={rows} role={role.toJson()} />;
}
