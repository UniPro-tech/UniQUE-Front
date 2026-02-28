/**
 * Tests for OAuth Authorization page
 */
import { describe, expect, it, mock, beforeEach } from "bun:test";
import Page from "./page";
import { Session } from "@/classes/Session";
import { Application } from "@/classes/Application";
import { createApiClient } from "@/libs/apiClient";

// Mock next/navigation
const mockRedirect = mock(() => {});
jest.mock("next/navigation", () => ({
  redirect: mockRedirect,
  RedirectType: { replace: "replace", push: "push" },
}));

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) => ({ value: "mock-jwt-token" }),
    }),
}));

describe("Authorization Page", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    mock.restore();
    mockRedirect.mockClear();
    process.env = {
      ...originalEnv,
      AUTH_API_URL: "http://localhost:8001",
      NEXT_PUBLIC_AUTH_API_URL: "http://localhost:8001",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should redirect to signin when no session exists", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      auth_request_id: "req-123",
    });
    Session.getCurrent = mock(() => Promise.resolve(null));

    // Act
    await Page({ searchParams });

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/signin"),
      "replace",
    );
  });

  it("should redirect to signin when session.toJson returns null", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      auth_request_id: "req-123",
    });
    const mockSession = {
      toJson: () => null,
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    await Page({ searchParams });

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/signin"),
      "replace",
    );
  });

  it("should show error page when error parameter is present", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "forbidden_scope",
    });
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ searchParams });

    // Assert
    expect(result.props.children).toContain("Authorization Error");
  });

  it("should show specific error message for forbidden_scope", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "forbidden_scope",
    });
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ searchParams });

    // Assert
    expect(result.props.children).toContain(
      "このスコープに対する認可を行う権限がありません。",
    );
  });

  it("should show bad request when auth_request_id is missing", async () => {
    // Arrange
    const searchParams = Promise.resolve({});
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ searchParams });

    // Assert
    expect(result.props.children).toContain("Bad Request");
  });

  it("should handle failed auth request API call", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      auth_request_id: "req-invalid",
    });
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    const mockApiClient = {
      get: mock(() => Promise.resolve({ ok: false })),
    };
    (createApiClient as any) = mock(() => mockApiClient);

    // Act
    const result = await Page({ searchParams });

    // Assert
    expect(result.props.children[0].props.snacks).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining("AuthRequestの取得に失敗"),
        variant: "error",
      }),
    );
  });

  it("should handle invalid client_id", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      auth_request_id: "req-123",
    });
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    const mockApiClient = {
      get: mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              client_id: "invalid-client",
              redirect_uri: "http://example.com",
              scope: "read",
            }),
        })
      ),
    };
    (createApiClient as any) = mock(() => mockApiClient);
    Application.getById = mock(() => Promise.resolve(null));

    // Act
    const result = await Page({ searchParams });

    // Assert
    expect(result.props.children[1].props.children).toContain(
      "不正なクライアントIDです。",
    );
  });

  it("should redirect to consent endpoint when already consented with prompt=none", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      auth_request_id: "req-123",
    });
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
      getUser: () =>
        Promise.resolve({
          toJson: () => ({ id: "user-123", name: "Test User" }),
        }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    const mockApp = {
      toJson: () =>
        Promise.resolve({ id: "app-123", name: "Test App", clientId: "client-123" }),
    };
    Application.getById = mock(() => Promise.resolve(mockApp));

    const mockApiClient = {
      get: mock((url: string) => {
        if (url.includes("auth-requests")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                client_id: "client-123",
                redirect_uri: "http://example.com",
                scope: "read",
                prompt: "none",
              }),
          });
        }
        if (url.includes("consents")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([{ application_id: "client-123" }]),
          });
        }
      }),
      post: mock(() => Promise.resolve({ ok: true })),
    };
    (createApiClient as any) = mock(() => mockApiClient);

    // Act
    await Page({ searchParams });

    // Assert
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("/consented"),
      "push",
    );
  });

  it("should render consent card when no prior consent exists", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      auth_request_id: "req-123",
    });
    const mockUser = {
      toJson: () => ({ id: "user-123", name: "Test User" }),
    };
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
      getUser: () => Promise.resolve(mockUser),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    const mockApp = {
      toJson: () =>
        Promise.resolve({ id: "app-123", name: "Test App", clientId: "client-123" }),
    };
    Application.getById = mock(() => Promise.resolve(mockApp));

    const mockApiClient = {
      get: mock((url: string) => {
        if (url.includes("auth-requests")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                client_id: "client-123",
                redirect_uri: "http://example.com",
                scope: "read write",
                state: "state-123",
              }),
          });
        }
        if (url.includes("consents")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
      }),
    };
    (createApiClient as any) = mock(() => mockApiClient);

    // Act
    const result = await Page({ searchParams });

    // Assert
    expect(result.props.children[1].props.auth_request_id).toBe("req-123");
    expect(result.props.children[1].props.scope).toBe("read write");
  });

  it("should handle consent check failure gracefully", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      auth_request_id: "req-123",
    });
    const mockUser = {
      toJson: () => ({ id: "user-123", name: "Test User" }),
    };
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
      getUser: () => Promise.resolve(mockUser),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    const mockApp = {
      toJson: () =>
        Promise.resolve({ id: "app-123", name: "Test App", clientId: "client-123" }),
    };
    Application.getById = mock(() => Promise.resolve(mockApp));

    const mockApiClient = {
      get: mock((url: string) => {
        if (url.includes("auth-requests")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                client_id: "client-123",
                redirect_uri: "http://example.com",
                scope: "read",
              }),
          });
        }
        if (url.includes("consents")) {
          throw new Error("Network error");
        }
      }),
    };
    (createApiClient as any) = mock(() => mockApiClient);

    // Act
    const result = await Page({ searchParams });

    // Assert - should render consent card despite error
    expect(result.props.children[1].props.auth_request_id).toBe("req-123");
  });

  it("should redirect to signin when JWT token is missing", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      auth_request_id: "req-123",
    });
    const mockSession = {
      toJson: () => ({ userId: "user-123" }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    const mockApp = {
      toJson: () => Promise.resolve({ id: "app-123", name: "Test App" }),
    };
    Application.getById = mock(() => Promise.resolve(mockApp));

    const mockApiClient = {
      get: mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              client_id: "client-123",
              redirect_uri: "http://example.com",
              scope: "read",
            }),
        })
      ),
    };
    (createApiClient as any) = mock(() => mockApiClient);

    // Mock cookies to return null
    jest.mock("next/headers", () => ({
      cookies: () =>
        Promise.resolve({
          get: () => undefined,
        }),
    }));

    // Act
    await Page({ searchParams });

    // Assert
    expect(mockRedirect).toHaveBeenCalled();
  });
});