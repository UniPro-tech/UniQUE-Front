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
export const saveUser = async (
  user: User | (Partial<UserDTO> & { id: string }),
): Promise<UserDTO> => {
  const src: Partial<UserDTO> & { id: string } =
    user instanceof User
      ? user.convertPlain()
      : (user as Partial<UserDTO> & { id: string });
  const profileSrc = src.profile as
    | Partial<import("@/types/User").ProfileDTO>
    | undefined;
  const body: UpdateUserRequest = {
    custom_id: src.customId,
    email: src.email,
    external_email: src.externalEmail,
    affiliation_period: src.affiliationPeriod,
    status: src.status,
    profile: profileSrc
      ? {
          display_name: profileSrc.displayName ?? undefined,
          bio: profileSrc.bio ?? undefined,
          website_url: profileSrc.websiteUrl ?? undefined,
          twitter_handle: profileSrc.twitterHandle ?? undefined,
          joined_at: profileSrc.joinedAt ?? undefined,
          birthdate: profileSrc.birthdate ?? undefined,
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
  return data;
};
