import ApplicationEditForm from "@/components/Forms/ApplicationEditForm";
import RedirectUris from "@/components/Pages/Applications/RedirectUris";
import { ResourceApiErrors } from "@/types/Errors/ResourceApiErrors";
import { Application } from "@/types/Application";
import { Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const app = await Application.getApplicationById(id);
    return {
      title: `${app.name} - アプリケーション編集`,
      description: `${app.name}の詳細設定を行います`,
    };
  } catch {
    return {
      title: "アプリケーション編集",
      description: "アプリケーションの詳細設定を行います",
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let application;
  let owner:
    | { displayName: string; customId: string; email: string }
    | undefined;

  try {
    application = await Application.getApplicationById(id);
  } catch (error) {
    if (error == ResourceApiErrors.ResourceNotFound) {
      notFound();
    }
  }

  if (!application) {
    notFound();
  }

  // オーナー情報を取得
  try {
    const owners = await application.getOwners();
    if (owners.length > 0) {
      owner = {
        displayName: owners[0].profile?.displayName ?? owners[0].email ?? "",
        customId: owners[0].customId ?? "",
        email: owners[0].email ?? "",
      };
    }
  } catch (error) {
    console.error("Failed to fetch owner:", error);
  }

  return (
    <Stack spacing={3}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/dashboard/applications">
          アプリケーション管理
        </Link>
        <Typography sx={{ color: "text.primary" }}>編集</Typography>
      </Breadcrumbs>

      <Stack>
        <Typography variant="h4" gutterBottom>
          {application.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          アプリケーションの詳細設定を行います。
        </Typography>
      </Stack>

      <ApplicationEditForm
        application={application.toPlainObject()}
        owner={owner}
      />
      <RedirectUris applicationId={application.id} />
    </Stack>
  );
}
