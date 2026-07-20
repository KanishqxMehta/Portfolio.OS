import { describe, expect, it } from "vitest";
import {
  PASSWORD_MIN_LENGTH,
  isValidEmail,
  normalizeEmail,
  slugifyUsername,
  validatePassword,
  validateUsername,
} from "@/lib/validations/user";

describe("user validation", () => {
  describe("normalizeEmail", () => {
    it("lowercases and trims email addresses", () => {
      expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
    });
  });

  describe("isValidEmail", () => {
    it("accepts valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
    });

    it("rejects invalid emails", () => {
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("missing@domain")).toBe(false);
    });
  });

  describe("slugifyUsername", () => {
    it("lowercases, trims, and replaces spaces with hyphens", () => {
      expect(slugifyUsername("  Jane Dev  ")).toBe("jane-dev");
    });

    it("removes invalid characters", () => {
      expect(slugifyUsername("jane@dev!")).toBe("janedev");
    });
  });

  describe("validateUsername", () => {
    it("accepts valid slugs", () => {
      expect(validateUsername("jane-dev")).toEqual({ valid: true });
    });

    it("rejects too-short usernames", () => {
      const result = validateUsername("ab");
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("3 and 20");
      }
    });

    it("rejects too-long usernames", () => {
      expect(validateUsername("a".repeat(21)).valid).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it(`requires at least ${PASSWORD_MIN_LENGTH} characters`, () => {
      expect(validatePassword("short").valid).toBe(false);
      expect(validatePassword("long-enough").valid).toBe(true);
    });
  });
});
