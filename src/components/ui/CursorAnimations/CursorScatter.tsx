"use client";
import { useEffect } from "react";
import "./CursorScatter.css";

export default function CursorScatter() {
  useEffect(() => {
    const coarseMedia = window.matchMedia("(pointer: coarse)");
    const noHoverMedia = window.matchMedia("(hover: none)");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const clearParticles = () => {
      document.querySelectorAll(".cs-particle").forEach((node) => node.remove());
    };

    const isDisabled = () =>
      coarseMedia.matches || noHoverMedia.matches || reducedMotionMedia.matches;

    const handleClick = (e: MouseEvent) => {
      if (isDisabled()) {
        clearParticles();
        return;
      }

      for (let i = 0; i < 6; i++) {
        const angle = (360 / 6) * i;
        const rad = (angle * Math.PI) / 180;
        const dist = 22 + Math.random() * 14;

        const p = document.createElement("div");
        p.className = "cs-particle";
        p.style.left = `${e.clientX}px`;
        p.style.top = `${e.clientY}px`;
        p.style.width = `${10 + Math.random() * 8}px`;
        p.style.setProperty("--ang", `${angle}deg`);
        p.style.setProperty("--tx", `${Math.cos(rad) * dist}px`);
        p.style.setProperty("--ty", `${Math.sin(rad) * dist}px`);

        document.body.appendChild(p);
        p.addEventListener("animationend", () => p.remove(), { once: true });
      }
    };

    const onPreferenceChange = () => {
      if (isDisabled()) clearParticles();
    };

    window.addEventListener("click", handleClick);
    coarseMedia.addEventListener("change", onPreferenceChange);
    noHoverMedia.addEventListener("change", onPreferenceChange);
    reducedMotionMedia.addEventListener("change", onPreferenceChange);

    return () => {
      window.removeEventListener("click", handleClick);
      coarseMedia.removeEventListener("change", onPreferenceChange);
      noHoverMedia.removeEventListener("change", onPreferenceChange);
      reducedMotionMedia.removeEventListener("change", onPreferenceChange);
      clearParticles();
    };
  }, []);

  return null;
}
