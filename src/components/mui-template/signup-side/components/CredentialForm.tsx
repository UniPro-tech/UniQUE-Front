import * as React from "react";
import { z } from "zod";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  TextField,
} from "@mui/material";
import ForgotPassword from "./ForgotPassword";

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
});

export default function CredentialForm(props: { signUp?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [emailOrName, setEmailOrName] = React.useState("");
  const [username, setUsername] = React.useState("");

  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [emailOrNameError, setEmailOrNameError] = React.useState(false);
  const [emailOrNameErrorMessage, setEmailOrNameErrorMessage] =
    React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");

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
      if (name === "emailOrName") {
        credentialSchema
          .pick({ emailOrName: true })
          .parse({ emailOrName: value });
        setEmailOrNameError(false);
        setEmailOrNameErrorMessage("");
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
          if (issue.path[0] === "emailOrName") {
            setEmailOrNameError(true);
            setEmailOrNameErrorMessage(issue.message);
          }
          if (issue.path[0] === "username") {
            setUsernameError(true);
            setUsernameErrorMessage(issue.message);
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
    <Box
      component="form"
      action={async (formData: FormData) => {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const remember = formData.get("remember") === "on";
        if (props.signUp) {
          try {
          } catch (error) {
            console.error("Sign-up error:", error);
          }
        } else {
          try {
          } catch (error) {
            console.error("Sign-in error:", error);
          }
        }
      }}
      noValidate
      sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
    >
      {props.signUp ? (
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
              color={username.length > 0 && usernameError ? "error" : "primary"}
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
      ) : (
        <FormControl>
          <FormLabel htmlFor="emailOrName">ユーザー名</FormLabel>
          <TextField
            error={emailOrName.length > 0 && emailOrNameError}
            helperText={emailOrName.length > 0 && emailOrNameErrorMessage}
            id="emailOrName"
            type="text"
            name="emailOrName"
            placeholder="username"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={
              emailOrName.length > 0 && emailOrNameError ? "error" : "primary"
            }
            value={emailOrName}
            onChange={(e) => setEmailOrName(e.target.value)}
            onBlur={(e) => validateField("emailOrName", e.target.value)}
          />
        </FormControl>
      )}
      <FormControl>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <FormLabel htmlFor="password">パスワード</FormLabel>
          {!props.signUp && (
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
      {!props.signUp ? (
        <FormControlLabel
          control={<Checkbox name="remember" color="primary" />}
          label="ログイン状態を保持する"
        />
      ) : (
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
              <Link href="/cookie-policy" target="_blank">
                サークル規約
              </Link>
              に
              <wbr />
              同意します。
            </>
          }
        />
      )}
      <Button type="submit" fullWidth variant="contained">
        {props.signUp ? "メンバー登録を申請" : "サインイン"}
      </Button>
      <ForgotPassword open={open} handleClose={handleClose} />
    </Box>
  );
}
