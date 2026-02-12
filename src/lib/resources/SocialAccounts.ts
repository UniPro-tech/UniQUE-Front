"use server";

import { apiGet } from "@/lib/apiClient";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import type {
  ExternalIdentityDTO,
  ExternalIdentityListResponse,
} from "@/types/ExternalIdentity";
import { AuthorizationErrors } from "@/types/Errors/AuthorizationErrors";
import { ResourceApiErrors } from "@/types/Errors/ResourceApiErrors";

/**
 * GET /users/{id}/external_identities
 * ユーザーにリンクされた外部アイデンティティの一覧を取得
 */
export const list = async (userId: string): Promise<ExternalIdentityDTO[]> => {
  const res = await apiGet(`/users/${userId}/external_identities`);
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
  const response = toCamelcase<ExternalIdentityListResponse>(json);
  return response.data ?? [];
};

/**
 * DELETE /users/{id}/external_identities/{eid}
 * ソーシャルアカウント連携を解除
 */
export const unlink = async (userId: string, identityId: string) => {
  const { apiDelete } = await import("@/lib/apiClient");
  const res = await apiDelete(
    `/users/${userId}/external_identities/${identityId}`,
  );
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
};
