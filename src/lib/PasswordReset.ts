export const PasswordResetRequest = async (username: string) => {
  console.log("Password reset request for username:", username);
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
    console.error("Password reset request failed:", response);
    throw new Error("Password reset request failed");
  }
  console.log("Password reset request successful:", response);
  return response.json();
};
