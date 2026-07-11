import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Layer */}
          <path
            d="M 16,18 L 24,22 L 16,26 L 8,22 Z"
            stroke="#a1a1aa"
            fill="none"
            strokeWidth="1.5"
          />
          {/* Middle Layer */}
          <path
            d="M 16,12 L 24,16 L 16,20 L 8,16 Z"
            stroke="#52525b"
            fill="#e4e4e7"
            strokeWidth="1.5"
          />
          {/* Top Layer */}
          <path
            d="M 16,6 L 24,10 L 16,14 L 8,10 Z"
            stroke="#09090b"
            fill="#ede9fe"
            strokeWidth="1.5"
          />
          {/* Core Dot */}
          <circle
            cx="16"
            cy="10"
            r="1.5"
            fill="#8b5cf6"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
