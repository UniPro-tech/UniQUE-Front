import RolesDataGrid from "@/components/DataGrids/Role";
import { Stack, Typography } from "@mui/material";

export const metadata = {
  title: "ロール一覧",
  description: "UniQUEのロール一覧ページ",
};

export default async function Page() {
  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5">ロール一覧</Typography>
        <Typography variant="body1">UniQUEのロール一覧です。</Typography>
      </Stack>
      <RolesDataGrid />
    </Stack>
  );
}
