import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/apiClient";
import { Discord } from "./Discord";
import { Role } from "./Role";
import { AuthorizationErrors } from "./Errors/AuthorizationErrors";
import { ResourceApiErrors } from "./Errors/ResourceApiErrors";
import { toCamelcase } from "@/lib/SnakeCamlUtil";

// ジェネリッククラス: Simple版とFull版を型パラメータで制御
export class User<T extends "Simple" | "Full" = "Full"> {
  id: string | null = null;
  name!: string;
  customId!: string;
  email!: string;
  externalEmail!: string;
  period: string | null = null;
  isEnable!: boolean;
  isSuspended!: boolean;
  isSystem!: boolean;
  suspendedReason: string | null = null;
  suspendedUntil: Date | null = null;
  joinedAt: Date | null = null;
  createdAt!: Date;
  updatedAt!: Date;
  discords?: Discord[];
  roles?: Role[];

  constructor(
    data: T extends "Full"
      ? {
          id: string | null;
          name: string;
          customId: string;
          email: string;
          externalEmail: string;
          period: string | null;
          isEnable: boolean;
          isSuspended: boolean;
          isSystem: boolean;
          suspendedReason: string | null;
          suspendedUntil: Date | null;
          joinedAt: Date | null;
          createdAt: Date;
          updatedAt: Date;
          discords?: Discord[];
          roles?: Role[];
        }
      : {
          id: string | null;
          name: string;
          customId: string;
          email: string;
          period: string | null;
          joinedAt: Date | null;
          createdAt?: Date;
          updatedAt?: Date;
          discords?: Discord[];
          roles?: Role[];
        },
  ) {
    if (data.id) this.id = data.id;
    if (data.name) this.name = data.name;
    if (data.customId) this.customId = data.customId;
    if (data.email) this.email = data.email;
    if ("externalEmail" in data && data.externalEmail)
      this.externalEmail = data.externalEmail;
    if (data.period !== undefined) this.period = data.period;
    if ("isEnable" in data && data.isEnable !== undefined)
      this.isEnable = data.isEnable;
    if ("isSuspended" in data && data.isSuspended !== undefined)
      this.isSuspended = data.isSuspended;
    if ("isSystem" in data && data.isSystem !== undefined)
      this.isSystem = data.isSystem;
    if ("suspendedReason" in data && data.suspendedReason)
      this.suspendedReason = data.suspendedReason;
    if ("suspendedUntil" in data && data.suspendedUntil)
      this.suspendedUntil = data.suspendedUntil;
    if (data.joinedAt !== undefined) this.joinedAt = data.joinedAt;
    if (data.createdAt) this.createdAt = data.createdAt;
    if (data.updatedAt) this.updatedAt = data.updatedAt;
    if (data.discords) this.discords = data.discords;
    if (data.roles) this.roles = data.roles;
  }

  async save(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snakeCaseData: Record<string, any> = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snakeCaseData[snakeKey] = (this as any)[key];
      }
    }
    await apiPatch(`/users/${this.id}`, snakeCaseData);
  }

  async create(data?: {
    name: string;
    customId: string;
    email: string;
    externalEmail?: string;
    period: string | null;
    isEnable: boolean;
    isSuspended: boolean;
    isSystem: boolean;
    suspendedReason: string | null;
    suspendedUntil: Date | null;
    joinedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    discords?: Discord[];
    roles?: Role[];
  }): Promise<void | User> {
    if (data) {
      // クラスのインスタンス自体を生成して返す
      const res = new User({
        id: null,
        name: data.name,
        customId: data.customId,
        email: data.email,
        externalEmail: data.externalEmail ?? "",
        period: data.period,
        isEnable: data.isEnable,
        isSuspended: data.isSuspended,
        isSystem: data.isSystem,
        suspendedReason: data.suspendedReason,
        suspendedUntil: data.suspendedUntil,
        joinedAt: data.joinedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        discords: data.discords,
        roles: data.roles,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snakeCaseData: Record<string, any> = {};
      for (const key in this) {
        if (this.hasOwnProperty(key)) {
          const snakeKey = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`,
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          snakeCaseData[snakeKey] = (this as any)[key];
        }
      }
      await apiPost(`/users`, snakeCaseData);
      return res;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snakeCaseData: Record<string, any> = {};
      for (const key in this) {
        if (this.hasOwnProperty(key)) {
          const snakeKey = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`,
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          snakeCaseData[snakeKey] = (this as any)[key];
        }
      }
      await apiPost(`/users`, snakeCaseData);
    }
  }

  async getPermissions(): Promise<UserPermissionsResponse> {
    if (!this.id) {
      throw new Error("User ID is not set");
    }
    const response = await apiPost(`/users/${this.id}/permissions`);
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        default:
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const data = await response.json();
    const parsedData: UserPermissionsResponse = {
      bit: data.permissions_bit,
      permissions: data.permissions_text,
    };
    return parsedData;
  }

  static async getById<T extends "Simple" | "Full" = "Full">(
    userId: string,
  ): Promise<User<T>> {
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
          console.log("Unexpected error:", response.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
    const data = await response.json();
    const res = new User<T>(toCamelcase<User<T>>(data));
    return res;
  }

  async passwordChange(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!this.id) {
      throw new Error("User ID is not set");
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
          console.log("Unexpected error:", res.statusText);
          throw ResourceApiErrors.ApiServerInternalError;
      }
    }
  }

  convertPlain(): object {
    return {
      id: this.id,
      name: this.name,
      customId: this.customId,
      email: this.email,
      externalEmail: this.externalEmail,
      period: this.period,
      isEnable: this.isEnable,
      isSuspended: this.isSuspended,
      isSystem: this.isSystem,
      suspendedReason: this.suspendedReason,
      suspendedUntil: this.suspendedUntil,
      joinedAt: this.joinedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      discords: this.discords,
      roles: this.roles,
    } as User<T>;
  }
}

type UserPermissionsResponse = {
  bit: number;
  permissions: string[];
};

// 型エイリアス: 使いやすさのため
export type UserSimple = User<"Simple">;
export type UserFull = User<"Full">;

export default User;
