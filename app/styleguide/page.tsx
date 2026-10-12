'use client';

import React from 'react';
import { TactileButton } from '@/components/ui/TactileButton';
import { StampBadge } from '@/components/ui/StampBadge';
import { ChalkLabel } from '@/components/ui/ChalkLabel';
import { StickyNote } from '@/components/ui/StickyNote';
import { Katori } from '@/components/ui/Katori';
import { SplitFlapBoard } from '@/components/ui/SplitFlap';
import { MessToken } from '@/components/ui/MessToken';
import { SteelWeightButton } from '@/components/ui/SteelWeightButton';
import { FillingWasteBin } from '@/components/ui/FillingWasteBin';
import { KitchenScaleDial } from '@/components/ui/KitchenScaleDial';
import {
  SteelGlassIcon,
  LadleIcon,
  TiffinIcon,
  TokenTicketIcon,
  ThaliOutlineIcon,
  SteamWisps,
} from '@/components/ui/DhabaIcons';

export default function StyleguidePage() {
  const palette = [
    { name: 'Warm Cream Paper', hex: '#F4ECD8', role: 'Default Background' },
    { name: 'Light Paper', hex: '#FAF5E8', role: 'Card & Sheet Surface' },
    { name: 'Solid Ink Black', hex: '#14110F', role: 'Borders & Brutal Shadows' },
    { name: 'Saffron Orange', hex: '#F28C1B', role: 'Primary Action Accent' },
    { name: 'Chilli Red', hex: '#D7312B', role: 'Emergency & Peak Crowds' },
    { name: 'Turmeric Yellow', hex: '#F2B705', role: 'Moderate Wait & Highlights' },
    { name: 'Curry-Leaf Green', hex: '#2F6B3A', role: 'Quiet Slots & Savings' },
    { name: 'Stainless Steel', hex: '#B8BCC2', role: 'Hostel Thali & Tumblers' },
    { name: 'Chalkboard Slate', hex: '#1C2220', role: 'Kitchen Wall Menus' },
  ];

  return (
    <div className="w-full space-y-12 pb-20 max-w-6xl mx-auto" id="styleguide-page">
      {/* 1. HEADER */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-xl">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#14110F]/15">
          <span className="font-mono text-xs font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-3 py-1 rounded">
            DESIGN SYSTEM STYLE TILE
          </span>
          <StampBadge text="DHABA MEETS DEPARTURE BOARD" color="saffron" />
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-black text-[#14110F] uppercase mt-3">
          VISUAL SYSTEM &amp; DESIGN TOKENS
        </h1>
        <p className="font-serif text-base text-[#5C554F] max-w-2xl mt-1">
          A distinctive, anti-SaaS visual language celebrating Indian university mess culture: thick 3px ink borders, hard offset shadows, chalkboard slate, stainless steel trays, and physical split-flap signage.
        </p>
      </div>

      {/* 2. COLOR PALETTE */}
      <div className="space-y-4">
        <h2 className="font-display text-3xl font-black uppercase text-[#14110F]">
          DHABA COLOR PALETTE
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {palette.map((c) => (
            <div
              key={c.name}
              className="border-2 border-[#14110F] rounded-xl overflow-hidden shadow-brutal-sm bg-[#FAF5E8]"
            >
              <div style={{ backgroundColor: c.hex }} className="h-16 border-b-2 border-[#14110F]" />
              <div className="p-3">
                <div className="font-display text-base font-bold uppercase">{c.name}</div>
                <div className="font-mono text-xs font-bold text-[#5C554F]">{c.hex}</div>
                <div className="font-serif text-[11px] text-[#5C554F] mt-1">{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TYPOGRAPHY SPECIMEN */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-md space-y-6">
        <h2 className="font-display text-3xl font-black uppercase text-[#14110F]">
          TYPOGRAPHY SPECIMEN
        </h2>

        <div className="space-y-5">
          <div className="border-b-2 border-[#14110F]/15 pb-4">
            <span className="font-mono text-xs font-bold text-[#5C554F] block">
              DISPLAY: BEBAS NEUE (CONDENSED HEADLINES)
            </span>
            <div className="font-display text-5xl sm:text-6xl text-[#14110F] uppercase tracking-wide">
              BEAT THE MESS RUSH • 15-MIN COACH ARRIVALS
            </div>
          </div>

          <div className="border-b-2 border-[#14110F]/15 pb-4">
            <span className="font-mono text-xs font-bold text-[#5C554F] block">
              SERIF ACCENTS: FRAUNCES
            </span>
            <div className="font-serif italic text-2xl text-[#14110F]">
              Right-sizing hostel dining portions with honest empirical queues.
            </div>
          </div>

          <div>
            <span className="font-mono text-xs font-bold text-[#5C554F] block">
              NUMBERS & TICKETS: IBM PLEX MONO
            </span>
            <div className="font-mono text-xl sm:text-2xl text-[#14110F] font-black tracking-wider">
              MESS-1 • CODE 1518 • WAIT: 5-8 MIN • THROUGHPUT 7.5/M
            </div>
          </div>
        </div>
      </div>

      {/* 4. TACTILE BUTTONS & STAMP BADGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-4">
          <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
            TACTILE BUTTONS (PRESS SHADOW COLLAPSE)
          </h3>
          <div className="flex flex-wrap gap-3">
            <TactileButton variant="saffron" size="md">
              CONFIRM PASS
            </TactileButton>
            <TactileButton variant="curry" size="md">
              SERVED &amp; EXIT
            </TactileButton>
            <TactileButton variant="chilli" size="md">
              RUSH SIMULATOR
            </TactileButton>
            <TactileButton variant="paper" size="md">
              NEUTRAL SECONDARY
            </TactileButton>
          </div>
        </div>

        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-4">
          <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
            RUBBER STAMP BADGES
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <StampBadge text="CONFIRMED" color="chilli" />
            <StampBadge text="SIMULATED DATA" color="chilli" />
            <StampBadge text="OFF-PEAK CHAMP" color="curry" />
            <StampBadge text="RECOMMENDED 12:45" color="saffron" />
            <StampBadge text="RIGHT-SIZED" color="turmeric" />
          </div>
        </div>
      </div>

      {/* 5. CHALK LABELS & STICKY NOTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-4">
          <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
            CHALKBOARD LABELS
          </h3>
          <div className="flex flex-wrap gap-3">
            <ChalkLabel label="CHALKBOARD WAIT" value="5-8 MIN" color="turmeric" sublabel="Live queue" />
            <ChalkLabel label="KITCHEN SAVINGS" value="820 KG" color="curry" sublabel="Monthly cut" />
            <ChalkLabel label="PEAK HEADCOUNT" value="38" color="chilli" sublabel="Bottleneck" />
          </div>
        </div>

        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-4">
          <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
            FEEDBACK LOOP STICKY NOTES
          </h3>
          <div className="flex flex-wrap gap-4 pt-2">
            <StickyNote text="Rice -6% tomorrow" subtext="Automated recipe feedback" color="yellow" rotate={-2} />
            <StickyNote text="Exam Day: -14% attendance" subtext="Campus event modifier" color="pink" rotate={3} />
            <StickyNote text="31% Lauki plate waste" subtext="Empirical ranking note" color="green" rotate={-1} />
          </div>
        </div>
      </div>

      {/* 6. ILLUSTRATED KATORIS & STEEL WEIGHTS */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6">
        <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
          ILLUSTRATED KATORI PORTION PICKERS &amp; STEEL WEIGHTS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Katori portion="Small" selected={false} />
          <Katori portion="Regular" selected={true} />
          <Katori portion="Large" selected={false} />
        </div>

        <div className="pt-4 border-t-2 border-[#14110F]/15 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs font-black uppercase text-[#14110F]">
            IRON WEIGHT PRESETS:
          </span>
          {[1, 2, 5, 10].map((kg) => (
            <SteelWeightButton key={kg} kg={kg} isSelected={kg === 5} onClick={() => {}} />
          ))}
        </div>
      </div>

      {/* 7. SPLIT-FLAP BOARD SPECIMEN */}
      <div className="space-y-3">
        <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
          SPLIT-FLAP DEPARTURE BOARD SPECIMEN
        </h3>
        <SplitFlapBoard
          rows={[
            'MESS 1  QUEUE 20  WAIT 6-11 MIN  STATUS BUSY',
            'MESS 2  QUEUE 08  WAIT 2-4 MIN   STATUS QUIET',
          ]}
        />
      </div>

      {/* 8. MESS TOKEN PASS */}
      <div className="space-y-3">
        <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
          PRINTED MESS TOKEN / BUS TICKET PASS
        </h3>
        <MessToken
          booking={{
            studentId: '22CS014',
            slotStart: '12:45',
            portion: 'Regular',
            dietType: 'Veg',
            checkinCode: '1518',
            mealType: 'Lunch',
          }}
          rollNumber="22CS014"
          qrDataUrl=""
        />
      </div>
    </div>
  );
}
