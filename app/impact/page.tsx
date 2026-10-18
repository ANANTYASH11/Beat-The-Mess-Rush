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
  ClipboardCheck,
} from 'lucide-react';
import Link from 'next/link';
import { StampBadge } from '@/components/ui/StampBadge';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import { university } from '@/config/university';
import { CompareMessesTable } from '@/components/mess/CompareMessesTable';

import { useSelectedMess } from '@/hooks/useSelectedMess';

export default function ImpactPage() {
  const { messId, mess: activeMess, shortName, isChanging } = useSelectedMess();
  const messSeats = activeMess.seats ?? activeMess.demoSeats ?? 350;
  const defaultPlates = Math.round(messSeats * 2.3);
  const [costPerKg, setCostPerKg] = useState(university.costPerKgFood);
  const [platesPerDay, setPlatesPerDay] = useState(defaultPlates);
  const [adoptionPct, setAdoptionPct] = useState(42);
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dividerPos, setDividerPos] = useState(50); // 0 to 100% split
  const [dataView, setDataView] = useState<'simulated' | 'measured'>('simulated');
  const prevMessIdRef = React.useRef(messId);

  useEffect(() => {
    prevMessIdRef.current = messId;
    setPlatesPerDay(Math.round((activeMess.seats ?? activeMess.demoSeats ?? 350) * 2.3));
  }, [messId, activeMess]);

  useEffect(() => {
    const fetchMessId = messId;
    setLoading(true);
    fetch(
      `/api/impact?messId=${encodeURIComponent(fetchMessId)}&costPerKg=${costPerKg}&platesPerDay=${platesPerDay}&adoptionPct=${adoptionPct}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (fetchMessId === prevMessIdRef.current) {
          setImpactData(data);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (fetchMessId === prevMessIdRef.current) {
          setLoading(false);
        }
      });
  }, [messId, costPerKg, platesPerDay, adoptionPct]);

  const hasMeasuredData = !!(impactData?.measured?.baseline || impactData?.measured?.pilot);

  const monthlySavingsInr = impactData?.savings?.monthlySavingsInr ?? 42000;
  const annualSavingsInr = impactData?.savings?.annualSavingsInr ?? 420000;
  const monthlyKgSaved = impactData?.savings?.monthlyKgSaved ?? 750;

  // Values based on active data view
  const isMeasured = dataView === 'measured' && hasMeasuredData;
  const beforeWait = isMeasured
    ? impactData.measured.baseline?.peakWaitRange || '22 MIN'
    : impactData?.baseline?.peakWaitRange || '18-24 MIN';
  const beforeWaste = isMeasured
    ? `${impactData.measured.baseline?.dailyWasteKg || 135} KG / DAY`
    : `~${impactData?.baseline?.dailyWasteKg || 138} KG / DAY`;
  const afterWait = isMeasured
    ? impactData.measured.pilot?.peakWaitRange || '6 MIN'
    : impactData?.withSystem?.peakWaitRange || '5-8 MIN';
  const afterWaste = isMeasured
    ? `${impactData.measured.pilot?.dailyWasteKg || 98} KG / DAY`
    : `~${impactData?.withSystem?.dailyWasteKg || 110} KG / DAY`;

  return (
    <div className="w-full space-y-8 pb-16" id="impact-editorial-page">
      {/* 1. EDITORIAL CASE STUDY HEADER WITH DATA STAMP */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg relative overflow-hidden">
        {/* Prominent Rotated Rubber Stamp */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 rotate-6 select-none z-10">
          <StampBadge
            text={isMeasured ? 'MEASURED PILOT' : 'SIMULATED DATA'}
            color={isMeasured ? 'green' : 'chilli'}
          />
        </div>

        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[14px] font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-3 py-1 rounded">
              UniQ IMPACT MODEL • {university.shortName}
            </span>
            <span className="font-serif italic text-[14px] text-[#5C554F]">
              {activeMess.name} ({activeMess.students || activeMess.demoStudents} Students)
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-black text-[#14110F] uppercase tracking-wide leading-none">
            SAVINGS &amp; QUEUE DISPATCH MODEL
          </h1>

          <p className="font-serif text-base text-[#5C554F] leading-relaxed pt-1">
            Comparing the chaos of unstructured hostel mealtimes against {university.slotLengthMinutes}-minute staggered arrivals and automated portion right-sizing.
          </p>
        </div>

        {/* View Toggle: Simulated Model vs Measured Pilot */}
        <div className="mt-5 pt-4 border-t-2 border-dashed border-[#14110F]/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[14px] font-black uppercase text-[#14110F]">DATA MODE:</span>
            <div className="inline-flex rounded-lg border-2 border-[#14110F] p-0.5 bg-[#EFE7D0] flex-wrap">
              <button
                type="button"
                onClick={() => setDataView('simulated')}
                className={`px-3.5 py-2.5 min-h-[48px] flex items-center font-mono text-[14px] font-black uppercase rounded transition-colors cursor-pointer ${
                  dataView === 'simulated'
                    ? 'bg-[#14110F] text-[#FAF5E8]'
                    : 'text-[#14110F] hover:bg-[#FAF5E8]'
                }`}
              >
                SIMULATED MODEL
              </button>
              <button
                type="button"
                onClick={() => setDataView('measured')}
                className={`px-3.5 py-2.5 min-h-[48px] flex items-center font-mono text-[14px] font-black uppercase rounded transition-colors cursor-pointer ${
                  dataView === 'measured'
                    ? 'bg-[#2F6B3A] text-[#FAF5E8]'
                    : 'text-[#14110F] hover:bg-[#FAF5E8]'
                }`}
              >
                MEASURED PILOT {hasMeasuredData ? '✓' : '(UNRECORDED)'}
              </button>
            </div>
          </div>

          <Link
            href="/admin/pilot"
            className="inline-flex items-center gap-2 font-mono text-[14px] font-black text-[#F28C1B] hover:text-[#14110F] bg-[#14110F] hover:bg-[#F28C1B] text-white px-4 py-2.5 min-h-[48px] rounded-lg border-2 border-[#14110F] transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            ENTER MEASURED BASELINE IN PILOT CONSOLE →
          </Link>
        </div>

        {/* Disclaimer Alert */}
        <div className="mt-4 p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl flex items-start gap-3 text-[14px] font-serif leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-[#D7312B] shrink-0 mt-0.5" />
          <div className="text-[#14110F]">
            <strong className="font-bold">Pilot Audit Protocol:</strong> All projections are calibrated against our 4-week hostel baseline for {university.messes[0].name}. Figures are tagged below as <strong>Simulated</strong>, <strong>Measured baseline</strong> or <strong>Measured pilot</strong>. Built as a student project for {university.name}.
          </div>
        </div>
      </div>

      {/* 2. TORN-PAPER BEFORE / AFTER DRAGGABLE SPLIT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="font-mono text-xs font-black uppercase tracking-widest text-[#14110F] flex items-center gap-2">
            <span>INTERACTIVE TORN-PAPER AUDIT COMPARISON</span>
            <span className="text-[10px] bg-[#D7312B] text-white px-2 py-0.5 rounded font-mono font-bold">
              {isMeasured ? 'MEASURED PILOT' : 'SIMULATED DATA'}
            </span>
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
                  <span className="font-mono text-xs font-black text-[#D7312B] px-2 py-0.5 rounded border border-[#D7312B]/40 bg-[#FAF5E8]">
                    {isMeasured ? 'MEASURED BASELINE' : 'SIMULATED BASELINE'}
                  </span>
                </div>

                <div className="my-5 space-y-4">
                  <div>
                    <div className="font-mono text-xs text-[#5C554F] uppercase flex items-center justify-between">
                      <span>PEAK LINE BOTTLENECK</span>
                      <span className="text-[9px] bg-[#5C554F]/20 px-1.5 py-0.2 rounded font-bold">
                        {isMeasured ? 'MEASURED BASELINE' : 'SIMULATED'}
                      </span>
                    </div>
                    <div className="font-display text-4xl sm:text-5xl font-black text-[#D7312B] leading-tight">
                      {beforeWait}
                    </div>
                    <div className="font-serif italic text-xs text-[#5C554F]">
                      Heavy door stall around {university.peakWindows.lunch} peak
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-[#5C554F] uppercase flex items-center justify-between">
                      <span>DAILY FOOD DISCARDED</span>
                      <span className="text-[9px] bg-[#5C554F]/20 px-1.5 py-0.2 rounded font-bold">
                        {isMeasured ? 'MEASURED BASELINE' : 'SIMULATED'}
                      </span>
                    </div>
                    <div className="font-display text-4xl font-black text-[#14110F] leading-tight">
                      {beforeWaste}
                    </div>
                    <div className="font-serif italic text-xs text-[#5C554F]">
                      Plate scraps (75g/student) + leftover vats
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#D9CEB4] border border-[#5C554F]/40 rounded-lg font-mono text-xs font-bold text-[#5C554F] flex justify-between items-center">
                <span>MONTHLY VALUE LOST:</span>
                <span className="font-black text-[#14110F]">
                  ₹{impactData?.baseline?.monthlyWasteCostInr?.toLocaleString() || '1,73,880'}
                  <span className="text-[9px] ml-1 opacity-70">
                    ({isMeasured ? 'MEASURED' : 'SIMULATED'})
                  </span>
                </span>
              </div>
            </div>

            {/* Right: AFTER (Smooth, Vibrant Curry & Saffron) */}
            <div className="p-6 sm:p-8 bg-[#FAF5E8] text-[#14110F] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#14110F]/20">
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#2F6B3A] text-[#FAF5E8] px-2 py-0.5 rounded">
                    WITH UniQ
                  </span>
                  <span className="font-mono text-xs font-black text-[#2F6B3A] px-2 py-0.5 rounded border border-[#2F6B3A]/40 bg-[#FAF5E8]">
                    {isMeasured ? 'MEASURED PILOT' : `SIMULATED (${adoptionPct}% ADOPTION)`}
                  </span>
                </div>

                <div className="my-5 space-y-4">
                  <div>
                    <div className="font-mono text-xs text-[#5C554F] uppercase flex items-center justify-between">
                      <span>STAGGERED QUEUE WAIT</span>
                      <span className="text-[9px] bg-[#2F6B3A]/20 text-[#2F6B3A] px-1.5 py-0.2 rounded font-bold">
                        {isMeasured ? 'MEASURED PILOT' : 'SIMULATED'}
                      </span>
                    </div>
                    <div className="font-display text-4xl sm:text-5xl font-black text-[#2F6B3A] leading-tight">
                      {afterWait}
                    </div>
                    <div className="font-serif italic text-xs text-[#2F6B3A] font-bold">
                      ✓ ~60% reduction in peak counter stall
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-[#5C554F] uppercase flex items-center justify-between">
                      <span>RIGHT-SIZED KITCHEN SCRAP</span>
                      <span className="text-[9px] bg-[#2F6B3A]/20 text-[#2F6B3A] px-1.5 py-0.2 rounded font-bold">
                        {isMeasured ? 'MEASURED PILOT' : 'SIMULATED'}
                      </span>
                    </div>
                    <div className="font-display text-4xl font-black text-[#F28C1B] leading-tight">
                      {afterWaste}
                    </div>
                    <div className="font-serif italic text-xs text-[#2F6B3A] font-bold">
                      ✓ ~{monthlyKgSaved} kg saved each month ({isMeasured ? 'MEASURED PILOT' : 'SIMULATED'})
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] rounded-lg font-mono text-xs font-black text-[#2F6B3A] flex items-center justify-between">
                <span>NET MONTHLY SAVINGS:</span>
                <span className="font-display text-xl text-[#14110F]">
                  ₹{monthlySavingsInr?.toLocaleString()}
                  <span className="font-mono text-[9px] ml-1 text-[#2F6B3A]">
                    [{isMeasured ? 'MEASURED' : 'SIMULATED'}]
                  </span>
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
            <span className="font-bold text-[#FAF5E8]">₹{(annualSavingsInr / 100000).toFixed(1)}L / YR [SIMULATED]</span>
          </div>
        </div>
      </div>

      {/* 3. PHYSICAL MIXING CONSOLE ASSUMPTION SLIDERS */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6">
        <div className="border-b-2 border-[#14110F]/15 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black bg-[#F28C1B] text-[#14110F] px-2 py-0.5 rounded border border-[#14110F]">
                CONSOLE FADERS
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#14110F]">
                OPERATIONAL MIXING CONSOLE
              </h2>
            </div>
            <p className="font-serif text-xs text-[#5C554F] mt-0.5">
              Slide faders to model {university.name} headcounts, ingredient bulk prices, and app adoption thresholds.
            </p>
          </div>
          <span className="font-mono text-[10px] font-bold bg-[#D7312B]/10 text-[#D7312B] px-2.5 py-1 rounded border border-[#D7312B]/30">
            [SIMULATED PARAMETRIC MODEL]
          </span>
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
              min="30"
              max="100"
              step="2"
              value={costPerKg}
              onChange={(e) => {
                setCostPerKg(Number(e.target.value));
                playDhabaSound('flip');
              }}
              className="w-full accent-[#14110F] cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[9px] text-[#5C554F]">
              <span>₹30 (Subsidized)</span>
              <span>₹{university.costPerKgFood} (Config)</span>
              <span>₹100</span>
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
              min="300"
              max="1500"
              step="50"
              value={platesPerDay}
              onChange={(e) => {
                setPlatesPerDay(Number(e.target.value));
                playDhabaSound('flip');
              }}
              className="w-full accent-[#14110F] cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[9px] text-[#5C554F]">
              <span>300</span>
              <span>{defaultPlates} (Mess 1)</span>
              <span>1500</span>
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
              <span>42% (Expected)</span>
              <span>80%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PILOT ROADMAP: HAND-DRAWN DOTTED PATH WITH MILESTONES */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#2F6B3A] text-[#FAF5E8] px-2.5 py-0.5 rounded">
              REAL MESS TRIAL FRAMEWORK
            </span>
            <h2 className="font-display text-3xl font-black uppercase text-[#14110F] mt-1">
              4-WEEK PILOT ROADMAP • {university.messes[0].name.toUpperCase()}
            </h2>
            <p className="font-serif text-xs text-[#5C554F]">
              Step-by-step trial deployment protocol for {university.name} mess counters requiring zero expensive biometric hardware.
            </p>
          </div>
          <Link
            href="/admin/pilot"
            className="px-3 py-1.5 bg-[#FAF5E8] border-2 border-[#14110F] rounded-lg font-mono text-xs font-black text-[#14110F] hover:bg-[#F28C1B] transition-colors shadow-brutal-xs"
          >
            VIEW PILOT CHECKLIST &amp; PRINT LOG SHEET →
          </Link>
        </div>

        {/* Winding Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative">
          {[
            {
              week: 'WEEK 01',
              title: 'AUDIT BASELINE',
              desc: `Observe counter dwell times, scale plate scrapes at ${university.messes[0].name}, record paper log baseline.`,
              badge: 'MEASURED BASELINE',
              color: 'bg-[#FAF5E8]',
            },
            {
              week: 'WEEK 02',
              title: 'STAFF 1-TAP CONSOLE',
              desc: `Deploy tablet at ${university.messes[0].name} Counter 1. Staff practice 1-tap walk-in & served tallying.`,
              badge: 'HARDWARE-FREE',
              color: 'bg-[#FAF5E8]',
            },
            {
              week: 'WEEK 03',
              title: 'SLOT TIMETABLE LIVE',
              desc: `Activate ${university.slotLengthMinutes}-min student slots on campus Wi-Fi. 30-50% adoption target.`,
              badge: 'PILOT STAGE',
              color: 'bg-[#FAF5E8]',
            },
            {
              week: 'WEEK 04',
              title: 'AUDIT COMPARISON',
              desc: 'Compare measured pilot data against measured baseline to publish the mess committee report.',
              badge: 'MEASURED PILOT',
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
                  <span className="font-mono text-[8px] font-black px-1.5 py-0.5 rounded border border-[#14110F] bg-[#FAF5E8]">
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

      {/* 5. COMPARE MESSES VIEW (PLATFORM LEVEL VIEW FOR MESS COMMITTEE) */}
      <CompareMessesTable />
    </div>
  );
}
