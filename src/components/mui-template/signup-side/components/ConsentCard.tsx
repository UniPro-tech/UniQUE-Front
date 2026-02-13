"use client";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiCard from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import { Theme } from "@mui/material/styles";
import type { UserDTO } from "@/types/User";
import type AppType from "@/types/App";

export default function ConsentCard(props: {
  app: AppType;
  user?: UserDTO;
  scope: string;
  jwt: string;
  redirect_uri: string;
  state?: string;
  action?: string;
  auth_request_id?: string;
}) {
  const {
    app,
    user,
    scope,
    jwt,
    redirect_uri,
    state,
    action,
    auth_request_id,
  } = props;
  const scopes = scope ? scope.split(" ") : [];
  // `action` should be provided by the server page (uses AUTH_API_URL). Fallback to relative endpoint.
  const formAction = action ?? "/auth";

  const denyHref = `${redirect_uri}?error=access_denied${
    state ? `&state=${encodeURIComponent(state)}` : ""
  }`;

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
          width: "600px",
        },
      })}
    >
      <Typography component="h1" variant="h5">
        {app.name} にアクセスを許可しますか？
      </Typography>

      <Box>
        <Typography variant="body2">アプリケーション:</Typography>
        <Typography variant="subtitle1">{app.name}</Typography>
        <Typography variant="caption">
          クライアントID: {app.id || app.id}
        </Typography>
      </Box>

      <Box>
        <Typography variant="body2">要求されている権限:</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {scopes.length === 0 && <Typography>（なし）</Typography>}
          {scopes.map((s) => (
            <Box key={s} sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2">•</Typography>
              <Typography variant="body2">{s}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="body2">ログイン中のユーザー:</Typography>
        <Typography variant="subtitle2">
          {user?.customId ?? user?.email ?? "不明なユーザー"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <form action={formAction} method="post">
          <input type="hidden" name="session_jwt" value={jwt} />
          <input type="hidden" name="auth_request_id" value={auth_request_id} />
          {state && <input type="hidden" name="state" value={state} />}
          <Button type="submit" variant="contained" color="primary">
            許可する
          </Button>
        </form>

        <Link href={denyHref} underline="none">
          <Button variant="outlined" color="inherit">
            拒否する
          </Button>
        </Link>
      </Box>
    </MuiCard>
  );
}
