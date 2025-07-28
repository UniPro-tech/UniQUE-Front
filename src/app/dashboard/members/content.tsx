import { use } from "react";
import DataGridContents from "./datagrid";
import { Stack, Typography } from "@mui/material";
import { ListResponse } from "@/types/rest";
import { User } from "@/types/user";

export default function MembersContents() {
  const fetchUsers = async () => {
    const response = (await (
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users`)
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
    created_at: member.created_at,
    updated_at: member.updated_at,
    is_enabled: member.is_enabled,
    joined_at: member.joined_at,
  }));

  return (
    <Stack style={{ width: "100%", height: "100%" }}>
      <Stack spacing={1} marginBottom={2}>
        <Typography variant="h4">Members</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          メンバー一覧です。
        </Typography>
      </Stack>
      <DataGridContents rows={rows} />
    </Stack>
  );
}
