'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Flat illustration 1: Phone with slot pill (Demand)
function DemandIllustration() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" className="text-ink">
      {/* Phone body */}
      <rect x="18" y="8" width="32" height="52" rx="6" fill="#FAF5E9" stroke="#14110F" strokeWidth="2.5" />
      {/* Screen speaker notch */}
      <line x1="28" y1="13" x2="40" y2="13" stroke="#14110F" strokeWidth="2" strokeLinecap="round" />
      {/* Slot selection pill */}
      <rect x="22" y="24" width="24" height="12" rx="6" fill="#F28C1B" stroke="#14110F" strokeWidth="2" />
      <circle cx="27" cy="30" r="2" fill="#14110F" />
      <line x1="32" y1="30" x2="41" y2="30" stroke="#14110F" strokeWidth="2" strokeLinecap="round" />
      {/* Secondary pills */}
      <rect x="22" y="40" width="24" height="6" rx="3" fill="#E2E4E8" stroke="#14110F" strokeWidth="1.5" />
    </svg>
  );
}

// Flat illustration 2: Serving counter with dot-people (Queue)
function QueueIllustration() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" className="text-ink">
      {/* Stainless counter surface */}
      <rect x="8" y="38" width="52" height="18" rx="2" fill="#FAF5E9" stroke="#14110F" strokeWidth="2.5" />
      <line x1="8" y1="44" x2="60" y2="44" stroke="#14110F" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* 3 Dot-people waiting in tidy line */}
      <circle cx="20" cy="22" r="5" fill="#2F6B3A" stroke="#14110F" strokeWidth="2" />
      <path d="M 14 36 C 14 29, 26 29, 26 36" stroke="#14110F" strokeWidth="2" fill="#2F6B3A" />

      <circle cx="34" cy="22" r="5" fill="#FAF5E9" stroke="#14110F" strokeWidth="2" />
      <path d="M 28 36 C 28 29, 40 29, 40 36" stroke="#14110F" strokeWidth="2" fill="#FAF5E9" />

      <circle cx="48" cy="22" r="5" fill="#FAF5E9" stroke="#14110F" strokeWidth="2" />
      <path d="M 42 36 C 42 29, 54 29, 54 36" stroke="#14110F" strokeWidth="2" fill="#FAF5E9" />
    </svg>
  );
}

