import { Box } from "@mui/material";
import CredentialFormClient from "./CredentialFormClient";
import {
  signInAction,
  signUpAction,
} from "@/components/mui-template/signup-side/lib/CredentialAction";

export default function CredentialForm(props: {
  signUp?: boolean;
  csrfToken: string;
}) {
  return (
    <Box
      component="form"
      action={props.signUp ? signUpAction : signInAction}
      sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
    >
      <CredentialFormClient signUp={props.signUp} csrfToken={props.csrfToken} />
    </Box>
  );
}
