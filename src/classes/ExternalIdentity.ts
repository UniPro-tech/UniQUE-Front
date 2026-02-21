import { apiDelete, apiGet, apiPost } from "@/libs/apiClient";

export interface ExternalIdentityData {
  id: string;
  userId: string;
  provider: string;
  externalUserId: string;
  idToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export class ExternalIdentity {
  id: string;
  private userId: string;
  provider: string;
  externalUserId: string;
  idToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  constructor(data: ExternalIdentityData) {
    this.id = data.id;
    this.userId = data.userId;
    this.provider = data.provider;
    this.externalUserId = data.externalUserId;
    this.idToken = data.idToken || null;
    this.accessToken = data.accessToken || null;
    this.refreshToken = data.refreshToken || null;
    this.tokenExpiresAt = data.tokenExpiresAt
      ? new Date(data.tokenExpiresAt)
      : null;
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
  }

  // ------ Converter Methods ------

  static fromJson(data: ExternalIdentityData): ExternalIdentity {
    return new ExternalIdentity(data);
  }

  toJson(): ExternalIdentityData {
    return {
      id: this.id,
      userId: this.userId,
      provider: this.provider,
      externalUserId: this.externalUserId,
      idToken: this.idToken,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiresAt:
        this.tokenExpiresAt instanceof Date
          ? this.tokenExpiresAt.toISOString()
          : this.tokenExpiresAt,
      createdAt:
        this.createdAt instanceof Date
          ? this.createdAt.toISOString()
          : this.createdAt,
      updatedAt:
        this.updatedAt instanceof Date
          ? this.updatedAt.toISOString()
          : this.updatedAt,
      deletedAt:
        this.deletedAt instanceof Date
          ? this.deletedAt.toISOString()
          : this.deletedAt,
    };
  }

  // ------ CRUD Methods ------

  static async getByUserId(userId: string): Promise<ExternalIdentity[]> {
    // API から userId に紐づく外部IDを取得する実装例
    const response = await apiGet(`/users/${userId}/external_identities`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch external identities: ${response.statusText}`,
      );
    }
    const data = await response.json();
    return data.map((item: ExternalIdentityData) =>
      ExternalIdentity.fromJson(item),
    );
  }

  static async create(
    userId: string,
    data: Omit<
      ExternalIdentityData,
      "id" | "userId" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ): Promise<ExternalIdentity> {
    // API を呼び出して新しい外部IDを作成する実装例
    const response = await apiPost(
      `/users/${userId}/external_identities`,
      data,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to create external identity: ${response.statusText}`,
      );
    }
    const responseJson = await response.json();
    return ExternalIdentity.fromJson(responseJson);
  }

  // ------ Instance Methods ------

  async remove(): Promise<void> {
    // API を呼び出してこの外部IDを削除する実装例
    const response = await apiDelete(
      `/users/${this.userId}/external_identities/${this.id}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to remove external identity: ${response.statusText}`,
      );
    }
    this.deletedAt = new Date();
  }
}
