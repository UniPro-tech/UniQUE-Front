import { createApiClient } from "@/lib/apiClient";
import { toCamelcase } from "@/lib/SnakeCamlUtil";
import User, { UserDTO } from "./User";

const COOKIE_NAME = "session_jwt";

const assertServer = () => {
  if (typeof window !== "undefined") {
    throw new Error("Session static helpers are server-only");
  }
};

/** JWT payload (最低限のフィールド) */
interface JwtPayload {
  sub?: string;
  user_id?: string;
  session_id?: string;
  jti?: string;
  exp?: number;
}

/** base64url → JSON デコード (サーバー/エッジ用の簡易実装) */
function decodeJwtPayload(jwt: string): JwtPayload {
  const parts = jwt.split(".");
  if (parts.length !== 3) return {};
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const json =
    typeof atob !== "undefined"
      ? atob(base64)
      : Buffer.from(base64, "base64").toString("utf-8");
  return JSON.parse(json);
}

// ============================
// Session class (JWT Cookie)
// ============================

export class Session {
  jwt: string;
  userId: string;
  sessionId: string;
  expiresAt: string;
  user: User;

  constructor(data: {
    jwt: string;
    userId: string;
    sessionId: string;
    expiresAt: string;
    user: User;
  }) {
    this.jwt = data.jwt;
    this.userId = data.userId;
    this.sessionId = data.sessionId;
    this.expiresAt = data.expiresAt;
    this.user = data.user instanceof User ? data.user : new User(data.user);
  }

  /** プレーンオブジェクトに変換 (Client Components用) */
  async convertPlain(): Promise<SessionPlain> {
    return {
      jwt: this.jwt,
      userId: this.userId,
      sessionId: this.sessionId,
      expiresAt: this.expiresAt,
      user: this.user.convertPlain(),
    };
  }

  // --- Static helpers (server-only) ---

  /** JWT Cookie をセットしてセッションを作成 */
  static async create(jwt: string, expiresAt: Date) {
    assertServer();
    const { cookies } = await import("next/headers");
    (await cookies()).set(COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });
  }

  /** Cookie から JWT を読み取り、ユーザー情報を取得してセッションを返す */
  static async get(): Promise<Session | null> {
    assertServer();
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const jwt = cookieStore.get(COOKIE_NAME)?.value || null;
    if (!jwt) return null;

    try {
      const payload = decodeJwtPayload(jwt);
      const userId = payload.user_id;
      // Auth API は sub フィールドにセッション ID を格納している
      // SID_ プレフィックスを削除
      const rawSessionId =
        payload.sub || payload.session_id || payload.jti || "";
      const sessionId = rawSessionId.replace(/^SID_/, "");

      if (!userId) return null;

      const exp = payload.exp ? new Date(payload.exp * 1000).toISOString() : "";
      const user = await User.getById(userId);

      return new Session({ jwt, userId, sessionId, expiresAt: exp, user });
    } catch {
      return null;
    }
  }

  /** Cookie を削除してログアウト */
  static async logout() {
    assertServer();

    // まず現在のセッション情報を取得
    const session = await Session.get();

    // サーバー側のセッションを先に削除（JWT が必要なため Cookie 削除前に実行）
    if (session && session.sessionId && session.sessionId.trim() !== "") {
      try {
        await Session.deleteById(session.sessionId);
      } catch (error) {
        console.error("Failed to delete session on server:", error);
        // サーバー側のセッション削除が失敗してもログアウトは継続
      }
    }

    // 最後に Cookie を削除
    const { cookies } = await import("next/headers");
    (await cookies()).delete(COOKIE_NAME);
  }

  /** Auth サーバーからセッション一覧を取得 */
  static async list(): Promise<AuthSessionDTO[]> {
    assertServer();
    const session = await Session.get();
    if (!session) return [];

    const authApiUrl = process.env.AUTH_API_URL || "";
    const authClient = createApiClient(authApiUrl);
    try {
      const res = await authClient.get(
        `/internal/sessions?user_id=${encodeURIComponent(session.userId)}`,
      );
      if (!res.ok) return [];
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (data.data ?? []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return raw.map((s: any) => toCamelcase(s) as AuthSessionDTO);
    } catch {
      return [];
    }
  }

  /** 指定セッションIDを削除 (Auth サーバー) */
  static async deleteById(sessionId: string): Promise<boolean> {
    assertServer();
    const authApiUrl = process.env.AUTH_API_URL || "";
    const authClient = createApiClient(authApiUrl);
    try {
      const res = await authClient.delete(
        `/internal/sessions/${encodeURIComponent(sessionId)}`,
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  /** 指定ユーザーの全セッションを削除 (Auth サーバー) */
  static async deleteAllForUser(userId: string): Promise<boolean> {
    assertServer();
    const authApiUrl = process.env.AUTH_API_URL || "";
    const authClient = createApiClient(authApiUrl);
    try {
      // まずセッション一覧を取得
      const res = await authClient.get(
        `/internal/sessions?user_id=${encodeURIComponent(userId)}`,
      );
      if (!res.ok) return false;

      const data = await res.json();
      const sessions = Array.isArray(data) ? data : (data.data ?? []);

      // 各セッションを個別に削除
      const deletePromises = sessions.map((session: { id: string }) =>
        Session.deleteById(session.id),
      );

      const results = await Promise.all(deletePromises);
      // 全て成功した場合のみ true を返す
      return results.every((result) => result === true);
    } catch {
      return false;
    }
  }
}

export default Session;

/** SessionPlain はフロント内セッション情報 (JWT + User) */
export type SessionPlain = {
  jwt: string;
  userId: string;
  sessionId: string;
  expiresAt: string;
  user: UserDTO;
};

/**
 * Auth サーバーの router.SessionResponse に対応する DTO。
 * セッション管理 UI で使用する。
 */
export interface AuthSessionDTO {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  lastLoginAt: string;
}
