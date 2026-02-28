import { describe, expect, it, mock, beforeEach } from "bun:test";
import { POST } from "./route";
import { Session } from "@/classes/Session";

describe("POST /api/auth/signout", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mock.restore();
  });

  it("should delete the current session and return 204", async () => {
    // Arrange
    const mockSession = {
      delete: mock(() => Promise.resolve()),
    };
    const mockGetCurrent = mock(() => Promise.resolve(mockSession));
    Session.getCurrent = mockGetCurrent;

    // Act
    const response = await POST();

    // Assert
    expect(mockGetCurrent).toHaveBeenCalledTimes(1);
    expect(mockSession.delete).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });

  it("should handle no session gracefully and return 204", async () => {
    // Arrange
    const mockGetCurrent = mock(() => Promise.resolve(null));
    Session.getCurrent = mockGetCurrent;

    // Act
    const response = await POST();

    // Assert
    expect(mockGetCurrent).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(204);
  });

  it("should handle session deletion errors gracefully", async () => {
    // Arrange
    const mockSession = {
      delete: mock(() => Promise.reject(new Error("Deletion failed"))),
    };
    const mockGetCurrent = mock(() => Promise.resolve(mockSession));
    Session.getCurrent = mockGetCurrent;

    // Act & Assert
    await expect(POST()).rejects.toThrow("Deletion failed");
  });

  it("should return response with no content body", async () => {
    // Arrange
    const mockSession = {
      delete: mock(() => Promise.resolve()),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const response = await POST();
    const text = await response.text();

    // Assert
    expect(text).toBe("");
    expect(response.headers.get("content-length")).toBe("0");
  });
});