'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  HardDrive,
  BarChart3,
} from 'lucide-react';
import { university } from '@/config/university';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import { StampBadge } from '@/components/ui/StampBadge';

export default function AdminDataPage() {
  const [dataMode, setDataMode] = useState<'demo' | 'live'>('demo');
  const [daysCollected, setDaysCollected] = useState(0);
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showWipeModal, setShowWipeModal] = useState(false);

  const fetchDataStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setDataMode(data.dataMode || 'demo');
        setDaysCollected(data.daysCollected || 0);
        setCounts(data.counts || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataStatus();
  }, []);

  const handleToggleMode = async (mode: 'demo' | 'live') => {
    playDhabaSound('flip');
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataMode: mode }),
      });
      if (res.ok) {
        setDataMode(mode);
        setStatusMsg(`Global Data Mode switched to ${mode === 'demo' ? 'DEMO (SIMULATED)' : 'LIVE (REAL)'}!`);
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch {
      setStatusMsg('Failed to toggle mode');
    }
  };

  const handleExportData = async () => {
    playDhabaSound('press');
    try {
      const res = await fetch('/api/admin/data?export=true');
      if (res.ok) {
        const json = await res.json();
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beat-the-mess-rush-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setStatusMsg('Dataset exported successfully!');
        setTimeout(() => setStatusMsg(''), 2500);
      }
    } catch {
      setStatusMsg('Export failed');
    }
  };

  const handleWipeData = async () => {
    playDhabaSound('stamp');
    try {
      const res = await fetch('/api/admin/data', { method: 'DELETE' });
      if (res.ok) {
        const result = await res.json();
        setStatusMsg(`Wiped ${result.cleared.bookings} bookings, ${result.cleared.queueEvents} events, ${result.cleared.wasteLogs} waste logs. Switched to Live mode.`);
        setShowWipeModal(false);
        fetchDataStatus();
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch {
      setStatusMsg('Failed to wipe data');
    }
  };

  const progressPct = Math.min(100, Math.round((daysCollected / 28) * 100));

  return (
    <div className="w-full space-y-8 pb-16 max-w-6xl mx-auto">
      {/* 1. ADMIN SUBNAV */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-4 shadow-brutal-md flex flex-wrap items-center justify-between gap-3">
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
            className="px-3 py-1.5 font-mono text-xs font-black rounded-lg border-2 border-[#14110F] bg-[#14110F] text-[#FAF5E8]"
          >
            DATA &amp; EXPORT
          </Link>
          <Link
            href="/admin/pilot"
            className="px-3 py-1.5 font-mono text-xs font-bold rounded-lg border-2 border-[#14110F] bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA]"
          >
            PILOT TRIAL
          </Link>
        </div>
        <div className="font-mono text-xs font-bold text-[#5C554F]">
          ACTIVE MODE: <span className="font-black text-[#D7312B] uppercase">{dataMode}</span>
        </div>
      </div>

      {/* 2. HEADER */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded">
              DATA HONESTY &amp; STORAGE
            </span>
            <span className="font-serif italic text-xs text-[#5C554F]">
              डेटा प्रबंधन एवं निर्यात
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-[#14110F] mt-1">
            DATA MODE, AUDIT &amp; WIPE
          </h1>
          <p className="font-serif text-sm text-[#5C554F] mt-1 max-w-2xl">
            Switch between simulated demonstration data and live on-campus data for {university.name}. Export complete sqlite records or wipe demo tables before starting an empirical mess trial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 bg-[#FAF5E8] border-2 border-[#14110F] rounded-xl font-mono text-xs font-black text-[#14110F] hover:bg-[#EAE1CA] flex items-center gap-2 shadow-brutal-xs"
          >
            <Download className="w-4 h-4 text-[#F28C1B]" />
            EXPORT ALL DATA (JSON)
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] rounded-xl font-mono text-xs font-black text-[#2F6B3A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 3. GLOBAL DATA MODE TOGGLE */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6">
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#14110F]/20">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#14110F]">
              GLOBAL DATA MODE SWITCH
            </h2>
            <p className="font-serif text-xs text-[#5C554F]">
              Controls whether forecasts and charts read simulated history or only measured campus logs.
            </p>
          </div>
          <StampBadge
            text={dataMode === 'demo' ? 'DEMO (SIMULATED)' : 'LIVE (REAL)'}
            color={dataMode === 'demo' ? 'chilli' : 'green'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Demo */}
          <div
            onClick={() => handleToggleMode('demo')}
            className={`p-5 rounded-2xl border-[3px] cursor-pointer transition-all ${
              dataMode === 'demo'
                ? 'bg-[#F28C1B]/15 border-[#14110F] shadow-brutal-md'
                : 'bg-[#F4ECD8] border-[#14110F]/30 hover:border-[#14110F]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-black uppercase text-[#14110F]">
                MODE 01: DEMO (SIMULATED)
              </span>
              <span
                className={`w-4 h-4 rounded-full border-2 border-[#14110F] ${
                  dataMode === 'demo' ? 'bg-[#14110F]' : 'bg-transparent'
                }`}
              />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase text-[#14110F]">
              PITCH &amp; SIMULATION READY
            </h3>
            <p className="font-serif text-xs text-[#5C554F] mt-1 leading-relaxed">
              Enables 28 days of simulated history generated from {university.shortName} peak parameters. Every chart and figure carries the explicit <strong>[SIMULATED DATA]</strong> badge for total honesty.
            </p>
          </div>

          {/* Option B: Live */}
          <div
            onClick={() => handleToggleMode('live')}
            className={`p-5 rounded-2xl border-[3px] cursor-pointer transition-all ${
              dataMode === 'live'
                ? 'bg-[#2F6B3A]/15 border-[#14110F] shadow-brutal-md'
                : 'bg-[#F4ECD8] border-[#14110F]/30 hover:border-[#14110F]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-black uppercase text-[#2F6B3A]">
                MODE 02: LIVE (REAL PILOT)
              </span>
              <span
                className={`w-4 h-4 rounded-full border-2 border-[#14110F] ${
                  dataMode === 'live' ? 'bg-[#2F6B3A]' : 'bg-transparent'
                }`}
              />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase text-[#14110F]">
              REAL CAMPUS DEPLOYMENT
            </h3>
            <p className="font-serif text-xs text-[#5C554F] mt-1 leading-relaxed">
              Hides all simulated records. Forecast models show low-confidence tags and empty-state guidance until 28 real days of live mess logs are accumulated.
            </p>
          </div>
        </div>

        {/* Live Mode Progress Indicator */}
        {dataMode === 'live' && (
          <div className="p-5 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-black text-[#14110F] flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#2F6B3A]" />
                CAMPUS LOG ACCUMULATION PROGRESS
              </span>
              <span className="font-bold text-[#2F6B3A]">
                {daysCollected} of 28 Days Collected ({progressPct}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-[#EAE1CA] border-2 border-[#14110F] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2F6B3A] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {daysCollected < 28 ? (
              <p className="font-serif text-xs text-[#5C554F] leading-relaxed">
                <strong>Not enough data yet:</strong> Kitchen forecasts and line curves currently fall back gracefully with a &ldquo;Low Confidence&rdquo; indicator. Once 28 distinct meal days are logged, high-confidence rolling averages will activate automatically.
              </p>
            ) : (
              <p className="font-serif text-xs text-[#2F6B3A] font-bold">
                ✓ Full 4-week dataset collected! Rolling historical averages are operating at maximum empirical confidence.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 4. CURRENT RECORD COUNTS */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-lg space-y-4">
        <h2 className="font-display text-2xl font-black uppercase text-[#14110F]">
          DATABASE RECORD COUNTS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl font-mono text-xs">
            <span className="text-[#5C554F] block">SLOT BOOKINGS</span>
            <span className="font-display text-3xl font-black text-[#14110F]">
              {counts.bookingsCount ?? '—'}
            </span>
          </div>
          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl font-mono text-xs">
            <span className="text-[#5C554F] block">QUEUE EVENTS</span>
            <span className="font-display text-3xl font-black text-[#14110F]">
              {counts.queueEventsCount ?? '—'}
            </span>
          </div>
          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl font-mono text-xs">
            <span className="text-[#5C554F] block">WASTE LOGS</span>
            <span className="font-display text-3xl font-black text-[#14110F]">
              {counts.wasteLogsCount ?? '—'}
            </span>
          </div>
          <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl font-mono text-xs">
            <span className="text-[#5C554F] block">DAILY FORECASTS</span>
            <span className="font-display text-3xl font-black text-[#14110F]">
              {counts.forecastsCount ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. DANGER ZONE: WIPE SIMULATED DATA */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#D7312B] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#D7312B]" />
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#D7312B]">
            DANGER ZONE: WIPE DEMO DATA
          </h2>
        </div>

        <p className="font-serif text-xs text-[#5C554F] leading-relaxed max-w-3xl">
          Permanently delete all simulated demo records (slot bookings, queue check-ins, waste logs, and pre-calculated forecast snapshots). This leaves your university configuration, mess parameters, students, and weekly menu intact so you can start a pristine real-world pilot.
        </p>

        <button
          type="button"
          onClick={() => setShowWipeModal(true)}
          className="px-4 py-2.5 bg-[#D7312B] text-white border-2 border-[#14110F] rounded-xl font-mono text-xs font-black uppercase hover:bg-[#b52621] shadow-brutal-xs flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          WIPE ALL SIMULATED DEMO DATA
        </button>
      </div>

      {/* Confirmation Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-[#14110F]/70 flex items-center justify-center p-4">
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 max-w-md w-full shadow-brutal-xl space-y-4">
            <div className="flex items-center gap-2 text-[#D7312B]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-display text-2xl font-black uppercase">
                CONFIRM WIPE?
              </h3>
            </div>
            <p className="font-serif text-xs text-[#14110F] leading-relaxed">
              Are you sure? This will delete all simulated historical queue events, bookings, and logs. Your weekly menu and student roll numbers will remain preserved. The app will be placed into Live Mode.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2 border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold bg-[#FAF5E8] text-[#14110F]"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleWipeData}
                className="px-4 py-2 bg-[#D7312B] text-white border-2 border-[#14110F] rounded-lg font-mono text-xs font-black uppercase hover:bg-[#b52621]"
              >
                YES, WIPE DATA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
