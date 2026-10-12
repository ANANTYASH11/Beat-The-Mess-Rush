'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ThaliScene = dynamic(
  () => import('@/components/three/ThaliScene'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square max-w-[520px] mx-auto bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
            Loading 3D Thali…
          </span>
        </div>
      </div>
    ),
  }
);

interface HomeHeroThaliProps {
  queueCount: number;
  waitRange: string;
  expectedPlates: number;
  wasteSavedKg?: number;
}

export function HomeHeroThali(props: HomeHeroThaliProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-transparent select-none overflow-visible">
      {/* 
        Single wrapper (position: relative, aspect-ratio: 1, overflow: visible)
        Contains the saffron sun, concentric ink ring, and 3D canvas
      */}
      <div className="relative w-full aspect-square max-w-[500px] sm:max-w-[520px] flex items-center justify-center overflow-visible">
        {/* Soft warm glow behind the sun in dark mode so the black thali does not disappear */}
        <div
          aria-hidden="true"
          className="absolute w-[96%] aspect-square rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 dark:opacity-100 transition-opacity duration-300 z-0"
          style={{
            background: 'radial-gradient(circle, rgba(242, 140, 27, 0.32) 0%, rgba(184, 137, 58, 0.16) 48%, transparent 72%)',
          }}
        />

        {/* Concentric 2px ink ring: 6% larger than the 82% sun = 88% diameter, same center */}
        <div
          aria-hidden="true"
          className="absolute w-[88%] aspect-square rounded-full border-2 border-ink dark:border-cream/35 pointer-events-none z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        {/* 
          The Saffron Sun: complete circle (#F28C1B), centred, diameter 82% of wrapper.
          Hard offset shadow on the sun in light mode (10px 10px 0 #14110F).
        */}
        <div
          aria-hidden="true"
          className="absolute w-[82%] aspect-square rounded-full bg-[#F28C1B] pointer-events-none z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[10px_10px_0px_#14110F] dark:shadow-none dark:opacity-90 transition-all"
        />

        {/* 3D Thali (Z-10, centered on the sun) */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <ThaliScene {...props} />
        </div>
      </div>

      {/* ── Caption below the wrapper: Fraunces italic with a small curved ink arrow ── */}
      <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 select-none pointer-events-none z-20">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-ink dark:text-cream/90 -rotate-12 flex-shrink-0"
        >
          <path
            d="M 19 19 C 14 20, 7 16, 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 3 9 L 6 6 L 10 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="font-accent italic text-base sm:text-lg text-ink dark:text-cream tracking-wide">
          Hover a katori. Tap to enter.
        </span>
      </div>
    </div>
  );
}

export default HomeHeroThali;
