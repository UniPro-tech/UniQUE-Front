import { apiPatch, apiPost } from "@/libs/apiClient";
import { User, UserData } from "./User";
import { toCamelcase } from "@/lib/SnakeCamlUtil";

export interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdBy: User | UserData;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export class Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: AnnouncementData) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.isPinned = data.isPinned;
    this.createdBy = new User(data.createdBy);
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
    this.updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt);
    this.deletedAt =
      data.deletedAt === null
        ? null
        : data.deletedAt instanceof Date
          ? data.deletedAt
          : new Date(data.deletedAt);
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // ------- Converte Methods --------

  static fromJson(data: AnnouncementData): Announcement {
    return new Announcement(data);
  }

  toJson(): AnnouncementData {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      isPinned: this.isPinned,
      createdBy: this.createdBy.toJson(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
    };
  }

  // ------- CRUD Methods --------

  static async create(
    data: Omit<
      AnnouncementData,
      "id" | "createdBy" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ): Promise<Announcement> {
    const response = await apiPost("/announcements", {
      ...data,
    });
    const responseData = await response.json();
    return new Announcement({
      ...responseData,
    });
  }

  static async getAll(): Promise<Announcement[]> {
    const response = await fetch("/announcements");
    const responseData = toCamelcase<{ data: AnnouncementData[] }>(
      await response.json(),
    );
    return responseData.data.map(
      (data: AnnouncementData) => new Announcement(data),
    );
  }

  static async getById(id: string): Promise<Announcement> {
    const response = await fetch(`/announcements/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch announcement: ${response.statusText}`);
    }
    const responseData = toCamelcase<{ data: AnnouncementData }>(
      await response.json(),
    );
    return new Announcement(responseData.data);
  }

  static async updateById(
    id: string,
    data: Partial<
      Omit<
        AnnouncementData,
        "id" | "createdBy" | "createdAt" | "updatedAt" | "deletedAt"
      >
    >,
  ): Promise<Announcement> {
    const response = await apiPatch(`/announcements/${id}`, {
      ...data,
    });
    if (!response.ok) {
      throw new Error(`Failed to update announcement: ${response.statusText}`);
    }
    const responseData = toCamelcase<{ data: AnnouncementData }>(
      await response.json(),
    );
    return new Announcement(responseData.data);
  }

  static async deleteById(id: string): Promise<void> {
    const response = await fetch(`/announcements/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete announcement: ${response.statusText}`);
    }
  }

  // ------- Instance Methods --------

  async pin(): Promise<void> {
    await Announcement.updateById(this.id, { isPinned: true });
    this.isPinned = true;
  }

  async unpin(): Promise<void> {
    await Announcement.updateById(this.id, { isPinned: false });
    this.isPinned = false;
  }

  async delete(): Promise<void> {
    await Announcement.deleteById(this.id);
    this.deletedAt = new Date();
  }

  async save(): Promise<void> {
    if (this.isDeleted) {
      throw new Error("Cannot save a deleted announcement");
    }
    if (!this.id) {
      const newAnnouncement = await Announcement.create({
        title: this.title,
        content: this.content,
        isPinned: this.isPinned,
      });
      this.id = newAnnouncement.id;
      this.createdAt = newAnnouncement.createdAt;
      this.updatedAt = newAnnouncement.updatedAt;
    } else {
      const updatedAnnouncement = await Announcement.updateById(this.id, {
        title: this.title,
        content: this.content,
        isPinned: this.isPinned,
      });
      this.updatedAt = updatedAnnouncement.updatedAt;
    }
  }
}
