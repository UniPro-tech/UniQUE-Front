# Test Dependencies Installation Guide

## Required Dependencies

Before running the tests, you need to install the following testing dependencies:

### Installation Command

```bash
bun add -d @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest happy-dom
```

## Dependency Breakdown

### @testing-library/react
- **Purpose**: Provides utilities for testing React components
- **Version**: Latest compatible with React 19
- **Usage**: Rendering components, querying DOM elements, simulating interactions

### @testing-library/jest-dom
- **Purpose**: Custom Jest matchers for DOM assertions
- **Usage**: Provides matchers like `toBeInTheDocument()`, `toHaveAttribute()`, etc.

### @testing-library/user-event
- **Purpose**: Simulates user interactions more realistically than fireEvent
- **Usage**: Clicking, typing, hovering, etc.

### @types/jest
- **Purpose**: TypeScript type definitions for Jest-compatible assertions
- **Usage**: Type checking for test assertions and mocks

### happy-dom
- **Purpose**: Fast and lightweight DOM implementation for testing
- **Alternative**: jsdom (heavier but more complete)
- **Usage**: Provides browser-like environment for component tests

## Verification

After installation, verify dependencies are installed:

```bash
bun pm ls | grep testing-library
bun pm ls | grep happy-dom
```

## Current package.json State

The project uses Bun as the runtime (already in devDependencies). The testing dependencies listed above need to be added.

## Configuration Files

### bunfig.toml
- Configures Bun test runner
- Sets up test preload script
- Enables coverage reporting

### src/test-setup.ts
- Global test setup file
- Imports `@testing-library/jest-dom` matchers
- Configures cleanup after each test

### package.json scripts
- `test`: Run all tests
- `test:watch`: Run tests in watch mode
- `test:coverage`: Run tests with coverage report

## Running Tests After Installation

1. Install dependencies:
   ```bash
   bun add -d @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest happy-dom
   ```

2. Run tests:
   ```bash
   bun test
   ```

3. View coverage:
   ```bash
   bun test --coverage
   ```

## Expected Test Output

When all dependencies are installed, you should see:

```
✓ API route tests (6 files)
✓ React page tests (8 files)
✓ Total: 100+ test cases
```

## Troubleshooting

### Error: Cannot find module '@testing-library/react'
**Solution**: Run the installation command above

### Error: happy-dom is not installed
**Solution**: Install happy-dom: `bun add -d happy-dom`

### TypeScript errors in test files
**Solution**: Ensure @types/jest is installed for type definitions

### React 19 compatibility issues
**Solution**: Update @testing-library/react to latest version:
```bash
bun add -d @testing-library/react@latest
```

## Next Steps

After installing dependencies:

1. Run `bun test` to execute all tests
2. Check test coverage with `bun test --coverage`
3. Fix any failing tests (see TESTING.md for debugging tips)
4. Add tests for new features as you develop them

## CI/CD Integration

For CI/CD pipelines, ensure the installation command runs before tests:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: bun install

- name: Install test dependencies
  run: bun add -d @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest happy-dom

- name: Run tests
  run: bun test --coverage
```

## Cost and License

All testing dependencies are open source and free to use:
- @testing-library/* - MIT License
- happy-dom - MIT License
- @types/jest - MIT License

No additional costs or subscriptions required.