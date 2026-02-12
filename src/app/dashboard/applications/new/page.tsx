import ApplicationCreateForm from "@/components/Forms/ApplicationCreateForm";
import { Stack, Typography, Breadcrumbs, Link } from "@mui/material";
import Session from "@/types/Session";

export const metadata = {
  title: "アプリケーション新規作成",
  description: "新しいアプリケーションを作成します",
};

export default async function Page() {
  // セッションを取得
  const session = await Session.get();
  if (!session) {
    return <div>ログインが必要です</div>;
  }

  return (
    <Stack spacing={3}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/dashboard/applications">
          アプリケーション管理
        </Link>
        <Typography sx={{ color: "text.primary" }}>新規作成</Typography>
      </Breadcrumbs>

      <Stack>
        <Typography variant="h4" gutterBottom>
          アプリケーション新規作成
        </Typography>
        <Typography variant="body2" color="text.secondary">
          新しいサードパーティアプリケーションを登録します。
        </Typography>
      </Stack>

      <ApplicationCreateForm userId={session.userId} />
    </Stack>
  );
}
