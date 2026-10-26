import sharp from "sharp";

export const PROJECT_THUMBNAIL_SIZE = 960;
/** Decode real pixels, cap decompression work, preserve ratio and strip metadata. */
export async function createProjectThumbnail(bytes: Buffer): Promise<Buffer> {
  return sharp(bytes, { limitInputPixels: 20_000_000, animated: false })
    .rotate()
    .resize({ width: PROJECT_THUMBNAIL_SIZE, height: PROJECT_THUMBNAIL_SIZE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
}
