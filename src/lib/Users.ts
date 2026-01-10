"use server";
import { User } from "@/types/User";
import { toCamelcase, toSnakecase } from "./SnakeCamlUtil";
import { convertToDateTime } from "./DateTimeUtils";
import { getAllCookies } from "./getAllCookie";
import { apiGet, apiPut, apiDelete } from "@/lib/apiClient";

export const getUserById = async (userId: string) => {
  const res = await apiGet(`/users/${userId}`);
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch user");
  }
  const user = toCamelcase(await res.json()) as User;
  return user;
};

export const getUsersList = async (isRoot: boolean) => {
  const res = await apiGet(
    `/users/search${
      !isRoot ? "?filter=is_enable:true,is_suspended:false" : ""
    }`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch users list");
  }
  const users = await res.json();
  return toCamelcase<User[]>(users.data);
};

export const saveUser = async (user: User): Promise<User> => {
  try {
    const res = await apiPut(`/users/${user.id}`, {
      ...toSnakecase<User>(convertToDateTime(user)),
    });
    if (!res.ok) {
      throw new Error(
        `HTTP error! status: ${res.status}, message: ${await res.text()}`
      );
    }
    const data = await res.json();
    return toCamelcase<User>(data);
  } catch (error) {
    throw new Error(`Error saving user: ${error}`);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const res = await apiDelete(`/users/${userId}`);
    if (!res.ok) {
      throw new Error(
        `HTTP error! status: ${res.status}, message: ${await res.text()}`
      );
    }
  } catch (error) {
    throw new Error(`Error deleting user: ${error}`);
  }
};
