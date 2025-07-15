import { PrismaClient } from "@/generated/prisma";
import { use } from "react";
import DataGridDemo from "./datagrid";

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
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DataGridDemo rows={rows} />
      </div>
    </div>
  );
}
