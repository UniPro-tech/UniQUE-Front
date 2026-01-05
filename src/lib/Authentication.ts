import {
  BadRequestError,
  AuthenticationError,
  AuthorizeError,
  ServerError,
} from "./RequestErrors";

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

export const authenticationRequest = async (
  credentials: Credentials
): Promise<AuthResponse> => {
  const response = await fetch(`${process.env.AUTH_API_URL}/authentication`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    credentials: "include",
  });
  if (!response.ok) {
    switch (response.status) {
      case 400:
        throw BadRequestError;
      case 401:
        throw AuthenticationError;
      case 403:
        throw AuthorizeError;
      case 500:
        throw ServerError;
      default:
        throw ServerError;
    }
  } else {
    const data: AuthResponse = await response.json();
    return data;
  }
};
