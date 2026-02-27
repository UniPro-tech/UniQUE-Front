import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { Announcement } from "@/classes/Announcement";
import AnnouncementsList from "@/components/Lists/AnnouncementsList";

export const metadata = {
  title: "ダッシュボード",
  description: "ユーザーダッシュボードページ",
};

export default async function DashboardPage() {
  const anns = (await Announcement.getAll()).map((a) => a.toJson());

  return (
    <Stack>
      <Typography variant="h4" gutterBottom>
        おかえりなさい！
      </Typography>
      <Typography variant="body1">
        ダッシュボードへようこそ。左のサイドバーからナビゲートしてください。
      </Typography>
      <Stack mt={4} spacing={2} id="announce">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">最近のお知らせ</Typography>
          <Link
            href="/dashboard/announcements"
            style={{ textDecoration: "none" }}
          >
            <Button size="small" variant="outlined">
              お知らせ管理
            </Button>
          </Link>
        </Stack>
        <Box>
          <AnnouncementsList initial={anns} canUpdate={false} />
        </Box>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 8 }}
        >
          <Link
            href="/dashboard/announcements"
            style={{ textDecoration: "none" }}
          >
            <Button size="small" variant="outlined">
              もっと見る
            </Button>
          </Link>
        </div>
      </Stack>
    </Stack>
  );
}
