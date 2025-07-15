import { PrismaClient } from "@/generated/prisma";
import { use } from "react";
import DataGridDemo from "./datagrid";
import { Stack } from "@mui/material";

export default function MembersContents() {
  const prisma = new PrismaClient();
  const members = use(prisma.members.findMany());

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
