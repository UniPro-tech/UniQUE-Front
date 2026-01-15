import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { AuthorizationErrors } from "./Errors/AuthorizationErrors";
import { ResourceApiErrors } from "./Errors/ResourceApiErrors";
import { toCamelcase, toSnakecase } from "@/lib/SnakeCamlUtil";
import User from "./User";

export class Role {
  id: string;
  custom_id: string;
  name: string;
  permissionBit: number;
  isSystem?: boolean;
  isEnable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  //======================================
  // Getters and Setters
  //======================================

  /**
   * ロールの権限情報を取得する
   *
   * @returns ロールの権限情報
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  async getPermissions(): Promise<{
    permissionsBit: number;
    permissionsText: string[];
  }> {
    const response = await apiGet(`/roles/${this.id}/permissions`);
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const json = toCamelcase<{
      permissionsBit: number;
      permissionsText: string[];
    }>(await response.json());
    return json;
  }

  /**
   * ロールに紐ついているユーザーを取得する
   *
   * @returns 紐ついているユーザーのリスト
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
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
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const json = toCamelcase<{ users: User[] }>(await response.json());
    return json.users;
  }

  /**
   * ユーザーにロールを割り当てる
   *
   * @param user ユーザーの配列もしくはインスタンス
   * @return void
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  async assignUser(user: string | User): Promise<void> {
    const userId = typeof user === "string" ? user : user.id;
    const response = await apiPut(`/roles/${this.id}/users/${userId}`);
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
  }

  /**
   * ユーザーからロールの割り当てを解除する
   *
   * @param user ユーザーの配列もしくはインスタンス
   * @return void
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  async unassignUser(user: string | User): Promise<void> {
    const userId = typeof user === "string" ? user : user.id;
    const response = await apiDelete(`/roles/${this.id}/users/${userId}`);
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
  }

  // =====================================
  // Constructor
  // =====================================

  constructor(
    id: string,
    custom_id: string,
    name: string,
    permissionBit: number,
    isSystem?: boolean,
    isEnable?: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.custom_id = custom_id;
    this.name = name;
    this.permissionBit = permissionBit;
    this.isSystem = isSystem;
    this.isEnable = isEnable;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // =====================================
  // Conversion Methods
  // =====================================

  /**
   * ロールオブジェクトをプレーンなオブジェクトに変換する
   * 主にClientSideComponentsで使用する。
   *
   * @returns プレーンなロールオブジェクト
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  toPlainObject(): PlainRole {
    return {
      id: this.id,
      custom_id: this.custom_id,
      name: this.name,
      permissionBit: this.permissionBit,
      isSystem: this.isSystem,
      isEnable: this.isEnable,
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    } as PlainRole;
  }

  // =====================================
  // Static Methods
  // =====================================

  /**
   * 全てのロールを取得する
   * @returns 全てのロールの配列
   * @static
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  static async getAllRoles(): Promise<Role[]> {
    const response = await apiGet("/roles");
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const data: RoleRestDTO[] = (await response.json()).data;
    const res = data.map(
      (item: RoleRestDTO) =>
        new Role(
          item.id,
          item.custom_id,
          item.name,
          item.permission,
          item.is_system,
          item.is_enable,
          item.created_at ? new Date(item.created_at) : undefined,
          item.updated_at ? new Date(item.updated_at) : undefined
        )
    );
    return res;
  }

  /**
   * 指定したIDのロールを取得する
   *
   * @param id ロールID
   * @returns ロールオブジェクト
   * @static
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
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
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const data: RoleRestDTO = await response.json();
    const res = new Role(
      data.id,
      data.custom_id,
      data.name,
      data.permission,
      data.is_system,
      data.is_enable,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
    return res;
  }

  /**
   * 指定したカスタムIDのロールを取得する
   *
   * @param customId ロールのカスタムID
   * @returns ロールオブジェクト
   * @static
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  static async getRoleByCustomId(customId: string): Promise<Role> {
    const response = await apiGet(`/roles/search?custom_id=${customId}`);
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const data: RoleRestDTO = await response.json();
    const res = new Role(
      data.id,
      data.custom_id,
      data.name,
      data.permission,
      data.is_system,
      data.is_enable,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
    return res;
  }

  /**
   * APIにてロールを作成する
   *
   * @param plain ロールの情報
   * @returns APIにて作成されたロールオブジェクト
   * @static
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  static async create(plain: PlainRole): Promise<Role> {
    const creationData: RoleRestDTO = {
      id: plain.id,
      custom_id: plain.custom_id,
      name: plain.name,
      permission: plain.permissionBit,
      is_system: plain.isSystem,
      is_enable: plain.isEnable,
      created_at: plain.createdAt,
      updated_at: plain.updatedAt,
    };
    const response = await apiPost(
      "/roles",
      toSnakecase<RoleRestDTO>(creationData)
    );
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const data = toCamelcase<PlainRole>(await response.json());
    return new Role(
      data.id,
      data.custom_id,
      data.name,
      data.permissionBit,
      data.isSystem,
      data.isEnable,
      data.createdAt ? new Date(data.createdAt) : undefined,
      data.updatedAt ? new Date(data.updatedAt) : undefined
    );
  }

  // =====================================
  // Dynamic Methods
  // =====================================

  /**
   * ロールを保存（更新）する
   *
   * @returns 更新されたロールオブジェクト
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  async save(): Promise<Role> {
    const updateData: RoleRestDTO = {
      id: this.id,
      custom_id: this.custom_id,
      name: this.name,
      permission: this.permissionBit,
      is_system: this.isSystem,
      is_enable: this.isEnable,
      created_at: this.createdAt ? this.createdAt.toISOString() : undefined,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    };
    const response = await apiPut(
      `/roles/${this.id}`,
      toSnakecase<RoleRestDTO>(updateData)
    );
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const data = toCamelcase<PlainRole>(await response.json());
    return new Role(
      data.id,
      data.custom_id,
      data.name,
      data.permissionBit,
      data.isSystem,
      data.isEnable,
      data.createdAt ? new Date(data.createdAt) : undefined,
      data.updatedAt ? new Date(data.updatedAt) : undefined
    );
  }

  /**
   * ロールを削除する
   *
   * @returns void
   * @author Yuito Akatsuki <yuito@yuito-it.jp>
   */
  async delete(): Promise<void> {
    const response = await apiDelete(`/roles/${this.id}/delete`);
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 404:
          throw ResourceApiErrors.ResourceNotFound;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
  }
}

/**
 * プレーンなロールオブジェクトの型定義
 * 主にClientSideComponentsで使用する。
 * @author Yuito Akatsuki <yuito@yuito-it.jp>
 */
export type PlainRole = {
  id: string;
  custom_id: string;
  name: string;
  permissionBit: number;
  isSystem?: boolean;
  isEnable?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * API通信で使用するロールDTOの型定義
 *
 * @author Yuito Akatsuki <yuito@yuito-it.jp>
 */
type RoleRestDTO = {
  id: string;
  custom_id: string;
  name: string;
  permission: number;
  is_system?: boolean;
  is_enable?: boolean;
  created_at?: string;
  updated_at?: string;
};
