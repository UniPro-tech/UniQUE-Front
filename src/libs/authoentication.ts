import { toCamelcase } from "@/lib/SnakeCamlUtil";
import { createApiClient } from "./apiClient";
import { getRealIPAddress } from "./request";
import { cookies } from "next/headers";
import { ParseJwt } from "./jwt";
import { Session } from "@/classes/Session";
import { ClearSessionCookie } from "./cookies";

interface Credentials {
  email?: string;
  password?: string;
  code?: string;
  remember?: boolean;
}

enum AuthenticationType {
  Password = "password",
  TOTP = "totp",
}

interface AuthenticationRequest {
  code?: string;
  ipAddress: string;
  password?: string;
  remember: boolean;
  type: AuthenticationType;
  userAgent: string;
  username: string;
}

enum MultifactorAuthenticationType {
  TOTP = "totp",
}

export interface AuthenticationResponse {
  mfa_type?: MultifactorAuthenticationType[];
  require_mfa?: boolean;
  session_jwt?: string;
}

export const AuthenticationRequest = async (
  credentials: Credentials,
): Promise<AuthenticationResponse> => {
  const { email, password, code } = credentials;

  const ipAddress = await getRealIPAddress();
  const userAgent = navigator.userAgent;

  const requestBody: AuthenticationRequest = {
    type: password ? AuthenticationType.Password : AuthenticationType.TOTP,
    username: email || "",
    password,
    code,
    ipAddress,
    userAgent,
    remember: credentials.remember || false,
  };

  const apiClient = createApiClient(process.env.AUTH_API_URL);
  const response = await apiClient.post(
    "/internal/authentication",
    requestBody,
  );

  if (!response.ok) {
    throw new Error(`Authentication failed with status ${response.status}`);
  }

  const data = toCamelcase<AuthenticationResponse>(await response.json());

  return data;
};

export const Logout = async () => {
  const cookieStore = await cookies();
  const sessionJwt = cookieStore.get("session_jwt")?.value;
  if (!sessionJwt) {
    return;
  }
  const sessionJwtPayload = ParseJwt(sessionJwt);
  const sub = sessionJwtPayload.sub;
  if (typeof sub !== "string") {
    return;
  }
  const sid = sub.startsWith("SID_") ? sub.slice(4) : sub;

  Session.deleteById(sid);

  ClearSessionCookie();
};
