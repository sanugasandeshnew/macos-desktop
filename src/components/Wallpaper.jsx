import { useEffect, useRef } from 'react';

const BLOBS = [
  { cx: '15%', cy: '25%', r1: 250, r2: 300, color: 'rgba(130, 80, 200, 0.15)', dur: 18, delay: 0 },
  { cx: '75%', cy: '20%', r1: 200, r2: 350, color: 'rgba(50, 120, 220, 0.12)', dur: 22, delay: 2 },
  { cx: '50%', cy: '60%', r1: 300, r2: 250, color: 'rgba(200, 70, 120, 0.1)', dur: 20, delay: 1 },
  { cx: '25%', cy: '70%', r1: 180, r2: 220, color: 'rgba(80, 200, 150, 0.08)', dur: 25, delay: 3 },
  { cx: '85%', cy: '65%', r1: 220, r2: 180, color: 'rgba(200, 150, 50, 0.08)', dur: 19, delay: 4 },
  { cx: '45%', cy: '35%', r1: 150, r2: 200, color: 'rgba(100, 180, 255, 0.06)', dur: 23, delay: 1.5 },
];

function Blob({ cx, cy, r1, r2, dur, delay, color }) {
  return (
    <ellipse
      cx={cx} cy={cy}
      rx={r1} ry={r2}
      fill={color}
      style={{
        animation: `blobFloat ${dur}s ease-in-out ${delay}s infinite`,
        filter: 'blur(60px)',
      }}
    />
  );
}

export default function Wallpaper() {
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="40%" stopColor="#16213e" />
          <stop offset="70%" stopColor="#0f2027" />
          <stop offset="100%" stopColor="#0d0d1a" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGrad)" />
      {BLOBS.map((b, i) => (
        <Blob key={i} {...b} />
      ))}
    </svg>
  );
}
