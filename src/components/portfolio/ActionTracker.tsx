"use client";

import { useEffect } from "react";
import type { EngagementTarget } from "@/lib/engagement";

export function ActionTracker({ slug, targets }: { slug: string; targets: EngagementTarget[] }) {
  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    let visitorSessionId: string;
    try {
      visitorSessionId = sessionStorage.getItem("portfolio_action_session") || crypto.randomUUID();
      sessionStorage.setItem("portfolio_action_session", visitorSessionId);
    } catch { visitorSessionId = crypto.randomUUID(); }
    const recent = new Map<string, number>();
    const track = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || (event.type === "auxclick" && event.button !== 1)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const candidates = targets.filter((item) => {
        if (link.dataset.engagementAction && link.dataset.engagementAction !== item.action) return false;
        try { return new URL(item.href, location.origin).href === link.href; } catch { return false; }
      });
      const match = candidates.find((item) => item.projectId === link.dataset.projectId) || candidates[0];
      if (!match) return;
      const key = `${match.action}:${match.projectId || match.target || ""}`;
      if (Date.now() - (recent.get(key) || 0) < 1000) return;
      recent.set(key, Date.now());
      const body = JSON.stringify({ id: crypto.randomUUID(), slug, visitorSessionId, action: match.action, projectId: match.projectId, target: match.target });
      // Analytics must never delay navigation or display an error to visitors.
      void fetch("/api/engagement", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
    };
    document.addEventListener("click", track);
    document.addEventListener("auxclick", track);
    return () => { document.removeEventListener("click", track); document.removeEventListener("auxclick", track); };
  }, [slug, targets]);
  return null;
}
