import { Box } from "@mui/material";
import CredentialFormClient from "./CredentialFormClient";
import {
  signInAction,
  signUpAction,
} from "@/components/mui-template/signup-side/lib/CredentialAction";
import { SignInCardMode } from "./SignInCard";

export default function CredentialForm(props: {
  mode: SignInCardMode;
  csrfToken: string;
}) {
  return (
    <Box
      component="form"
      action={
        props.mode === SignInCardMode.SignUp ? signUpAction : signInAction
      }
      sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
    >
      <CredentialFormClient mode={props.mode} csrfToken={props.csrfToken} />
    </Box>
  );
}
