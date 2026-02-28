import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Session } from "@/classes/Session";
import { ExternalIdentity } from "@/classes/ExternalIdentity";

// Mock fetch globally
const originalFetch = global.fetch;

describe("GET /api/oauth/discord/callback", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    mock.restore();
    process.env = {
      ...originalEnv,
      DISCORD_CLIENT_ID: "test-client-id",
      DISCORD_CLIENT_SECRET: "test-client-secret",
      DISCORD_REDIRECT_URI: "http://localhost:3000/api/oauth/discord/callback",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("should redirect with error when error parameter is present", async () => {
    // Arrange
    const state = Buffer.from(JSON.stringify({ from: "settings" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?error=access_denied&state=${state}`,
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/dashboard/settings");
    expect(location).toContain("oauth=Discord");
    expect(location).toContain("status=error");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Discord OAuth error:",
      "access_denied",
    );
  });

  it("should redirect with error when code is missing", async () => {
    // Arrange
    const state = Buffer.from(JSON.stringify({ from: "settings" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?state=${state}`,
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/dashboard/settings");
    expect(location).toContain("status=error");
  });

  it("should successfully link Discord account from settings", async () => {
    // Arrange
    const state = Buffer.from(JSON.stringify({ from: "settings" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?code=test-code&state=${state}`,
    );

    // Mock fetch for token exchange
    global.fetch = mock((url: string) => {
      if (url.includes("oauth2/token")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "test-access-token",
              refresh_token: "test-refresh-token",
              expires_in: 3600,
            }),
        });
      }
      if (url.includes("users/@me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "discord-user-123" }),
        });
      }
      return Promise.reject(new Error("Unexpected fetch"));
    });

    const mockUser = {
      addExternalIdentity: mock(() => Promise.resolve()),
    };
    const mockSession = {
      getUser: mock(() => Promise.resolve(mockUser)),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/dashboard/settings");
    expect(location).toContain("oauth=Discord");
    expect(location).toContain("status=success");
    expect(mockUser.addExternalIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "discord",
        externalUserId: "discord-user-123",
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      }),
    );
  });

  it("should handle signup flow correctly", async () => {
    // Arrange
    const state = Buffer.from(JSON.stringify({ from: "signup" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?code=test-code&state=${state}`,
    );

    global.fetch = mock((url: string) => {
      if (url.includes("oauth2/token")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "token",
              refresh_token: "refresh",
              expires_in: 3600,
            }),
        });
      }
      if (url.includes("users/@me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "discord-123" }),
        });
      }
    });

    const mockUser = {
      addExternalIdentity: mock(() => Promise.resolve()),
    };
    const mockSession = {
      getUser: mock(() => Promise.resolve(mockUser)),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/signup");
    expect(location).toContain("oauth=discord");
    expect(location).toContain("status=success");
  });

  it("should handle email_verify flow with verification code", async () => {
    // Arrange
    const state = Buffer.from(
      JSON.stringify({ from: "email_verify", code: "verify-code-123" }),
    ).toString("base64");
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?code=test-code&state=${state}`,
    );

    global.fetch = mock((url: string) => {
      if (url.includes("oauth2/token")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "token",
              refresh_token: "refresh",
              expires_in: 3600,
            }),
        });
      }
      if (url.includes("users/@me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "discord-456" }),
        });
      }
    });

    Session.getCurrent = mock(() => Promise.resolve(null));
    ExternalIdentity.createByEmailVerificationCode = mock(() =>
      Promise.resolve(),
    );

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/email-verify");
    expect(location).toContain("code=verify-code-123");
    expect(location).toContain("discord_linked=true");
  });

  it("should return 500 when environment variables are missing", async () => {
    // Arrange
    delete process.env.DISCORD_CLIENT_ID;
    const state = Buffer.from(JSON.stringify({ from: "settings" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?code=test-code&state=${state}`,
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("status=error");
  });

  it("should handle token exchange failure", async () => {
    // Arrange
    const state = Buffer.from(JSON.stringify({ from: "settings" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?code=bad-code&state=${state}`,
    );

    global.fetch = mock((url: string) => {
      if (url.includes("oauth2/token")) {
        return Promise.resolve({
          ok: false,
          text: () => Promise.resolve("Invalid code"),
        });
      }
    });

    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("status=error");
  });

  it("should handle user info fetch failure", async () => {
    // Arrange
    const state = Buffer.from(JSON.stringify({ from: "settings" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?code=test-code&state=${state}`,
    );

    global.fetch = mock((url: string) => {
      if (url.includes("oauth2/token")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "token",
              refresh_token: "refresh",
              expires_in: 3600,
            }),
        });
      }
      if (url.includes("users/@me")) {
        return Promise.resolve({
          ok: false,
          text: () => Promise.resolve("Unauthorized"),
        });
      }
    });

    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("status=error");
  });

  it("should handle conflict when account is already linked", async () => {
    // Arrange
    const state = Buffer.from(JSON.stringify({ from: "settings" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?code=test-code&state=${state}`,
    );

    global.fetch = mock((url: string) => {
      if (url.includes("oauth2/token")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "token",
              refresh_token: "refresh",
              expires_in: 3600,
            }),
        });
      }
      if (url.includes("users/@me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "discord-789" }),
        });
      }
    });

    const mockUser = {
      addExternalIdentity: mock(() => {
        throw "ResourceAlreadyExists";
      }),
    };
    const mockSession = {
      getUser: mock(() => Promise.resolve(mockUser)),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("status=warning");
    expect(location).toContain("reason=conflict");
  });

  it("should handle invalid state parameter gracefully", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/oauth/discord/callback?code=test-code&state=invalid-base64",
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    global.fetch = mock((url: string) => {
      if (url.includes("oauth2/token")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "token",
              refresh_token: "refresh",
              expires_in: 3600,
            }),
        });
      }
      if (url.includes("users/@me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "discord-999" }),
        });
      }
    });

    const mockUser = {
      addExternalIdentity: mock(() => Promise.resolve()),
    };
    const mockSession = {
      getUser: mock(() => Promise.resolve(mockUser)),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to parse state:",
      expect.any(Error),
    );
  });

  it("should redirect to signin when no session and not email_verify flow", async () => {
    // Arrange
    const state = Buffer.from(JSON.stringify({ from: "settings" })).toString(
      "base64",
    );
    const request = new NextRequest(
      `http://localhost/api/oauth/discord/callback?code=test-code&state=${state}`,
    );

    global.fetch = mock((url: string) => {
      if (url.includes("oauth2/token")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: "token",
              refresh_token: "refresh",
              expires_in: 3600,
            }),
        });
      }
      if (url.includes("users/@me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "discord-abc" }),
        });
      }
    });

    Session.getCurrent = mock(() => Promise.resolve(null));
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/signin");
    expect(location).toContain("redirect=/dashboard/settings");
  });
});