'use client';

import React from 'react';
import Link from 'next/link';

export function HomeFooter() {
  return (
    <footer className="w-full bg-[#14110F] text-[#F4ECD8] border-t-2 border-[#14110F] relative overflow-hidden pt-16 sm:pt-20">
      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        {/* Top footer row: Link columns & info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-16 border-b border-white/10">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="font-condensed text-3xl sm:text-4xl uppercase tracking-wider text-[#F4ECD8]">
              BEAT THE MESS RUSH
            </div>
            <p className="font-body text-xs text-[#A8A095] leading-relaxed max-w-xs">
              A 15-minute staggered lunch booking system connecting student arrival demand directly
              with hostel kitchen batch prep.
            </p>
          </div>

          {/* Col 2: Modules Links */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold uppercase tracking-widest text-saffron">
              System Modules
            </div>
            <ul className="space-y-2 text-[#A8A095]">
              <li>
                <Link href="/student" className="hover:text-saffron transition-colors">
                  Student Express
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-saffron transition-colors">
                  Staff Control Deck
                </Link>
              </li>
              <li>
                <Link href="/kitchen" className="hover:text-saffron transition-colors">
                  Kitchen Chalkboard
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-saffron transition-colors">
                  Impact Model
                </Link>
              </li>
              <li>
                <Link href="/case-study" className="hover:text-saffron transition-colors">
                  Case Study
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus Pilot Info */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold uppercase tracking-widest text-saffron">
              Pilot Parameters
            </div>
            <ul className="space-y-2 text-[#A8A095]">
              <li>Hostel 4 Dining Hall</li>
              <li>North Campus Express Line</li>
              <li>600 Active Boarders</li>
              <li>15-Minute Staggered Slots</li>
              <li>Daily Waste Weigh-ins</li>
            </ul>
          </div>

          {/* Col 4: Simulated Data Disclaimer */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold uppercase tracking-widest text-saffron">
              Notice
            </div>
            <div className="p-3.5 bg-black/40 border border-white/10 space-y-2">
              <span className="inline-block px-2 py-0.5 bg-saffron text-ink font-bold text-[10px] uppercase">
                Simulated Data
              </span>
              <p className="text-[#A8A095] text-xs leading-normal">
                All numbers on this page are simulated. Real results need a pilot.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#8E857C]">
          <span>Designed & Built for Collegiate Dining Halls</span>
          <span>Open Source Framework · MIT License</span>
        </div>
      </div>

      {/* 
        ── HUGE BEBAS WORDMARK INTENTIONALLY CROPPED AT BOTTOM EDGE ──
        The only intentional crop on the site per design brief.
      */}
      <div className="w-full overflow-hidden select-none pointer-events-none mt-4">
        <div
          className="font-condensed uppercase tracking-tighter text-[#221E1A] text-center whitespace-nowrap leading-[0.72] translate-y-[22%]"
          style={{
            fontSize: 'clamp(96px, 19vw, 280px)',
          }}
        >
          BEAT THE MESS RUSH
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
