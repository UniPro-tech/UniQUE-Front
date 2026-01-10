import { getSession } from "@/lib/resources/Session";
import { Card, Stack, Typography } from "@mui/material";

export const metadata = {
  title: "プロフィール",
  description: "ユーザープロフィールページ",
};

export default async function ProfilePage() {
  const user = (await getSession())!.user;
  return (
    <Stack>
      <Typography variant="h4" gutterBottom>
        プロフィール
      </Typography>
      <Typography variant="body1">
        ここでプロフィール情報を表示・編集できます。
      </Typography>
      <Card
        variant="outlined"
        sx={{
          padding: 2,
          marginTop: 2,
          borderColor: "warning.main",
        }}
      >
        <Typography variant="h6">
          🚧 現在はプロフィール編集機能は実装されていません。
        </Typography>
      </Card>
      <Card sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6" gutterBottom>
          ユーザー情報
        </Typography>
        <Typography variant="body2">名前: {user.name}</Typography>
        <Typography variant="body2">メール: {user.email}</Typography>
      </Card>
    </Stack>
  );
}
