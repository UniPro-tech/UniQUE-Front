/**
 * Tests for Sign In page
 *
 * Note: This test file requires the following dependencies:
 * - @testing-library/react
 * - @testing-library/jest-dom
 * - happy-dom (for DOM environment)
 */
import { describe, expect, it, mock, beforeEach } from "bun:test";
import Page from "./page";

describe("Sign In Page", () => {
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

  it("should initialize form state from search params", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      externalEmail: "external@example.com",
      agreeToTerms: "1",
      rememberMe: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.initFormState).toEqual({
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      externalEmail: "external@example.com",
      agreeToTerms: true,
      rememberMe: true,
    });
  });

  it("should convert agreeToTerms and rememberMe string to boolean", async () => {
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

  it("should show signout success snackbar when signouted param is present", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      signouted: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
    expect(snackProvider.props.snacks[0]).toEqual({
      message: "サインアウトしました。",
      variant: "success",
    });
  });

  it("should show migration success snackbar when migration param is present", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      migration: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
    expect(snackProvider.props.snacks[0]).toEqual({
      message: "アカウントの移行が完了しました。サインインしてください。",
      variant: "success",
    });
  });

  it("should show authentication error snackbar when error starts with A", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "A001",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
    expect(snackProvider.props.snacks[0]).toHaveProperty("message");
    expect(snackProvider.props.snacks[0]).toHaveProperty("variant");
  });

  it("should show form request error snackbar when error starts with F", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "F001",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
  });

  it("should show auth server error snackbar when error starts with D", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "D001",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
  });

  it("should show frontend error snackbar when error starts with E", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "E001",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
  });

  it("should not show error snackbar when error code is unknown", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "X999",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(0);
  });

  it("should show multiple snackbars when multiple params are present", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      signouted: "1",
      migration: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(2);
  });

  it("should have correct metadata", () => {
    // Arrange & Act
    const { metadata } = require("./page");

    // Assert
    expect(metadata.title).toBe("サインイン");
    expect(metadata.description).toContain("UniQUE");
  });

  it("should handle undefined values in search params gracefully", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      name: undefined,
      username: undefined,
      email: undefined,
    });

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.initFormState.name).toBeUndefined();
    expect(authPage.props.initFormState.username).toBeUndefined();
    expect(authPage.props.initFormState.email).toBeUndefined();
  });
});