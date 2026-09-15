import { describe, expect, it } from "vitest";

import { createImageToken, verifyImageToken } from "@/lib/imageTokens";

const SECRET = "unit-test-only-secret-at-least-32-characters";
const FOLDER = "allowed-folder";
const FILE = "photo_123";
const NOW = 1_800_000_000_000;

describe("signed image capabilities", () => {
  it("allows a signed file within its configured folder", () => {
    const token = createImageToken(FILE, FOLDER, SECRET, NOW);
    expect(verifyImageToken(FILE, token, FOLDER, SECRET, NOW)).toBe(true);
  });
  it("cannot be reused for another file, folder, or secret", () => {
    const token = createImageToken(FILE, FOLDER, SECRET, NOW);
    expect(verifyImageToken("other-file", token, FOLDER, SECRET, NOW)).toBe(
      false,
    );
    expect(verifyImageToken(FILE, token, "other-folder", SECRET, NOW)).toBe(
      false,
    );
    expect(verifyImageToken(FILE, token, FOLDER, "wrong-secret", NOW)).toBe(
      false,
    );
  });
  it("expires after 24 hours, including the exact boundary", () => {
    const token = createImageToken(FILE, FOLDER, SECRET, NOW);
    expect(
      verifyImageToken(FILE, token, FOLDER, SECRET, NOW + 86_399_000),
    ).toBe(true);
    expect(
      verifyImageToken(FILE, token, FOLDER, SECRET, NOW + 86_400_000),
    ).toBe(false);
  });
  it.each([
    "",
    "garbage",
    "123.abc",
    "1800086400.bad",
    "1800086400.abc.extra",
    "Infinity.abc",
    "1800086400.",
  ])("rejects malformed token %s without throwing", (token) => {
    expect(verifyImageToken(FILE, token, FOLDER, SECRET, NOW)).toBe(false);
  });
  it("rejects path traversal and future-dated tokens", () => {
    const badId = "../secret";
    expect(
      verifyImageToken(
        badId,
        createImageToken(badId, FOLDER, SECRET, NOW),
        FOLDER,
        SECRET,
        NOW,
      ),
    ).toBe(false);
    expect(
      verifyImageToken(
        FILE,
        createImageToken(FILE, FOLDER, SECRET, NOW + 100_000),
        FOLDER,
        SECRET,
        NOW,
      ),
    ).toBe(false);
  });
});
