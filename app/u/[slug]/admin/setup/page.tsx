'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Clock,
  Users,
  Layers,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { university, MessConfig } from '@/config/university';

interface Props {
  params: {
    slug: string;
  };
}

export default function UniversitySetupPage({ params }: Props) {
  const slug = params.slug || 'lpu';
  const isLpu = slug.toLowerCase() === 'lpu';

  const [messes, setMesses] = useState<MessConfig[]>(university.messes);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [dataMode, setDataMode] = useState<'demo' | 'live'>('demo');

  const filteredMesses = messes.filter((m) => {
    if (activeFilter === 'ALL') return true;
    return m.category === activeFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 pt-4" id="lpu-setup-health-page">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-4 relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded">
            TENANT CONFIGURATION • /{slug.toUpperCase()}
          </span>
          <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-saffron text-ink px-2 py-0.5 rounded border border-ink">
            MULTI-TENANT ACTIVE
          </span>
          <span className="font-mono text-[10px] bg-[#D7312B]/15 text-[#D7312B] border border-[#D7312B] px-2 py-0.5 rounded font-black">
            DATA MODE: {dataMode === 'demo' ? 'SIMULATED (DEMO)' : 'LIVE AUDIT'}
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[#14110F] uppercase tracking-wide leading-none">
            {isLpu ? 'LOVELY PROFESSIONAL UNIVERSITY (LPU)' : slug.toUpperCase()} SETUP &amp; AUDIT HEALTH
          </h1>
          <p className="font-serif italic text-sm text-[#5C554F]">
            Central mess structure, meal plan distribution, operational capacity settings, and authenticity verification.
          </p>
        </div>

        {/* ── PROMINENT HONESTY DISCLAIMER ── */}
        <div className="p-4 rounded-xl bg-[#FAF5E8] border-2 border-dashed border-[#D7312B] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#D7312B] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-mono font-black text-[#D7312B] uppercase tracking-wider block">
              OFFICIAL DISCLAIMER &amp; INTEGRITY NOTICE
            </span>
            <p className="font-serif text-[#14110F] leading-relaxed">
              Built as a student project for LPU. Not an official LPU service. UniQ makes no claim that LPU administration has approved or adopted this service. All historical queue metrics, wait calculations, and baseline counts remain strictly <strong>SIMULATED</strong> until validated directly with the LPU mess office.
            </p>
          </div>
        </div>
      </div>

      {/* ── SETUP HEALTH CHECKLIST ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#14110F]/15 pb-2">
          <h2 className="font-display text-2xl font-black uppercase text-[#14110F] tracking-wide flex items-center gap-2">
            <span>TENANT SETUP HEALTH CHECKLIST</span>
          </h2>
          <span className="font-mono text-xs font-bold text-[#5C554F]">
            LPU MESS ARCHITECTURE
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {/* Action item required */}
          <div className="p-3.5 rounded-xl bg-[#FFF8E7] border-2 border-[#F28C1B] flex items-start justify-between gap-3 shadow-brutal-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#F28C1B] shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-[#14110F] uppercase">
                  Verify mess details with the LPU mess office (19 messes)
                </span>
                <p className="font-serif text-[11px] text-[#5C554F] mt-0.5">
                  Capacities (seats, students assigned, physical counters) are currently set to <code className="bg-[#14110F]/10 px-1 rounded">NULL</code> (&ldquo;Not set yet&rdquo;) to prevent fabrication. Requires official ground truth confirmation.
                </p>
              </div>
            </div>
            <span className="bg-[#F28C1B] text-[#14110F] px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0">
              ACTION REQUIRED
            </span>
          </div>

          {/* Meal timings */}
          <div className="p-3.5 rounded-xl bg-[#FAF5E8] border-2 border-[#14110F]/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#F28C1B] shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#14110F] uppercase">
                    Meal Timings &amp; 15-Minute Slot Generation
                  </span>
                  <span className="text-[9px] bg-[#F28C1B]/20 text-[#14110F] border border-[#F28C1B] px-1.5 py-0.2 rounded font-black">
                    Unverified details
                  </span>
                </div>
                <p className="font-serif text-[11px] text-[#5C554F] mt-0.5">
                  Default schedule: Breakfast (08:00–09:30), Lunch (12:30–14:30), Snacks (17:00–18:30), Dinner (19:30–21:30). 15-min intervals. Overrides customizable per mess.
                </p>
              </div>
            </div>
            <span className="bg-[#2F6B3A]/15 text-[#2F6B3A] border border-[#2F6B3A] px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0">
              CONFIGURED
            </span>
          </div>

          {/* Meal Plans */}
          <div className="p-3.5 rounded-xl bg-[#FAF5E8] border-2 border-[#14110F]/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-[#2F6B3A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#14110F] uppercase">
                  Meal Plan Engine (Standard 4-Meal vs Basic 3-Meal)
                </span>
                <p className="font-serif text-[11px] text-[#5C554F] mt-0.5">
                  Active in database: Standard Plan (Breakfast, Lunch, Snacks, Dinner) and Basic / Custom Plan (No Snacks). Booking form dynamically excludes Snacks for Basic plan students. Kitchen forecast scales accordingly.
                </p>
              </div>
            </div>
            <span className="bg-[#2F6B3A] text-white px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0">
              ACTIVE
            </span>
          </div>

          {/* PIN security */}
          <div className="p-3.5 rounded-xl bg-[#FAF5E8] border-2 border-[#14110F]/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-[#2F6B3A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#14110F] uppercase">
                  Individual Hashed Mess PINs (19 Staff &amp; 19 Kitchen)
                </span>
                <p className="font-serif text-[11px] text-[#5C554F] mt-0.5">
                  Each mess has an isolated SHA-256 hashed 4-digit PIN. Staff members are isolated and only see their assigned service deck.
                </p>
              </div>
            </div>
            <span className="bg-[#2F6B3A] text-white px-2 py-0.5 rounded font-black text-[10px] uppercase shrink-0">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* ── 19 MESSES AUDIT DIRECTORY ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-[#14110F]/15 pb-3">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#14110F] tracking-wide">
              LPU MESS REGISTRY ({messes.length} MESSES)
            </h2>
            <p className="font-serif italic text-xs text-[#5C554F]">
              Review status, category classifications, and unverified data badges across all halls.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            {['ALL', 'CENTRAL', 'BOYS_HOSTEL', 'BOYS_STUDIO', 'GIRLS_HOSTEL', 'GIRLS_STUDIO'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 rounded-lg border-2 font-bold whitespace-nowrap text-[11px] transition-all ${
                  activeFilter === cat
                    ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F]'
                    : 'bg-[#FAF5E8] text-[#5C554F] border-[#14110F]/30 hover:border-[#14110F]'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Mess Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMesses.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border-2 border-[#14110F] bg-[#FAF5E8] shadow-brutal-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-black text-[#14110F] uppercase leading-tight">
                      {m.name}
                    </h3>
                    <span className="font-mono text-[10px] text-[#5C554F]">
                      CODE: {m.id} • {m.shortName}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-[#14110F] text-[#FAF5E8] px-2 py-0.5 rounded font-black shrink-0">
                    {m.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Attribute Pills */}
                <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                  <span className="bg-[#FAF5E8] border border-[#14110F]/30 px-1.5 py-0.5 rounded font-bold">
                    Gender: {m.gender}
                  </span>
                  {m.zone && (
                    <span className="bg-saffron/20 border border-ink/30 px-1.5 py-0.5 rounded font-bold">
                      Zone: {m.zone}
                    </span>
                  )}
                  {m.dietFlag === 'confirm' ? (
                    <span className="bg-[#D7312B]/15 text-[#D7312B] border border-[#D7312B] px-1.5 py-0.5 rounded font-black">
                      Diet: Confirm Needed
                    </span>
                  ) : (
                    <span className="bg-[#2F6B3A]/15 text-[#2F6B3A] border border-[#2F6B3A] px-1.5 py-0.5 rounded font-bold">
                      Diet: {m.dietType || 'Veg'}
                    </span>
                  )}
                </div>

                {/* Honest Capacity Metrics */}
                <div className="p-2.5 rounded-lg bg-[#EFE7D0] border border-[#14110F]/20 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C554F]">Physical Seats:</span>
                    <span className="font-bold flex items-center gap-1">
                      {m.seats ? m.seats : 'Not set yet'}
                      <span className="text-[8px] bg-[#F28C1B]/20 text-[#14110F] px-1 py-0.2 rounded border border-[#F28C1B]">
                        Unverified details
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C554F]">Students Assigned:</span>
                    <span className="font-bold flex items-center gap-1">
                      {m.students ? m.students : 'Not set yet'}
                      <span className="text-[8px] bg-[#F28C1B]/20 text-[#14110F] px-1 py-0.2 rounded border border-[#F28C1B]">
                        Unverified details
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C554F]">Serving Counters:</span>
                    <span className="font-bold flex items-center gap-1">
                      {m.counters ? m.counters : 'Not set yet'}
                      <span className="text-[8px] bg-[#F28C1B]/20 text-[#14110F] px-1 py-0.2 rounded border border-[#F28C1B]">
                        Unverified details
                      </span>
                    </span>
                  </div>
                </div>

                {/* Demo Fallback Notice */}
                <div className="text-[10px] font-mono text-[#5C554F] italic">
                  Demo queue math fallback: {m.demoCounters} counters @ {m.demoServiceRate} students/min (SIMULATED).
                </div>
              </div>

              {/* Footer status */}
              <div className="pt-2 border-t border-[#14110F]/15 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#5C554F]">DATA SOURCE:</span>
                <span className="font-black text-[#F28C1B] uppercase tracking-wider">
                  {m.dataSource}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ACTIONS ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#14110F] text-[#FAF5E8] font-mono text-xs">
        <div>
          <span className="font-bold block text-sm">Need to update mess capacities or meal timings?</span>
          <span className="text-[#FAF5E8]/70 text-xs">
            Edit the top array in <code className="text-saffron">/prisma/seed/lpu.ts</code> or configure via Admin Menu CSV.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/menu"
            className="px-4 py-2 bg-saffron text-ink font-bold uppercase rounded-lg border border-white/20 hover:opacity-90 transition-opacity"
          >
            Manage CSV Menu
          </Link>
          <Link
            href="/case-study"
            className="px-4 py-2 bg-transparent text-white border border-white/40 uppercase rounded-lg hover:bg-white/10 transition-colors"
          >
            View Case Study
          </Link>
        </div>
      </div>
    </div>
  );
}
