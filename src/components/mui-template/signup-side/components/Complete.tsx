"use client";
import { Theme } from "@mui/material/styles";
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { SitemarkIcon } from "./CustomIcons";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useEffect, useState } from "react";

export default function Complete() {
  const [isDiscordLinked, setIsDiscordLinked] = useState<boolean | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Discord連携状態をチェック
    const checkDiscordLink = async () => {
      try {
        const response = await fetch("/api/auth/check-discord-link");
        if (response.ok) {
          const data = await response.json();
          setIsDiscordLinked(data.linked);
          setHasSession(data.hasSession ?? null);
        }
      } catch (error) {
        console.error("Discord連携状態の確認に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDiscordLink();
  }, []);

  const handleDiscordLink = () => {
    // Discord OAuth開始（signupフローフラグ付き）
    window.location.href = "/api/oauth/discord?from=signup";
  };

  return (
    <MuiCard
      variant="outlined"
      sx={(theme: Theme) => ({
        display: "flex",
        flexDirection: "column",
        alignSelf: "center",
        width: "100%",
        padding: theme.spacing(4),
        gap: theme.spacing(2),
        boxShadow:
          "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
        [theme.breakpoints.up("sm")]: {
          width: "450px",
        },
        ...(theme.applyStyles?.("dark", {
          boxShadow:
            "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
        }) || {}),
      })}
    >
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <SitemarkIcon />
      </Box>
      <Stack alignItems="center" spacing={3} sx={{ mt: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 40, color: "green" }} />
        <Typography variant="h5" component="div" gutterBottom>
          メールアドレス認証が完了しました
        </Typography>

        {isLoading ? (
          <CircularProgress size={24} />
        ) : hasSession === false ? (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ whiteSpace: "pre-line" }}
            >
              アカウントが正常に作成されました。
              <wbr />
              管理者による承認後、サインインできるようになります。
              <wbr />
              承認が完了しましたら、登録されたメールアドレスに通知が送信されます。
              <wbr />
              しばらくお待ちください。
            </Typography>
          </>
        ) : !isDiscordLinked ? (
          <>
            <Alert severity="info" sx={{ width: "100%" }}>
              サインアップを完了するには、Discordアカウントの連携が必須です。
            </Alert>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ whiteSpace: "pre-line" }}
            >
              Discord連携により、UniProjectのコミュニティサーバーに自動的に参加できます。
              <wbr />
              下のボタンをクリックして、Discordアカウントを連携してください。
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleDiscordLink}
              fullWidth
              sx={{
                backgroundColor: "#5865F2",
                "&:hover": {
                  backgroundColor: "#4752C4",
                },
              }}
            >
              Discordアカウントを連携する
            </Button>
          </>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ whiteSpace: "pre-line" }}
            >
              アカウントが正常に作成されました。
              <wbr />
              管理者による承認後、サインインできるようになります。
              <wbr />
              承認が完了しましたら、登録されたメールアドレスに通知が送信されます。
              <wbr />
              しばらくお待ちください。
            </Typography>
          </>
        )}
      </Stack>
    </MuiCard>
  );
}
