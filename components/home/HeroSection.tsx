'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HomeHeroThali } from './HomeHeroThali';

interface HeroSectionProps {
  queueCount: number;
  waitRange: string;
  expectedPlates: number;
  wasteSavedKg?: number;
}

export function HeroSection({
  queueCount,
  waitRange,
  expectedPlates,
  wasteSavedKg = 42,
}: HeroSectionProps) {
  return (
    <section className="min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] lg:max-h-[860px] flex items-center max-w-[1280px] mx-auto px-4 sm:px-6 py-6 lg:py-0 overflow-visible">
      <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* ── Left 5 Columns: Tidy Hierarchy ── */}
        <div className="w-full lg:col-span-5 flex flex-col justify-center space-y-4 lg:space-y-5 order-1">
          {/* 1. Small "Simulated data" stamp */}
          <div>
            <span className="rubber-stamp text-saffron border-saffron bg-saffron/10 text-xs px-2.5 py-1">
              SIMULATED DATA
            </span>
          </div>

          {/* 
            2. Headline: clamp(88px, 9.5vw, 150px), Bebas Neue, line-height 0.9
            Three lines: "BEAT THE" / "MESS" / "RUSH"
            "RUSH" on saffron hand-cut block, ink text on saffron
            On cream, the headline is ink #14110F; in dark mode, cream #F4ECD8
          */}
          <div className="select-none">
            <h1
              className="font-condensed uppercase tracking-tight font-normal text-left"
              style={{
                fontSize: 'clamp(88px, 9.5vw, 150px)',
                lineHeight: 0.9,
              }}
            >
              {/* Line 1: BEAT THE */}
              <span className="block text-[#14110F] dark:text-[#F4ECD8]">
                BEAT THE
              </span>

              {/* Line 2: MESS */}
              <span className="block text-[#14110F] dark:text-[#F4ECD8]">
                MESS
              </span>

              {/* Line 3: RUSH on saffron block */}
              <span className="block overflow-visible pt-1">
                <span
                  className="hand-cut-block text-[#14110F] bg-[#F28C1B] inline-block px-3.5 py-0.5 border-2 border-[#14110F] shadow-[3px_3px_0px_#14110F] dark:shadow-[3px_3px_0px_#F4ECD8]"
                  style={{
                    clipPath: 'polygon(1% 4%, 99% 1%, 98% 96%, 2% 99%)',
                  }}
                >
                  RUSH
                </span>
              </span>
            </h1>
          </div>

          {/* 3. Fraunces italic subhead */}
          <p className="font-accent italic text-lg sm:text-xl text-[#5A534C] dark:text-[#B8B0A2] leading-snug">
            Staggered arrival slots that eliminate lunchtime queues and cut mess waste.
          </p>

          {/* 4. Two Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {/* Book a slot: Saffron fill, ink border, hard shadow */}
            <Link
              href="/student"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#F28C1B] text-[#14110F] font-mono font-bold text-sm uppercase tracking-wider border-2 border-[#14110F] shadow-[3px_3px_0px_#14110F] dark:shadow-[3px_3px_0px_#F4ECD8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#14110F] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
            >
              Book a slot
            </Link>

            {/* Staff deck: Ink outline with hard-shadow press state */}
            <Link
              href="/staff"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent text-[#14110F] dark:text-[#F4ECD8] font-mono font-bold text-sm uppercase tracking-wider border-2 border-[#14110F] dark:border-[#F4ECD8] shadow-[2px_2px_0px_#14110F] dark:shadow-[2px_2px_0px_#F4ECD8] hover:bg-bg-raised hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <span>Staff deck</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── Right 7 Columns (3D Matte Black Thali on Saffron Sun) ── */}
        <div className="w-full lg:col-span-7 flex flex-col items-center justify-center order-2 overflow-visible">
          <HomeHeroThali
            queueCount={queueCount}
            waitRange={waitRange}
            expectedPlates={expectedPlates}
            wasteSavedKg={wasteSavedKg}
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
