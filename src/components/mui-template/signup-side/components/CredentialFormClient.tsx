"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  signInAction,
  signUpAction,
  applyCompleteAction,
  migrateAction,
  totpSignInAction,
} from "@/components/mui-template/signup-side/lib/CredentialAction";
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
  Stack,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import ForgotPassword from "@/components/Dialogs/ForgotPassword";
import { SignInCardMode } from "../types/SignInCardMode";
import { User } from "@/types/User";

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
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください。" }),
  confirmPassword: z
    .string()
    .min(1, { message: "パスワード確認を入力してください。" }),
  birthdate: z.string().min(1, { message: "生年月日を入力してください。" }),
});

type FormField = {
  value: string;
  error: boolean;
  message: string;
};

type FormState = {
  name: FormField;
  email: FormField;
  password: FormField;
  confirmPassword: FormField;
  otp: FormField;
  username: FormField;
  period: FormField;
  birthdate: FormField;
  forgotPasswordOpen: boolean;
};

type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof Omit<FormState, "forgotPasswordOpen">;
      value: string;
    }
  | {
      type: "SET_ERROR";
      field: keyof Omit<FormState, "forgotPasswordOpen">;
      error: boolean;
      message: string;
    }
  | { type: "RESET_ERROR"; field: keyof Omit<FormState, "forgotPasswordOpen"> }
  | { type: "TOGGLE_FORGOT_PASSWORD" };

