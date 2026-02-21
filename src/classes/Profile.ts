export interface ProfileData {
  displayName: string;
  bio: string | null;
  birthdate: string | null;
  birthdateVisible: boolean;
  twitterHandle: string | null;
  websiteUrl: string | null;
  joinedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export const PROFILE_ENDPOINT = `${process.env.RESOURCE_API_URL}/profiles`;

export class Profile {
  displayName: string;
  bio: string | null;
  birthdate: string | null;
  birthdateVisible: boolean;
  twitterHandle: string | null;
  websiteUrl: string | null;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  constructor(data: ProfileData) {
    this.displayName = data.displayName;
    this.bio = data.bio;
    this.birthdate = data.birthdate;
    this.birthdateVisible = data.birthdateVisible;
    this.twitterHandle = data.twitterHandle;
    this.websiteUrl = data.websiteUrl;
    this.joinedAt = data.joinedAt ? new Date(data.joinedAt) : null;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
    this.deletedAt = data.deletedAt ? new Date(data.deletedAt) : null;
  }

  // ------ Converter Methods ------

  static fromJson(data: ProfileData): Profile {
    return new Profile(data);
  }

  toJson(): ProfileData {
    return {
      displayName: this.displayName,
      bio: this.bio,
      birthdate: this.birthdate,
      birthdateVisible: this.birthdateVisible,
      twitterHandle: this.twitterHandle,
      websiteUrl: this.websiteUrl,
      joinedAt: this.joinedAt ? this.joinedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
    };
  }
}
