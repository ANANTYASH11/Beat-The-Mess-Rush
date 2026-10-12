'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Calendar,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { StampBadge } from '@/components/ui/StampBadge';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';

export default function ImpactPage() {
  const [costPerKg, setCostPerKg] = useState(68);
  const [platesPerDay, setPlatesPerDay] = useState(980);
  const [adoptionPct, setAdoptionPct] = useState(42);
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dividerPos, setDividerPos] = useState(50); // 0 to 100% split

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/impact?costPerKg=${costPerKg}&platesPerDay=${platesPerDay}&adoptionPct=${adoptionPct}`
    )
      .then((res) => res.json())
      .then((data) => setImpactData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [costPerKg, platesPerDay, adoptionPct]);

  const monthlySavingsInr = impactData?.savings?.monthlySavingsInr ?? 56000;
  const annualSavingsInr = impactData?.savings?.annualSavingsInr ?? 504000;
  const monthlyKgSaved = impactData?.savings?.monthlyKgSaved ?? 820;

  return (
    <div className="w-full space-y-8 pb-16" id="impact-editorial-page">
      {/* 1. EDITORIAL CASE STUDY HEADER WITH SIMULATED STAMP */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg relative overflow-hidden">
        {/* Prominent Rotated Rubber Stamp */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 rotate-6 select-none z-10">
          <StampBadge text="SIMULATED DATA" color="chilli" />
        </div>

        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded">
              EMPIRICAL CASE STUDY
            </span>
            <span className="font-serif italic text-xs text-[#5C554F]">
              दैनिक भोजन बचत प्रतिवेदन
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-black text-[#14110F] uppercase tracking-wide leading-none">
            SAVINGS &amp; QUEUE DISPATCH MODEL
          </h1>

          <p className="font-serif text-base text-[#5C554F] leading-relaxed pt-1">
            Comparing the chaos of unstructured hostel mealtimes against 15-minute staggered arrivals and automated portion right-sizing.
          </p>
        </div>

        {/* Disclaimer Alert */}
        <div className="mt-6 p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl flex items-start gap-3 text-xs font-serif leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-[#D7312B] shrink-0 mt-0.5" />
          <div className="text-[#14110F]">
            <strong className="font-bold">Pilot Audit Protocol:</strong> All projections are calibrated against our 4-week hostel baseline. Field gains vary with counter geometry and student adoption, verifiable during the 4-week pilot deployment.
          </div>
        </div>
      </div>

      {/* 2. TORN-PAPER BEFORE / AFTER DRAGGABLE SPLIT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="font-mono text-xs font-black uppercase tracking-widest text-[#14110F]">
            INTERACTIVE TORN-PAPER AUDIT COMPARISON
          </div>
          <div className="font-mono text-xs font-bold text-[#5C554F]">
            DRAG SLIDER: {dividerPos}% AFTER
          </div>
        </div>

        {/* Torn-Paper Container with Drag Slider */}
        <div className="relative border-[3px] border-[#14110F] rounded-2xl overflow-hidden shadow-brutal-xl select-none bg-[#14110F]">
          <div className="grid grid-cols-1 md:grid-cols-2 relative min-h-[360px]">
            {/* Left: BEFORE (Crowded, Sepia-Tinted, Chaotic) */}
            <div
              className="p-6 sm:p-8 bg-[#EAE1CA] text-[#423933] border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#14110F] flex flex-col justify-between"
              style={{ filter: 'sepia(0.35) contrast(0.95)' }}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#5C554F]/30">
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#5C554F] text-[#FAF5E8] px-2 py-0.5 rounded">
                    STATUS QUO (NO SYSTEM)
                  </span>
                  <span className="font-mono text-xs font-black text-[#D7312B]">
                    SCENARIO A
                  </span>
                </div>

                <div className="my-5 space-y-4">
                  <div>
                    <div className="font-mono text-xs text-[#5C554F] uppercase">
                      PEAK LINE BOTTLENECK
                    </div>
                    <div className="font-display text-4xl sm:text-5xl font-black text-[#D7312B] leading-tight">
                      {impactData?.baseline?.peakWaitRange || '18-24 MIN'}
                    </div>
                    <div className="font-serif italic text-xs text-[#5C554F]">
                      Heavy door stall between 12:45 - 13:15
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-[#5C554F] uppercase">
                      DAILY FOOD DISCARDED
                    </div>
                    <div className="font-display text-4xl font-black text-[#14110F] leading-tight">
                      ~{impactData?.baseline?.dailyWasteKg || 138} KG / DAY
                    </div>
                    <div className="font-serif italic text-xs text-[#5C554F]">
                      Plate scraps (75g/student) + leftover vats
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#D9CEB4] border border-[#5C554F]/40 rounded-lg font-mono text-xs font-bold text-[#5C554F]">
                MONTHLY VALUE LOST: ₹{impactData?.baseline?.monthlyWasteCostInr?.toLocaleString() || '2,81,000'}
              </div>
            </div>

            {/* Right: AFTER (Smooth, Vibrant Curry & Saffron) */}
            <div className="p-6 sm:p-8 bg-[#FAF5E8] text-[#14110F] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#14110F]/20">
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#2F6B3A] text-[#FAF5E8] px-2 py-0.5 rounded">
                    WITH BEAT THE MESS RUSH
                  </span>
                  <span className="font-mono text-xs font-black text-[#2F6B3A]">
                    SCENARIO B ({adoptionPct}% ADOPTION)
                  </span>
                </div>

                <div className="my-5 space-y-4">
                  <div>
                    <div className="font-mono text-xs text-[#5C554F] uppercase">
                      STAGGERED QUEUE WAIT
                    </div>
                    <div className="font-display text-4xl sm:text-5xl font-black text-[#2F6B3A] leading-tight">
                      {impactData?.withSystem?.peakWaitRange || '5-8 MIN'}
                    </div>
                    <div className="font-serif italic text-xs text-[#2F6B3A] font-bold">
                      ✓ 60% reduction in peak counter stall
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-[#5C554F] uppercase">
                      RIGHT-SIZED KITCHEN SCRAP
                    </div>
                    <div className="font-display text-4xl font-black text-[#F28C1B] leading-tight">
                      ~{impactData?.withSystem?.dailyWasteKg || 110} KG / DAY
                    </div>
                    <div className="font-serif italic text-xs text-[#2F6B3A] font-bold">
                      ✓ ~{monthlyKgSaved} kg saved each month
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] rounded-lg font-mono text-xs font-black text-[#2F6B3A] flex items-center justify-between">
                <span>NET MONTHLY SAVINGS:</span>
                <span className="font-display text-xl text-[#14110F]">
                  ₹{monthlySavingsInr?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Draggable Divider Control */}
          <div className="p-4 bg-[#14110F] text-[#FAF5E8] border-t-[3px] border-[#14110F] flex items-center justify-between gap-4 font-mono text-xs">
            <span className="font-bold text-[#F28C1B]">← DRAG SPLIT TO COMPARE →</span>
            <input
              type="range"
              min="0"
              max="100"
              value={dividerPos}
              onChange={(e) => {
                setDividerPos(Number(e.target.value));
                playDhabaSound('flip');
              }}
              className="w-1/2 accent-[#F28C1B] cursor-pointer"
            />
            <span className="font-bold text-[#FAF5E8]">₹{(annualSavingsInr / 100000).toFixed(1)}L / YR</span>
          </div>
        </div>
      </div>

      {/* 3. PHYSICAL MIXING CONSOLE ASSUMPTION SLIDERS */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6">
        <div className="border-b-2 border-[#14110F]/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-[#F28C1B] text-[#14110F] px-2 py-0.5 rounded border border-[#14110F]">
              CONSOLE FADERS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#14110F]">
              OPERATIONAL MIXING CONSOLE
            </h2>
          </div>
          <p className="font-serif text-xs text-[#5C554F] mt-0.5">
            Slide faders to model campus headcounts, ingredient bulk prices, and app adoption thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fader 1: Food Cost */}
          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl shadow-brutal-sm space-y-2">
            <div className="flex justify-between font-mono text-xs font-black">
              <span>AVG INGREDIENT COST</span>
              <span className="text-[#2F6B3A] text-sm">₹{costPerKg} / KG</span>
            </div>
            <input
              type="range"
              min="40"
              max="120"
              step="2"
              value={costPerKg}
              onChange={(e) => {
                setCostPerKg(Number(e.target.value));
                playDhabaSound('flip');
              }}
              className="w-full accent-[#14110F] cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[9px] text-[#5C554F]">
              <span>₹40</span>
              <span>₹80</span>
              <span>₹120</span>
            </div>
          </div>

          {/* Fader 2: Plates Per Day */}
          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl shadow-brutal-sm space-y-2">
            <div className="flex justify-between font-mono text-xs font-black">
              <span>TOTAL PLATES / DAY</span>
              <span className="text-[#F28C1B] text-sm">{platesPerDay} PLATES</span>
            </div>
            <input
              type="range"
              min="400"
              max="1600"
              step="50"
              value={platesPerDay}
              onChange={(e) => {
                setPlatesPerDay(Number(e.target.value));
                playDhabaSound('flip');
              }}
              className="w-full accent-[#14110F] cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[9px] text-[#5C554F]">
              <span>400</span>
              <span>1000</span>
              <span>1600</span>
            </div>
          </div>

          {/* Fader 3: Student Adoption */}
          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl shadow-brutal-sm space-y-2">
            <div className="flex justify-between font-mono text-xs font-black">
              <span>STUDENT APP ADOPTION</span>
              <span className="text-[#D7312B] text-sm">{adoptionPct}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={adoptionPct}
              onChange={(e) => {
                setAdoptionPct(Number(e.target.value));
                playDhabaSound('flip');
              }}
              className="w-full accent-[#14110F] cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[9px] text-[#5C554F]">
              <span>20% (Soft)</span>
              <span>50%</span>
              <span>80%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PILOT ROADMAP: HAND-DRAWN DOTTED PATH WITH MILESTONES */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6">
        <div>
          <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#2F6B3A] text-[#FAF5E8] px-2.5 py-0.5 rounded">
            PRAGMATIC DEPLOYMENT
          </span>
          <h2 className="font-display text-3xl font-black uppercase text-[#14110F] mt-1">
            4-WEEK CAMPUS PILOT ROADMAP
          </h2>
          <p className="font-serif text-xs text-[#5C554F]">
            Hand-drawn phased rollout roadmap requiring zero expensive biometric or camera hardware.
          </p>
        </div>

        {/* Winding Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative">
          {[
            {
              week: 'WEEK 01',
              title: 'AUDIT BASELINE',
              desc: 'Observe counter dwell times, scale plate scrapes, record status quo.',
              badge: 'PASSIVE',
              color: 'bg-[#FAF5E8]',
            },
            {
              week: 'WEEK 02',
              title: 'STAFF 1-TAP CONSOLE',
              desc: 'Deploy single tablet at Counter 1. Staff practice 1-tap walk-in & served.',
              badge: 'HARDWARE-FREE',
              color: 'bg-[#FAF5E8]',
            },
            {
              week: 'WEEK 03',
              title: 'SLOT TIMETABLE LIVE',
              desc: 'Activate 15-min student slots on campus Wi-Fi. 30-50% adoption target.',
              badge: 'PILOT PHASE',
              color: 'bg-[#FAF5E8]',
            },
            {
              week: 'WEEK 04',
              title: 'AUDIT COMPARISON',
              desc: 'Measure exact food kg cut, line wait drops, and publish mess report.',
              badge: 'RESULTS',
              color: 'bg-[#F28C1B] text-[#14110F]',
            },
          ].map((m, idx) => (
            <div
              key={m.week}
              className={`p-4 border-2 border-[#14110F] rounded-xl shadow-brutal-sm flex flex-col justify-between relative ${m.color}`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-[#14110F]/30">
                  <span className="font-mono text-xs font-black text-[#5C554F]">
                    {m.week}
                  </span>
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#14110F] bg-[#FAF5E8]">
                    {m.badge}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-[#14110F] mt-2">
                  {m.title}
                </h3>
                <p className="font-serif text-xs text-[#5C554F] mt-1 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="pt-3 font-mono text-[10px] font-bold text-[#14110F]">
                MILESTONE #{idx + 1} ✓
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
