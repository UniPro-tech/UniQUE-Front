import { User } from "@/types/User";
import { toCamelcase } from "./SnakeCamlUtil";

export const getUserById = async (userId: string) => {
  const res = await fetch(`${process.env.RESOURCE_API_URL}/users/${userId}`);
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch user");
  }
  const user = toCamelcase(await res.json()) as User;
  return user;
};
