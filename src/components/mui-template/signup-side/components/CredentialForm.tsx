import CredentialFormClient from "./CredentialFormClient";
import { SignInCardMode } from "../types/SignInCardMode";
import { User } from "@/types/User";

export default function CredentialForm(props: {
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
  return (
    <CredentialFormClient
      mode={props.mode}
      csrfToken={props.csrfToken}
      user={props.user}
      code={props.code}
      redirect={props.redirect}
      initialFormValues={props.initialFormValues}
    />
  );
}
