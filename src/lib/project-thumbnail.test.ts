import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { createProjectThumbnail, PROJECT_THUMBNAIL_SIZE } from "./project-thumbnail";

describe("upload thumbnail generation", () => {
  it.each([[2400, 1500], [1000, 2200], [200, 100]])("preserves %s×%s image proportions without upscaling", async (width, height) => {
    const original = await sharp({ create: { width, height, channels: 3, background: '#6d28d9' } }).png().toBuffer();
    const preview = await createProjectThumbnail(original);
    const metadata = await sharp(preview).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.width!).toBeLessThanOrEqual(Math.min(width, PROJECT_THUMBNAIL_SIZE));
    expect(metadata.height!).toBeLessThanOrEqual(Math.min(height, PROJECT_THUMBNAIL_SIZE));
    expect(metadata.width! / metadata.height!).toBeCloseTo(width / height, 2);
    expect(metadata.exif).toBeUndefined();
  });
  it("rejects truncated files rather than trusting a valid signature", async () => {
    await expect(createProjectThumbnail(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).rejects.toThrow();
  });
});
