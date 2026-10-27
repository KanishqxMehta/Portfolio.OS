"use client";
import { useEffect, useRef } from "react";
import "./SmoothCursor.css";

const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"]';

export default function SmoothCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);
  const pressed = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const coarseMedia = window.matchMedia("(pointer: coarse)");
    const noHoverMedia = window.matchMedia("(hover: none)");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const isDisabledEnvironment = () =>
      coarseMedia.matches ||
      noHoverMedia.matches ||
      reducedMotionMedia.matches;

    const stopAnimation = () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = 0;
      }
      cursor.setAttribute("data-animating", "false");
    };

    const deactivate = (hideDisplay = false) => {
      stopAnimation();
      document.documentElement.classList.remove("custom-cursor-active");
      cursor.style.opacity = "0";
      if (hideDisplay || isDisabledEnvironment()) {
        cursor.style.display = "none";
      }
    };

    const syncEnvironment = () => {
      if (isDisabledEnvironment()) {
        deactivate(true);
      } else {
        cursor.style.display = "block";
      }
    };

    syncEnvironment();

    const applyTransform = () => {
      const scale = pressed.current ? " scale(0.85)" : "";
      cursor.style.transform = `translate(${current.current.x}px, ${current.current.y}px)${scale}`;
    };

    const loop = () => {
      const dx = pos.current.x - current.current.x;
      const dy = pos.current.y - current.current.y;

      if (Math.hypot(dx, dy) <= 0.4) {
        current.current.x = pos.current.x;
        current.current.y = pos.current.y;
        applyTransform();
        raf.current = 0;
        cursor.setAttribute("data-animating", "false");
        return;
      }

      current.current.x += dx * 0.35;
      current.current.y += dy * 0.35;
      applyTransform();
      raf.current = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      if (isDisabledEnvironment() || document.hidden) {
        deactivate(true);
        return;
      }

      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(EDITABLE_SELECTOR)) {
        deactivate(false);
        return;
      }

      pos.current = { x: e.clientX, y: e.clientY };
      if (!initialized.current) {
        current.current = { x: e.clientX, y: e.clientY };
        initialized.current = true;
      }

      cursor.style.display = "block";
      cursor.style.opacity = "1";
      document.documentElement.classList.add("custom-cursor-active");

      if (!raf.current) {
        cursor.setAttribute("data-animating", "true");
        raf.current = requestAnimationFrame(loop);
      }
    };

    const onLeave = () => deactivate(false);
    const onKeyDown = () => deactivate(false);
    const onTouchStart = () => deactivate(true);
    const onVisibilityChange = () => {
      if (document.hidden) deactivate(false);
    };

    const onDown = () => {
      if (!document.documentElement.classList.contains("custom-cursor-active")) return;
      pressed.current = true;
      applyTransform();
    };

    const onUp = () => {
      if (!pressed.current) return;
      pressed.current = false;
      if (document.documentElement.classList.contains("custom-cursor-active")) {
        applyTransform();
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    coarseMedia.addEventListener("change", syncEnvironment);
    noHoverMedia.addEventListener("change", syncEnvironment);
    reducedMotionMedia.addEventListener("change", syncEnvironment);

    return () => {
      deactivate(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      coarseMedia.removeEventListener("change", syncEnvironment);
      noHoverMedia.removeEventListener("change", syncEnvironment);
      reducedMotionMedia.removeEventListener("change", syncEnvironment);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="smooth-cursor"
      data-animating="false"
      aria-hidden="true"
    >
      <svg
        width="20"
        height="24"
        viewBox="0 0 20 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 2L19 10.5L11.5 13L8 21Q7.4 22.2 6.5 20.8L3 2Z"
          fill="white"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
