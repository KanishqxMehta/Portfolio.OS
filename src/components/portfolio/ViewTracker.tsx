"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ slug }: { slug: string }) {
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    // Only track once per mount to prevent strict mode double-firing
    if (tracked.current === slug || navigator.doNotTrack === "1") return;
    tracked.current = slug;

    // Retrieve or create a persistent visitor session ID
    let sessionId = crypto.randomUUID();
    try {
      sessionId = localStorage.getItem("portfolio_visitor_session_id") || sessionId;
      localStorage.setItem("portfolio_visitor_session_id", sessionId);
    } catch { /* Private browsing may disable storage; use an ephemeral session. */ }

    // Send view anonymously with the session ID
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, visitorSessionId: sessionId }),
      keepalive: true,
    }).catch(() => undefined); // Best effort: navigation must not surface analytics failures.
  }, [slug]);

  return null;
}
