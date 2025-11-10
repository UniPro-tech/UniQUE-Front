import { expect, test } from "bun:test";

import { VerifyCSRFToken, generateCSRFToken } from "@/lib/CSRF";

test("CSRF Token Generation and Verification", () => {
  const data = "test_data";
  const token = generateCSRFToken(data, false);
  const verifiedData = VerifyCSRFToken(token, false);
  expect(verifiedData).toBe(data);
});

test("CSRF Token Generation and Verification with expire", () => {
  const data = "test_data";
  const token = generateCSRFToken(data, true);
  const verifiedData = VerifyCSRFToken(token, true);
  expect(verifiedData).toBe(data);
});
