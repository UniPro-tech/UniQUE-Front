import { requestPasswordReset } from "@/lib/PasswordReset";

/**
 * Request password reset for a user
 * Sends a password reset email to the user's external email address
 */
export const PasswordResetRequest = async (email: string) => {
  const result = await requestPasswordReset(email);

  if (!result.ok) {
    throw new Error(result.error || "Failed to request password reset");
  }

  return result;
};
