'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ThaliFallbackSVG } from '@/components/three/ThaliFallbackSvg';

const ThaliScene = dynamic(
  () => import('@/components/three/ThaliScene'),
  {
    ssr: false,
    loading: () => null,
  }
);

interface HomeHeroThaliProps {
  queueCount: number;
  waitRange: string;
  expectedPlates: number;
  wasteSavedKg?: number;
}

export function HomeHeroThali(props: HomeHeroThaliProps) {
  const [load3D, setLoad3D] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    // Check saved user preference first
    const saved = localStorage.getItem('uniq_thali_mode') as '3d' | '2d' | null;
    if (saved === '3d') {
      setLoad3D(true);
      return;
    } else if (saved === '2d') {
      setLoad3D(false);
      return;
    }

    // Check basic WebGL support
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      hasWebGL = false;
    }

    if (!hasWebGL) {
      setLoad3D(false);
      return;
    }

    // Only bypass automatic 3D on tiny screens (< 640px) or explicit save-data
    const nav = navigator as any;
    const isSmallScreen = window.innerWidth < 640;
    const isSaveData = Boolean(nav.connection?.saveData || nav.connection?.effectiveType === 'slow-2g');

    if (isSmallScreen || isSaveData) {
      setLoad3D(false);
      return;
    }

    // Standard Desktop / Tablet: load 3D directly!
    setLoad3D(true);
  }, []);

  const toggle3D = (targetMode: '3d' | '2d') => {
    setLoad3D(targetMode === '3d');
    try {
      localStorage.setItem('uniq_thali_mode', targetMode);
    } catch {
      // ignore localStorage quota errors
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-transparent select-none overflow-visible">
      {/* 
        Single wrapper (position: relative, aspect-ratio: 1, overflow: visible)
        Contains the saffron sun, concentric ink ring, and 3D canvas / SVG fallback
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

        {/* Thali: 3D procedural steel on capable devices with smooth fallback */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {load3D ? (
            <React.Suspense
              fallback={
                <ThaliFallbackSVG
                  queueCount={props.queueCount}
                  waitRange={props.waitRange}
                  expectedPlates={props.expectedPlates}
                  wasteSavedKg={props.wasteSavedKg}
                />
              }
            >
              <ThaliScene {...props} />
            </React.Suspense>
          ) : (
            <ThaliFallbackSVG
              queueCount={props.queueCount}
              waitRange={props.waitRange}
              expectedPlates={props.expectedPlates}
              wasteSavedKg={props.wasteSavedKg}
            />
          )}
        </div>
      </div>

      {/* ── Caption & Interactive 3D / 2D Toggle ── */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 select-none z-20">
        <div className="flex items-center justify-center gap-2 pointer-events-none">
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
            {load3D ? 'Interactive 3D Thali · Hover to lift' : 'Hover a katori. Tap to enter.'}
          </span>
        </div>

        {/* 3D / 2D Toggle Switch */}
        {mounted && (
          <div className="flex items-center gap-1 bg-bg-raised border-2 border-ink rounded-lg p-0.5 text-xs font-mono font-bold shadow-sm">
            <button
              type="button"
              onClick={() => toggle3D('3d')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                load3D
                  ? 'bg-ink text-bg font-black'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Switch to 3D procedural steel thali"
            >
              ✦ 3D Thali
            </button>
            <button
              type="button"
              onClick={() => toggle3D('2d')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                !load3D
                  ? 'bg-ink text-bg font-black'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Switch to 2D simplified view"
            >
              2D SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeHeroThali;
