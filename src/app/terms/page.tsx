import { Stack } from "@mui/material";
import Markdown from "react-markdown";
import fs from "fs";
import path from "path";
import Link from "next/link";

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
