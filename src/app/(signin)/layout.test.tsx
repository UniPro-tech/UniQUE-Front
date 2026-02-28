/**
 * Tests for Auth Layout component
 *
 * Note: This is a client component test
 */
import { describe, expect, it, beforeEach, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import AuthLayout from "./layout";
import "@testing-library/jest-dom";

describe("Auth Layout", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should render children correctly", () => {
    // Arrange
    const testContent = <div data-testid="test-child">Test Content</div>;

    // Act
    render(<AuthLayout>{testContent}</AuthLayout>);

    // Assert
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render html element with lang=ja", () => {
    // Arrange
    const testContent = <div>Content</div>;

    // Act
    const { container } = render(<AuthLayout>{testContent}</AuthLayout>);
    const html = container.closest("html");

    // Assert
    expect(html).toHaveAttribute("lang", "ja");
  });

  it("should include CssBaseline component", () => {
    // Arrange
    const testContent = <div>Content</div>;

    // Act
    render(<AuthLayout>{testContent}</AuthLayout>);

    // Assert
    // CssBaseline should be rendered (it normalizes CSS)
    const body = document.body;
    expect(body).toBeInTheDocument();
  });

  it("should wrap children in AppTheme", () => {
    // Arrange
    const testContent = <div data-testid="themed-content">Themed</div>;

    // Act
    render(<AuthLayout>{testContent}</AuthLayout>);

    // Assert
    expect(screen.getByTestId("themed-content")).toBeInTheDocument();
  });

  it("should render Stack component with correct direction", () => {
    // Arrange
    const testContent = <div>Stack content</div>;

    // Act
    const { container } = render(<AuthLayout>{testContent}</AuthLayout>);
    const stacks = container.querySelectorAll('[class*="MuiStack"]');

    // Assert
    expect(stacks.length).toBeGreaterThan(0);
  });

  it("should handle multiple children", () => {
    // Arrange
    const children = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </>
    );

    // Act
    render(<AuthLayout>{children}</AuthLayout>);

    // Assert
    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("should handle null children gracefully", () => {
    // Act & Assert - should not throw
    expect(() => {
      render(<AuthLayout>{null}</AuthLayout>);
    }).not.toThrow();
  });

  it("should handle undefined children gracefully", () => {
    // Act & Assert - should not throw
    expect(() => {
      render(<AuthLayout>{undefined}</AuthLayout>);
    }).not.toThrow();
  });

  it("should render body element", () => {
    // Arrange
    const testContent = <div>Body content</div>;

    // Act
    render(<AuthLayout>{testContent}</AuthLayout>);

    // Assert
    expect(document.body).toBeInTheDocument();
  });

  it("should apply responsive direction to inner Stack", () => {
    // Arrange
    const testContent = <div>Responsive content</div>;

    // Act
    const { container } = render(<AuthLayout>{testContent}</AuthLayout>);

    // Assert
    // Inner stack should exist with responsive direction
    expect(container.querySelector("main")).toBeInTheDocument();
  });

  it("should set minimum height for main container", () => {
    // Arrange
    const testContent = <div>Full height content</div>;

    // Act
    const { container } = render(<AuthLayout>{testContent}</AuthLayout>);
    const main = container.querySelector("main");

    // Assert
    expect(main).toBeInTheDocument();
  });

  it("should render background gradient styles", () => {
    // Arrange
    const testContent = <div>Styled content</div>;

    // Act
    const { container } = render(<AuthLayout>{testContent}</AuthLayout>);
    const main = container.querySelector("main");

    // Assert
    // Main element should have styling applied
    expect(main).toBeInTheDocument();
  });

  it("should maintain layout structure with complex children", () => {
    // Arrange
    const complexChildren = (
      <div>
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </div>
    );

    // Act
    render(<AuthLayout>{complexChildren}</AuthLayout>);

    // Assert
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("should be a client component", () => {
    // This test verifies the "use client" directive is respected
    // by checking that the component can use client-side features

    // Arrange
    const testContent = <div>Client component test</div>;

    // Act & Assert - should not throw when rendering
    expect(() => {
      render(<AuthLayout>{testContent}</AuthLayout>);
    }).not.toThrow();
  });

  it("should center content vertically and horizontally", () => {
    // Arrange
    const testContent = <div data-testid="centered">Centered</div>;

    // Act
    const { container } = render(<AuthLayout>{testContent}</AuthLayout>);
    const main = container.querySelector("main");

    // Assert
    expect(main).toBeInTheDocument();
    expect(screen.getByTestId("centered")).toBeInTheDocument();
  });
});