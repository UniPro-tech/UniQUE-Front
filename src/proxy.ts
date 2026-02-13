import { NextResponse, NextRequest } from "next/server";
import {
  jwtVerify,
  importJWK,
  type JWTPayload,
  type JWTVerifyGetKey,
  type JWTHeaderParameters,
} from "jose";

const COOKIE_NAME = "session_jwt";
const AUTH_ISSUER = process.env.AUTH_API_URL || "http://localhost:8000";
const JWKS_CACHE_TTL = 1000 * 60 * 60; // 1時間

// JWKS キャッシュ
let jwksCache: {
  data: { keys: JWKSResponse["keys"] };
  timestamp: number;
} | null = null;

interface JWKSResponse {
  keys: Array<{
    kty: string;
    use: string;
    alg: string;
    kid: string;
    n: string;
    e: string;
  }>;
}

/**
 * JWKS エンドポイントから JSON Web Key Set を取得
 */
async function fetchJWKS(): Promise<JWKSResponse> {
  // キャッシュが有効かチェック
  if (jwksCache && Date.now() - jwksCache.timestamp < JWKS_CACHE_TTL) {
    return jwksCache.data;
  }

  try {
    const jwksUrl = `${AUTH_ISSUER}/.well-known/jwks.json`;
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
    }
    const jwks: JWKSResponse = await response.json();
    jwksCache = {
      data: jwks,
      timestamp: Date.now(),
    };
    return jwks;
  } catch (error) {
    console.error("Error fetching JWKS:", error);
    throw error;
  }
}

/**
 * JWT トークンを検証する（JWKS から鍵を取得）
 * @param token JWT トークン文字列
 * @returns 検証結果 { valid: boolean, payload?: JWTPayload }
 */
async function verifySessionJWT(token: string): Promise<{
  valid: boolean;
  payload?: JWTPayload;
}> {
  try {
    // JWKS を取得
    const jwks = await fetchJWKS();

    // JWKS から鍵を探す関数
    const key: JWTVerifyGetKey = async (
      protectedHeader: JWTHeaderParameters,
    ) => {
      const jwk = jwks.keys.find((k) => k.kid === protectedHeader.kid);
      if (!jwk) {
        throw new Error(
          `Key with kid ${protectedHeader.kid} not found in JWKS`,
        );
      }
      return importJWK(jwk);
    };

    // JWT を検証
    const verified = await jwtVerify(token, key);
    const sub = verified.payload.sub;
    // sid_を外す
    const sid =
      typeof sub === "string" && sub.startsWith("SID_") ? sub.slice(4) : sub;
    const sessionValidateResponse = await fetch(
      `${AUTH_ISSUER}/internal/session_verify?jti=${sid}`,
    );
    if (!sessionValidateResponse.ok) {
      throw new Error(
        `Session validation failed: ${sessionValidateResponse.statusText}`,
      );
    }
    const data = await sessionValidateResponse.json();
    if (!data.valid) {
      throw new Error("Session is not valid");
    }
    return { valid: true, payload: verified.payload };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { valid: false };
  }
}

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const jwtToken = request.cookies.get(COOKIE_NAME)?.value;
  if (!jwtToken) {
    // 旧Cookieが残っていたら削除
    const oldSid = request.cookies.get("unique-sid")?.value;
    const { pathname, search } = request.nextUrl;
    const redirectPath = `${pathname}${search}`;
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("redirect", redirectPath);
    const response = NextResponse.redirect(redirectUrl);
    if (oldSid) {
      response.cookies.delete("unique-sid");
    }
    return response;
  }

  // JWT を検証
  const { valid, payload } = await verifySessionJWT(jwtToken);
  if (!valid) {
    // JWT 検証失敗時は /signin にリダイレクト
    const { pathname, search } = request.nextUrl;
    const redirectPath = `${pathname}${search}`;
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("redirect", redirectPath);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.url);
  // JWT のペイロード情報をヘッダーに追加（オプション）
  if (payload && typeof payload.sub === "string") {
    requestHeaders.set("x-user-id", payload.sub);
  }
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|signin|signup|migrate|terms|privacy|club_statute|email-verify|password-reset|.*\\.png|.*\\.webp|.*\\.svg).*)",
};
