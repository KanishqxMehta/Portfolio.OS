"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ slug }: { slug: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per mount to prevent strict mode double-firing
    if (tracked.current) return;
    tracked.current = true;

    // Retrieve or create a persistent visitor session ID
    let sessionId = localStorage.getItem("portfolio_visitor_session_id");
    if (!sessionId) {
      sessionId = "vs_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("portfolio_visitor_session_id", sessionId);
    }

    // Send view anonymously with the session ID
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, visitorSessionId: sessionId }),
    }).catch(console.error); // Silently catch errors
  }, [slug]);

  return null;
}
