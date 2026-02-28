import { describe, expect, it, mock, beforeEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { User } from "@/classes/User";

describe("GET /api/email-verify", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should return 400 when code is missing", async () => {
    // Arrange
    const request = new NextRequest("http://localhost/api/email-verify");

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Code is required" });
  });

  it("should return valid=false when verification fails", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify?code=invalid-code",
    );
    User.emailVerify = mock(() => Promise.resolve(null));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ valid: false, type: null });
  });

  it("should return error result when verification returns error", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify?code=expired-code",
    );
    const errorResult = { error: "Code expired", valid: false };
    User.emailVerify = mock(() => Promise.resolve(errorResult));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(errorResult);
  });

  it("should return success result when verification succeeds", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify?code=valid-code",
    );
    const successResult = {
      valid: true,
      type: "signup",
      userId: "user-123",
    };
    User.emailVerify = mock(() => Promise.resolve(successResult));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(successResult);
  });

  it("should handle verification exception and return 500", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify?code=error-code",
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;
    User.emailVerify = mock(() => {
      throw new Error("Database connection failed");
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Verification failed" });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("should properly encode code parameter when calling emailVerify", async () => {
    // Arrange
    const specialCode = "code+with/special=chars";
    const request = new NextRequest(
      `http://localhost/api/email-verify?code=${encodeURIComponent(specialCode)}`,
    );
    const mockEmailVerify = mock(() =>
      Promise.resolve({ valid: true, type: "signup" }),
    );
    User.emailVerify = mockEmailVerify;

    // Act
    await GET(request);

    // Assert
    expect(mockEmailVerify).toHaveBeenCalledWith(specialCode);
  });

  it("should handle null and undefined edge cases", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify?code=test",
    );
    User.emailVerify = mock(() => Promise.resolve(undefined));

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ valid: false, type: null });
  });
});