"use server";
import { getSession } from "./Session";

export const unlink = async (provider: string, id: string) => {
  try {
    const session = await getSession();
    const user = session?.user;
    if (!user) {
      throw new Error("User not authenticated");
    }
    const response = await fetch(
      `${process.env.RESOURCE_API_URL}/users/${user.id}/${provider}/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error("Bad Request: Invalid parameters");
        case 401:
          throw new Error("Unauthorized: Please log in again");
        case 403:
          throw new Error(
            "Forbidden: You do not have permission to perform this action"
          );
        case 404:
          throw new Error(
            "Not Found: The specified social account does not exist"
          );
        case 500:
          throw new Error("Internal Server Error: Please try again later");
        case 502:
          throw new Error("Bad Gateway: Invalid response from upstream server");
        case 503:
          throw new Error("Service Unavailable: Please try again later");
        default:
          throw new Error(`Unexpected error: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error("Error unlinking social account:", error);
  }
};
