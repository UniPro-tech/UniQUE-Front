"use server";
import User, { UserDTO, UpdateUserRequest } from "@/types/User";
import { toCamelcase } from "../SnakeCamlUtil";
import { apiGet, apiPut } from "@/lib/apiClient";
import { AuthorizationErrors } from "@/types/Errors/AuthorizationErrors";
import { ResourceApiErrors } from "@/types/Errors/ResourceApiErrors";

/** GET /users/{id} で単一ユーザー取得 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const res = await apiGet(`/users/${userId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch user");
  }
  const data = toCamelcase<UserDTO>(await res.json());
  return new User(data);
};

/** GET /users でユーザー一覧取得 */
export const getUsersList = async (options?: {
  filterPendingApplicants?: boolean;
}): Promise<User[]> => {
  const res = await apiGet(`/users`, { cache: "no-store" });
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
  const json = await res.json();
  const items = toCamelcase<UserDTO[]>(json.data ?? []);
  let users = items.map((item) => new User(item));

  // メンバー申請者のみにフィルタ (established かつ email が tmp_ から始まる)
  if (options?.filterPendingApplicants) {
    users = users.filter((user) => user.status === "established");
  }

  return users;
};

/** PUT /users/{id} でユーザー情報を更新 */
export const saveUser = async (user: User): Promise<User> => {
  const body: UpdateUserRequest = {
    custom_id: user.customId,
    email: user.email,
    external_email: user.externalEmail,
    affiliation_period: user.affiliationPeriod,
    status: user.status,
    profile: user.profile
      ? {
          display_name: user.profile.displayName,
          bio: user.profile.bio,
          website_url: user.profile.websiteUrl,
          joined_at: user.profile.joinedAt,
          birthdate: user.profile.birthdate,
        }
      : undefined,
  };
  const res = await apiPut(`/users/${user.id}`, body);
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
  const data = toCamelcase<UserDTO>(await res.json());
  return new User(data);
};
