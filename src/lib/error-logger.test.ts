import { describe, it, expect } from "vitest";
import { captureException, captureMessage } from "./error-logger";

describe("Error Logger (src/lib/error-logger.ts)", () => {
  it("captures Error objects without throwing exceptions", () => {
    expect(() => {
      captureException(new Error("Test error"), {
        tags: { env: "test" },
      });
    }).not.toThrow();
  });

  it("handles non-Error objects gracefully", () => {
    expect(() => {
      captureException("String error message");
    }).not.toThrow();
  });

  it("captures non-exception log messages without throwing", () => {
    expect(() => {
      captureMessage("User logged in", "info", {
        extra: { userId: "123" },
      });
    }).not.toThrow();
  });
});
