import { use } from "react";
import DataGridDemo from "./datagrid";
import { Stack } from "@mui/material";
import { ListResponse } from "@/types/rest";
import { User } from "@/types/user";

export default function MembersContents() {
  const fetchUsers = async () => {
    const response = (await (
      await fetch(`${process.env.API_URL}/v1/users`)
    ).json()) as ListResponse<User>;
    return response.data;
  };
  const members = use(fetchUsers());

  const rows = members.map((member) => ({
    custom_id: member.custom_id,
    name: member.name,
    email: member.email,
    period: member.period,
    id: member.id,
    external_email: member.external_email,
  }));

  return (
    <Stack style={{ width: "100%", height: "100%" }}>
      <DataGridDemo rows={rows} />
    </Stack>
  );
}
