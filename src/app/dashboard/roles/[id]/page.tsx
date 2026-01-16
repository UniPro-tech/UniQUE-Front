import RoleUsersDataGrid from "@/components/DataGrids/RoleUsers";
import { Role } from "@/types/Role";
import { Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await Role.getRoleById(id);
  if (!role) {
    notFound();
  }
  return (
    <Stack spacing={2}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/dashboard/roles">
          ロール管理
        </Link>
        <Typography sx={{ color: "text.primary" }}>詳細管理</Typography>
      </Breadcrumbs>
      <Typography variant="h4" gutterBottom>
        {role.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        ロールの詳細設定を行います。
      </Typography>
      <Stack>
        <Typography variant="h5" gutterBottom>
          紐ついたユーザー一覧
        </Typography>
        <Suspense fallback={<div>Loading...</div>}>
          <RoleUsersDataGrid role={role} />
        </Suspense>
      </Stack>
    </Stack>
  );
}
