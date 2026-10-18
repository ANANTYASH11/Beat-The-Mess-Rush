'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  CheckSquare,
  Square,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  Scale,
  ClipboardList,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { university } from '@/config/university';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import { StampBadge } from '@/components/ui/StampBadge';

export default function AdminPilotPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [baselineWait, setBaselineWait] = useState('22');
  const [baselineWaste, setBaselineWaste] = useState('136');
  const [measuredWait, setMeasuredWait] = useState('7');
  const [measuredWaste, setMeasuredWaste] = useState('102');
  const [notes, setNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pilot')
      .then((res) => res.json())
      .then((data) => {
        if (data.checklist) setChecklist(data.checklist);
        if (data.baseline?.waitMin) setBaselineWait(data.baseline.waitMin);
        if (data.baseline?.wasteKg) setBaselineWaste(data.baseline.wasteKg);
        if (data.measured?.waitMin) setMeasuredWait(data.measured.waitMin);
        if (data.measured?.wasteKg) setMeasuredWaste(data.measured.wasteKg);
        if (data.notes) setNotes(data.notes);
      })
      .catch(console.error);
  }, []);

  const toggleCheck = (key: string) => {
    playDhabaSound('flip');
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    savePilotData(updated);
  };

  const savePilotData = async (updatedChecklist = checklist) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: updatedChecklist,
          baselineWaitMin: baselineWait,
          baselineWasteKg: baselineWaste,
          measuredWaitMin: measuredWait,
          measuredWasteKg: measuredWaste,
          notes,
        }),
      });
      if (res.ok) {
        setStatusMsg('Pilot trial settings and measured baseline saved successfully!');
        playDhabaSound('stamp');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch {
      setStatusMsg('Failed to save pilot data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    playDhabaSound('press');
    window.print();
  };

  const intervals = [
    '12:30', '12:40', '12:50', '13:00', '13:10', '13:20',
    '13:30', '13:40', '13:50', '14:00', '14:10', '14:20'
  ];

  return (
    <div className="w-full space-y-8 pb-16 max-w-6xl mx-auto">
      {/* 1. ADMIN SUBNAV (HIDDEN IN PRINT) */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-4 shadow-brutal-md flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#14110F] bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA]"
          >
            CONTROLS
          </Link>
          <Link
            href="/admin/menu"
            className="px-3 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#14110F] bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA]"
          >
            WEEKLY MENU
          </Link>
          <Link
            href="/admin/data"
            className="px-3 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#14110F] bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA]"
          >
            DATA &amp; EXPORT
          </Link>
          <Link
            href="/admin/pilot"
            className="px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#14110F] bg-[#14110F] text-[#FAF5E8]"
          >
            PILOT TRIAL
          </Link>
        </div>
        <div className="font-mono text-xs font-bold text-[#5C554F]">
          MESS COMMITTEE: <span className="font-black text-[#14110F]">{university.messCommittee.contactName}</span>
        </div>
      </div>

      {/* 2. HEADER (HIDDEN IN PRINT) */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase bg-[#2F6B3A] text-[#FAF5E8] px-2.5 py-0.5 rounded">
              CAMPUS TRIAL PROTOCOL
            </span>
            <span className="font-serif italic text-xs text-[#5C554F]">
              प्रायोगिक परीक्षण रूपरेखा
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-[#14110F] mt-1">
            REAL PILOT TRIAL &amp; BASELINE AUDIT
          </h1>
          <p className="font-serif text-sm text-[#5C554F] mt-1 max-w-2xl">
            Protocol for {university.messes[0].name} ({university.shortName}): 1 week baseline manual observation, 2 weeks app pilot, followed by comparative reporting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#F28C1B] border-2 border-[#14110F] rounded-xl font-mono text-xs font-black text-[#14110F] hover:bg-[#e07f15] flex items-center gap-2 shadow-brutal-xs"
          >
            <Printer className="w-4 h-4" />
            PRINT 1-PAGE PAPER LOG SHEET
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] rounded-xl font-mono text-xs font-black text-[#2F6B3A] flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 3. THREE-PHASE PILOT CHECKLIST (HIDDEN IN PRINT) */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6 print:hidden">
        <div className="border-b-2 border-[#14110F]/20 pb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#14110F]">
            3-PHASE TRIAL CHECKLIST
          </h2>
          <span className="font-mono text-xs text-[#5C554F] font-bold">
            {university.messes[0].name} • {university.messes[0].students} Students
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phase 1: Baseline Week */}
          <div className="p-5 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#14110F]/20">
              <span className="font-mono text-xs font-black text-[#D7312B] uppercase">
                PHASE 01: 1-WEEK BASELINE
              </span>
              <span className="font-mono text-[9px] bg-[#FAF5E8] px-1.5 py-0.5 rounded border border-[#14110F] font-bold">
                MANUAL
              </span>
            </div>
            <p className="font-serif text-xs text-[#5C554F]">
              Collect ground truth before introducing student slots or app nudges.
            </p>
            <div className="space-y-2 pt-1 font-mono text-xs">
              {[
                { id: 'b1', text: 'Print paper log sheets for Counter 1 & 2' },
                { id: 'b2', text: 'Place spring/digital scale at plate return window' },
                { id: 'b3', text: 'Record queue count every 10 min during lunch peak' },
                { id: 'b4', text: 'Weigh leftover pots & plate waste per meal' },
                { id: 'b5', text: 'Enter 7-day average into form below' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-start gap-2 cursor-pointer hover:text-[#D7312B]"
                >
                  {checklist[item.id] ? (
                    <CheckSquare className="w-4 h-4 text-[#2F6B3A] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-[#5C554F] shrink-0 mt-0.5" />
                  )}
                  <span className={checklist[item.id] ? 'line-through text-[#8E857C]' : 'text-[#14110F]'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2: Pilot Activation */}
          <div className="p-5 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#14110F]/20">
              <span className="font-mono text-xs font-black text-[#F28C1B] uppercase">
                PHASE 02: 2-WEEKS PILOT
              </span>
              <span className="font-mono text-[9px] bg-[#FAF5E8] px-1.5 py-0.5 rounded border border-[#14110F] font-bold">
                LIVE APP
              </span>
            </div>
            <p className="font-serif text-xs text-[#5C554F]">
              Roll out software with 1-tap tablet at counter and student slot link.
            </p>
            <div className="space-y-2 pt-1 font-mono text-xs">
              {[
                { id: 'p1', text: 'Place tablet at Counter 1 with Staff Console' },
                { id: 'p2', text: 'Share student booking web link on hostel group' },
                { id: 'p3', text: 'Cooks check blended forecast at 07:00 and 11:30' },
                { id: 'p4', text: 'Staff log daily waste with 1-click kitchen log' },
                { id: 'p5', text: 'Allow walk-ins without friction or penalties' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-start gap-2 cursor-pointer hover:text-[#F28C1B]"
                >
                  {checklist[item.id] ? (
                    <CheckSquare className="w-4 h-4 text-[#2F6B3A] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-[#5C554F] shrink-0 mt-0.5" />
                  )}
                  <span className={checklist[item.id] ? 'line-through text-[#8E857C]' : 'text-[#14110F]'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3: Comparative Audit */}
          <div className="p-5 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#14110F]/20">
              <span className="font-mono text-xs font-black text-[#2F6B3A] uppercase">
                PHASE 03: COMPARATIVE AUDIT
              </span>
              <span className="font-mono text-[9px] bg-[#FAF5E8] px-1.5 py-0.5 rounded border border-[#14110F] font-bold">
                REPORT
              </span>
            </div>
            <p className="font-serif text-xs text-[#5C554F]">
              Compare measured baseline against pilot outcomes and present findings.
            </p>
            <div className="space-y-2 pt-1 font-mono text-xs">
              {[
                { id: 'c1', text: 'Calculate average queue wait drop (minutes)' },
                { id: 'c2', text: 'Total food waste saved (kg and ₹ at ₹42/kg)' },
                { id: 'c3', text: 'Enter measured pilot figures in form below' },
                { id: 'c4', text: 'Export JSON audit archive from Data page' },
                { id: 'c5', text: 'Submit summary to Mess Warden & Committee' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-start gap-2 cursor-pointer hover:text-[#2F6B3A]"
                >
                  {checklist[item.id] ? (
                    <CheckSquare className="w-4 h-4 text-[#2F6B3A] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-[#5C554F] shrink-0 mt-0.5" />
                  )}
                  <span className={checklist[item.id] ? 'line-through text-[#8E857C]' : 'text-[#14110F]'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. FORM: ENTER MEASURED NUMBERS FOR THE IMPACT PAGE (HIDDEN IN PRINT) */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6 print:hidden">
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#14110F]/20 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#14110F]">
              ENTER MEASURED PILOT FIGURES (FOR IMPACT PAGE)
            </h2>
            <p className="font-serif text-xs text-[#5C554F]">
              These recorded numbers will display on the Impact page explicitly labeled as <strong>Measured baseline</strong> and <strong>Measured pilot</strong>.
            </p>
          </div>
          <Link
            href="/impact"
            className="font-mono text-xs font-bold text-[#14110F] hover:text-[#F28C1B] underline flex items-center gap-1"
          >
            VIEW IMPACT PAGE <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-1">
            <span className="font-mono text-[10px] font-bold text-[#D7312B] uppercase block">
              01. BASELINE PEAK WAIT (MIN)
            </span>
            <input
              type="number"
              value={baselineWait}
              onChange={(e) => setBaselineWait(e.target.value)}
              placeholder="e.g. 22"
              className="w-full px-3 py-2 bg-white border-2 border-[#14110F] rounded-lg font-mono text-sm font-black"
            />
            <span className="font-mono text-[9px] text-[#5C554F]">Status quo without system</span>
          </div>

          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-1">
            <span className="font-mono text-[10px] font-bold text-[#D7312B] uppercase block">
              02. BASELINE DAILY WASTE (KG)
            </span>
            <input
              type="number"
              value={baselineWaste}
              onChange={(e) => setBaselineWaste(e.target.value)}
              placeholder="e.g. 136"
              className="w-full px-3 py-2 bg-white border-2 border-[#14110F] rounded-lg font-mono text-sm font-black"
            />
            <span className="font-mono text-[9px] text-[#5C554F]">Plates + pots combined</span>
          </div>

          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-1">
            <span className="font-mono text-[10px] font-bold text-[#2F6B3A] uppercase block">
              03. PILOT PEAK WAIT (MIN)
            </span>
            <input
              type="number"
              value={measuredWait}
              onChange={(e) => setMeasuredWait(e.target.value)}
              placeholder="e.g. 7"
              className="w-full px-3 py-2 bg-white border-2 border-[#14110F] rounded-lg font-mono text-sm font-black"
            />
            <span className="font-mono text-[9px] text-[#5C554F]">Measured with staggered slots</span>
          </div>

          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-1">
            <span className="font-mono text-[10px] font-bold text-[#2F6B3A] uppercase block">
              04. PILOT DAILY WASTE (KG)
            </span>
            <input
              type="number"
              value={measuredWaste}
              onChange={(e) => setMeasuredWaste(e.target.value)}
              placeholder="e.g. 102"
              className="w-full px-3 py-2 bg-white border-2 border-[#14110F] rounded-lg font-mono text-sm font-black"
            />
            <span className="font-mono text-[9px] text-[#5C554F]">Measured with right-sized cooking</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => savePilotData()}
            disabled={loading}
            className="px-5 py-2.5 bg-[#14110F] text-[#FAF5E8] hover:bg-[#2F6B3A] border-2 border-[#14110F] rounded-xl font-mono text-xs font-black uppercase flex items-center gap-2 shadow-brutal-sm"
          >
            <Save className="w-4 h-4" />
            SAVE MEASURED FIGURES TO IMPACT PAGE
          </button>
        </div>
      </div>

      {/* 5. PRINTABLE ONE-PAGE PAPER LOG SHEET (OPTIMIZED FOR A4 PRINT) */}
      <div className="border-[3px] border-[#14110F] rounded-2xl p-8 bg-white text-black shadow-brutal-xl print:border-none print:shadow-none print:p-0 print:m-0">
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div>
            <div className="font-mono text-[11px] font-black uppercase tracking-widest text-black">
              {university.name.toUpperCase()} • MESS AUDIT PROTOCOL
            </div>
            <h2 className="font-display text-3xl font-black uppercase text-black tracking-wide leading-tight">
              WEEK 1 BASELINE OBSERVATION LOG SHEET
            </h2>
          </div>
          <div className="text-right font-mono text-[10px]">
            <div>FORM: CS-BL-01</div>
            <div>PILOT: 1-WEEK PRE-TRIAL</div>
          </div>
        </div>

        {/* Form Metadata Fields */}
        <div className="grid grid-cols-4 gap-4 py-4 border-b-2 border-black font-mono text-xs">
          <div>
            <span className="font-bold block text-[10px] uppercase text-gray-700">DATE:</span>
            <div className="border-b border-black h-6" />
          </div>
          <div>
            <span className="font-bold block text-[10px] uppercase text-gray-700">MESS HALL:</span>
            <div className="font-bold">{university.messes[0].name}</div>
          </div>
          <div>
            <span className="font-bold block text-[10px] uppercase text-gray-700">MEAL PERIOD:</span>
            <div className="font-bold">Lunch (12:30 - 14:30)</div>
          </div>
          <div>
            <span className="font-bold block text-[10px] uppercase text-gray-700">OBSERVER / WARDEN:</span>
            <div className="border-b border-black h-6" />
          </div>
        </div>

        {/* Section A: 10-Minute Queue Headcounts */}
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs font-black">
            <span>SECTION A: 10-MINUTE INTERVAL QUEUE HEADCOUNT</span>
            <span className="text-[10px] font-normal text-gray-600">Count students waiting before counter</span>
          </div>

          <table className="w-full text-left font-mono text-xs border-2 border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black text-[10px]">
                <th className="p-2 border-r border-black w-24">TIME</th>
                <th className="p-2 border-r border-black w-32">QUEUE LENGTH (#)</th>
                <th className="p-2 border-r border-black w-36">EST. DWELL TIME (MIN)</th>
                <th className="p-2">NOTES (Bottle-neck, slow item, tray refill)</th>
              </tr>
            </thead>
            <tbody>
              {intervals.map((t) => (
                <tr key={t} className="border-b border-black/40 h-7">
                  <td className="p-1.5 border-r border-black font-bold">{t}</td>
                  <td className="p-1.5 border-r border-black" />
                  <td className="p-1.5 border-r border-black" />
                  <td className="p-1.5" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section B: Food Waste Weigh-In */}
        <div className="pt-6 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs font-black">
            <span>SECTION B: POST-MEAL FOOD WASTE WEIGH-IN (PLATFORM SCALE)</span>
            <span className="text-[10px] font-normal text-gray-600">Tare vessel weight before measuring</span>
          </div>

          <table className="w-full text-left font-mono text-xs border-2 border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black text-[10px]">
                <th className="p-2 border-r border-black w-48">WASTE CATEGORY</th>
                <th className="p-2 border-r border-black w-32">GROSS WT (KG)</th>
                <th className="p-2 border-r border-black w-32">TARE WT (KG)</th>
                <th className="p-2 border-r border-black w-32">NET WT (KG)</th>
                <th className="p-2">INITIALS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black/40 h-8">
                <td className="p-1.5 border-r border-black font-bold">Plate Return Scrape Bin #1</td>
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5" />
              </tr>
              <tr className="border-b border-black/40 h-8">
                <td className="p-1.5 border-r border-black font-bold">Plate Return Scrape Bin #2</td>
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5" />
              </tr>
              <tr className="border-b border-black/40 h-8">
                <td className="p-1.5 border-r border-black font-bold">Kitchen Pot Leftovers (Dal/Curry)</td>
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5" />
              </tr>
              <tr className="border-b border-black/40 h-8">
                <td className="p-1.5 border-r border-black font-bold">Kitchen Pot Leftovers (Rice/Roti)</td>
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5 border-r border-black" />
                <td className="p-1.5" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="pt-6 grid grid-cols-2 gap-8 font-mono text-xs">
          <div>
            <div className="border-b border-black h-8" />
            <span className="text-[10px] text-gray-700 block mt-1">HEAD COOK SIGNATURE &amp; DATE</span>
          </div>
          <div>
            <div className="border-b border-black h-8" />
            <span className="text-[10px] text-gray-700 block mt-1">MESS COMMITTEE OBSERVER SIGNATURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
