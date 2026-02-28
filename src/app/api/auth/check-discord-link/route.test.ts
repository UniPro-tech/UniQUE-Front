import { describe, expect, it, mock, beforeEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Session } from "@/classes/Session";
import { User } from "@/classes/User";

describe("GET /api/auth/check-discord-link", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should return linked=false when no session exists", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/auth/check-discord-link",
    );
    Session.getCurrent = mock(() => Promise.resolve(null));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ linked: false, hasSession: false });
  });

  it("should return linked=true when user has Discord identity", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/auth/check-discord-link",
    );
    const mockSession = {
      userId: "user-123",
    };
    const mockUser = {
      getExternalIdentities: mock(() =>
        Promise.resolve([
          { provider: "discord", externalUserId: "discord-123" },
        ]),
      ),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));
    User.getById = mock(() => Promise.resolve(mockUser));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ linked: true, hasSession: true });
    expect(User.getById).toHaveBeenCalledWith("user-123");
  });

  it("should return linked=false when user has no Discord identity", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/auth/check-discord-link",
    );
    const mockSession = {
      userId: "user-456",
    };
    const mockUser = {
      getExternalIdentities: mock(() =>
        Promise.resolve([{ provider: "github", externalUserId: "github-123" }]),
      ),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));
    User.getById = mock(() => Promise.resolve(mockUser));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ linked: false, hasSession: true });
  });

  it("should return linked=false when user has empty identities", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/auth/check-discord-link",
    );
    const mockSession = {
      userId: "user-789",
    };
    const mockUser = {
      getExternalIdentities: mock(() => Promise.resolve([])),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));
    User.getById = mock(() => Promise.resolve(mockUser));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ linked: false, hasSession: true });
  });

  it("should handle user not found gracefully", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/auth/check-discord-link",
    );
    const mockSession = {
      userId: "user-nonexistent",
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));
    User.getById = mock(() => Promise.resolve(null));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ linked: false, hasSession: true });
  });

  it("should handle errors and return linked=false", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/auth/check-discord-link",
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;
    Session.getCurrent = mock(() => {
      throw new Error("Database error");
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ linked: false, hasSession: false });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Discord連携状態の確認エラー:",
      expect.any(Error),
    );
  });

  it("should check for multiple Discord identities", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/auth/check-discord-link",
    );
    const mockSession = {
      userId: "user-multi",
    };
    const mockUser = {
      getExternalIdentities: mock(() =>
        Promise.resolve([
          { provider: "github", externalUserId: "github-123" },
          { provider: "discord", externalUserId: "discord-456" },
          { provider: "discord", externalUserId: "discord-789" },
        ]),
      ),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));
    User.getById = mock(() => Promise.resolve(mockUser));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ linked: true, hasSession: true });
  });

  it("should handle getExternalIdentities throwing error", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/auth/check-discord-link",
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;
    const mockSession = {
      userId: "user-error",
    };
    const mockUser = {
      getExternalIdentities: mock(() => {
        throw new Error("Failed to fetch identities");
      }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));
    User.getById = mock(() => Promise.resolve(mockUser));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ linked: false, hasSession: false });
  });
});