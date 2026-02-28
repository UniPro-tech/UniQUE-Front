# Testing Guide

This document describes the testing setup and conventions for this project.

## Testing Framework

This project uses **Bun's built-in test runner** with the following libraries:

- `@testing-library/react` - For testing React components
- `@testing-library/jest-dom` - For additional DOM matchers
- `@testing-library/user-event` - For simulating user interactions
- `happy-dom` - For DOM environment in tests

## Installation

Install the required testing dependencies:

```bash
bun add -d @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest happy-dom
```

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test path/to/test.test.ts
```

## Test Organization

Tests are co-located with the source files they test:

```
src/
  app/
    api/
      auth/
        signout/
          route.ts
          route.test.ts      # Tests for route.ts
    (signin)/
      signin/
        page.tsx
        page.test.tsx        # Tests for page.tsx
```

## Test File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

## Writing Tests

### API Route Tests

```typescript
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("GET /api/example", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should return 200 with valid data", async () => {
    const request = new NextRequest("http://localhost/api/example");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("result");
  });
});
```

### React Component Tests

```typescript
import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import Page from "./page";
import "@testing-library/jest-dom";

describe("Page Component", () => {
  it("should render correctly", async () => {
    const result = await Page({ searchParams: Promise.resolve({}) });
    expect(result).toBeTruthy();
  });
});
```

## Test Coverage

The following files have comprehensive test coverage:

### API Routes
- ✅ `/api/auth/signout`
- ✅ `/api/auth/check-discord-link`
- ✅ `/api/email-verify`
- ✅ `/api/email-verify-code-info`
- ✅ `/api/oauth/discord`
- ✅ `/api/oauth/discord/callback`

### Pages
- ✅ `(signin)/signin/page.tsx`
- ✅ `(signin)/signup/page.tsx`
- ✅ `(signin)/migrate/page.tsx`
- ✅ `(signin)/signup/success/page.tsx`
- ✅ `(signin)/authorization/page.tsx`
- ✅ `(signin)/layout.tsx`
- ✅ `dashboard/announcements/[id]/page.tsx`
- ✅ `dashboard/announcements/[id]/edit/page.tsx`

## Testing Best Practices

1. **Arrange-Act-Assert Pattern**: Structure tests clearly
   ```typescript
   it("should do something", async () => {
     // Arrange - Set up test data and mocks
     const input = "test";

     // Act - Execute the code under test
     const result = await functionUnderTest(input);

     // Assert - Verify the results
     expect(result).toBe("expected");
   });
   ```

2. **Mock External Dependencies**: Use `mock()` to isolate unit tests
   ```typescript
   import { Session } from "@/classes/Session";
   Session.getCurrent = mock(() => Promise.resolve(mockSession));
   ```

3. **Test Edge Cases**: Include tests for:
   - Empty/null/undefined inputs
   - Error conditions
   - Boundary values
   - Invalid data

4. **Clean Up**: Restore mocks in `beforeEach`
   ```typescript
   beforeEach(() => {
     mock.restore();
   });
   ```

5. **Descriptive Test Names**: Use clear, specific test descriptions
   ```typescript
   it("should return 400 when code parameter is missing", async () => {
     // ...
   });
   ```

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipeline
- Before deploying to production

Add to your CI configuration:
```yaml
- name: Run tests
  run: bun test --coverage
```

## Troubleshooting

### Tests fail with module import errors
- Ensure all dependencies are installed: `bun install`
- Check that `bunfig.toml` is properly configured

### React component tests fail
- Verify `happy-dom` is installed
- Check that `@testing-library/react` version is compatible with React 19

### Mock functions not working
- Call `mock.restore()` in `beforeEach` to reset mocks
- Ensure you're using Bun's `mock()` function, not Jest's

## Additional Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)