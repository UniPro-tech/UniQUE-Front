import { Stack } from "@mui/material";
import fs from "fs";
import Link from "next/link";
import path from "path";
import Markdown from "react-markdown";

export const metadata = {
  title: "利用規約",
  description: "UniQUEの利用規約ページです。",
};

export default function TOSPage() {
  const file = fs.readFileSync(path.join("./src/app/terms/terms.md"), "utf8");
  return (
    <Stack
      className="markdown"
      sx={{ padding: 4, maxWidth: 800, margin: "auto" }}
    >
      <Link href="/dashboard">← ホームに戻る</Link>
      <Markdown>{file}</Markdown>
    </Stack>
  );
}
