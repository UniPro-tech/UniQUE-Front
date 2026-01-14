import User from "./User";

const assertServer = () => {
  if (typeof window !== "undefined") {
    throw new Error("Session static helpers are server-only");
  }
};

// Session データモデル（Users.ts のスタイルに準拠）
export class Session {
  id!: string;
  ipAddress!: string;
  isEnable!: boolean;
  userAgent!: string;
  // APIレスポンスに合わせて string を採用（toCamelcaseでそのまま渡される想定）
  createdAt!: string;
  expiresAt!: string;
  user!: User;

  constructor(data: {
    id: string;
    ipAddress: string;
    isEnable: boolean;
    userAgent: string;
    createdAt: string;
    expiresAt: string;
    user: User;
  }) {
    this.id = data.id;
    this.ipAddress = data.ipAddress;
    this.isEnable = data.isEnable;
    this.userAgent = data.userAgent;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
    this.user = data.user;
  }

  async delete() {
    assertServer();
    const { apiDelete } = await import("@/lib/apiClient");
    const res = await apiDelete(`/sessions/${this.id}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to delete session: ${res.status}`);
    }
  }

  async convertPlain() {
    return {
      id: this.id,
      ipAddress: this.ipAddress,
      isEnable: this.isEnable,
      userAgent: this.userAgent,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      user: this.user.convertPlain(),
    } as SessionPlain;
  }

  // --- Static helpers (server-only) ---
  static async create(sessionId: string, expires: Date) {
    assertServer();
    const { cookies } = await import("next/headers");
    const res = (await cookies()).set("unique-sid", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires,
      path: "/",
      domain:
        process.env.NODE_ENV === "production" ? ".uniproject.jp" : "localhost",
    });
    return res;
  }

  static async get(options?: { asPlain?: boolean }): Promise<Session | null> {
    assertServer();
    const { cookies } = await import("next/headers");
    const { apiGet } = await import("@/lib/apiClient");
    const { toCamelcase } = await import("@/lib/SnakeCamlUtil");

    const cookieStore = await cookies();
    const sid = cookieStore.get("unique-sid")?.value || null;
    if (!sid) return null;
    const res = await apiGet(`/sessions/${sid}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    const data = toCamelcase<ConstructorParameters<typeof Session>[0]>(json);
    const user = new User(data.user);
    const asPlain = options?.asPlain || false;
    return asPlain ? (data as Session) : new Session({ ...data, user });
  }

  static async logout(options?: { isAPI?: boolean }) {
    assertServer();
    const { apiDelete } = await import("@/lib/apiClient");
    const { AuthorizationErrors } = await import(
      "@/types/Errors/AuthorizationErrors"
    );
    const { cookies } = await import("next/headers");
    const { redirect } = await import("next/navigation");

    const current = await Session.get({ asPlain: false });
    const sessionId = current?.id;
    if (!sessionId) {
      (await cookies()).delete("unique-sid");
      return;
    }
    const res2 = await apiDelete(`/sessions/${sessionId}`, {
      cache: "no-store",
    });
    if (!res2.ok) {
      switch (res2.status) {
        case 404:
          break;
        case 403:
          throw AuthorizationErrors.AccessDenied;
        case 401:
          throw AuthorizationErrors.Unauthorized;
        default:
          throw new Error(`Failed to delete session: ${res2.status}`);
      }
    }
    (await cookies()).delete("unique-sid");
    if (!options?.isAPI) {
      redirect("/signin?signouted=true");
    }
  }

  static async list(options?: {
    asPlain?: boolean;
  }): Promise<Session[] | SessionPlain[]> {
    assertServer();
    const current = await Session.get({ asPlain: false });
    if (!current?.user.id) {
      throw new Error("User ID is not available");
    }
    const { apiGet } = await import("@/lib/apiClient");
    const { toCamelcase } = await import("@/lib/SnakeCamlUtil");

    const res = await apiGet(`/users/${current.user.id}/sessions`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch sessions");
    }
    const json = await res.json();
    const sessions = toCamelcase<Session[]>(json.data);
    const result = sessions.map((s) => {
      const user = new User(s.user);
      return new Session({ ...s, user });
    });
    if (options?.asPlain) {
      return Promise.all(result.map((s) => s.convertPlain()));
    }
    return result;
  }
}

export default Session;

export type SessionPlain = {
  id: string;
  ipAddress: string;
  isEnable: boolean;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  user: User;
};
