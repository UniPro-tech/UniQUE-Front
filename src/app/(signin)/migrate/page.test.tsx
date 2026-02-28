/**
 * Tests for Account Migration page
 */
import { describe, expect, it, mock, beforeEach } from "bun:test";
import Page from "./page";
import { AuthorizationPageMode } from "@/components/Pages/Authentication";

describe("Account Migration Page", () => {
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

  it("should pass Migration mode to AuthenticationPage", async () => {
    // Arrange
    const searchParams = Promise.resolve({});

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.mode).toBe(AuthorizationPageMode.Migration);
  });

  it("should initialize form state from search params", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      name: "Migration User",
      username: "migrateuser",
      email: "migrate@example.com",
      externalEmail: "external@example.com",
      agreeToTerms: "1",
      rememberMe: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.initFormState).toEqual({
      name: "Migration User",
      username: "migrateuser",
      email: "migrate@example.com",
      externalEmail: "external@example.com",
      agreeToTerms: true,
      rememberMe: true,
    });
  });

  it("should have correct metadata", () => {
    // Arrange & Act
    const { metadata } = require("./page");

    // Assert
    expect(metadata.title).toBe("アカウント移行");
    expect(metadata.description).toContain("移行");
  });

  it("should show all error types correctly", async () => {
    // Test authentication error
    const searchParamsAuth = Promise.resolve({ error: "A001" });
    const resultAuth = await Page({ searchParams: searchParamsAuth });
    expect(resultAuth.props.children[0].props.snacks).toHaveLength(1);

    // Test form request error
    const searchParamsForm = Promise.resolve({ error: "F001" });
    const resultForm = await Page({ searchParams: searchParamsForm });
    expect(resultForm.props.children[0].props.snacks).toHaveLength(1);

    // Test auth server error
    const searchParamsServer = Promise.resolve({ error: "D001" });
    const resultServer = await Page({ searchParams: searchParamsServer });
    expect(resultServer.props.children[0].props.snacks).toHaveLength(1);

    // Test frontend error
    const searchParamsFrontend = Promise.resolve({ error: "E001" });
    const resultFrontend = await Page({ searchParams: searchParamsFrontend });
    expect(resultFrontend.props.children[0].props.snacks).toHaveLength(1);

    // Test resource API error
    const searchParamsResource = Promise.resolve({ error: "R001" });
    const resultResource = await Page({ searchParams: searchParamsResource });
    expect(resultResource.props.children[0].props.snacks).toHaveLength(1);
  });

  it("should show migration success message", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      migration: "1",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(1);
    expect(snackProvider.props.snacks[0].message).toContain("移行が完了");
  });

  it("should show signout success message", async () => {
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
  });

  it("should handle multiple messages", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      signouted: "1",
      migration: "1",
      error: "R001",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(3);
  });

  it("should convert checkbox values to booleans", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      agreeToTerms: "1",
      rememberMe: "0",
    });

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.initFormState.agreeToTerms).toBe(true);
    expect(authPage.props.initFormState.rememberMe).toBe(false);
  });

  it("should handle empty string values as false", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      agreeToTerms: "",
      rememberMe: "",
    });

    // Act
    const result = await Page({ searchParams });
    const authPage = result.props.children[1];

    // Assert
    expect(authPage.props.initFormState.agreeToTerms).toBe(false);
    expect(authPage.props.initFormState.rememberMe).toBe(false);
  });

  it("should not show snackbar for unknown error codes", async () => {
    // Arrange
    const searchParams = Promise.resolve({
      error: "UNKNOWN",
    });

    // Act
    const result = await Page({ searchParams });
    const snackProvider = result.props.children[0];

    // Assert
    expect(snackProvider.props.snacks).toHaveLength(0);
  });
});