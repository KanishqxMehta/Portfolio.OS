// Kept below Vercel's request-body ceiling, including request overhead.
export const MAX_PROJECT_IMAGE_BYTES = 3 * 1024 * 1024;
export const PROJECT_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export function imageExtension(bytes: Uint8Array, mime: string): string | null {
  if (mime === "image/png" && bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return "png";
  if (mime === "image/jpeg" && bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
  if (mime === "image/webp" && bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  return null;
}
