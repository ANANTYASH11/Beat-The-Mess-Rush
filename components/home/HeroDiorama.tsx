'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MessDioramaCanvas = dynamic(
  () => import('@/components/diorama/MessDioramaCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] bg-warm-grey-100 rounded-panel animate-pulse flex items-center justify-center border border-warm-grey-200">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-ink-muted">Loading 3D Mess Hall…</span>
        </div>
      </div>
    ),
  }
);

interface HeroDioramaProps {
  queueCount: number;
  serviceRate: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  waitTime: string;
}

export function HeroDiorama(props: HeroDioramaProps) {
  return (
    <div className="w-full h-[440px] md:h-[500px]">
      <MessDioramaCanvas {...props} />
    </div>
  );
}
