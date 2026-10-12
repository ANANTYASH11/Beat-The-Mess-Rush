'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { useForecast } from '@/hooks/useForecast';

const ThaliScene = dynamic(
  () => import('@/components/three/ThaliScene'),
  {
    ssr: false,
    loading: () => (
      <div className="w-[520px] h-[520px] rounded-full bg-warm-grey-100/50 border-2 border-ink animate-pulse flex items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          Loading 3D Steel Thali…
        </span>
      </div>
    ),
  }
);

export function ThaliLabPage() {
  const { queue } = useQueueStatus('mess-1');
  const { forecast } = useForecast('mess-1');

  const queueCount = queue?.currentQueue ?? 20;
  const waitRange = queue?.waitRange ?? '6-11 min';
  const expectedPlates = forecast?.targetPlates ?? 342;
  const wasteSavedKg = 42;

  return (
    <div className="min-h-screen w-screen bg-bg text-ink flex flex-col items-center justify-center relative overflow-hidden select-none p-4">
      {/* Top Evaluation Tag */}
      <div className="absolute top-6 left-6 z-30">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg-raised border-2 border-ink shadow-offset-sm text-xs font-mono font-bold uppercase text-ink">
          <span className="w-2 h-2 rounded-full bg-curry-leaf" />
          <span>THALI LAB · 3D PROCEDURAL STEEL EVALUATION</span>
        </div>
      </div>

      {/* Full Viewport 3D Steel Thali */}
      <div className="w-full max-w-[800px] h-[75vh] flex items-center justify-center">
        <ThaliScene
          queueCount={queueCount}
          waitRange={waitRange}
          expectedPlates={expectedPlates}
          wasteSavedKg={wasteSavedKg}
          className="w-full h-full"
        />
      </div>

      {/* Bottom Evaluation Guidance */}
      <div className="absolute bottom-6 z-30 text-center">
        <p className="font-mono text-xs text-ink-muted uppercase tracking-wider">
          Hover a katori to lift (+0.25 spring) & release steam · Click to dolly in
        </p>
      </div>
    </div>
  );
}

export default ThaliLabPage;
