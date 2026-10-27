import type { HTMLAttributes } from "react";
import Image from "next/image";

const PHONE_WIDTH = 433;
const PHONE_HEIGHT = 882;
const SCREEN_X = 21.25;
const SCREEN_Y = 19.25;
const SCREEN_WIDTH = 389.5;
const SCREEN_HEIGHT = 843.5;
const SCREEN_RADIUS = 55.75;

// Proportional placement for inner screen
const LEFT_PCT = (SCREEN_X / PHONE_WIDTH) * 100;
const TOP_PCT = (SCREEN_Y / PHONE_HEIGHT) * 100;
const WIDTH_PCT = (SCREEN_WIDTH / PHONE_WIDTH) * 100;
const HEIGHT_PCT = (SCREEN_HEIGHT / PHONE_HEIGHT) * 100;
const RADIUS_H = (SCREEN_RADIUS / SCREEN_WIDTH) * 100;
const RADIUS_V = (SCREEN_RADIUS / SCREEN_HEIGHT) * 100;

export interface IphoneProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  priority?: boolean;
}

/**
 * Authentic iPhone 15/16 Pro device frame.
 * Pure vector SVG with no GPU mask layers or translateZ hacks,
 * guaranteeing zero compositor tile drops, blackouts, or jittering.
 */
export function Iphone({
  src,
  alt = "Mobile screenshot",
  priority = false,
  className = "",
  style,
  children,
  ...props
}: IphoneProps) {
  const hasMedia = Boolean(src || children);

  return (
    <div
      className={`relative inline-block w-full align-middle select-none ${className}`}
      style={{
        aspectRatio: `${PHONE_WIDTH}/${PHONE_HEIGHT}`,
        ...style,
      }}
      {...props}
    >
      {/* Phone Screen Contents */}
      {hasMedia && (
        <div
          className="absolute z-0 overflow-hidden bg-black"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
            borderRadius: `${RADIUS_H}% / ${RADIUS_V}%`,
          }}
        >
          {children ? (
            children
          ) : src ? (
            <Image
              src={src}
              alt={alt}
              fill
              unoptimized
              priority={priority}
              className="block h-full w-full object-cover object-top"
            />
          ) : null}
        </div>
      )}

      {/* Titanium Frame SVG overlay (pure vector geometry, transparent screen center) */}
      <svg
        viewBox={`0 0 ${PHONE_WIDTH} ${PHONE_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 size-full z-10"
        aria-hidden="true"
      >
        {/* Outer Titanium Chassis Rim */}
        <rect
          x="4"
          y="3"
          width="425"
          height="876"
          rx="72"
          className="stroke-zinc-400/90 dark:stroke-zinc-600/90"
          strokeWidth="4"
        />

        {/* Screen Bezel Ring */}
        <rect
          x={SCREEN_X}
          y={SCREEN_Y}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          rx={SCREEN_RADIUS}
          className="stroke-zinc-950/80 dark:stroke-zinc-800/80"
          strokeWidth="6"
        />

        {/* Action Button (left) */}
        <rect x="0" y="170" width="4" height="34" rx="2" className="fill-zinc-400 dark:fill-zinc-600" />

        {/* Volume Up (left) */}
        <rect x="0" y="233" width="4" height="67" rx="2" className="fill-zinc-400 dark:fill-zinc-600" />

        {/* Volume Down (left) */}
        <rect x="0" y="318" width="4" height="67" rx="2" className="fill-zinc-400 dark:fill-zinc-600" />

        {/* Power / Siri Button (right) */}
        <rect x="429" y="279" width="4" height="106" rx="2" className="fill-zinc-400 dark:fill-zinc-600" />

        {/* Top Speaker Ear Slit */}
        <rect x="174" y="6" width="85" height="4" rx="2" className="fill-zinc-500/70 dark:fill-zinc-400/70" />

        {/* Dynamic Island Pill */}
        <rect
          x="154"
          y="32"
          width="125"
          height="35"
          rx="17.5"
          className="fill-black"
        />

        {/* Dynamic Island Front Camera Ring */}
        <circle cx="259" cy="49.5" r="9.5" className="fill-zinc-950" />
        <circle cx="259" cy="49.5" r="5" className="fill-zinc-800" />
      </svg>
    </div>
  );
}
