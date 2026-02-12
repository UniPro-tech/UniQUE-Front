import { FrontendErrors } from "@/types/Errors/FrontendErrors";
import { createApiClient } from "@/lib/apiClient";
import { AuthenticationErrors } from "@/types/Errors/AuthenticationErrors";
import { AuthServerErrors } from "@/types/Errors/AuthServerErrors";

/** POST /internal/authentication リクエスト */
export type AuthenticationRequest = {
  type: "password" | "mfa" | "totp";
  username?: string;
  password?: string;
  ip_address?: string;
  user_agent?: string;
  remember?: boolean;
};

/** POST /internal/authentication レスポンス */
export interface AuthResponse {
  session_jwt: string;
}

const authApi = createApiClient(process.env.AUTH_API_URL);

export const authenticationRequest = async (
  credentials: AuthenticationRequest,
): Promise<AuthResponse> => {
  const response = await authApi.post(`/internal/authentication`, credentials);
  if (!response.ok) {
    switch (response.status) {
      case 400:
        throw FrontendErrors.InvalidInput;
      case 401:
        throw AuthenticationErrors.InvalidCredentials;
      default:
        throw AuthServerErrors.InternalServerError;
    }
  }
  const data: AuthResponse = await response.json();
  return data;
};
