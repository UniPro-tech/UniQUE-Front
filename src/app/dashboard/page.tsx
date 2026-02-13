import { Card, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { AccessDeniedAlert } from "@/components/AccessDeniedAlert";
import { Button } from "@mui/material";

export const metadata = {
  title: "ダッシュボード",
  description: "ユーザーダッシュボードページ",
};

export default async function DashboardPage() {
  return (
    <Stack>
      <AccessDeniedAlert />
      <Typography variant="h4" gutterBottom>
        おかえりなさい！
      </Typography>
      <Typography variant="body1">
        ダッシュボードへようこそ。左のサイドバーからナビゲートしてください。
      </Typography>
      <Stack mt={4} spacing={2} id="announce">
        <Typography variant="h5">お知らせ</Typography>
        <Stack spacing={1}>
          <Card variant="outlined" sx={{ padding: 2 }}>
            <Typography variant="h6">🚧 Close Alpha版公開のお知らせ</Typography>
            <Typography variant="body1">
              この度、Close Alpha版を公開いたしました。
              <br />
              様々なバグ等が発生する可能性があります。
              ご理解のほどよろしくお願いいたします。
              <br />
              バグが発生した場合は、下記リンクから報告をお願いいたします。
              <br />
              <Link
                href="https://canary.discord.com/channels/1191346186880286770/1239215629962182789"
                target="_blank"
                rel="noopener noreferrer"
              >
                UniQUE Discord スレッド
              </Link>
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ padding: 2 }}>
            <Typography variant="h6">🛠️ サービス停止のお知らせ</Typography>
            <Typography variant="body1">
              2025年1月10日20時から25時までサービスが一時的に停止します。
            </Typography>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  );
}
