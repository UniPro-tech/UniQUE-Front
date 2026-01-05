export const PasswordResetRequest = async (username: string) => {
  const response = await fetch(
    `${process.env.RESOURCE_API_URL}/users/password/reset`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    }
  );
  if (!response.ok) {
    throw new Error("Password reset request failed");
  }
  return response.json();
};
