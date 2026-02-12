// ============================
// External Identity types (Swagger準拠)
// ============================

/** routes.ExternalIdentityDTO */
export interface ExternalIdentityDTO {
  id: string;
  userId: string;
  provider: string;
  externalUserId: string;
  /** Common normalised fields from provider userinfo */
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  /** Decoded ID Token JWT claims */
  idTokenClaims?: Record<string, unknown>;
  /** Raw provider-specific userinfo data */
  providerData?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/** routes.CreateExternalIdentityRequest */
export interface CreateExternalIdentityRequest {
  provider: string;
  external_user_id: string;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  token_expires_at?: string;
}

/** routes.ExternalIdentityListResponse */
export interface ExternalIdentityListResponse {
  data: ExternalIdentityDTO[];
}
