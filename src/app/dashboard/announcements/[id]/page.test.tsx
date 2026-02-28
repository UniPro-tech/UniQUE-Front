/**
 * Tests for Announcement Detail page
 */
import { describe, expect, it, mock, beforeEach } from "bun:test";
import Page from "./page";
import { Announcement } from "@/classes/Announcement";
import { Session } from "@/classes/Session";
import { PermissionBitsFields } from "@/constants/Permission";

// Mock next/navigation
const mockNotFound = mock(() => {
  throw new Error("Not Found");
});
jest.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

describe("Announcement Detail Page", () => {
  beforeEach(() => {
    mock.restore();
    mockNotFound.mockClear();
  });

  it("should call notFound when announcement does not exist", async () => {
    // Arrange
    const params = Promise.resolve({ id: "non-existent" });
    const searchParams = Promise.resolve({});
    Announcement.getById = mock(() => Promise.resolve(null));

    // Act & Assert
    await expect(Page({ params, searchParams })).rejects.toThrow("Not Found");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("should render announcement details when found", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({});
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test Announcement",
        content: "Test content",
        createdAt: new Date("2024-01-01").toISOString(),
        createdBy: {
          id: "user-123",
          customId: "testuser",
          profile: { displayName: "Test User" },
        },
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    const mockSession = {
      getUser: () =>
        Promise.resolve({
          hasPermission: mock(() => Promise.resolve(false)),
        }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ params, searchParams });

    // Assert
    expect(result).toBeTruthy();
    expect(result.props.children).toBeDefined();
  });

  it("should show success snackbar when success param is present", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({
      success: "1",
      type: "edit",
    });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        createdAt: new Date().toISOString(),
        createdBy: null,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    const mockSession = {
      getUser: () =>
        Promise.resolve({
          hasPermission: mock(() => Promise.resolve(false)),
        }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ params, searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
    expect(snackProvider.props.snacks[0].message).toBe("お知らせを更新しました");
    expect(snackProvider.props.snacks[0].variant).toBe("success");
  });

  it("should show delete success message when type is delete", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({
      success: "1",
      type: "delete",
    });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        createdAt: new Date().toISOString(),
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    const mockSession = {
      getUser: () =>
        Promise.resolve({
          hasPermission: mock(() => Promise.resolve(false)),
        }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ params, searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks[0].message).toBe("お知らせを削除しました");
  });

  it("should show error snackbar when error param is present", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({
      error: "Failed to update",
    });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        createdAt: new Date().toISOString(),
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    const mockSession = {
      getUser: () =>
        Promise.resolve({
          hasPermission: mock(() => Promise.resolve(false)),
        }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ params, searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks[0].message).toContain("エラー:");
    expect(snackProvider.props.snacks[0].variant).toBe("error");
  });

  it("should show edit button when user has permission", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({});
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        createdAt: new Date().toISOString(),
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    const mockUser = {
      hasPermission: mock((permission: any) => {
        if (permission === PermissionBitsFields.ANNOUNCEMENT_UPDATE) {
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      }),
    };
    const mockSession = {
      getUser: () => Promise.resolve(mockUser),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ params, searchParams });
    const content = result.props.children[1];

    // Assert
    expect(mockUser.hasPermission).toHaveBeenCalledWith(
      PermissionBitsFields.ANNOUNCEMENT_UPDATE,
    );
  });

  it("should not show edit button when user lacks permission", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({});
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        createdAt: new Date().toISOString(),
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    const mockUser = {
      hasPermission: mock(() => Promise.resolve(false)),
    };
    const mockSession = {
      getUser: () => Promise.resolve(mockUser),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ params, searchParams });

    // Assert
    expect(mockUser.hasPermission).toHaveBeenCalled();
  });

  it("should handle announcement with null creator", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({});
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "System Announcement",
        content: "System message",
        createdAt: new Date().toISOString(),
        createdBy: null,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    const mockSession = {
      getUser: () =>
        Promise.resolve({
          hasPermission: mock(() => Promise.resolve(false)),
        }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ params, searchParams });

    // Assert
    expect(result).toBeTruthy();
  });

  it("should handle no session gracefully", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({});
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        createdAt: new Date().toISOString(),
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));
    Session.getCurrent = mock(() => Promise.resolve(null));

    // Act
    const result = await Page({ params, searchParams });

    // Assert
    expect(result).toBeTruthy();
  });

  it("should format date correctly in display", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const searchParams = Promise.resolve({});
    const testDate = new Date("2024-01-15T10:30:00Z");
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        createdAt: testDate.toISOString(),
        createdBy: {
          profile: { displayName: "Test User" },
        },
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    const mockSession = {
      getUser: () =>
        Promise.resolve({
          hasPermission: mock(() => Promise.resolve(false)),
        }),
    };
    Session.getCurrent = mock(() => Promise.resolve(mockSession));

    // Act
    const result = await Page({ params, searchParams });

    // Assert
    expect(result).toBeTruthy();
  });

  it("should have correct metadata", () => {
    // Arrange & Act
    const { metadata } = require("./page");

    // Assert
    expect(metadata.title).toBe("アナウンス詳細");
    expect(metadata.description).toContain("詳細表示");
  });
});