import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  createApiClient,
} from "@/libs/apiClient";
import { ExternalIdentity, ExternalIdentityData } from "./ExternalIdentity";
import { Profile, ProfileData } from "./Profile";
import { Role, RoleData } from "./Role";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import { IsIncludedInBitmask, MergeBitmask } from "@/libs/bitmask";
import { ConvertPermissionBitsToText } from "@/constants/Permission";

export enum UserStatus {
  ESTABLISHED = "established",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  ARCHIVED = "archived",
}

export interface UserData {
  id: string;
  customId: string;
  email: string;
  externalEmail: string | null;
  readonly pendingEmail: string | null;
  emailVerified: boolean;
  affiliationPeriod: string | null;
  isTotpEnabled: boolean | null;
  status: UserStatus;
  profile: ProfileData | Profile;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export class User {
  id: string;
  customId: string;
  email: string;
  externalEmail: string | null;
  readonly pendingEmail: string | null;
  emailVerified: boolean;
  affiliationPeriod: string | null;
  isTotpEnabled: boolean | null;
  status: UserStatus;
  profile: Profile;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  get canApprove(): boolean {
    return this.status === UserStatus.ESTABLISHED && this.emailVerified;
  }

  constructor(data: UserData) {
    this.id = data.id;
    this.customId = data.customId;
    this.email = data.email;
    this.externalEmail = data.externalEmail;
    this.pendingEmail = data.pendingEmail;
    this.emailVerified = data.emailVerified;
    this.affiliationPeriod = data.affiliationPeriod;
    this.isTotpEnabled = data.isTotpEnabled;
    this.status = data.status as UserStatus;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
    this.updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt);
    this.deletedAt = data.deletedAt
      ? data.deletedAt instanceof Date
        ? data.deletedAt
        : new Date(data.deletedAt)
      : null;
    this.profile =
      data.profile instanceof Profile
        ? data.profile
        : Profile.fromJson(data.profile);
  }

  // ------ Converter Methods ------

  static fromJson(data: UserData): User {
    return new User(data);
  }

