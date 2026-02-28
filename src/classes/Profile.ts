export interface ProfileData {
  displayName: string;
  bio: string | null;
  birthdate: string | null;
  birthdateVisible: boolean;
  twitterHandle: string | null;
  websiteUrl: string | null;
  joinedAt: string | Date | null;
  isAdult?: boolean;
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
  isAdult?: boolean;

  constructor(data: ProfileData) {
    this.displayName = data.displayName;
    this.bio = data.bio;
    this.birthdate = data.birthdate;
    this.birthdateVisible = data.birthdateVisible;
    this.twitterHandle = data.twitterHandle;
    this.websiteUrl = data.websiteUrl;
    this.joinedAt = data.joinedAt ? new Date(data.joinedAt) : null;
    this.isAdult = data.isAdult;
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
      isAdult: this.isAdult,
    };
  }
}
