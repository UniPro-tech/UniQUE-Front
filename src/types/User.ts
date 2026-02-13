import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { AuthorizationErrors } from "./Errors/AuthorizationErrors";
import { ResourceApiErrors } from "./Errors/ResourceApiErrors";
import { toCamelcase } from "@/lib/SnakeCamlUtil";

// ============================
// DTO definitions (Swagger準拠)
// ============================

/** routes.ProfileDTO */
export interface ProfileDTO {
  userId?: string;
  displayName?: string;
  bio?: string;
  websiteUrl?: string;
  twitterHandle?: string;
  joinedAt?: string;
  birthdate?: string;
  birthdateVisible?: boolean;
}

/** routes.UserDTO
 * 注意: 返されるフィールドはアクセスコンテキストに依存します
 * - 公開エンドポイント(GET /users): id, customId, profile(基本情報のみ)
 * - 自分のデータ(GET /users/{id} 認証済み自分): 全フィールド
 * - 他人のデータ(GET /users/{id}): 基本情報のみ (email, status等は含まれない)
 */
export interface UserDTO {
  id: string;
  customId?: string;
  email?: string;
  externalEmail?: string;
  pendingEmail?: string;
  emailVerified?: boolean;
  affiliationPeriod?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  profile?: ProfileDTO;
}

/** routes.CreateUserRequest */
export interface CreateUserRequest {
  custom_id: string;
  email: string;
  password?: string;
  external_email?: string;
  status?: string;
  affiliation_period?: string;
  profile?: {
    display_name?: string;
    bio?: string;
    website_url?: string;
    twitter_handle?: string;
    joined_at?: string;
    birthdate?: string;
  };
}

/** routes.UpdateUserRequest */
export interface UpdateUserRequest {
  custom_id?: string;
  email?: string;
  external_email?: string;
  affiliation_period?: string;
  status?: string;
  profile?: {
    display_name?: string;
    bio?: string;
    website_url?: string;
    twitter_handle?: string;
    joined_at?: string;
    birthdate?: string;
    birthdate_visible?: boolean;
  };
}

/** routes.CreateUserRoleRequest */
export interface CreateUserRoleRequest {
  role_id: string;
}

/** routes.UserListResponse */
export interface UserListResponse {
  data: UserDTO[];
}

// ============================
// User class
// ============================

export class User {
  id!: string;
  customId?: string;
  email?: string;
  externalEmail?: string;
  pendingEmail?: string;
  emailVerified?: boolean;
  affiliationPeriod?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  profile?: ProfileDTO;

  constructor(data: Partial<UserDTO> & { id: string }) {
    this.id = data.id;
    if (data.customId !== undefined) this.customId = data.customId;
    if (data.email !== undefined) this.email = data.email;
    if (data.externalEmail !== undefined)
      this.externalEmail = data.externalEmail;
    if (data.pendingEmail !== undefined) this.pendingEmail = data.pendingEmail;
    if (data.emailVerified !== undefined)
      this.emailVerified = data.emailVerified;
    if (data.affiliationPeriod !== undefined)
      this.affiliationPeriod = data.affiliationPeriod;
    if (data.status !== undefined) this.status = data.status;
    if (data.createdAt !== undefined) this.createdAt = data.createdAt;
    if (data.updatedAt !== undefined) this.updatedAt = data.updatedAt;
    if (data.profile !== undefined) this.profile = data.profile;
  }

  /**
   * ユーザーがパブリック情報のみ含むデータ（他のユーザー情報）を持つかチェック
   * email, statusなどの機密情報がない場合はtrue
   */
  isPublicOnly(): boolean {
    return this.email === undefined || this.status === undefined;
  }

  /**
   * ユーザーが自分のフルなデータを持つかチェック
   * email, status, createdAtなどの全フィールドが含まれている場合はtrue
   */
  hasFullData(): boolean {
    return (
      this.email !== undefined &&
      this.status !== undefined &&
      this.createdAt !== undefined &&
      this.updatedAt !== undefined
    );
  }

  /** 表示名を取得 (profile.displayName ?? customId ?? id) */
  get displayName(): string {
    return this.profile?.displayName || this.customId || this.id || "";
  }

