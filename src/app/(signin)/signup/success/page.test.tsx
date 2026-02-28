/**
 * Tests for Sign Up Success page
 */
import { describe, expect, it, beforeEach, mock } from "bun:test";
import SignUpSuccessPage from "./page";

describe("Sign Up Success Page", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should show initial signup message when email_verified is not set", async () => {
    // Arrange
    const searchParams = Promise.resolve({});

    // Act
    const result = await SignUpSuccessPage({ searchParams });

    // Assert
    expect(result).toBeTruthy();
    expect(result.props.children).toContainEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          children: expect.stringContaining("サインアップが完了しました"),
        }),
      }),
    );
  });

  it("should show initial signup message when email_verified is false", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      email_verified: "false",
    });

    // Act
    const result = await SignUpSuccessPage({ searchParams });

    // Assert
    expect(result).toBeTruthy();
    expect(result.props.children).toContainEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          children: expect.stringContaining("サインアップが完了しました"),
        }),
      }),
    );
  });

  it("should show email verification complete message when email_verified is true", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      email_verified: "true",
    });

    // Act
    const result = await SignUpSuccessPage({ searchParams });

    // Assert
    expect(result).toBeTruthy();
    expect(result.props.children).toContainEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          children: expect.stringContaining("メールアドレスの認証が完了しました"),
        }),
      }),
    );
  });

  it("should display confirmation email instructions when not verified", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      email_verified: "false",
    });

    // Act
    const result = await SignUpSuccessPage({ searchParams });
    const textElements = result.props.children.filter(
      (child: any) => child.props?.children,
    );

    // Assert
    expect(textElements.some((el: any) =>
      typeof el.props?.children === "string" &&
      el.props.children.includes("確認メールを送信")
    )).toBe(true);
  });

  it("should display admin approval instructions when verified", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      email_verified: "true",
    });

    // Act
    const result = await SignUpSuccessPage({ searchParams });
    const textElements = result.props.children.filter(
      (child: any) => child.props?.children,
    );

    // Assert
    expect(textElements.some((el: any) =>
      typeof el.props?.children === "string" &&
      el.props.children.includes("管理者の承認")
    )).toBe(true);
  });

  it("should render Stack container component", async () => {
    // Arrange
    const searchParams = Promise.resolve({});

    // Act
    const result = await SignUpSuccessPage({ searchParams });

    // Assert
    expect(result.type).toBeDefined();
    expect(result.props.children).toBeTruthy();
  });

  it("should handle undefined searchParams gracefully", async () => {
    // Arrange
    const searchParams = Promise.resolve(undefined as any);

    // Act & Assert - should not throw
    const result = await SignUpSuccessPage({ searchParams });
    expect(result).toBeTruthy();
  });

  it("should have Typography components for headings and body text", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      email_verified: "false",
    });

    // Act
    const result = await SignUpSuccessPage({ searchParams });

    // Assert
    const typographyElements = result.props.children;
    expect(typographyElements.length).toBeGreaterThan(0);
    expect(
      typographyElements.some((el: any) => el.props?.variant === "h4"),
    ).toBe(true);
    expect(
      typographyElements.some((el: any) => el.props?.variant === "body1"),
    ).toBe(true);
  });

  it("should use center alignment for text", async () => {
    // Arrange
    const searchParams = Promise.resolve({});

    // Act
    const result = await SignUpSuccessPage({ searchParams });

    // Assert
    const typographyElements = result.props.children;
    expect(
      typographyElements.every((el: any) => el.props?.align === "center"),
    ).toBe(true);
  });

  it("should show emoji in heading when not verified", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      email_verified: "false",
    });

    // Act
    const result = await SignUpSuccessPage({ searchParams });
    const heading = result.props.children[0];

    // Assert
    expect(heading.props.children).toContain("🎉");
  });

  it("should show emoji in heading when verified", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      email_verified: "true",
    });

    // Act
    const result = await SignUpSuccessPage({ searchParams });
    const heading = result.props.children[0];

    // Assert
    expect(heading.props.children).toContain("🎉");
  });

  it("should handle various truthy values for email_verified", async () => {
    const truthyValues = ["true", "1", "yes"];

    for (const value of truthyValues) {
      // Only "true" should be treated as verified
      const searchParams = Promise.resolve({
        email_verified: value,
      });

      const result = await SignUpSuccessPage({ searchParams });
      const hasVerifiedMessage = result.props.children.some((el: any) =>
        typeof el.props?.children === "string" &&
        el.props.children.includes("メールアドレスの認証が完了")
      );

      if (value === "true") {
        expect(hasVerifiedMessage).toBe(true);
      } else {
        expect(hasVerifiedMessage).toBe(false);
      }
    }
  });
});