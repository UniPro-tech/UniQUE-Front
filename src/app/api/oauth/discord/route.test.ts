import { describe, expect, it, mock, beforeEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("GET /api/oauth/discord", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    mock.restore();
    process.env = {
      ...originalEnv,
      DISCORD_CLIENT_ID: "test-client-id",
      DISCORD_REDIRECT_URI: "http://localhost:3000/api/oauth/discord/callback",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should redirect to Discord OAuth with proper parameters", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/oauth/discord?from=settings",
    );

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307); // Temporary redirect
    const location = response.headers.get("location");
    expect(location).toContain("https://discord.com/api/oauth2/authorize");
    expect(location).toContain("client_id=test-client-id");
    expect(location).toContain("response_type=code");
    expect(location).toContain("scope=openid+identify+guilds.join");
  });

  it("should include state parameter with from=settings by default", async () => {
    // Arrange
    const request = new NextRequest("http://localhost/api/oauth/discord");

    // Act
    const response = await GET(request);

    // Assert
    const location = response.headers.get("location");
    const url = new URL(location!);
    const state = url.searchParams.get("state");
    expect(state).toBeTruthy();

    const decodedState = JSON.parse(
      Buffer.from(state!, "base64").toString("utf-8"),
    );
    expect(decodedState.from).toBe("settings");
    expect(decodedState.nonce).toBeTruthy();
  });

  it("should include from parameter in state when provided", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/oauth/discord?from=signup",
    );

    // Act
    const response = await GET(request);

    // Assert
    const location = response.headers.get("location");
    const url = new URL(location!);
    const state = url.searchParams.get("state");
    const decodedState = JSON.parse(
      Buffer.from(state!, "base64").toString("utf-8"),
    );
    expect(decodedState.from).toBe("signup");
  });

  it("should include code parameter in state when provided", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/oauth/discord?from=email_verify&code=verify-123",
    );

    // Act
    const response = await GET(request);

    // Assert
    const location = response.headers.get("location");
    const url = new URL(location!);
    const state = url.searchParams.get("state");
    const decodedState = JSON.parse(
      Buffer.from(state!, "base64").toString("utf-8"),
    );
    expect(decodedState.from).toBe("email_verify");
    expect(decodedState.code).toBe("verify-123");
  });

  it("should parse incoming state parameter and merge with new state", async () => {
    // Arrange
    const incomingState = Buffer.from(
      JSON.stringify({ from: "email_verify", code: "email-code-123" }),
    ).toString("base64");
    const request = new NextRequest(
      `http://localhost/api/oauth/discord?state=${incomingState}`,
    );

    // Act
    const response = await GET(request);

    // Assert
    const location = response.headers.get("location");
    const url = new URL(location!);
    const state = url.searchParams.get("state");
    const decodedState = JSON.parse(
      Buffer.from(state!, "base64").toString("utf-8"),
    );
    expect(decodedState.from).toBe("email_verify");
    expect(decodedState.code).toBe("email-code-123");
  });

  it("should return 500 when DISCORD_CLIENT_ID is not set", async () => {
    // Arrange
    delete process.env.DISCORD_CLIENT_ID;
    const request = new NextRequest("http://localhost/api/oauth/discord");
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Discord OAuth is not configured" });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("should return 500 when DISCORD_REDIRECT_URI is not set", async () => {
    // Arrange
    delete process.env.DISCORD_REDIRECT_URI;
    const request = new NextRequest("http://localhost/api/oauth/discord");
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Discord OAuth is not configured" });
  });

  it("should handle invalid state parameter gracefully", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/oauth/discord?state=invalid-base64!@#",
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(307);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to parse incoming state:",
      expect.any(Error),
    );
  });

  it("should generate unique nonce for each request", async () => {
    // Arrange
    const request1 = new NextRequest("http://localhost/api/oauth/discord");
    const request2 = new NextRequest("http://localhost/api/oauth/discord");

    // Act
    const response1 = await GET(request1);
    const response2 = await GET(request2);

    // Assert
    const location1 = response1.headers.get("location");
    const location2 = response2.headers.get("location");
    const state1 = new URL(location1!).searchParams.get("state");
    const state2 = new URL(location2!).searchParams.get("state");
    const decoded1 = JSON.parse(
      Buffer.from(state1!, "base64").toString("utf-8"),
    );
    const decoded2 = JSON.parse(
      Buffer.from(state2!, "base64").toString("utf-8"),
    );
    expect(decoded1.nonce).not.toBe(decoded2.nonce);
  });

  it("should include redirect_uri in authorization URL", async () => {
    // Arrange
    const request = new NextRequest("http://localhost/api/oauth/discord");

    // Act
    const response = await GET(request);

    // Assert
    const location = response.headers.get("location");
    const url = new URL(location!);
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/oauth/discord/callback",
    );
  });
});