// Flat illustration 3: Cooking pot with scale (Kitchen)
function KitchenIllustration() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" className="text-ink">
      {/* Degchi / Pot body */}
      <path
        d="M 16 26 C 16 38, 52 38, 52 26 L 50 18 L 18 18 Z"
        fill="#FAF5E9"
        stroke="#14110F"
        strokeWidth="2.5"
      />
      {/* Pot handles */}
      <path d="M 14 20 L 10 23 L 14 26" stroke="#14110F" strokeWidth="2" strokeLinecap="round" />
      <path d="M 54 20 L 58 23 L 54 26" stroke="#14110F" strokeWidth="2" strokeLinecap="round" />
      {/* Scale platform below */}
      <rect x="12" y="44" width="44" height="14" rx="3" fill="#D7312B" stroke="#14110F" strokeWidth="2" />
      {/* Dial circular gauge */}
      <circle cx="34" cy="51" r="4" fill="#FAF5E9" stroke="#14110F" strokeWidth="1.5" />
      <line x1="34" y1="51" x2="36" y2="49" stroke="#14110F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LoopDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 35%'],
  });

  // Looping arrow draws itself with SVG stroke-dashoffset tied to scroll progress
  const pathLength = useTransform(scrollYProgress, [0.15, 0.95], [0, 1]);

  const stations = [
    {
      step: '01',
      title: 'DEMAND',
      subtitle: 'Slot & Portion Booking',
      Illustration: DemandIllustration,
      href: '/student',
      badge: 'Student Express',
      descLine1: 'Students select their arrival window before leaving the hostel room.',
      descLine2: 'Walk-ins are capped to 24 per 15-minute slot to prevent surges.',
    },
    {
      step: '02',
      title: 'QUEUE',
      subtitle: 'Controlled Flow',
      Illustration: QueueIllustration,
      href: '/staff',
      badge: 'Staff Deck',
      descLine1: 'Arrivals are spread evenly across eight staggered slots.',
      descLine2: 'Counter line stays under 20 and average wait drops to 6–11 minutes.',
    },
    {
      step: '03',
      title: 'KITCHEN',
      subtitle: 'Prep & Waste Weigh-in',
      Illustration: KitchenIllustration,
      href: '/kitchen',
      badge: 'Cook Deck',
      descLine1: 'Cooks see booked plate tallies hours before lunch service begins.',
      descLine2: 'Plate return bins are weighed to adjust tomorrow’s batch sizes.',
    },
  ];

  return (
    <section
      ref={containerRef}
      className="py-14 lg:py-24 max-w-[1280px] mx-auto px-6 relative"
    >
      {/* ── Section Header with Eyebrow ── */}
      <div className="mb-14">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-saffron mb-2">
          03 / The Closed System
        </div>
        <h2 className="font-condensed text-4xl sm:text-5xl lg:text-6xl text-ink uppercase tracking-tight leading-none">
          DEMAND <span className="text-saffron">→</span> QUEUE <span className="text-saffron">→</span> KITCHEN
        </h2>
        <p className="font-accent italic text-base sm:text-lg text-ink-muted mt-3">
          How pre-booked arrival slots spread the rush and automatically tune prep quantities.
        </p>
      </div>

      {/* ── Three Stations on Hand-Drawn Dotted Path ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {stations.map((st, idx) => {
          const Illus = st.Illustration;
          return (
            <Link
              key={st.step}
              href={st.href}
              className="bg-bg-raised border-2 border-ink shadow-offset-md p-6 sm:p-8 flex flex-col justify-between relative group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-offset-sm transition-all select-none"
            >
              <div>
                {/* Step number and badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-full border-2 border-ink font-mono font-bold text-xs flex items-center justify-center bg-saffron text-ink">
                    {st.step}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-ink/40 bg-warm-grey-100 dark:bg-black/40 text-ink">
                    {st.badge}
                  </span>
                </div>

                {/* Flat Illustration with 2px ink outline */}
                <div className="mb-4 flex items-center justify-start">
                  <div className="p-2 border-2 border-ink bg-bg shadow-[2px_2px_0px_#14110F] dark:shadow-[2px_2px_0px_#F4ECD8]">
                    <Illus />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-condensed text-3xl tracking-wide uppercase text-ink group-hover:text-saffron transition-colors">
                  {st.title}
                </h3>
                <div className="font-mono text-xs font-semibold text-saffron uppercase mb-3">
                  {st.subtitle}
                </div>

                {/* 2-line plain description per brief */}
                <div className="font-body text-sm text-ink-muted space-y-1">
                  <p>{st.descLine1}</p>
                  <p>{st.descLine2}</p>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-between text-xs font-mono font-bold text-ink uppercase group-hover:text-saffron transition-colors">
                <span>Inspect module</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── SVG Looping Arrow (Kitchen back to Demand) with Scroll-Drawn Stroke & Travelling Dot ── */}
      <div className="mt-10 relative hidden md:block select-none pointer-events-none">
        <svg
          viewBox="0 0 1100 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto overflow-visible"
        >
          {/* Hand-drawn dotted path track */}
          <path
            id="feedback-loop-track"
            d="M 940 20 C 940 100, 160 100, 160 20"
            stroke="#14110F"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            strokeOpacity="0.25"
          />

          {/* Animated drawing looping stroke tied to scroll progress */}
          <motion.path
            d="M 940 20 C 940 100, 160 100, 160 20"
            stroke="#F28C1B"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              pathLength,
            }}
          />

          {/* Loop Arrow head at Demand (Station 01) */}
          <path
            d="M 152 36 L 160 18 L 168 36"
            stroke="#F28C1B"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Small saffron dot that travels along the path continuously */}
          <circle r="5" fill="#F28C1B" stroke="#14110F" strokeWidth="1.5">
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              path="M 940 20 C 940 100, 160 100, 160 20"
            />
          </circle>
        </svg>

        {/* Feedback loop label */}
        <div className="text-center -mt-3">
          <span className="inline-block px-4 py-1.5 bg-bg-raised border-2 border-ink shadow-offset-sm text-xs font-mono font-bold uppercase text-ink">
            Feedback Loop: Kitchen leftover weights recalibrate tomorrow’s student batch size
          </span>
        </div>
      </div>
    </section>
  );
}

export default LoopDiagram;
