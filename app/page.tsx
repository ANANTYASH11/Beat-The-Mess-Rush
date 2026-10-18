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
import { university } from '@/config/university';

export default function HomePage() {
  const defaultMess = university.messes[0];
  const { queue } = useQueueStatus(defaultMess.id);
  const { forecast } = useForecast(defaultMess.id);

  const queueCount = queue?.currentQueue ?? 18;
  const waitRange = queue?.waitRange ?? '5-8 MIN';
  const expectedPlates = forecast?.expectedPlates ?? Math.round((defaultMess.seats || 350) * 1.2);
  const crowdStatus = queue?.crowdLevel?.toUpperCase() ?? 'MODERATE';
  const messLabel = queue?.messName
    ? queue.messName.toUpperCase()
    : defaultMess.name.toUpperCase();

  // Dynamic marquee facts from university config
  const marqueeItems = [
    'UniQ: mess ki line ab online!',
    `${expectedPlates} PLATES FORECAST AT ${defaultMess.name.toUpperCase()}`,
    `PEAK RUSH AT ${university.peakWindows.lunch} & ${university.peakWindows.dinner}`,
    'PRE-BOOK 15-MIN EXPRESS MEAL SLOTS',
    'WALK-INS ALWAYS ADMITTED WITHOUT PENALTY',
    `BUILT FOR ${university.shortName.toUpperCase()}`,
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
