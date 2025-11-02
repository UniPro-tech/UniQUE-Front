import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BadgeIcon from "@mui/icons-material/Badge";
import KeyIcon from "@mui/icons-material/Key";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import HubIcon from "@mui/icons-material/Hub";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { SitemarkIcon } from "./CustomIcons";

const SignInItems = [
  {
    icon: <HubIcon sx={{ color: "text.secondary" }} />,
    title: "ひとつのIDで、すべてをつなぐ",
    description: (
      <>
        UniQUEひとつで、UniProjectの
        <wbr />
        すべての
        <wbr />
        サービスを
        <wbr />
        利用できます。
      </>
    ),
  },
  {
    icon: <KeyIcon sx={{ color: "text.secondary" }} />,
    title: "シンプルでセキュア",
    description: (
      <>
        OIDC/OAuth2.0対応。
        <wbr />
        安全でスマートなログインを。
      </>
    ),
  },
  {
    icon: <BadgeIcon sx={{ color: "text.secondary" }} />,
    title: "メンバーであることを証明",
    description: (
      <>
        本当に必要な人だけが
        <wbr />
        アクセスできるように、
        <wbr />
        メンバー管理を簡単に。
      </>
    ),
  },
  {
    icon: <PublishedWithChangesIcon sx={{ color: "text.secondary" }} />,
    title: "リアルタイムで正確なデータを",
    description: (
      <>
        簡単に素早く情報を更新でき、
        <wbr />
        常に
        <wbr />
        最新の
        <wbr />
        状態を
        <wbr />
        保ちます。
      </>
    ),
  },
];

const SignUpItems = [
  {
    icon: <VolunteerActivismIcon sx={{ color: "text.secondary" }} />,
    title: "デジタル創作をもっと自由に",
    description: (
      <>
        デジタル創作サークルでは、
        <wbr />
        自由に創作活動を
        <wbr />
        行うため、
        <wbr />
        さまざまな支援を
        <wbr />
        行っています。
      </>
    ),
  },
  {
    icon: <HubIcon sx={{ color: "text.secondary" }} />,
    title: "UniQUEひとつで、すべてをつなぐ",
    description: (
      <>
        UniProjectでは、さまざまな
        <wbr />
        ツールを
        <wbr />
        提供しています。
        <wbr />
        UniQUEひとつで、
        <wbr />
        すべての
        <wbr />
        サービスを
        <wbr />
        利用できます。
      </>
    ),
  },
  {
    icon: <BadgeIcon sx={{ color: "text.secondary" }} />,
    title: "メンバーになろう",
    description: (
      <>
        あなたもUniQUEに登録して、
        <wbr />
        UniProjectの
        <wbr />
        一員になりましょう！
      </>
    ),
  },
  {
    icon: <EmojiPeopleIcon sx={{ color: "text.secondary" }} />,
    title: "仲間とつながる",
    description: (
      <>
        UniQUEを通じて、
        <wbr />
        他のメンバーと
        <wbr />
        つながり、
        <wbr />
        交流を深めましょう。
      </>
    ),
  },
];

export default function Content({ isSignUp = false }: { isSignUp?: boolean }) {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        alignSelf: "center",
        gap: 4,
        maxWidth: 450,
      }}
    >
      <Box sx={{ display: { xs: "none", md: "flex" } }}>
        <SitemarkIcon />
      </Box>
      {isSignUp
        ? SignUpItems.map((item, index) => (
            <Stack key={index} direction="row" sx={{ gap: 2 }}>
              {item.icon}
              <Box sx={{ display: "block", width: "100%" }}>
                <Typography gutterBottom sx={{ fontWeight: "medium" }}>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    wordBreak: "keep-all",
                    width: "100%",
                  }}
                >
                  {item.description}
                </Typography>
              </Box>
            </Stack>
          ))
        : SignInItems.map((item, index) => (
            <Stack key={index} direction="row" sx={{ gap: 2 }}>
              {item.icon}
              <Box sx={{ display: "block", width: "100%" }}>
                <Typography gutterBottom sx={{ fontWeight: "medium" }}>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    wordBreak: "keep-all",
                    width: "100%",
                  }}
                >
                  {item.description}
                </Typography>
              </Box>
            </Stack>
          ))}
    </Stack>
  );
}
