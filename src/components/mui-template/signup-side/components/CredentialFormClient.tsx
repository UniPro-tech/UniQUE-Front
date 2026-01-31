import * as React from "react";
import { z } from "zod";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Link,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ForgotPassword from "@/components/Dialogs/ForgotPassword";
import { SignInCardMode } from "../types/SignInCardMode";
import { enqueueSnackbar } from "notistack";
import { User } from "@/types/User";
import { unlink } from "@/lib/resources/SocialAccounts";

const credentialSchema = z.object({
  name: z.string().min(1, { message: "名前を入力してください。" }),
  username: z
    .string()
    .min(3, { message: "ユーザー名は3文字以上で入力してください。" })
    .max(20, { message: "ユーザー名は20文字以内で入力してください。" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "ユーザー名は英数字とアンダースコアのみ使用できます。",
    }),
  email: z
    .string()
    .nonempty({ message: "メールアドレスを入力してください。" })
    .email({ message: "有効なメールアドレスを入力してください。" }),
  emailOrName: z.string().min(3, {
    message: "メールアドレスまたはユーザー名は3文字以上で入力してください。",
  }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください。" }),
  birthdate: z.string().min(1, { message: "生年月日を入力してください。" }), // Add more validation if needed
});

export default function CredentialFormClient(props: {
  mode: SignInCardMode;
  csrfToken: string;
  user?: User;
  code?: string;
  redirect?: string;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [period, setPeriod] = React.useState("");
  const [birthdate, setBirthdate] = React.useState("");

  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");
  const [birthdateError, setBirthdateError] = React.useState(false);
  const [birthdateErrorMessage, setBirthdateErrorMessage] = React.useState("");

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const validateField = React.useCallback((name: string, value: string) => {
    // validate single field using partial parsing
    try {
      if (name === "name") {
        credentialSchema.pick({ name: true }).parse({ name: value });
        setNameError(false);
        setNameErrorMessage("");
      }
      if (name === "email") {
        credentialSchema.pick({ email: true }).parse({ email: value });
        setEmailError(false);
        setEmailErrorMessage("");
      }
      if (name === "password") {
        credentialSchema.pick({ password: true }).parse({ password: value });
        setPasswordError(false);
        setPasswordErrorMessage("");
      }
      if (name === "username") {
        credentialSchema.pick({ username: true }).parse({ username: value });
        setUsernameError(false);
        setUsernameErrorMessage("");
      }
      if (name === "birthdate") {
        // Add validation for birthdate if needed
        setBirthdateError(false);
        setBirthdateErrorMessage("");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        for (const issue of err.issues) {
          if (issue.path[0] === "email") {
            setEmailError(true);
            setEmailErrorMessage(issue.message);
          }
          if (issue.path[0] === "password") {
            setPasswordError(true);
            setPasswordErrorMessage(issue.message);
          }
          if (issue.path[0] === "name") {
            setNameError(true);
            setNameErrorMessage(issue.message);
          }
          if (issue.path[0] === "username") {
            setUsernameError(true);
            setUsernameErrorMessage(issue.message);
          }
          if (issue.path[0] === "birthdate") {
            setBirthdateError(true);
            setBirthdateErrorMessage(issue.message);
          }
        }
      }
    }
  }, []);

  React.useEffect(() => {
    // validate on change (real-time)
    validateField("email", email);
  }, [email, validateField]);

  React.useEffect(() => {
    validateField("password", password);
  }, [password, validateField]);

  return (
    <>
      <input type="hidden" name="csrfToken" value={props.csrfToken} />
      {props.redirect && (
        <input type="hidden" name="redirect" value={props.redirect} />
      )}
      {(() => {
        switch (props.mode) {
          case SignInCardMode.SignUp:
            return (
              <>
                <FormControl>
                  <FormLabel htmlFor="name">名前 (ニックネーム可)</FormLabel>
                  <TextField
                    error={name.length > 0 && nameError}
                    helperText={name.length > 0 && nameErrorMessage}
                    id="name"
                    type="text"
                    name="name"
                    placeholder="ゆに太郎"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={name.length > 0 && nameError ? "error" : "primary"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={(e) => validateField("name", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="username">ユーザー名</FormLabel>
                  <TextField
                    error={username.length > 0 && usernameError}
                    helperText={username.length > 0 && usernameErrorMessage}
                    id="username"
                    type="text"
                    name="username"
                    placeholder="your-username"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={
                      username.length > 0 && usernameError ? "error" : "primary"
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={(e) => validateField("username", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="email">メールアドレス</FormLabel>
                  <TextField
                    error={email.length > 0 && emailError}
                    helperText={email.length > 0 && emailErrorMessage}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    fullWidth
                    variant="outlined"
                    color={email.length > 0 && emailError ? "error" : "primary"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={(e) => validateField("email", e.target.value)}
                  />
                </FormControl>
              </>
            );
          case SignInCardMode.SignUpEmailValidated:
            return (
              <>
                <input
                  type="hidden"
                  name="userId"
                  value={props.user?.id || ""}
                />
                <input type="hidden" name="code" value={props.code || ""} />
                <Stack direction={"row"} alignItems="center" spacing={1}>
                  <Typography variant="h6" textAlign={"left"}>
                    Discordアカウント
                  </Typography>
                  <Divider sx={{ flexGrow: 1 }} />
                </Stack>
                <Typography variant="body2">
                  サークル参加にあたって、Discordアカウントの連携を行います。
                </Typography>
                {props.user!.discords?.length !== 0 ? (
                  <List>
                    {props.user!.discords!.map((discord) => (
                      <ListItem key={discord.discordId}>
                        <Typography variant="body2">
                          {discord.customId} (ID: {discord.discordId})
                        </Typography>
                        <Button
                          onClick={() =>
                            unlink("discord", discord.discordId)
                              .then(() => {
                                enqueueSnackbar(
                                  "Discordアカウントの連携を解除しました。",
                                  { variant: "success" },
                                );
                              })
                              .catch((error) => {
                                enqueueSnackbar(
                                  `Discordアカウントの連携解除に失敗しました: ${error.message}`,
                                  { variant: "error" },
                                );
                              })
                          }
                        >
                          連携解除
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2">
                    現在、Discordアカウントは連携されていません。
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  href={`/api/oauth/discord?signup=${props.code}`}
                >
                  Discordアカウントを連携する
                </Button>
                <FormControl>
                  <Stack direction={"row"} alignItems="center" spacing={1}>
                    <Typography variant="h6" textAlign={"left"}>
                      生年月日
                    </Typography>
                    <Divider sx={{ flexGrow: 1 }} />
                  </Stack>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    未成年者保護の観点から、生年月日の提供をお願いしております。
                  </Typography>
                  <TextField
                    error={birthdate.length > 0 && birthdateError}
                    helperText={birthdate.length > 0 && birthdateErrorMessage}
                    id="birthdate"
                    type="date"
                    name="birthdate"
                    placeholder="birthdate"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={
                      birthdate.length > 0 && birthdateError
                        ? "error"
                        : "primary"
                    }
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    onBlur={(e) => validateField("birthdate", e.target.value)}
                  />
                </FormControl>
              </>
            );
          case SignInCardMode.SignIn:
            return (
              <FormControl>
                <FormLabel htmlFor="username">ユーザー名</FormLabel>
                <TextField
                  error={username.length > 0 && usernameError}
                  helperText={username.length > 0 && usernameErrorMessage}
                  id="username"
                  type="text"
                  name="username"
                  placeholder="username"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={
                    username.length > 0 && usernameError ? "error" : "primary"
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={(e) => validateField("username", e.target.value)}
                />
              </FormControl>
            );
          case SignInCardMode.Migrate:
            return (
              <>
                <FormControl>
                  <FormLabel htmlFor="name">名前 (ニックネーム可)</FormLabel>
                  <TextField
                    error={name.length > 0 && nameError}
                    helperText={name.length > 0 && nameErrorMessage}
                    id="name"
                    type="text"
                    name="name"
                    placeholder="ゆに太郎"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={name.length > 0 && nameError ? "error" : "primary"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={(e) => validateField("name", e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="email">外部メールアドレス</FormLabel>
                  <TextField
                    error={email.length > 0 && emailError}
                    helperText={email.length > 0 && emailErrorMessage}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="example@exsample.com"
                    autoComplete="email"
                    required
                    fullWidth
                    variant="outlined"
                    color={email.length > 0 && emailError ? "error" : "primary"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={(e) => validateField("email", e.target.value)}
                  />
                  <FormHelperText>
                    UniProに登録している外部のメールアドレス(@uniproject.jpではないもの)を入力してください。
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="period">所属期</FormLabel>
                  <TextField
                    id="period"
                    type="text"
                    name="period"
                    placeholder="01A"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    onBlur={(e) => validateField("period", e.target.value)}
                  />
                  <FormHelperText>例:01A、02C、00など</FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="username">ユーザー名</FormLabel>
                  <TextField
                    error={username.length > 0 && usernameError}
                    helperText={username.length > 0 && usernameErrorMessage}
                    id="username"
                    type="text"
                    name="username"
                    placeholder="username"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={
                      username.length > 0 && usernameError ? "error" : "primary"
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={(e) => validateField("username", e.target.value)}
                  />
                  <FormHelperText>
                    メールアドレス&lt;所属期&gt;.xxxx@uniproject.jpのxxxx部分を
                    <wbr />
                    入力してください。
                  </FormHelperText>
                </FormControl>
              </>
            );
        }
      })()}
      {![SignInCardMode.SignUpEmailValidated].includes(props.mode) && (
        <FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <FormLabel htmlFor="password">パスワード</FormLabel>
            {props.mode === SignInCardMode.SignIn && (
              <Link
                component="button"
                variant="body2"
                onClick={handleClickOpen}
                sx={{ alignSelf: "center" }}
              >
                パスワードをお忘れですか？
              </Link>
            )}
          </Box>
          <TextField
            error={password.length > 0 && passwordError}
            helperText={password.length > 0 && passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
            color={password.length > 0 && passwordError ? "error" : "primary"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={(e) => validateField("password", e.target.value)}
          />
        </FormControl>
      )}
      {(() => {
        switch (props.mode) {
          case SignInCardMode.SignIn:
            return (
              <FormControlLabel
                control={<Checkbox name="remember" color="primary" />}
                label="ログイン状態を保持する"
              />
            );
          case SignInCardMode.SignUp:
          case SignInCardMode.Migrate:
          case SignInCardMode.SignUpEmailValidated:
            return (
              <FormControlLabel
                sx={{ wordBreak: "keep-all" }}
                control={<Checkbox name="remember" color="primary" />}
                label={
                  <>
                    <Link href="/terms" target="_blank">
                      利用規約
                    </Link>
                    と
                    <Link href="/privacy" target="_blank">
                      プライバシーポリシー
                    </Link>
                    、
                    <Link href="/club_statute" target="_blank">
                      サークル規約
                    </Link>
                    に
                    <wbr />
                    同意します。
                  </>
                }
              />
            );
        }
      })()}
      <Button type="submit" fullWidth variant="contained">
        {(() => {
          switch (props.mode) {
            case SignInCardMode.SignUp:
              return "メンバー登録を申請";
            case SignInCardMode.SignUpEmailValidated:
              return "申請を完了する";
            case SignInCardMode.SignIn:
              return "サインイン";
            case SignInCardMode.Migrate:
              return "アカウント移行を完了する";
          }
        })()}
      </Button>
      <ForgotPassword
        open={open}
        handleClose={handleClose}
        csrfToken={props.csrfToken}
      />
    </>
  );
}