  toJson(): UserData {
    return {
      id: this.id,
      customId: this.customId,
      email: this.email,
      externalEmail: this.externalEmail,
      pendingEmail: this.pendingEmail,
      emailVerified: this.emailVerified,
      affiliationPeriod: this.affiliationPeriod,
      isTotpEnabled: this.isTotpEnabled,
      status: this.status,
      profile: this.profile.toJson(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt ? this.deletedAt : null,
    };
  }

  // ------ CRUD Static Methods ------

  static async create(
    userData: Omit<UserData, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<User> {
    const response = await apiPost("/internal/users", userData);
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    const responseJson = await response.json();
    return User.fromJson(responseJson);
  }

  static async getById(id: string): Promise<User | null> {
    const response = await apiGet(`/users/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    const responseJson = await response.json();
    return User.fromJson(responseJson);
  }

  static async updateById(
    id: string,
    updateData: Partial<
      Omit<UserData, "id" | "createdAt" | "updatedAt" | "deletedAt">
    >,
  ): Promise<User> {
    const response = await apiPatch(`/users/${id}`, updateData);
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }
    const responseJson = await response.json();
    return User.fromJson(responseJson);
  }

  static async deleteById(id: string): Promise<void> {
    const response = await apiDelete(`/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  }

  static async getAll(): Promise<User[]> {
    const response = await apiGet("/users");
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const responseJson = await response.json();
    return responseJson.map((userData: UserData) => User.fromJson(userData));
  }

  static async passwordResetRequest(email: string): Promise<void> {
    const response = await apiPost("/internal/password-reset/request", {
      email,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to request password reset: ${response.statusText}`,
      );
    }
  }

  static async emailVerify(code: string): Promise<EmailVerificationResponse> {
    const response = await apiPost(`/internal/users/email_verify`, {
      code: code,
    });
    if (!response.ok) {
      throw new Error(
        `Failed to send verification email: ${response.statusText}`,
      );
    }
    const responseJson = await response.json();
    return toCamelcase<EmailVerificationResponse>(responseJson);
  }

  static async resendVerificationEmail(userId: string): Promise<void> {
    const response = await apiPost(
      `/users/${userId}/resend_email_verification`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to resend verification email: ${response.statusText}`,
      );
    }
  }

  // ------ Instance Methods ------

  async save(): Promise<void> {
    if (this.isDeleted) {
      throw new Error("Cannot save a deleted user.");
    }
    const updateData: Partial<
      Omit<UserData, "id" | "createdAt" | "updatedAt" | "deletedAt">
    > = {
      customId: this.customId,
      email: this.email,
      externalEmail: this.externalEmail,
      emailVerified: this.emailVerified,
      affiliationPeriod: this.affiliationPeriod,
      isTotpEnabled: this.isTotpEnabled,
      status: this.status,
      profile: this.profile.toJson(),
    };
    const updatedUser = await User.updateById(this.id, updateData);
    Object.assign(this, updatedUser);
  }

  async delete(): Promise<void> {
    await User.deleteById(this.id);
    this.deletedAt = new Date();
  }

  async getRoles(): Promise<Role[]> {
    const response = await apiGet(`/users/${this.id}/roles`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user roles: ${response.statusText}`);
    }
    const responseJson = toCamelcase<{ data: RoleData[] }>(
      await response.json(),
    );
    return responseJson.data.map((roleData) => Role.fromJson(roleData));
  }

  async getPermissions(): Promise<{
    permissionText: string[];
    permissionBits: bigint;
  }> {
    const roles = await this.getRoles();
    const permissionBitsArray = roles.map((role) => role.permissionBits);
    const mergedPermissionBits = MergeBitmask(permissionBitsArray);
    const permissionText: string[] = [];
    roles.forEach((role) => {
      ConvertPermissionBitsToText(role.permissionBits).forEach((text) => {
        if (!permissionText.includes(text)) {
          permissionText.push(text);
        }
      });
    });
    return {
      permissionText,
      permissionBits: mergedPermissionBits,
    };
  }

  async hasPermission(permission: bigint): Promise<boolean> {
    const permissions = await this.getPermissions();
    const bit = permissions.permissionBits;
    return IsIncludedInBitmask(bit, permission);
  }

  async getExternalIdentities(): Promise<ExternalIdentity[]> {
    const data = await ExternalIdentity.getByUserId(this.id);
    return data;
  }

  async addExternalIdentity(
    data: Omit<
      ExternalIdentityData,
      "id" | "userId" | "createdAt" | "updatedAt"
    >,
    registrationCode?: string,
  ): Promise<ExternalIdentity> {
    if (!registrationCode) {
      const externalIdentity = await ExternalIdentity.create(this.id, {
        ...data,
      });
      return externalIdentity;
    } else {
      // API を呼び出して新しい外部IDを作成する実装例
      const response = await apiPost(
        `/internal/users/email_verify/discord_link`,
        { ...data, code: registrationCode },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to create external identity: ${response.statusText}`,
        );
      }
      const responseJson = await response.json();
      return ExternalIdentity.fromJson(responseJson);
    }
  }

  async setupBeginTotp(
    password: string,
  ): Promise<{ uri: string; secret: string }> {
    const apiClient = createApiClient(`${process.env.AUTH_API_URL}`);
    const response = await apiClient.post(`/internal/totp/${this.id}`, {
      password,
    });
    return toCamelcase<{
      uri: string;
      secret: string;
    }>(await response.json());
  }

  async setupFinishTotp(code: string): Promise<void> {
    const apiClient = createApiClient(`${process.env.AUTH_API_URL}`);
    const response = await apiClient.post(`/totp/${this.id}/verify`, {
      code,
    });
    if (!response.ok) {
      throw new Error(`Failed to verify TOTP code: ${response.statusText}`);
    }
    this.isTotpEnabled = true;
  }

  async disableTotp(password: string): Promise<void> {
    const apiClient = createApiClient(`${process.env.AUTH_API_URL}`);
    const response = await apiClient.post(`/totp/${this.id}/disable`, {
      password,
    });
    if (!response.ok) {
      throw new Error(`Failed to disable TOTP: ${response.statusText}`);
    }
    this.isTotpEnabled = false;
  }
}

interface EmailVerificationResponse {
  type: "registration" | "email_change";
  valid: boolean;
}
