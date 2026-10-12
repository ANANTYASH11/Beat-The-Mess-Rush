'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface IntroLetterSectionProps {
  queueCount: number;
  expectedPlates: number;
  waitMinutes?: number;
}

// Animated counting number that triggers when scrolled into view
function CountUpNumber({
  value,
  duration = 1.2,
  suffix = '',
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const stepTime = Math.max(16, (duration * 1000) / (end || 1));
    const step = Math.max(1, Math.ceil(end / (duration * 60)));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
}

export function IntroLetterSection({
  queueCount,
  expectedPlates,
  waitMinutes = 8,
}: IntroLetterSectionProps) {
  return (
    <section className="py-14 lg:py-24 max-w-[1280px] mx-auto px-6">
      {/* ── Section Header with Mono Eyebrow and Bebas Title ── */}
      <div className="mb-12">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-saffron mb-2">
          01 / Why this exists
        </div>
        <h2 className="font-condensed text-4xl sm:text-5xl lg:text-6xl text-ink uppercase tracking-tight leading-none">
          THE ORIGIN OF BEAT THE RUSH
        </h2>
      </div>

      {/* ── 12-Column Grid: Left 7 cols (Letter) + Right 5 cols (Big Mono Stats) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* ── Left 7 Columns: Paper Letter Card ── */}
        <div className="lg:col-span-7">
          <div
            className="relative bg-[#ECE4CE] dark:bg-[#231F1C] border-2 border-ink dark:border-cream p-8 sm:p-12 shadow-offset-lg transition-transform duration-300"
            style={{
              transform: 'rotate(-0.6deg)', // Very slight 0.6 degree tilt per brief
            }}
          >
            {/* Small Translucent Tape Piece on Top */}
            <div
              aria-hidden="true"
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-white/70 dark:bg-white/20 border-t border-b border-ink/20 shadow-sm rotate-[1deg] pointer-events-none"
            />

            {/* EDIT ME: personal intro */}
            <blockquote className="font-accent text-lg sm:text-xl text-ink leading-relaxed mb-8">
              “I built this after standing in the 40-minute lunch queue at our hostel on a hot Tuesday
              during mid-term exams. The kitchen staff weren’t slow — 280 students simply showed up
              within the exact same 15 minutes. By giving every wing a staggered 15-minute window and
              reporting plate tallies to the cook early, both the queue and the leftover waste vanished.”
            </blockquote>

            {/* Handwritten Signature in Caveat */}
            <div className="flex flex-col items-end pt-4 border-t border-ink/20">
              <span className="font-handwriting text-3xl sm:text-4xl text-saffron font-bold tracking-wide">
                — Aditya K.
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-1">
                Hostel 4 Resident · Senior (22CS014)
              </span>
            </div>
          </div>
        </div>

        {/* ── Right 5 Columns: Three Big Mono Numbers with Small Labels (No Cards) ── */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8 sm:space-y-10 lg:pl-6">
          {/* Stat 1: Queue Now */}
          <div>
            <div className="text-6xl sm:text-7xl font-mono font-bold text-ink leading-none">
              <CountUpNumber value={queueCount} />
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-2 font-semibold">
              Students in queue right now
            </div>
          </div>

          {/* Stat 2: Expected Plates Today */}
          <div>
            <div className="text-6xl sm:text-7xl font-mono font-bold text-saffron leading-none">
              <CountUpNumber value={expectedPlates} />
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-2 font-semibold">
              Plates forecast for today’s lunch
            </div>
          </div>

          {/* Stat 3: Estimated Wait Time */}
          <div>
            <div className="text-6xl sm:text-7xl font-mono font-bold text-curry-leaf leading-none">
              <CountUpNumber value={waitMinutes} suffix=" MIN" />
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-2 font-semibold">
              Average wait with pre-booked slot
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntroLetterSection;
