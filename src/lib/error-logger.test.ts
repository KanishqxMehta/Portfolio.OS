import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { captureException, captureMessage } from "./error-logger";

describe("error-logger", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("captureException", () => {
    it("should log Error objects to console.error", () => {
      const err = new Error("Test exception");
      captureException(err, { extra: { tag: "test" } });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const firstArg = consoleErrorSpy.mock.calls[0][0];
      const payload = consoleErrorSpy.mock.calls[0][1];

      expect(firstArg).toBe("[ERROR_LOGGER]");
      expect(payload.message).toBe("Test exception");
      expect(payload.context).toEqual({ extra: { tag: "test" } });
    });

    it("should normalize non-Error instances into an Error object", () => {
      captureException("String error message");

      expect(consoleErrorSpy).toHaveBeenCalled();
      const payload = consoleErrorSpy.mock.calls[0][1];
      expect(payload.message).toBe("String error message");
    });
  });

  describe("captureMessage", () => {
    it("should log message to console.log with formatted severity label", () => {
      captureMessage("Custom warning message", "warning", { extra: { code: 404 } });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[LOG_WARNING]",
        expect.objectContaining({
          message: "Custom warning message",
          context: { extra: { code: 404 } },
        })
      );
    });

    it("should default to info severity if unspecified", () => {
      captureMessage("Default info message");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[LOG_INFO]",
        expect.objectContaining({
          message: "Default info message",
        })
      );
    });
  });
});
