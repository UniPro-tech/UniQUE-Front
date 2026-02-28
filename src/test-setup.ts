/**
 * Test setup file for Bun test runner
 *
 * Required dependencies (add to package.json):
 * - @testing-library/react
 * - @testing-library/jest-dom
 * - @testing-library/user-event
 * - happy-dom
 */

import { afterEach } from "bun:test";
import "@testing-library/jest-dom";

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  if (typeof jest !== "undefined") {
    jest.clearAllMocks();
  }
});