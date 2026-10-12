'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  CheckCircle2,
  Users,
  Sliders,
  Shield,
  Zap,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';
import { StampBadge } from '@/components/ui/StampBadge';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';

export default function AdminPage() {
  const [messes, setMesses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedMessCode, setSelectedMessCode] = useState('mess-1');
  const [lowThresh, setLowThresh] = useState(15);
  const [highThresh, setHighThresh] = useState(35);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [rushIntensity, setRushIntensity] = useState<'Standard' | 'Heavy' | 'Overload'>('Heavy');
  const [simStatus, setSimStatus] = useState<{ running: boolean; ticksRemaining: number }>({
    running: false,
    ticksRemaining: 0,
  });

  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        setMesses(data.messes || []);
        setStudents(data.students || []);

        const active = data.messes?.find((m: any) => m.code === selectedMessCode);
        if (active) {
          setLowThresh(active.queueLowThresh);
          setHighThresh(active.queueHighThresh);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [selectedMessCode]);

  // Poll simulation status
  useEffect(() => {
    const checkSim = async () => {
      try {
        const res = await fetch('/api/simulate');
        if (res.ok) {
          const data = await res.json();
          setSimStatus(data);
        }
      } catch {
        // quiet
      }
    };
    checkSim();
    const interval = setInterval(checkSim, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');
    playDhabaSound('press');

    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messCode: selectedMessCode,
          queueLowThresh: Number(lowThresh),
          queueHighThresh: Number(highThresh),
        }),
      });

      if (res.ok) {
        setStatusMsg('Threshold boundaries updated across all student & staff boards!');
        loadAdminData();
        playDhabaSound('stamp');
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch {
      setStatusMsg('Failed to update thresholds');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSim = async () => {
    playDhabaSound('stamp');
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messCode: selectedMessCode }),
      });
      if (res.ok) {
        setSimStatus({ running: true, ticksRemaining: 15 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Preview crowd level calculation based on threshold
  const sampleCount = 24;
  const previewLevel =
    sampleCount <= lowThresh ? 'QUIET' : sampleCount >= highThresh ? 'BUSY' : 'MODERATE';
  const previewColor =
    previewLevel === 'QUIET' ? '#2F6B3A' : previewLevel === 'MODERATE' ? '#F28C1B' : '#D7312B';

  return (
    <div className="w-full space-y-7 pb-16" id="admin-control-page">
      {/* 1. ADMIN DISPATCH BOARD */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded">
              WARDEN &amp; MESS COMMITTEE
            </span>
            <span className="font-serif italic text-xs text-[#5C554F]">
              प्रशासन नियंत्रण कक्ष
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[#14110F] uppercase tracking-wide">
            HOSTEL MESS ADMINISTRATION
          </h1>
          <p className="font-serif text-sm text-[#5C554F]">
            Adjust threshold boundaries, trigger live presentation rush hour simulation, and inspect privacy directory.
          </p>
        </div>

        <StampBadge text="SYSTEM CONTROL" color="saffron" />
      </div>

      {statusMsg && (
        <div className="p-4 bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] text-[#2F6B3A] rounded-xl font-mono text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. BIG RED EMERGENCY-STYLE RUSH HOUR INJECTOR BUTTON WITH INTENSITY DIAL */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-xl relative overflow-hidden">
        {/* Hazard Stripes Border at Top */}
        <div className="absolute top-0 inset-x-0 h-3 bg-[repeating-linear-gradient(45deg,#14110F_0px,#14110F_12px,#F2B705_12px,#F2B705_24px)]" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-2">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D7312B] animate-ping" />
              <span className="font-mono text-xs font-black uppercase tracking-widest text-[#D7312B]">
                LIVE RUSH SIMULATION ENGINE
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#14110F] uppercase leading-tight">
              TRIGGER 30-SEC PEAK RUSH HOUR
            </h2>
            <p className="font-serif text-xs text-[#5C554F] leading-relaxed">
              Injects synthetic arriving students into the live database for 30 seconds. All student coach densities, staff split-flap departure boards, and kitchen orders update dynamically in real time.
            </p>
          </div>

          {/* Right Side: Intensity Dial & Giant Emergency Button */}
          <div className="flex flex-col sm:flex-row items-center gap-5 self-stretch lg:self-auto justify-end">
            {/* Physical Intensity Selector Switch */}
            <div className="p-3 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl text-center space-y-1.5 shadow-brutal-xs">
              <div className="font-mono text-[9px] font-black uppercase text-[#5C554F]">
                INTENSITY LEVEL
              </div>
              <div className="flex gap-1">
                {(['Standard', 'Heavy', 'Overload'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setRushIntensity(lvl);
                      playDhabaSound('press');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase transition ${
                      rushIntensity === lvl
                        ? 'bg-[#14110F] text-[#FAF5E8]'
                        : 'text-[#5C554F] hover:text-[#14110F]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Giant Red Emergency Button */}
            {simStatus.running ? (
              <div className="p-6 rounded-2xl bg-[#D7312B] text-[#FAF5E8] border-[3px] border-[#14110F] shadow-brutal-md text-center font-mono font-black animate-pulse">
                <div className="text-xs uppercase tracking-widest text-[#FAF5E8]/80">
                  SIMULATION ACTIVE
                </div>
                <div className="font-display text-4xl text-[#FAF5E8] leading-none my-1">
                  {simStatus.ticksRemaining * 2}S REMAINING
                </div>
                <div className="text-[10px] text-[#FAF5E8]/80">
                  GENERATING LIVE ADMISSIONS...
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTriggerSim}
                className="dhaba-btn dhaba-btn-giant px-8 py-6 bg-[#D7312B] text-[#FAF5E8] hover:bg-[#E03A34] active:bg-[#B52520] border-[4px] border-[#14110F] text-center select-none cursor-pointer flex flex-col items-center gap-1 shadow-brutal-lg"
              >
                <span className="w-10 h-10 rounded-full bg-[#FAF5E8] border-2 border-[#14110F] flex items-center justify-center text-[#D7312B] shadow-inner mb-0.5">
                  <Zap className="w-6 h-6 fill-current" />
                </span>
                <span className="font-display text-3xl font-black tracking-wider leading-none">
                  SIMULATE RUSH HOUR
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#FAF5E8]/90">
                  PRESS EMERGENCY BUTTON
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. THRESHOLD SETTINGS & DYNAMIC PREVIEW GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-7 shadow-brutal-md space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#14110F]/15 pb-3">
              <Sliders className="w-4 h-4 text-[#F28C1B]" />
              <h2 className="font-display text-2xl font-black uppercase text-[#14110F]">
                CONGESTION THRESHOLD BOUNDARIES
              </h2>
            </div>

            <form onSubmit={handleSaveThresholds} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-xs font-black uppercase text-[#14110F] mb-1">
                    TARGET MESS HALL
                  </label>
                  <select
                    id="admin-select-mess"
                    value={selectedMessCode}
                    onChange={(e) => setSelectedMessCode(e.target.value)}
                    className="w-full bg-[#FAF5E8] border-2 border-[#14110F] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#14110F] focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
                  >
                    {messes.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-black uppercase text-[#14110F] mb-1">
                    QUIET CAP (MAX HEADCOUNT)
                  </label>
                  <input
                    id="admin-low-thresh"
                    type="number"
                    value={lowThresh}
                    onChange={(e) => setLowThresh(Number(e.target.value))}
                    className="w-full bg-[#FAF5E8] border-2 border-[#14110F] rounded-xl px-3 py-2 text-xl font-mono font-black text-[#14110F] focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
                  />
                  <span className="font-mono text-[10px] text-[#5C554F] mt-1 block">
                    Under {lowThresh} displays as Quiet (Green)
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs font-black uppercase text-[#14110F] mb-1">
                    BUSY FLOOR (MIN HEADCOUNT)
                  </label>
                  <input
                    id="admin-high-thresh"
                    type="number"
                    value={highThresh}
                    onChange={(e) => setHighThresh(Number(e.target.value))}
                    className="w-full bg-[#FAF5E8] border-2 border-[#14110F] rounded-xl px-3 py-2 text-xl font-mono font-black text-[#14110F] focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
                  />
                  <span className="font-mono text-[10px] text-[#5C554F] mt-1 block">
                    Above {highThresh} displays as Busy (Red)
                  </span>
                </div>
              </div>

              <TactileButton
                id="admin-btn-save-thresholds"
                type="submit"
                variant="saffron"
                size="md"
                disabled={loading}
                className="mt-2 text-sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                SAVE CONGESTION THRESHOLDS
              </TactileButton>
            </form>
          </div>
        </div>

        {/* Live Threshold Preview Gauge */}
        <div>
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md flex flex-col items-center justify-center text-center h-full">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#5C554F] mb-3">
              LIVE GAUGE PREVIEW (AT {sampleCount} QUEUE)
            </span>

            {/* Illustrated Threshold Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <circle cx="50" cy="50" r="42" fill="#FAF5E8" stroke="#14110F" strokeWidth="3" />
                <path
                  d="M 20 70 A 36 36 0 1 1 80 70"
                  stroke={previewColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute font-display text-2xl font-black text-[#14110F]">
                {previewLevel}
              </div>
            </div>

            <div className="font-serif text-xs text-[#5C554F] mt-3 leading-relaxed">
              When counter reaches 24 students, departure boards will display{' '}
              <strong style={{ color: previewColor }} className="font-bold">
                {previewLevel}
              </strong>.
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRIVACY-FIRST STUDENT REGISTRY */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#14110F]/15 pb-3 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F28C1B]" />
              <h2 className="font-display text-2xl font-black uppercase text-[#14110F]">
                STUDENT DIRECTORY SAMPLE ({students.length || 608} TOTAL)
              </h2>
            </div>
            <p className="font-serif text-xs text-[#5C554F] mt-0.5">
              Privacy by design: Only anonymized roll numbers &amp; streaks stored. Zero biometric or facial capture.
            </p>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#2F6B3A]">
            <Lock className="w-4 h-4" />
            <span>100% HARDWARE-FREE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {students.slice(0, 16).map((stu) => (
            <div
              key={stu.rollNumber}
              className="p-2.5 rounded-lg bg-[#F4ECD8] border-2 border-[#14110F] text-center font-mono"
            >
              <div className="font-black text-xs text-[#14110F]">{stu.rollNumber}</div>
              <div className="text-[10px] text-[#F28C1B] font-bold">🔥 {stu.offPeakStreak}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
