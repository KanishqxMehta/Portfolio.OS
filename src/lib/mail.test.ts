import { afterEach, describe, expect, it, vi } from "vitest";
const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail }) } }));
import { sendPasswordResetEmail } from "./mail";

describe("reset email delivery", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); sendMail.mockReset(); });
  it("never logs the reset token when SMTP is missing in production", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("SMTP_HOST", "");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    expect(await sendPasswordResetEmail("person@example.com", "secret-token")).toBe(false);
    expect(log).not.toHaveBeenCalled(); expect(sendMail).not.toHaveBeenCalled();
  });
  it("returns false on rejected delivery", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    sendMail.mockRejectedValue(new Error("SMTP failed"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await sendPasswordResetEmail("person@example.com", "secret-token")).toBe(false);
  });
  it("requires an accepted recipient for success", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    sendMail.mockResolvedValueOnce({ accepted: [] }).mockResolvedValueOnce({ accepted: ["person@example.com"] });
    expect(await sendPasswordResetEmail("person@example.com", "token")).toBe(false);
    expect(await sendPasswordResetEmail("person@example.com", "token")).toBe(true);
  });
});
