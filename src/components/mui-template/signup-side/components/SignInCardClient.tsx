"use client";

import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";
// avoid importing `styled` here so this can remain a server component
import { SitemarkIcon } from "./CustomIcons";
//import MailLockIcon from "@mui/icons-material/MailLock";
import CredentialForm from "./CredentialForm";
import { Link, Stack } from "@mui/material";
import { SignInCardMode } from "../types/SignInCardMode";
import { User } from "@/types/User";

// we will apply equivalent styles via the `sx` prop on `MuiCard`

export default function SignInCardClient(props: {
  mode: SignInCardMode;
  csrfToken: string;
  user?: User;
  code?: string;
  redirect?: string;
  initialFormValues?: {
    name?: string;
    email?: string;
    period?: string;
    username?: string;
  };
}) {
  const buildHrefWithRedirect = (href: string): string => {
    if (!props.redirect) return href;
    const url = new URL(href, "http://localhost");
    url.searchParams.set("redirect", props.redirect);
    return url.pathname + url.search;
  };

  const IF_YOUR_TEXTS = (() => {
    switch (props.mode) {
      case SignInCardMode.SignUp:
        return [
          {
            text: "アカウントをお持ちですか？",
            linkText: "サインイン",
            linkHref: buildHrefWithRedirect("/signin"),
          },
          {
            text: "既存メンバーですか？",
            linkText: "アカウント移行",
            linkHref: buildHrefWithRedirect("/migrate"),
          },
        ];
      case SignInCardMode.SignUpEmailValidated:
        return [];
      case SignInCardMode.Migrate:
        return [
          {
            text: "アカウントをお持ちですか？",
            linkText: "サインアップ",
            linkHref: buildHrefWithRedirect("/signup"),
          },
          {
            text: "メンバー登録申請がまだですか？",
            linkText: "サインアップ",
            linkHref: buildHrefWithRedirect("/signup"),
          },
        ];
      case SignInCardMode.SignIn:
        return [
          {
            text: "メンバー登録申請がまだですか？",
            linkText: "サインアップ",
            linkHref: buildHrefWithRedirect("/signup"),
          },
          {
            text: "アカウント移行がまだですか？",
            linkText: "アカウント移行",
            linkHref: buildHrefWithRedirect("/migrate"),
          },
        ];
    }
  })();

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
        {(() => {
          switch (props.mode) {
            case SignInCardMode.SignUp:
              return "メンバー登録申請";
            case SignInCardMode.SignUpEmailValidated:
              return "メンバー登録申請";
            case SignInCardMode.Migrate:
              return "アカウント移行";
            default:
              return "サインイン";
          }
        })()}
      </Typography>
      {IF_YOUR_TEXTS.map((item, index) => (
        <Stack
          direction="row"
          alignItems="center"
          sx={{ width: "100%" }}
          gap={1}
          key={index}
        >
          <Typography
            key={index}
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            {item.text}
            <Link
              href={item.linkHref}
              underline="hover"
              sx={{ cursor: "pointer" }}
            >
              {item.linkText}
            </Link>
          </Typography>
        </Stack>
      ))}
      <CredentialForm
        mode={props.mode}
        csrfToken={props.csrfToken}
        user={props.user}
        code={props.code}
        redirect={props.redirect}
        initialFormValues={props.initialFormValues}
      />
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
