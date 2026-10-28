import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), limit: vi.fn(), fetch: vi.fn(), query: vi.fn(), thumbnail: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/persistent-rate-limit", () => ({ checkPersistentRateLimit: mocks.limit }));
vi.mock("@/lib/db", () => ({ pool: { query: mocks.query } }));
vi.mock("@/lib/project-thumbnail", () => ({ createProjectThumbnail: mocks.thumbnail }));
import { POST, DELETE } from "@/app/api/project-images/route";
import { MAX_PROJECT_IMAGE_BYTES } from "./project-media";

describe("project image uploads", () => {
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const request = (body: BodyInit = png, mime = "image/png") => new Request("http://localhost/api/project-images", { method: "POST", headers: { "Content-Type": mime, origin: "http://localhost" }, body });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SUPABASE_URL", "https://storage.example.test");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "server-secret");
    vi.stubEnv("SUPABASE_PROJECT_IMAGES_BUCKET", "project-images");
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.auth.mockResolvedValue({ user: { id: "owner" } });
    mocks.limit.mockResolvedValue({ allowed: true });
    mocks.fetch.mockResolvedValue(new Response("{}", { status: 200 }));
    mocks.query.mockResolvedValue({ rows: [] });
    mocks.thumbnail.mockResolvedValue(Buffer.from('preview-webp'));
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it("uploads a signature-checked image with a unique object name and server-only credential", async () => {
    const response = await POST(request());
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.url).toMatch(/^https:\/\/storage.example.test\/storage\/v1\/object\/public\/project-images\/[a-f0-9]{64}\/[a-f0-9-]+\.png$/);
    expect(JSON.stringify(json)).not.toContain("server-secret");
    expect(json.thumbnailUrl).toMatch(/-preview\.webp$/);
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    expect(mocks.query).toHaveBeenCalledOnce();
    expect(mocks.fetch.mock.calls[0][1].headers["x-upsert"]).toBe("false");
  });
  it("requires authentication and limits uploads", async () => {
    mocks.auth.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    mocks.auth.mockResolvedValue({ user: { id: "owner" } });
    mocks.limit.mockResolvedValue({ allowed: false, retryAfterSeconds: 10 });
    expect((await POST(request())).status).toBe(429);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("rejects oversized files, SVGs and forged MIME types", async () => {
    expect((await POST(request(new Uint8Array(MAX_PROJECT_IMAGE_BYTES + 1)))).status).toBe(413);
    expect((await POST(request("<svg/>", "image/svg+xml"))).status).toBe(400);
    expect((await POST(request("not an image"))).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("explains the image-link fallback when storage is unconfigured", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain("public image link");
  });
  it("rejects images which have a valid header but cannot be decoded", async () => {
    mocks.thumbnail.mockRejectedValue(new Error('Invalid pixels'));
    expect((await POST(request())).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.query).not.toHaveBeenCalled();
  });
  it("keeps provider failures out of user-facing messages", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.fetch.mockResolvedValue(new Response("Sensitive internal failure", { status: 500 }));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("Sensitive internal failure");
  });

  describe("project image deletion", () => {
    const deleteRequest = (body: object = {}) =>
      new Request("http://localhost/api/project-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", origin: "http://localhost" },
        body: JSON.stringify(body),
      });

    it("requires authentication", async () => {
      mocks.auth.mockResolvedValue(null);
      const res = await DELETE(deleteRequest({ url: "https://storage.example.test/pic.png" }));
      expect(res.status).toBe(401);
    });

    it("requires image URL", async () => {
      const res = await DELETE(deleteRequest({}));
      expect(res.status).toBe(400);
    });

    it("deletes managed paths from storage bucket and marks database record as deleted", async () => {
      const storageUrl = "https://storage.example.test/storage/v1/object/public/project-images/owner-hash/img-123.png";
      mocks.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: "img-123",
              ownerId: "owner",
              paths: ["owner-hash/img-123.png", "owner-hash/img-123-preview.webp"],
              urls: [storageUrl],
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const res = await DELETE(deleteRequest({ url: storageUrl }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.deletedFromStorage).toBe(true);
      expect(mocks.fetch).toHaveBeenCalledWith(
        "https://storage.example.test/storage/v1/object/project-images",
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({ prefixes: ["owner-hash/img-123.png", "owner-hash/img-123-preview.webp"] }),
        })
      );
      expect(mocks.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "ProjectUpload" SET status = \'deleted\''),
        ["img-123"]
      );
    });

    it("handles non-storage external URLs gracefully", async () => {
      const res = await DELETE(deleteRequest({ url: "https://images.unsplash.com/photo-123" }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.deletedFromStorage).toBe(false);
      expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it("returns 502 when Supabase Storage deletion fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      const storageUrl = "https://storage.example.test/storage/v1/object/public/project-images/owner-hash/img-123.png";
      mocks.query.mockResolvedValueOnce({
        rows: [{ id: "img-123", ownerId: "owner", paths: ["owner-hash/img-123.png"], urls: [storageUrl] }],
      });
      mocks.fetch.mockResolvedValueOnce(new Response("Storage error", { status: 500 }));

      const res = await DELETE(deleteRequest({ url: storageUrl }));
      expect(res.status).toBe(502);
      expect(mocks.query).not.toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "ProjectUpload" SET status = \'deleted\''),
        expect.anything()
      );
    });
  });
});
