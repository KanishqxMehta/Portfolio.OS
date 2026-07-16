"use client";
import { useEffect, useRef, useState } from "react";
import './SmoothCursor.css';

export default function SmoothCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const touchDevice = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window;
    if (touchDevice) {
      setIsMobile(true);
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      cursor.style.opacity = "1";
    };

    const onLeave = () => cursor.style.opacity = "0";
    const onDown = () => cursor.style.transform += " scale(0.85)";
    const onUp = () => {};

    const loop = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.22;
      current.current.y += (pos.current.y - current.current.y) * 0.22;
      cursor.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`;
      raf.current = requestAnimationFrame(loop);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    raf.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="smooth-cursor" aria-hidden="true">
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