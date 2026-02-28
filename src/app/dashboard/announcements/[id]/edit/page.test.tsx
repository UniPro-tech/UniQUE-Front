/**
 * Tests for Announcement Edit page
 */
import { describe, expect, it, mock, beforeEach } from "bun:test";
import Page from "./page";
import { Announcement } from "@/classes/Announcement";
import { requirePermission } from "@/libs/permissions";
import { PermissionBitsFields } from "@/constants/Permission";

// Mock dependencies
const mockNotFound = mock(() => {
  throw new Error("Not Found");
});
jest.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

jest.mock("@/libs/permissions", () => ({
  requirePermission: mock(() => {}),
}));

describe("Announcement Edit Page", () => {
  beforeEach(() => {
    mock.restore();
    mockNotFound.mockClear();
  });

  it("should require ANNOUNCEMENT_UPDATE permission", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        isPinned: false,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    await Page({ params });

    // Assert
    expect(requirePermission).toHaveBeenCalledWith(
      PermissionBitsFields.ANNOUNCEMENT_UPDATE,
    );
  });

  it("should call notFound when announcement does not exist", async () => {
    // Arrange
    const params = Promise.resolve({ id: "non-existent" });
    Announcement.getById = mock(() => Promise.resolve(null));

    // Act & Assert
    await expect(Page({ params })).rejects.toThrow("Not Found");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("should render edit form with announcement data", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test Announcement",
        content: "Test content",
        isPinned: true,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });

    // Assert
    expect(result).toBeTruthy();
    expect(result.props.children).toBeDefined();
  });

  it("should pass correct initial values to form", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-456" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-456",
        title: "Important Update",
        content: "# Markdown content\n\nWith **formatting**",
        isPinned: true,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });
    const form = result.props.children[1];

    // Assert
    expect(form.props.id).toBe("ann-456");
    expect(form.props.initial).toEqual({
      title: "Important Update",
      content: "# Markdown content\n\nWith **formatting**",
      isPinned: true,
    });
  });

  it("should handle isPinned as false when not set", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-789" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-789",
        title: "Regular Announcement",
        content: "Not pinned",
        isPinned: null,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });
    const form = result.props.children[1];

    // Assert
    expect(form.props.initial.isPinned).toBe(false);
  });

  it("should convert truthy isPinned values correctly", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-999" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-999",
        title: "Test",
        content: "Test",
        isPinned: 1, // Truthy value
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });
    const form = result.props.children[1];

    // Assert
    expect(form.props.initial.isPinned).toBe(true);
  });

  it("should have correct metadata", () => {
    // Arrange & Act
    const { metadata } = require("./page");

    // Assert
    expect(metadata.title).toBe("お知らせ編集");
    expect(metadata.description).toContain("編集");
  });

  it("should render heading with correct text", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        isPinned: false,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });
    const heading = result.props.children[0];

    // Assert
    expect(heading.props.children).toBe("お知らせ編集");
  });

  it("should handle empty content gracefully", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-empty" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-empty",
        title: "Empty Content",
        content: "",
        isPinned: false,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });
    const form = result.props.children[1];

    // Assert
    expect(form.props.initial.content).toBe("");
  });

  it("should handle special characters in title", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-special" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-special",
        title: "Title with <html> & special \"characters\"",
        content: "Content",
        isPinned: false,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });
    const form = result.props.children[1];

    // Assert
    expect(form.props.initial.title).toBe(
      "Title with <html> & special \"characters\"",
    );
  });

  it("should handle markdown content with special syntax", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-md" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-md",
        title: "Markdown Test",
        content:
          "# Heading\n- List item\n```code block```\n[link](url)\n![image](url)",
        isPinned: false,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });
    const form = result.props.children[1];

    // Assert
    expect(form.props.initial.content).toContain("# Heading");
    expect(form.props.initial.content).toContain("```code block```");
  });

  it("should use Stack component for layout", async () => {
    // Arrange
    const params = Promise.resolve({ id: "ann-123" });
    const mockAnnouncement = {
      toJson: () => ({
        id: "ann-123",
        title: "Test",
        content: "Content",
        isPinned: false,
      }),
    };
    Announcement.getById = mock(() => Promise.resolve(mockAnnouncement));

    // Act
    const result = await Page({ params });

    // Assert
    expect(result.props.spacing).toBe(3);
    expect(result.props.children).toHaveLength(2);
  });
});