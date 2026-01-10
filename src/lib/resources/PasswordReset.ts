import { apiPost } from "@/lib/apiClient";

export const PasswordResetRequest = async (username: string) => {
  const response = await apiPost(`/users/password/reset`, { username });
  if (!response.ok) {
    throw new Error("Password reset request failed");
  }
  return response.json();
};
