"use server";
import { User } from "@/types/User";
import { toCamelcase, toSnakecase } from "../SnakeCamlUtil";
import { convertToDateTime } from "../DateTimeUtils";
import { apiGet, apiPut, apiDelete } from "@/lib/apiClient";
import { AuthorizationErrors } from "@/types/Errors/AuthorizationErrors";
import { ResourceApiErrors } from "@/types/Errors/ResourceApiErrors";

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

export const getUsersList = async () => {
  const res = await apiGet(`/users`, {
    cache: "no-store",
  });
  if (!res.ok) {
    switch (res.status) {
      case 401:
        throw AuthorizationErrors.Unauthorized;
      case 403:
        throw AuthorizationErrors.AccessDenied;
      default:
        throw ResourceApiErrors.ApiServerInternalError;
    }
  }
  const users = await res.json();
  if (!Array.isArray(users.data)) {
    throw ResourceApiErrors.ApiServerInternalError;
  }
  if (users.data.length != 0) {
    if (!users.data[0].hasOwnProperty("is_suspended")) {
      return toCamelcase<User<"Simple">[]>(users.data);
    }
  }
  return toCamelcase<User[]>(users.data);
};

export const saveUser = async (user: User): Promise<User> => {
  try {
    const res = await apiPut(`/users/${user.id}`, {
      ...toSnakecase<User>(convertToDateTime(user)),
    });
    if (!res.ok) {
      switch (res.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        default:
          throw ResourceApiErrors.ResourceUpdateFailed;
      }
    }
    const data = await res.json();
    return toCamelcase<User>(data);
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const res = await apiDelete(`/users/${userId}`);
    if (!res.ok) {
      switch (res.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        default:
          throw ResourceApiErrors.ResourceDeletionFailed;
      }
    }
  } catch (error) {
    throw error;
  }
};
