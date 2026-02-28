import { Stack, Typography } from "@mui/material";

export default function SignUpSuccessPage() {
  return (
    <Stack>
      <Typography variant="h4" align="center" gutterBottom>
        サインアップが完了しました!
      </Typography>
      <Typography variant="body1" align="center">
        ご登録いただきありがとうございます。ご入力いただいたメールアドレスに確認メールを送信しました。
      </Typography>
      <Typography variant="body1" align="center">
        メール内のリンクをクリックして、メールアドレスの確認を完了してください。
      </Typography>
    </Stack>
  );
}
