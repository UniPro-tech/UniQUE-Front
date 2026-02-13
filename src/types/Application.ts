import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { AuthorizationErrors } from "./Errors/AuthorizationErrors";
import { ResourceApiErrors } from "./Errors/ResourceApiErrors";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import User, { UserDTO } from "./User";

// ============================
// DTO definitions (Swagger準拠)
// ============================

/** routes.ApplicationDTO */
export interface ApplicationDTO {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  userId: string;
}

/** routes.CreateApplicationRequest */
export interface CreateApplicationRequest {
  name: string;
  client_secret: string;
  user_id: string;
  description?: string;
  website_url?: string;
  privacy_policy_url?: string;
}

/** routes.UpdateApplicationRequest */
export interface UpdateApplicationRequest {
  name?: string;
  client_secret?: string;
  description?: string;
  website_url?: string;
  privacy_policy_url?: string;
}

/** routes.CreateApplicationOwnerRequest */
export interface CreateApplicationOwnerRequest {
  user_id: string;
}

/** Client Components用のプレーン型 */
export type PlainApplication = ApplicationDTO;

/** オーナー情報を含むアプリケーション型 */
export interface ApplicationWithOwner extends PlainApplication {
  ownerDisplayName?: string;
  ownerCustomId?: string;
}

// ============================
// Application class
// ============================

export class Application {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  userId: string;
  clientSecret?: string; // 再生成時のみ使用

  constructor(data: ApplicationDTO) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.websiteUrl = data.websiteUrl;
    this.privacyPolicyUrl = data.privacyPolicyUrl;
    this.userId = data.userId;
  }

  /** GET /applications/{id}/owners でアプリケーションのオーナーを取得 */
  async getOwners(): Promise<User[]> {
    const response = await apiGet(`/applications/${this.id}/owners`);
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
    const json = await response.json();
    const items = toCamelcase<UserDTO[]>(json.data ?? []);
    return items.map((item) => new User(item));
  }

  /** POST /applications/{id}/owners でオーナーを設定/置換 */
  async assignOwner(user: string | User): Promise<Application> {
    const userId = typeof user === "string" ? user : user.id;
    const body: CreateApplicationOwnerRequest = {
      user_id: userId,
    };
    const res = await apiPost(`/applications/${this.id}/owners`, body);
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
    const data = toCamelcase<ApplicationDTO>(await res.json());
    Object.assign(this, data);
    return this;
  }

  /** PUT /applications/{id} でアプリケーション情報を更新 */
  async save(): Promise<Application> {
    const body: UpdateApplicationRequest = {
      name: this.name,
      description: this.description,
      website_url: this.websiteUrl,
      privacy_policy_url: this.privacyPolicyUrl,
    };
    // clientSecretが設定されている場合のみ含める（再生成時）
    if (this.clientSecret) {
      body.client_secret = this.clientSecret;
    }
    const response = await apiPut(`/applications/${this.id}`, body);
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
    const data = toCamelcase<ApplicationDTO>(await response.json());
    Object.assign(this, data);
    return this;
  }

  /** プレーンオブジェクトに変換 */
  toPlainObject(): PlainApplication {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      privacyPolicyUrl: this.privacyPolicyUrl,
      userId: this.userId,
    };
  }

  // ============================
  // Static methods
  // ============================

  /** GET /applications で全アプリケーション取得 */
  static async getAllApplications(): Promise<Application[]> {
    const response = await apiGet("/applications");
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
    const items = toCamelcase<ApplicationDTO[]>(json.data ?? []);
    return items.map((item) => new Application(item));
  }

  /** GET /applications/{id} で指定アプリケーション取得 */
  static async getApplicationById(id: string): Promise<Application> {
    const response = await apiGet(`/applications/${id}`);
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
    const data = toCamelcase<ApplicationDTO>(await response.json());
    return new Application(data);
  }

  /** POST /internal/applications で新規アプリケーション作成 */
  static async create(req: CreateApplicationRequest): Promise<Application> {
    const response = await apiPost("/internal/applications", req);
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        default:
          throw ResourceApiErrors.ResourceCreationFailed;
      }
    }
    const data = toCamelcase<ApplicationDTO>(await response.json());
    return new Application(data);
  }

  /** DELETE /applications/{id} でアプリケーションを削除 */
  async delete(): Promise<void> {
    const { apiDelete } = await import("@/lib/apiClient");
    const res = await apiDelete(`/applications/${this.id}`);
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

  /** 指定IDのアプリケーションを削除（便利メソッド） */
  static async deleteById(id: string): Promise<void> {
    const { apiDelete } = await import("@/lib/apiClient");
    const res = await apiDelete(`/applications/${id}`);
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

  /** GET /users/{id}/apps でユーザーが所有するアプリケーション一覧を取得 */
  static async getApplicationsByUserId(userId: string): Promise<Application[]> {
    const response = await apiGet(`/users/${userId}/apps`);
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
    const json = await response.json();
    const items = toCamelcase<ApplicationDTO[]>(json.data ?? []);
    return items.map((item) => new Application(item));
  }
}

export default Application;