const initialFormState = (initialValues?: {
  name?: string;
  email?: string;
  period?: string;
  username?: string;
}): FormState => ({
  name: { value: initialValues?.name || "", error: false, message: "" },
  email: { value: initialValues?.email || "", error: false, message: "" },
  password: { value: "", error: false, message: "" },
  confirmPassword: { value: "", error: false, message: "" },
  otp: { value: "", error: false, message: "" },
  username: { value: initialValues?.username || "", error: false, message: "" },
  period: { value: initialValues?.period || "", error: false, message: "" },
  birthdate: { value: "", error: false, message: "" },
  forgotPasswordOpen: false,
});

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: { ...state[action.field], value: action.value },
      };
    case "SET_ERROR":
      return {
        ...state,
        [action.field]: {
          ...state[action.field],
          error: action.error,
          message: action.message,
        },
      };
    case "RESET_ERROR":
      return {
        ...state,
        [action.field]: { ...state[action.field], error: false, message: "" },
      };
    case "TOGGLE_FORGOT_PASSWORD":
      return { ...state, forgotPasswordOpen: !state.forgotPasswordOpen };
    default:
      return state;
  }
};

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  name: string;
  placeholder: string;
  value: string;
  error: boolean;
  errorMessage: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  helperText?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = "text",
  name,
  placeholder,
  value,
  error,
  errorMessage,
  onChange,
  onBlur,
  helperText,
  autoFocus,
  autoComplete,
  disabled = false,
}) => {
  const hasValue = value.length > 0;
  return (
    <FormControl>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <TextField
        error={hasValue && error}
        helperText={hasValue && error ? errorMessage : helperText || ""}
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        fullWidth
        variant="outlined"
        color={hasValue && error ? "error" : "primary"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        disabled={disabled}
        inputProps={{ "aria-describedby": `${id}-helper` }}
      />
      <FormHelperText
        id={`${id}-helper`}
        role={hasValue && error ? "alert" : "status"}
        aria-live={hasValue && error ? "assertive" : "polite"}
      >
        {hasValue && error ? errorMessage : helperText || ""}
      </FormHelperText>
    </FormControl>
  );
};

export default function CredentialFormClient(props: {
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
  onClientModeChange?: (mode: SignInCardMode) => void;
}) {
  const [state, dispatch] = React.useReducer(
    formReducer,
    props.initialFormValues,
    initialFormState,
  );
  const router = useRouter();
  const [clientMode, setClientMode] = React.useState<SignInCardMode>(
    props.mode,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const codeRef = React.useRef<HTMLInputElement | null>(null);

  const validateField = React.useCallback(
    (fieldName: keyof Omit<FormState, "forgotPasswordOpen">, value: string) => {
      try {
        const fieldValue = value || "";

        // Special validation for confirmPassword
        if (fieldName === "confirmPassword") {
          if (fieldValue !== state.password.value) {
            dispatch({
              type: "SET_ERROR",
              field: fieldName,
              error: true,
              message: "パスワードが一致しません。",
            });
          } else {
            dispatch({ type: "RESET_ERROR", field: fieldName });
          }
          return;
        }

        // Zod validation for other fields
        if (
          ["name", "email", "password", "username", "birthdate"].includes(
            fieldName,
          )
        ) {
          credentialSchema
            .pick({ [fieldName]: true } as never)
            .parse({ [fieldName]: fieldValue });
          dispatch({ type: "RESET_ERROR", field: fieldName });
        }
      } catch (err) {
        if (err instanceof z.ZodError && err.issues.length > 0) {
          dispatch({
            type: "SET_ERROR",
            field: fieldName,
            error: true,
            message: err.issues[0].message,
          });
        }
      }
    },
    [state.password.value],
  );

  // Real-time validation for email and password
  React.useEffect(() => {
    if (state.email.value.length > 0) {
      validateField("email", state.email.value);
    }
  }, [state.email.value, validateField]);

  React.useEffect(() => {
    if (state.password.value.length > 0) {
      validateField("password", state.password.value);
    }
  }, [state.password.value, validateField]);

  React.useEffect(() => {
    if (state.confirmPassword.value.length > 0) {
      validateField("confirmPassword", state.confirmPassword.value);
    }
  }, [state.confirmPassword.value, state.password.value, validateField]);

  const setFieldValue = (
    field: keyof Omit<FormState, "forgotPasswordOpen">,
    value: string,
  ) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const handleForgotPassword = () => {
    dispatch({ type: "TOGGLE_FORGOT_PASSWORD" });
  };

  const renderModeSpecificFields = () => {
    const mode = clientMode;
    switch (mode) {
      case SignInCardMode.SignUp:
        return (
          <>
            <FormField
              label="名前 (ニックネーム可)"
              id="name"
              name="name"
              placeholder="ゆに太郎"
              value={state.name.value}
              error={state.name.error}
              errorMessage={state.name.message}
              onChange={(v) => setFieldValue("name", v)}
              onBlur={() => validateField("name", state.name.value)}
              autoFocus
            />
            <FormField
              label="ユーザー名"
              id="username"
              name="username"
              placeholder="your-username"
              value={state.username.value}
              error={state.username.error}
              errorMessage={state.username.message}
              onChange={(v) => setFieldValue("username", v)}
              onBlur={() => validateField("username", state.username.value)}
            />
            <FormField
              label="メールアドレス"
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={state.email.value}
              error={state.email.error}
              errorMessage={state.email.message}
              onChange={(v) => setFieldValue("email", v)}
              onBlur={() => validateField("email", state.email.value)}
              autoComplete="email"
            />
          </>
        );

      case SignInCardMode.SignUpEmailValidated:
        return (
          <>
            <input type="hidden" name="userId" value={props.user?.id || ""} />
            <input type="hidden" name="code" value={props.code || ""} />
            <Stack direction={"row"} alignItems="center" spacing={1}>
              <Typography variant="h6">Discordアカウント</Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Stack>
            <Typography variant="body2">
              サークル参加にあたって、Discordアカウントの連携を行います。
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discord連携は現在利用できません（未実装）。
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href={`/api/oauth/discord?signup=${props.code}`}
            >
              Discordアカウントを連携する
            </Button>
            <FormControl>
              <Stack direction={"row"} alignItems="center" spacing={1}>
                <Typography variant="h6">生年月日</Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Stack>
              <Typography variant="body2" sx={{ mb: 1 }}>
                未成年者保護の観点から、生年月日の提供をお願いしております。
              </Typography>
              <TextField
                error={
                  state.birthdate.value.length > 0 && state.birthdate.error
                }
                helperText={
                  state.birthdate.value.length > 0
                    ? state.birthdate.message
                    : ""
                }
                id="birthdate"
                type="date"
                name="birthdate"
                required
                fullWidth
                variant="outlined"
                color={
                  state.birthdate.value.length > 0 && state.birthdate.error
                    ? "error"
                    : "primary"
                }
                value={state.birthdate.value}
                onChange={(e) => setFieldValue("birthdate", e.target.value)}
                onBlur={() => validateField("birthdate", state.birthdate.value)}
              />
            </FormControl>
          </>
        );

      case SignInCardMode.SignIn:
        return (
          <FormField
            label="ユーザー名"
            id="username"
            name="username"
            placeholder="username"
            value={state.username.value}
            error={state.username.error}
            errorMessage={state.username.message}
            onChange={(v) => setFieldValue("username", v)}
            onBlur={() => validateField("username", state.username.value)}
            autoFocus
          />
        );

      case SignInCardMode.Totp:
        return (
          <>
            <FormField
              label="ユーザー名"
              id="username_tmp"
              name="username_tmp"
              placeholder="username"
              value={state.username.value}
              error={state.username.error}
              errorMessage={state.username.message}
              onChange={(v) => setFieldValue("username", v)}
              onBlur={() => validateField("username", state.username.value)}
              disabled={true}
            />
            <input type="hidden" name="username" value={state.username.value} />
            <FormControl>
              <FormLabel htmlFor="code">認証コード</FormLabel>
              <TextField
                id="code"
                name="code"
                placeholder="123456"
                value={state.otp.value}
                onChange={(e) => setFieldValue("otp", e.target.value)}
                required
                fullWidth
                variant="outlined"
                inputRef={codeRef}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "\\d*",
                  maxLength: 6,
                  "aria-describedby": "code-helper",
                }}
                autoComplete="one-time-code"
                autoFocus
              />
              <FormHelperText id="code-helper" role="status" aria-live="polite">
                認証アプリのコード（6桁）を入力してください
              </FormHelperText>
            </FormControl>
          </>
        );

      case SignInCardMode.Migrate:
        return (
          <>
            <FormField
              label="名前 (ニックネーム可)"
              id="name"
              name="name"
              placeholder="ゆに太郎"
              value={state.name.value}
              error={state.name.error}
              errorMessage={state.name.message}
              onChange={(v) => setFieldValue("name", v)}
              onBlur={() => validateField("name", state.name.value)}
              autoFocus
            />
            <FormField
              label="外部メールアドレス"
              id="email"
              type="email"
              name="email"
              placeholder="example@exsample.com"
              value={state.email.value}
              error={state.email.error}
              errorMessage={state.email.message}
              onChange={(v) => setFieldValue("email", v)}
              onBlur={() => validateField("email", state.email.value)}
              helperText="UniProに登録しているお持ちのメールアドレス (@uniproject.jp 以外) をご入力ください"
              autoComplete="email"
            />
            <FormControl>
              <FormLabel htmlFor="period">所属期</FormLabel>
              <TextField
                id="period"
                type="text"
                name="period"
                placeholder="01A"
                required
                fullWidth
                variant="outlined"
                value={state.period.value}
                onChange={(e) => setFieldValue("period", e.target.value)}
              />
              <FormHelperText>
                例: 01A、02C、00 などのように入力してください
              </FormHelperText>
            </FormControl>
            <FormField
              label="ユーザー名"
              id="username"
              name="username"
              placeholder="username"
              value={state.username.value}
              error={state.username.error}
              errorMessage={state.username.message}
              onChange={(v) => setFieldValue("username", v)}
              onBlur={() => validateField("username", state.username.value)}
              helperText="メールアドレス&lt;所属期&gt;.xxxx@uniproject.jp の xxxx 部分をご入力ください"
            />
          </>
        );
    }
  };

  const renderPasswordFields = () => {
    if (
      [SignInCardMode.SignUpEmailValidated, SignInCardMode.Totp].includes(
        clientMode,
      )
    ) {
      return null;
    }

    return (
      <>
        <FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <FormLabel htmlFor="password">パスワード</FormLabel>
            {props.mode === SignInCardMode.SignIn && (
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPassword}
                sx={{ alignSelf: "center" }}
              >
                パスワードをお忘れですか？
              </Link>
            )}
          </Box>
          <TextField
            error={state.password.value.length > 0 && state.password.error}
            helperText={
              state.password.value.length > 0 && state.password.error
                ? state.password.message
                : props.mode !== SignInCardMode.SignIn
                  ? "8文字以上で、安全なパスワードを決めてください"
                  : ""
            }
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
            color={
              state.password.value.length > 0 && state.password.error
                ? "error"
                : "primary"
            }
            value={state.password.value}
            onChange={(e) => setFieldValue("password", e.target.value)}
            onBlur={() => validateField("password", state.password.value)}
          />
        </FormControl>
        {props.mode !== SignInCardMode.SignIn && (
          <FormControl>
            <FormLabel htmlFor="confirmPassword">パスワード確認</FormLabel>
            <TextField
              error={
                state.confirmPassword.value.length > 0 &&
                state.confirmPassword.error
              }
              helperText={
                state.confirmPassword.value.length > 0 &&
                state.confirmPassword.error
                  ? state.confirmPassword.message
                  : "上記で入力したパスワードをもう一度ご入力ください"
              }
              name="confirmPassword"
              placeholder="••••••"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              required
              fullWidth
              variant="outlined"
              color={
                state.confirmPassword.value.length > 0 &&
                state.confirmPassword.error
                  ? "error"
                  : "primary"
              }
              value={state.confirmPassword.value}
              onChange={(e) => setFieldValue("confirmPassword", e.target.value)}
              onBlur={() =>
                validateField("confirmPassword", state.confirmPassword.value)
              }
            />
          </FormControl>
        )}
      </>
    );
  };

  const renderTermsCheckbox = () => {
    if (props.mode === SignInCardMode.SignIn) {
      return (
        <FormControlLabel
          control={<Checkbox name="remember" color="primary" />}
          label="ログイン状態を保持する"
        />
      );
    }

    return (
      <FormControl required sx={{ wordBreak: "keep-all" }}>
        <FormControlLabel
          control={<Checkbox name="termsAccepted" color="primary" />}
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
        <FormHelperText>申請の送信には同意が必要です</FormHelperText>
      </FormControl>
    );
  };

  const getButtonText = () => {
    const mode = clientMode;
    switch (mode) {
      case SignInCardMode.SignUp:
        return "メンバー登録を申請";
      case SignInCardMode.SignUpEmailValidated:
        return "申請を完了する";
      case SignInCardMode.SignIn:
        return "サインイン";
      case SignInCardMode.Totp:
        return "TOTPでサインイン";
      case SignInCardMode.Migrate:
        return "アカウント移行を完了する";
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);
        let action: (fd: FormData) => Promise<
          | {
              mfaRequired: boolean;
              mfaType: string;
              username: string;
              redirectTo?: undefined;
            }
          | {
              redirectTo: string;
              mfaRequired?: undefined;
              mfaType?: undefined;
              username?: undefined;
            }
          | void
        > = signInAction;
        const mode = clientMode;
        switch (mode) {
          case SignInCardMode.SignUp:
            action = signUpAction;
            break;
          case SignInCardMode.SignUpEmailValidated:
            action = applyCompleteAction;
            break;
          case SignInCardMode.SignIn:
            action = signInAction;
            break;
          case SignInCardMode.Totp:
            action = totpSignInAction;
            break;
          case SignInCardMode.Migrate:
            action = migrateAction;
            break;
        }

        try {
          setIsSubmitting(true);
          const res = await action(fd);
          if (res) {
            if (res.redirectTo) {
              router.push(res.redirectTo);
              return;
            }
            if (res.mfaRequired) {
              // switch to TOTP UI without changing URL
              setClientMode(SignInCardMode.Totp);
              props.onClientModeChange?.(SignInCardMode.Totp);
              if (res.username) {
                dispatch({
                  type: "SET_FIELD",
                  field: "username",
                  value: res.username,
                });
              }
              // focus code input on next tick
              Promise.resolve().then(() => codeRef.current?.focus());
              return;
            }
          }
        } catch (err) {
          console.error("Submit action error:", err);
        } finally {
          setIsSubmitting(false);
        }
      }}
      aria-busy={isSubmitting}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 16,
        opacity: isSubmitting ? 0.96 : 1,
        transition: "opacity 180ms ease",
        pointerEvents: isSubmitting ? "none" : "auto",
      }}
    >
      <input type="hidden" name="csrfToken" value={props.csrfToken} />
      {props.redirect && (
        <input type="hidden" name="redirect" value={props.redirect} />
      )}
      {renderModeSpecificFields()}
      {renderPasswordFields()}
      {renderTermsCheckbox()}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{
          transition: "transform 200ms ease, opacity 200ms ease",
          transform: isSubmitting ? "scale(0.98)" : "scale(1)",
          opacity: isSubmitting ? 0.95 : 1,
        }}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
            {getButtonText()}
          </>
        ) : (
          getButtonText()
        )}
      </Button>
      <ForgotPassword
        open={state.forgotPasswordOpen}
        handleClose={handleForgotPassword}
        csrfToken={props.csrfToken}
      />
    </form>
  );
}
