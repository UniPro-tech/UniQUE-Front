"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";
// avoid importing `styled` here so this can remain a server component
import { SitemarkIcon } from "./CustomIcons";
//import MailLockIcon from "@mui/icons-material/MailLock";
import CredentialForm from "./CredentialForm";
import { Link, Stack } from "@mui/material";
import { SignInCardMode } from "./SignInCard";

// we will apply equivalent styles via the `sx` prop on `MuiCard`

export default function SignInCardClient(props: {
  mode: SignInCardMode;
  csrfToken: string;
}) {
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
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        {props.mode === SignInCardMode.SignUp ? "メンバー登録" : "サインイン"}
      </Typography>
      <Stack direction="row" alignItems="center" sx={{ width: "100%" }} gap={1}>
        {props.mode === SignInCardMode.SignUp
          ? "アカウントをお持ちですか？"
          : "アカウントをお持ちでないですか？"}
        <Link
          href={props.mode === SignInCardMode.SignUp ? "/signin" : "/signup"}
          variant="body2"
          sx={{ alignSelf: "center" }}
        >
          {props.mode === SignInCardMode.SignUp ? "サインイン" : "サインアップ"}
        </Link>
      </Stack>
      <CredentialForm mode={props.mode} csrfToken={props.csrfToken} />
      {/*}
      <Divider>もしくは</Divider>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!props.signUp && (
          <form action={async () => {}} noValidate>
            <Button
              fullWidth
              variant="outlined"
              type="submit"
              startIcon={<KeyIcon />}
            >
              Passkeyでサインイン(beta)
            </Button>
          </form>
        )}
        <form action={() => {}} noValidate>
          <input type="hidden" name="redirectTo" value="/" />
          <Button
            fullWidth
            variant="outlined"
            type="submit"
            startIcon={<MailLockIcon />}
          >
            Email Magic Linkでサインイン
          </Button>
        </form>
    </Box>
    */}
    </MuiCard>
  );
}
