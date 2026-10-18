'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { university, brand } from '@/config/university';
import { UniQLogo } from '@/components/brand/UniQLogo';

export function HomeFooter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isKiosk = pathname?.includes('/display') || searchParams?.get('kiosk') === '1';

  if (isKiosk) {
    return null;
  }

  const primaryMess = university.messes[0];

  return (
    <footer className="w-full bg-[#14110F] text-[#F4ECD8] border-t-2 border-[#14110F] relative overflow-hidden pt-16 sm:pt-20">
      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        {/* Top footer row: Link columns & info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-16 border-b border-white/10">
          {/* Col 1: Identity */}
          <div className="space-y-3">
            <Link href="/" className="min-w-[48px] min-h-[48px] inline-flex items-center hover:opacity-90 transition-opacity">
              <UniQLogo size={36} lightText />
            </Link>
            <div className="font-accent italic text-[14px] text-saffron">
              {brand.tagline}
            </div>
            <p className="font-body text-[14px] text-[#A8A095] leading-relaxed max-w-xs">
              {brand.descriptor}
            </p>
          </div>

          {/* Col 2: Modules Links */}
          <div className="space-y-3 font-mono text-[14px]">
            <div className="font-bold uppercase tracking-widest text-saffron">
              System Modules
            </div>
            <ul className="space-y-1 text-[#A8A095]">
              <li>
                <Link href="/student" className="min-h-[48px] flex items-center hover:text-saffron transition-colors">
                  Student Express
                </Link>
              </li>
              <li>
                <Link href="/staff" className="min-h-[48px] flex items-center hover:text-saffron transition-colors">
                  Staff Control Deck
                </Link>
              </li>
              <li>
                <Link href="/kitchen" className="min-h-[48px] flex items-center hover:text-saffron transition-colors">
                  Kitchen Chalkboard
                </Link>
              </li>
              <li>
                <Link href="/impact" className="min-h-[48px] flex items-center hover:text-saffron transition-colors">
                  Impact Model
                </Link>
              </li>
              <li>
                <Link href="/case-study" className="min-h-[48px] flex items-center hover:text-saffron transition-colors">
                  Case Study
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus Pilot Info */}
          <div className="space-y-3 font-mono text-[14px]">
            <div className="font-bold uppercase tracking-widest text-saffron">
              Mess Information
            </div>
            <ul className="space-y-2 text-[#A8A095]">
              <li>{primaryMess.name} (LPU Tenant)</li>
              <li>{primaryMess.hostel} ({primaryMess.seats ? `${primaryMess.seats} Seats` : 'Seats unverified'})</li>
              <li>{primaryMess.students ? `${primaryMess.students} Boarders` : 'Students unverified'} ({primaryMess.counters ? `${primaryMess.counters} Counters` : 'Counters unverified'})</li>
              <li>{university.slotLengthMinutes}-Minute Staggered Slots</li>
              <li>{university.city}</li>
            </ul>
          </div>

          {/* Col 4: Simulated Data Disclaimer */}
          <div className="space-y-3 font-mono text-[14px]">
            <div className="font-bold uppercase tracking-widest text-saffron">
              Notice
            </div>
            <div className="p-3.5 bg-black/40 border border-white/10 space-y-2">
              <span className="inline-block px-2.5 py-1 bg-saffron text-ink font-bold text-[14px] uppercase">
                Simulated Data
              </span>
              <p className="text-[#A8A095] text-[14px] leading-normal">
                All numbers on this page are simulated. Real results need a pilot.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[14px] text-[#8E857C]">
          <span>{brand.credit}</span>
          <span>Open Source Framework · MIT License</span>
        </div>
      </div>

      {/* 
        ── HUGE BEBAS WORDMARK INTENTIONALLY CROPPED AT BOTTOM EDGE ──
        The only intentional crop on the site per design brief.
      */}
      <div className="w-full overflow-hidden select-none pointer-events-none mt-4 flex justify-center">
        <div
          className="text-center whitespace-nowrap translate-y-[22%]"
          style={{
            fontSize: 'clamp(96px, 19vw, 280px)',
          }}
        >
          <UniQLogo huge />
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
