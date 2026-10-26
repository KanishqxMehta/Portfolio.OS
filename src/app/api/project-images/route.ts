import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPersistentRateLimit } from "@/lib/persistent-rate-limit";
import { rateLimitExceededResponse } from "@/lib/api/rate-limit-response";
import { imageExtension, MAX_PROJECT_IMAGE_BYTES } from "@/lib/project-media";
import { createProjectThumbnail } from "@/lib/project-thumbnail";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to upload images." }, { status: 401 });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    const limit = await checkPersistentRateLimit(`project-images:${session.user.id}`, { limit: 30, windowMs: 60 * 60_000 });
    if (!limit.allowed) return rateLimitExceededResponse(limit);
    const storageUrl = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_PROJECT_IMAGES_BUCKET || "project-images";
    if (!storageUrl || !key) return NextResponse.json({ error: "Image uploads are not configured yet. You can add a public image link instead." }, { status: 503 });
    if (Number(request.headers.get("content-length")) > MAX_PROJECT_IMAGE_BYTES) return NextResponse.json({ error: "Please choose an image smaller than 3 MB." }, { status: 413 });
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_PROJECT_IMAGE_BYTES) {
        await reader.cancel();
        return NextResponse.json({ error: "Please choose an image smaller than 3 MB." }, { status: 413 });
      }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    const mime = request.headers.get("content-type")?.split(";")[0] || "";
    const extension = imageExtension(bytes, mime);
    if (!extension) return NextResponse.json({ error: "Please use a PNG, JPEG, or WebP image." }, { status: 400 });
    let thumbnail: Buffer;
    try { thumbnail = await createProjectThumbnail(bytes); }
    catch { return NextResponse.json({ error: "This image cannot be read or is too large to process. Please export a smaller PNG, JPEG or WebP." }, { status: 400 }); }
    const ownerFolder = createHash("sha256").update(session.user.id).digest("hex");
    const id = randomUUID();
    const paths = [`${ownerFolder}/${id}.${extension}`, `${ownerFolder}/${id}-preview.webp`];
    const base = storageUrl.replace(/\/$/, "");
    const urls = paths.map((path) => `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path}`);
    // Register before network I/O so partially failed uploads are still reclaimable.
    await pool.query('INSERT INTO "ProjectUpload" (id, "ownerId", "storageBase", bucket, paths, urls) VALUES ($1, $2, $3, $4, $5::text[], $6::text[])', [id, session.user.id, base, bucket, paths, urls]);
    for (const [index, path] of paths.entries()) {
    const response = await fetch(`${base}/storage/v1/object/${encodeURIComponent(bucket)}/${path}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": index === 0 ? mime : "image/webp", "x-upsert": "false", "cache-control": "max-age=31536000" },
      body: new Uint8Array(index === 0 ? bytes : thumbnail),
      signal: AbortSignal.timeout(20_000),
      redirect: "error",
    });
    if (!response.ok) {
      console.error("Project image upload failed", { status: response.status });
      return NextResponse.json({ error: "We couldn’t upload this image right now. Please try again or use an image link." }, { status: 503 });
    }
    }
    return NextResponse.json({ url: urls[0], thumbnailUrl: urls[1] }, { status: 201 });
  } catch (error) {
    console.error("Project image upload failed:", error);
    return NextResponse.json({ error: "We couldn’t upload this image right now. Please try again or use an image link." }, { status: 503 });
  }
}
