import { describe, expect, it, mock, beforeEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { apiGet } from "@/libs/apiClient";

describe("GET /api/email-verify-code-info", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should return 400 when code is missing", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify-code-info",
    );

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Code is required" });
  });

  it("should return user data when code is valid", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify-code-info?code=valid-code",
    );
    const userData = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
    };
    const mockApiGet = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(userData),
      }),
    );
    (apiGet as any) = mockApiGet;

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(userData);
    expect(mockApiGet).toHaveBeenCalledWith(
      "/internal/users/email_verify/valid-code",
    );
  });

  it("should return error when code is not found", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify-code-info?code=invalid-code",
    );
    const mockApiGet = mock(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Code not found" }),
      }),
    );
    (apiGet as any) = mockApiGet;

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data).toEqual({ error: "Code not found" });
  });

  it("should handle API error responses with default error message", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify-code-info?code=error-code",
    );
    const mockApiGet = mock(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      }),
    );
    (apiGet as any) = mockApiGet;

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Code not found" });
  });

  it("should handle JSON parsing errors gracefully", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify-code-info?code=bad-json",
    );
    const mockApiGet = mock(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("Invalid JSON")),
      }),
    );
    (apiGet as any) = mockApiGet;

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Code not found" });
  });

  it("should handle network errors and return 500", async () => {
    // Arrange
    const request = new NextRequest(
      "http://localhost/api/email-verify-code-info?code=network-error",
    );
    const consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;
    const mockApiGet = mock(() => {
      throw new Error("Network connection failed");
    });
    (apiGet as any) = mockApiGet;

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Verification lookup failed" });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("should properly encode special characters in code", async () => {
    // Arrange
    const specialCode = "code+with/special=chars";
    const request = new NextRequest(
      `http://localhost/api/email-verify-code-info?code=${encodeURIComponent(specialCode)}`,
    );
    const mockApiGet = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ valid: true }),
      }),
    );
    (apiGet as any) = mockApiGet;

    // Act
    await GET(request);

    // Assert
    const expectedPath = `/internal/users/email_verify/${encodeURIComponent(specialCode)}`;
    expect(mockApiGet).toHaveBeenCalledWith(expectedPath);
  });
});