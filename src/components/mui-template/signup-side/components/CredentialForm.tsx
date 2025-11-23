import { Box } from "@mui/material";
import CredentialFormClient from "./CredentialFormClient";
import {
  applyCompleteAction,
  signInAction,
  signUpAction,
} from "@/components/mui-template/signup-side/lib/CredentialAction";
import { SignInCardMode } from "../types/SignInCardMode";
import { User } from "@/types/User";

export default function CredentialForm(props: {
  mode: SignInCardMode;
  csrfToken: string;
  user?: User;
  code?: string;
}) {
  return (
    <Box
      component="form"
      action={(() => {
        switch (props.mode) {
          case SignInCardMode.SignUp:
            return signUpAction;
          case SignInCardMode.SignUpEmailValidated:
            return applyCompleteAction;
          case SignInCardMode.SignIn:
            return signInAction;
        }
      })()}
      sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
    >
      <CredentialFormClient
        mode={props.mode}
        csrfToken={props.csrfToken}
        user={props.user}
        code={props.code}
      />
    </Box>
  );
}
