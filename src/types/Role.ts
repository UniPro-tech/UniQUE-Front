import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { AuthorizationErrors } from "./Errors/AuthorizationErrors";
import { ResourceApiErrors } from "./Errors/ResourceApiErrors";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import User, { UserDTO } from "./User";

// ============================
// DTO definitions (Swagger準拠)
// ============================

/** routes.RoleDTO */
export interface RoleDTO {
  id: string;
  customId: string;
  name: string;
  description?: string;
  permissionBitmask: number;
}

/** routes.CreateRoleRequest */
export interface CreateRoleRequest {
  custom_id: string;
  name: string;
  description?: string;
  permission_bitmask: number;
}

/** routes.UpdateRoleRequest */
export interface UpdateRoleRequest {
  custom_id?: string;
  name?: string;
  description?: string;
  permission_bitmask?: number;
}

/** Client Components用のプレーン型 */
export type PlainRole = RoleDTO;

// ============================
// Role class
// ============================

export class Role {
  id: string;
  customId: string;
  name: string;
  description?: string;
  permissionBitmask: number;

  constructor(data: RoleDTO) {
    this.id = data.id;
    this.customId = data.customId;
    this.name = data.name;
    this.description = data.description;
    this.permissionBitmask = data.permissionBitmask;
  }

  /** GET /roles/{id}/users でロールに紐ついているユーザーを取得 */
  async getUsers(): Promise<User[]> {
    const response = await apiGet(`/roles/${this.id}/users`);
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

  /** POST /users/{userId}/roles でユーザーにロールを割り当て */
  async assignUser(user: string | User): Promise<void> {
    const userId = typeof user === "string" ? user : user.id;
    const res = await apiPost(`/users/${userId}/roles`, {
      role_id: this.id,
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

  /** DELETE /users/{userId}/roles/{roleId} でロール割り当て解除 */
  async unassignUser(user: string | User): Promise<void> {
    const userId = typeof user === "string" ? user : user.id;
    const { apiDelete } = await import("@/lib/apiClient");
    const res = await apiDelete(`/users/${userId}/roles/${this.id}`);
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

  /** PUT /roles/{id} でロール情報を更新 */
  async save(): Promise<Role> {
    const body: UpdateRoleRequest = {
      custom_id: this.customId,
      name: this.name,
      description: this.description,
      permission_bitmask: this.permissionBitmask,
    };
    const response = await apiPut(`/roles/${this.id}`, body);
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
    const data = toCamelcase<RoleDTO>(await response.json());
    Object.assign(this, data);
    return this;
  }

  /** プレーンオブジェクトに変換 */
  toPlainObject(): PlainRole {
    return {
      id: this.id,
      customId: this.customId,
      name: this.name,
      description: this.description,
      permissionBitmask: this.permissionBitmask,
    };
  }

  // ============================
  // Static methods
  // ============================

  /** GET /roles で全ロール取得 */
  static async getAllRoles(): Promise<Role[]> {
    const response = await apiGet("/roles");
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
    const items = toCamelcase<RoleDTO[]>(json.data ?? []);
    return items.map((item) => new Role(item));
  }

  /** GET /roles/{id} で指定ロール取得 */
  static async getRoleById(id: string): Promise<Role> {
    const response = await apiGet(`/roles/${id}`);
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
    const data = toCamelcase<RoleDTO>(await response.json());
    return new Role(data);
  }

  /** POST /internal/roles で新規ロール作成 */
  static async create(req: CreateRoleRequest): Promise<Role> {
    const response = await apiPost("/internal/roles", req);
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
    const data = toCamelcase<RoleDTO>(await response.json());
    return new Role(data);
  }
}

export default Role;
