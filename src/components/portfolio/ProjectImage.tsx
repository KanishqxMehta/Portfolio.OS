"use client";

import Image from "next/image";
import { useState } from "react";
import { Code2 } from "lucide-react";

export function ProjectImage({ url, thumbnailUrl, alt, contain = false, cover = false }: { url?: string; thumbnailUrl?: string; alt: string; contain?: boolean; cover?: boolean }) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [landscapeUrl, setLandscapeUrl] = useState<string | null>(null);
  const fallback = cover ? (
    <div data-project-cover data-project-fallback aria-hidden="true" className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center overflow-hidden bg-[var(--p-bg-secondary)] text-[var(--p-primary)]" style={{ backgroundImage: "radial-gradient(ellipse at 50% 40%, color-mix(in srgb, var(--p-primary) 18%, transparent), transparent 75%)", maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)" }}>
      <div className="w-3/5 -rotate-6 overflow-hidden rounded-xl border border-current/25 bg-[var(--p-bg-card)] shadow-[var(--p-shadow)]">
        <div className="flex items-center gap-1.5 border-b border-current/15 px-3 py-2.5">
          <span className="size-1.5 rounded-full bg-current opacity-60" /><span className="size-1.5 rounded-full bg-current opacity-40" /><span className="size-1.5 rounded-full bg-current opacity-20" />
          <span className="ml-3 h-1 w-2/5 rounded-full bg-current opacity-15" />
        </div>
        <div className="flex items-center gap-4 p-4 sm:p-6">
          <Code2 className="size-10 shrink-0 opacity-70 sm:size-14" />
          <div className="flex flex-1 flex-col gap-2.5"><span className="h-1.5 w-4/5 rounded-full bg-current opacity-35" /><span className="h-1.5 w-full rounded-full bg-current opacity-15" /><span className="h-1.5 w-3/5 rounded-full bg-current opacity-25" /></div>
        </div>
      </div>
    </div>
  ) : null;
  const imageUrl = [!contain ? thumbnailUrl : undefined, url].find((candidate) => {
    if (!candidate || failedUrls.includes(candidate)) return false;
    try { return ["http:", "https:"].includes(new URL(candidate).protocol); } catch { return false; }
  });
  if (!imageUrl) return fallback;
  const image = (
    <Image
      src={imageUrl}
      alt={alt}
      width={1200}
      height={750}
      unoptimized
      style={cover ? { position: "absolute", inset: 0 } : undefined}
      className={cover
        ? `h-full w-full ${landscapeUrl === imageUrl ? "object-cover" : "object-contain pb-[12%]"}`
        : `w-full rounded-lg bg-[var(--p-bg-secondary)] ${contain ? "max-h-[600px] object-contain" : "aspect-[16/10] object-contain"}`}
      onLoad={(event) => {
        const img = event.currentTarget;
        setLandscapeUrl(img.naturalWidth >= img.naturalHeight ? imageUrl : null);
      }}
      onError={() => setFailedUrls((current) => [...current, imageUrl])}
    />
  );
  if (!cover) return image;
  return <div data-project-cover className="relative aspect-[16/10] w-full shrink-0 bg-[var(--p-bg-secondary)]" style={{ maskImage: `linear-gradient(to bottom, black ${landscapeUrl === imageUrl ? "70%" : "82%"}, transparent 100%)` }}>{image}</div>;
}
