import { Box } from "@mui/material";
import CredentialFormClient from "./CredentialFormClient";
import {
  signInAction,
  signUpAction,
} from "@/components/mui-template/signup-side/lib/CredentialAction";
import { SignInCardMode } from "../types/SignInCardMode";

export default function CredentialForm(props: {
  mode: SignInCardMode;
  csrfToken: string;
}) {
  return (
    <Box
      component="form"
      action={(() => {
        switch (props.mode) {
          case SignInCardMode.SignUp:
          case SignInCardMode.SignUpEmailValidated:
            return signUpAction;
          case SignInCardMode.SignIn:
            return signInAction;
        }
      })()}
      sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
    >
      <CredentialFormClient mode={props.mode} csrfToken={props.csrfToken} />
    </Box>
  );
}
