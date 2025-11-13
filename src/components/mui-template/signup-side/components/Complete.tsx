"use client";
import { Theme } from "@mui/material/styles";
import { Box, Stack, Typography } from "@mui/material";
import MuiCard from "@mui/material/Card";
import { SitemarkIcon } from "./CustomIcons";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function Complete() {
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
      <Stack alignItems="center" spacing={2} sx={{ mt: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 40, color: "green" }} />
        <Typography variant="h5" component="div" gutterBottom>
          サインアップが完了しました
        </Typography>
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
      </Stack>
    </MuiCard>
  );
}
