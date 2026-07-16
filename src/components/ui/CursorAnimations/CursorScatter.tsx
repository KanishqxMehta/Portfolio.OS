"use client";
import { useEffect } from "react";
import "./CursorScatter.css";

export default function CursorScatter() {
  useEffect(() => {
    const touchDevice = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window;
    if (touchDevice) return;

    const handleClick = (e: MouseEvent) => {
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
        p.addEventListener("animationend", () => p.remove());
      }
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}