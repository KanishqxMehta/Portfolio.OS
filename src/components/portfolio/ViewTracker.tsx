"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ slug }: { slug: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per mount to prevent strict mode double-firing
    if (tracked.current) return;
    tracked.current = true;

    // Send view anonymously
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(console.error); // Silently catch errors
  }, [slug]);

  return null;
}
