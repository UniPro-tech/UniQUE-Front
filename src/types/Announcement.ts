import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import { AuthorizationErrors } from "./Errors/AuthorizationErrors";
import { ResourceApiErrors } from "./Errors/ResourceApiErrors";
import type { UserDTO } from "./User";

/** routes.AnnouncementDTO */
export interface AnnouncementDTO {
  id: string;
  title: string;
  content: string;
  createdBy?: UserDTO | null;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  is_pinned?: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  is_pinned?: boolean;
}

export interface GetAllAnnouncementsOptions {
  includeDeleted?: boolean;
  limit?: number;
}

export class Announcement {
  id: string;
  title: string;
  content: string;
  createdBy?: UserDTO | null;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: AnnouncementDTO) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.createdBy = data.createdBy ?? null;
    this.isPinned = data.isPinned;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toPlainObject(): AnnouncementDTO {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      createdBy: this.createdBy ?? null,
      isPinned: this.isPinned,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    } as AnnouncementDTO;
  }

  static async getAll({
    options,
  }: {
    options?: GetAllAnnouncementsOptions;
  } = {}): Promise<Announcement[]> {
    const params = new URLSearchParams();
    if (options?.includeDeleted) {
      params.append("deleted", "true");
    }
    if (options?.limit !== undefined) {
      params.append("limit", options.limit.toString());
    }
    const res = await apiGet(`/announcements?${params.toString()}`, {
      cache: "no-store",
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
    const json = await res.json();
    const items = toCamelcase<AnnouncementDTO[]>(json.data ?? []);
    return items.map((i) => new Announcement(i));
  }

  static async getById(id: string): Promise<Announcement> {
    const res = await apiGet(`/announcements/${encodeURIComponent(id)}`);
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
    const data = toCamelcase<AnnouncementDTO>(await res.json());
    return new Announcement(data);
  }

  static async create(req: CreateAnnouncementRequest): Promise<Announcement> {
    const res = await apiPost(`/announcements`, req);
    if (!res.ok) {
      switch (res.status) {
        case 401:
          throw AuthorizationErrors.Unauthorized;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        default:
          throw ResourceApiErrors.ResourceCreationFailed;
      }
    }
    const data = toCamelcase<AnnouncementDTO>(await res.json());
    return new Announcement(data);
  }

  async save(): Promise<Announcement> {
    const body: UpdateAnnouncementRequest = {
      title: this.title,
      content: this.content,
      is_pinned: this.isPinned,
    };
    const res = await apiPut(
      `/announcements/${encodeURIComponent(this.id)}`,
      body,
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
          throw ResourceApiErrors.ResourceUpdateFailed;
      }
    }
    const json = toCamelcase<AnnouncementDTO>(await res.json());
    Object.assign(this, json);
    return this;
  }

  async delete(): Promise<void> {
    const { apiDelete } = await import("@/lib/apiClient");
    const res = await apiDelete(
      `/announcements/${encodeURIComponent(this.id)}`,
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
  }
}

export default Announcement;
