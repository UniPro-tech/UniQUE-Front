import { toCamelcase } from "@/lib/SnakeCamlUtil";
import { createApiClient } from "./apiClient";
import { getRealIPAddress } from "./request";
import { cookies } from "next/headers";

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

interface AuthenticationResponse {
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

export const SetSessionCookie = async (response: AuthenticationResponse) => {
  const { session_jwt } = response;
  const cookieName = "session_jwt";
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // セッション終了時

  const cookieStore = await cookies();
  cookieStore.set(cookieName, session_jwt || "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
  });
};
