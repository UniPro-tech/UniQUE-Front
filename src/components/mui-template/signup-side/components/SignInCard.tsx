import { generateCSRFToken } from "@/lib/CSRF";
import SignInCardClient from "./SignInCardClient";

export default function SignInCard(props: { signUp?: boolean }) {
  const csrfToken = generateCSRFToken("expired_" + Date.now().toString());
  return <SignInCardClient signUp={props.signUp} csrfToken={csrfToken} />;
}