  /** PUT /users/{id} でユーザー情報を更新
   * 注意: このメソッドは完全なフルデータ(自分のデータ)を編集する場合のみ使用してください
   */
  async save(): Promise<void> {
    // メールアドレスが含まれていない場合は編集不可
    if (!this.email) {
      throw new Error(
        "Cannot save user data without email. You may not have permission to edit this user.",
      );
    }

    const body: UpdateUserRequest = {
      custom_id: this.customId,
      email: this.email,
      external_email: this.externalEmail,
      affiliation_period: this.affiliationPeriod,
      status: this.status,
      profile: this.profile
        ? {
            display_name: this.profile.displayName,
            bio: this.profile.bio,
            website_url: this.profile.websiteUrl,
            twitter_handle: this.profile.twitterHandle,
            joined_at: this.profile.joinedAt,
            birthdate: this.profile.birthdate,
            birthdate_visible: this.profile.birthdateVisible,
          }
        : undefined,
    };
    const res = await apiPut(`/users/${this.id}`, body);
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
    const updated = toCamelcase<UserDTO>(data);
    Object.assign(this, updated);
  }

  /** POST /users/{id}/approve でユーザー登録を承認する */
  async approve(): Promise<void> {
    const res = await apiPost(`/users/${this.id}/approve`);
    if (!res.ok) {
      switch (res.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
  }

  /** GET /users/{id}/roles でユーザーのロール一覧を取得 */
  async getRoles(): Promise<import("./Role").RoleDTO[]> {
    const res = await apiGet(`/users/${this.id}/roles`);
    if (!res.ok) {
      switch (res.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const json = await res.json();
    return toCamelcase<import("./Role").RoleDTO[]>(json.data ?? []);
  }

  /** POST /users/{id}/roles でロールを割り当て */
  async assignRole(roleId: string): Promise<void> {
    const res = await apiPost(`/users/${this.id}/roles`, {
      role_id: roleId,
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
  }

  /** DELETE /users/{id}/roles/{roleId} でロール割り当てを解除 */
  async unassignRole(roleId: string): Promise<void> {
    const { apiDelete } = await import("@/lib/apiClient");
    const res = await apiDelete(`/users/${this.id}/roles/${roleId}`);
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
  }

  /** GET /users/{id}/apps でユーザーのアプリ一覧を取得 */
  async getApps(): Promise<import("./App").ApplicationDTO[]> {
    const res = await apiGet(`/users/${this.id}/apps`);
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
    return toCamelcase<import("./App").ApplicationDTO[]>(json.data ?? []);
  }

  /** TODO: パスワード変更 (将来実装) */
  async passwordChange(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!this.id) {
      throw new Error("Cannot change password: user id is not set");
    }

    const res = await apiPut(`/users/${this.id}/password/change`, {
      current_password: currentPassword,
      new_password: newPassword,
    });

    if (!res.ok) {
      switch (res.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        default:
          console.log(await res.text());
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
  }

  /** プレーンオブジェクトに変換 (Client Components用) */
  convertPlain(): UserDTO {
    return {
      id: this.id,
      customId: this.customId,
      email: this.email,
      externalEmail: this.externalEmail,
      pendingEmail: this.pendingEmail,
      emailVerified: this.emailVerified,
      affiliationPeriod: this.affiliationPeriod,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      profile: this.profile ? { ...this.profile } : undefined,
    };
  }

  // ============================
  // Static methods
  // ============================

  static async getById(userId: string): Promise<User> {
    const response = await apiGet(`/users/${userId}`);
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const data = await response.json();
    return new User(toCamelcase<UserDTO>(data));
  }

  /** POST /internal/users で新規ユーザー作成 */
  static async create(
    req: CreateUserRequest,
    options?: { headers?: Record<string, string> },
  ): Promise<User> {
    const res = await apiPost(`/internal/users`, req, {
      headers: options?.headers,
    });
    if (!res.ok) {
      // エラーレスポンスからエラーコードを取得
      try {
        const errorData = await res.json();
        const errorCode = errorData?.code;

        if (errorCode === "R0006") {
          throw ResourceApiErrors.UsernameAlreadyExists;
        } else if (errorCode === "R0007") {
          throw ResourceApiErrors.EmailAlreadyExists;
        }
      } catch {
        // JSON parseに失敗した場合は continue
      }

      switch (res.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 409:
          throw ResourceApiErrors.ResourceAlreadyExists;
        default:
          console.error("User creation failed with status:", res.status);
          throw ResourceApiErrors.ResourceCreationFailed;
      }
    }
    const data = await res.json();
    return new User(toCamelcase<UserDTO>(data));
  }

  /** GET /users でユーザー一覧取得 */
  static async list(): Promise<User[]> {
    const response = await apiGet(`/users`, { cache: "no-store" });
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        default:
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const json = await response.json();
    const items = toCamelcase<UserDTO[]>(json.data ?? []);
    return items.map((item) => new User(item));
  }
}

export default User;
