'use client';

import React from 'react';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { useForecast } from '@/hooks/useForecast';
import { HeroSection } from '@/components/home/HeroSection';
import { SplitFlap } from '@/components/ui/SplitFlap';
import { Marquee } from '@/components/ui/Marquee';
import { IntroLetterSection } from '@/components/home/IntroLetterSection';
import { ScrollStoryPlaceholder } from '@/components/home/ScrollStoryPlaceholder';
import { LoopDiagram } from '@/components/home/LoopDiagram';

export default function HomePage() {
  const { queue } = useQueueStatus('mess-1');
  const { forecast } = useForecast('mess-1');

  const queueCount = queue?.currentQueue ?? 20;
  const waitRange = queue?.waitRange ?? '6-11 MIN';
  const expectedPlates = forecast?.targetPlates ?? 495;
  const crowdStatus = queue?.crowdLevel?.toUpperCase() ?? 'BUSY';
  const messLabel = queue?.messCode
    ? `MESS ${queue.messCode.replace('mess-', '').toUpperCase()}`
    : 'MESS A';

  // Live marquee facts per brief: "495 plates expected today ★ Lauki wasted 31% ★ Rice cut by 6% ★ Walk-ins always welcome ★ Token 47 now serving"
  const marqueeItems = [
    `${expectedPlates} PLATES EXPECTED TODAY`,
    'LAUKI WASTED 31%',
    'RICE CUT BY 6%',
    'WALK-INS ALWAYS WELCOME',
    'TOKEN 47 NOW SERVING',
  ];

  return (
    <div className="bg-bg text-ink scroll-smooth">
      {/* ── 1. HERO SECTION (12-col grid, clamp headline, hand-cut block, 3D thali + saffron sun) ── */}
      <HeroSection
        queueCount={queueCount}
        waitRange={waitRange}
        expectedPlates={expectedPlates}
        wasteSavedKg={42}
      />

      {/* ── 2. SPLIT-FLAP BOARD (Full width, ONE row on desktop, 2x2 on mobile, CSS 3D flips) ── */}
      <SplitFlap
        messLabel={messLabel}
        queueCount={queueCount}
        waitRange={waitRange}
        crowdStatus={crowdStatus}
      />

      {/* ── 3. SINGLE MARQUEE STRIP (Saffron background, IBM Plex Mono, 40s loop, pauses on hover) ── */}
      <Marquee items={marqueeItems} />

      {/* ── 4. INTRO LETTER (Left 7 cols paper letter with Caveat signature, Right 5 cols big mono numbers) ── */}
      <IntroLetterSection
        queueCount={queueCount}
        expectedPlates={expectedPlates}
        waitMinutes={8}
      />

      {/* ── 5. SCROLL STORY ANCHOR (id="story", min-height: 100vh, Chapter 1 label) ── */}
      <ScrollStoryPlaceholder />

      {/* ── 6. THE DEMAND -> QUEUE -> KITCHEN LOOP DIAGRAM ── */}
      <LoopDiagram />
    </div>
  );
}
