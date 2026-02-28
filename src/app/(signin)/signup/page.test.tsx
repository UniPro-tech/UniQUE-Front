/**
 * Tests for Sign Up page
 */
import { describe, expect, it, mock, beforeEach } from "bun:test";
import Page from "./page";
import { AuthorizationPageMode } from "@/components/Pages/Authentication";

describe("Sign Up Page", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should render with empty search params", async () => {
    // Arrange
    const searchParams = Promise.resolve({});

    // Act
    const result = await Page({ searchParams });

    // Assert
    expect(result).toBeTruthy();
    expect(result.props.children).toHaveLength(2);
  });

  it("should pass SignUp mode to AuthenticationPage", async () => {
    // Arrange
    const searchParams = Promise.resolve({});

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.mode).toBe(AuthorizationPageMode.SignUp);
  });

  it("should initialize form state from search params", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      name: "New User",
      username: "newuser",
      email: "new@example.com",
      externalEmail: "ext@example.com",
      agreeToTerms: "1",
      rememberMe: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.initFormState).toEqual({
      name: "New User",
      username: "newuser",
      email: "new@example.com",
      externalEmail: "ext@example.com",
      agreeToTerms: true,
      rememberMe: true,
    });
  });

  it("should show signout success snackbar", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      signouted: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
    expect(snackProvider.props.snacks[0].message).toBe(
      "サインアウトしました。",
    );
    expect(snackProvider.props.snacks[0].variant).toBe("success");
  });

  it("should show migration success snackbar", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      migration: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
    expect(snackProvider.props.snacks[0].message).toContain(
      "アカウントの移行が完了しました",
    );
  });

  it("should handle ResourceApiError (R prefix)", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "R001",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
  });

  it("should handle all error types", async () => {
    // Test each error type prefix
    const errorPrefixes = ["A", "F", "D", "E", "R"];

    for (const prefix of errorPrefixes) {
      // Arrange
      const searchParams = Promise.resolve({
        error: `${prefix}001`,
      });

      // Act
      const result = await Page({ searchParams });
      const snackProvider = result.props.children[0];

      // Assert
      expect(snackProvider.props.snacks).toHaveLength(1);
      expect(snackProvider.props.snacks[0]).toHaveProperty("message");
      expect(snackProvider.props.snacks[0]).toHaveProperty("variant");
    }
  });

  it("should not show error for unknown error code", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "Z999",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(0);
  });

  it("should have correct metadata", () => {
    // Arrange & Act
    const { metadata } = require("./page");

    // Assert
    expect(metadata.title).toBe("メンバー登録申請");
    expect(metadata.description).toContain("サインアップ");
  });

  it("should convert boolean flags correctly", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      agreeToTerms: "0",
      rememberMe: "0",
    });

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.initFormState.agreeToTerms).toBe(false);
    expect(authPage.props.initFormState.rememberMe).toBe(false);
  });

  it("should handle multiple snackbars simultaneously", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      signouted: "1",
      error: "R001",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(2);
  });

  it("should preserve all form field values", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      name: "Test Name",
      username: "testusername",
      email: "test@test.com",
      externalEmail: "external@test.com",
    });

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];
    const formState = authPage.props.initFormState;

    // Assert
    expect(formState.name).toBe("Test Name");
    expect(formState.username).toBe("testusername");
    expect(formState.email).toBe("test@test.com");
    expect(formState.externalEmail).toBe("external@test.com");
  });
});