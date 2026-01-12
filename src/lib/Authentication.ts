import { FrontendErrors } from "@/types/Errors/FrontendErrors";
import { createApiClient } from "@/lib/apiClient";
import { AuthenticationErrors } from "@/types/Errors/AuthenticationErrors";
import { AuthServerErrors } from "@/types/Errors/AuthServerErrors";

export type Credentials = {
  username: string;
  password: string;
  ip: string;
  user_agent: string;
  remember_me?: boolean;
  expires_at?: Date;
  max_age?: number;
};

export interface AuthResponse {
  session_id: string;
  expires: string;
  max_age: number;
}

const authApi = createApiClient(process.env.AUTH_API_URL);

export const authenticationRequest = async (
  credentials: Credentials
): Promise<AuthResponse> => {
  const response = await authApi.post(`/authentication`, credentials);
  if (!response.ok) {
    switch (response.status) {
      case 400:
        throw FrontendErrors.InvalidInput;
      case 401:
        throw AuthenticationErrors.InvalidCredentials;
      default:
        throw AuthServerErrors.InternalServerError;
    }
  } else {
    const data: AuthResponse = await response.json();
    return data;
  }
};
