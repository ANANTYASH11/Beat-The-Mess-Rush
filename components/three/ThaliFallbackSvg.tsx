'use client';

import React from 'react';
import Link from 'next/link';

interface ThaliFallbackProps {
  queueCount?: number;
  waitRange?: string;
  expectedPlates?: number;
  wasteSavedKg?: number;
}

export function ThaliFallbackSVG({
  queueCount = 20,
  waitRange = '6-11 min',
  expectedPlates = 342,
  wasteSavedKg = 42,
}: ThaliFallbackProps) {
  return (
    <div
      className="relative w-full aspect-square max-w-[560px] mx-auto flex items-center justify-center select-none"
      aria-label="Interactive 2D top-down view of stainless steel hostel mess thali"
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="thaliPlateGrad" cx="46%" cy="42%" r="56%">
            <stop offset="0%" stopColor="#E6EAEE" />
            <stop offset="70%" stopColor="#C4CAD2" />
            <stop offset="100%" stopColor="#A2A8B2" />
          </radialGradient>
          <radialGradient id="katoriSteelGrad" cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#F2F5F8" />
            <stop offset="75%" stopColor="#CBD1DA" />
            <stop offset="100%" stopColor="#ACB2BC" />
          </radialGradient>
          <radialGradient id="dalAmberGrad" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#F5A623" />
            <stop offset="80%" stopColor="#D98200" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
        </defs>

        {/* Soft Contact Shadow beneath plate */}
        <ellipse cx="250" cy="265" rx="222" ry="216" fill="#14110F" opacity="0.14" />

        {/* Outer Steel Plate Rim */}
        <circle cx="250" cy="250" r="226" fill="url(#thaliPlateGrad)" stroke="#14110F" strokeWidth="2.5" />
        <circle cx="250" cy="250" r="215" stroke="#FFFFFF" strokeWidth="2" opacity="0.65" />
        <circle cx="250" cy="250" r="196" stroke="#878D96" strokeWidth="1" />

        {/* ── Katori 1: STUDENT (Dal Tadka) Top Left ── */}
        <g>
          <circle cx="160" cy="150" r="56" fill="url(#katoriSteelGrad)" stroke="#14110F" strokeWidth="2" />
          <circle cx="160" cy="150" r="50" fill="url(#dalAmberGrad)" />
          {/* Swirl */}
          <path d="M142 144 Q 160 135 178 152" stroke="#FDF6E2" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <circle cx="152" cy="148" r="2.5" fill="#B91C1C" />
          <circle cx="168" cy="154" r="2" fill="#14110F" />
        </g>

        {/* ── Katori 2: STAFF (Curd / Dahi) Top Right ── */}
        <g>
          <circle cx="338" cy="150" r="50" fill="url(#katoriSteelGrad)" stroke="#14110F" strokeWidth="2" />
          <circle cx="338" cy="150" r="44" fill="#FAF8F2" />
          <circle cx="338" cy="150" r="3.5" fill="#F28C1B" />
        </g>

        {/* ── Katori 3: KITCHEN (Sabzi Aloo Gobi) Bottom Left ── */}
        <g>
          <circle cx="144" cy="308" r="52" fill="url(#katoriSteelGrad)" stroke="#14110F" strokeWidth="2" />
          <circle cx="144" cy="308" r="46" fill="#E5A93C" />
          {/* Veg pieces */}
          <rect x="134" y="298" width="13" height="13" rx="2" fill="#D75B1B" />
          <circle cx="155" cy="302" r="7" fill="#EADBBA" />
          <circle cx="136" cy="318" r="5" fill="#2F6B3A" />
          <circle cx="154" cy="318" r="4.5" fill="#D75B1B" />
          <circle cx="146" cy="310" r="5" fill="#2F6B3A" />
        </g>

        {/* ── Katori 4: IMPACT (Jeera Rice) Bottom Right ── */}
        <g>
          <circle cx="346" cy="308" r="55" fill="url(#katoriSteelGrad)" stroke="#14110F" strokeWidth="2" />
          <circle cx="346" cy="308" r="49" fill="#FFFDF7" />
          {/* Jeera seeds */}
          <ellipse cx="338" cy="300" rx="3.5" ry="1.5" fill="#3A2718" transform="rotate(25 338 300)" />
          <ellipse cx="354" cy="306" rx="3.5" ry="1.5" fill="#3A2718" transform="rotate(-30 354 306)" />
          <ellipse cx="343" cy="316" rx="3.5" ry="1.5" fill="#3A2718" transform="rotate(15 343 316)" />
        </g>

        {/* ── Middle: 2 Rotis ── */}
        <circle cx="232" cy="238" r="64" fill="#D9B47D" stroke="#A8824C" strokeWidth="1.5" />
        <circle cx="228" cy="242" r="4" fill="#6B431D" opacity="0.6" />
        <circle cx="246" cy="232" r="5" fill="#6B431D" opacity="0.5" />

        <circle cx="258" cy="254" r="62" fill="#E2C188" stroke="#A8824C" strokeWidth="1.5" />
        <circle cx="266" cy="248" r="4" fill="#6B431D" opacity="0.6" />
        <circle cx="254" cy="266" r="3.5" fill="#6B431D" opacity="0.5" />

        {/* Papad */}
        <circle cx="276" cy="204" r="36" fill="#E8D196" stroke="#BFA36B" strokeWidth="1" strokeDasharray="3 2" />

        {/* Lemon & Chilli */}
        <path d="M210 322 A 15 15 0 0 1 230 332 Z" fill="#F2C41D" />
        <path d="M254 332 Q 270 342 286 334" stroke="#2F6B3A" strokeWidth="5.5" strokeLinecap="round" />
      </svg>

      {/* Clickable Overlay Quadrants matching 3D Navigation */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-10 pointer-events-auto">
        <Link
          href="/student"
          className="flex flex-col items-center justify-center p-2 rounded hover:bg-saffron/15 transition-all group"
          title="Student Express"
        >
          <span className="font-mono text-[10px] font-bold uppercase text-ink bg-bg-raised px-2 py-0.5 border border-ink shadow-sm group-hover:bg-saffron">
            विद्यार्थी · {waitRange}
          </span>
        </Link>
        <Link
          href="/staff"
          className="flex flex-col items-center justify-center p-2 rounded hover:bg-saffron/15 transition-all group"
          title="Staff Deck"
        >
          <span className="font-mono text-[10px] font-bold uppercase text-ink bg-bg-raised px-2 py-0.5 border border-ink shadow-sm group-hover:bg-saffron">
            कतार · {queueCount} in line
          </span>
        </Link>
        <Link
          href="/kitchen"
          className="flex flex-col items-center justify-center p-2 rounded hover:bg-saffron/15 transition-all group"
          title="Kitchen Chalkboard"
        >
          <span className="font-mono text-[10px] font-bold uppercase text-ink bg-bg-raised px-2 py-0.5 border border-ink shadow-sm group-hover:bg-saffron">
            रसोई · {expectedPlates} plates
          </span>
        </Link>
        <Link
          href="/impact"
          className="flex flex-col items-center justify-center p-2 rounded hover:bg-saffron/15 transition-all group"
          title="Impact Model"
        >
          <span className="font-mono text-[10px] font-bold uppercase text-ink bg-bg-raised px-2 py-0.5 border border-ink shadow-sm group-hover:bg-saffron">
            असर · {wasteSavedKg} kg cut
          </span>
        </Link>
      </div>
    </div>
  );
}

export default ThaliFallbackSVG;
