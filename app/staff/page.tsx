'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  CheckCircle,
  Hash,
  WifiOff,
  Sliders,
} from 'lucide-react';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useActiveMess } from '@/hooks/useActiveMess';
import { SplitFlapBoard } from '@/components/ui/SplitFlap';
import { TiffinIcon } from '@/components/ui/DhabaIcons';
import { StampBadge } from '@/components/ui/StampBadge';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import { UniQInsightsPanel } from '@/components/insights/UniQInsightsPanel';

export default function StaffPage() {
  const { messCode, activeMess, shortName } = useActiveMess();
  const [checkinInput, setCheckinInput] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // SWR live queue with fast 4s polling for staff
  const { queue, refreshQueue } = useQueueStatus(messCode, 4000);

  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'success', onUndo?: () => void) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, message: msg, type, onUndo };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Offline queue hook
  const { isOnline, offlineCount, enqueueAction } = useOfflineQueue(() => {
    refreshQueue();
    addToast('Central database synchronized with local tokens.', 'info');
  });

  // 1-Tap Walk-in Action
  const handleWalkIn = async () => {
    playDhabaSound('press');
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'WALKIN', messCode }),
      });

      if (res.ok) {
        addToast('+1 Walk-in Student Admitted', 'success', () => handleDriftAdjust(-1));
        refreshQueue();
      } else {
        throw new Error('Server error');
      }
    } catch {
      enqueueAction('/api/queue', { action: 'WALKIN', messCode });
      addToast('Offline: Walk-in saved locally', 'info');
    }
  };

  // 1-Tap Served Action (with counter bell ding!)
  const handleServed = async () => {
    playDhabaSound('ding');
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SERVED', messCode }),
      });

      if (res.ok) {
        addToast('Student Served & Line Advanced 🔔', 'success', () => handleDriftAdjust(1));
        refreshQueue();
      } else {
        throw new Error('Server error');
      }
    } catch {
      enqueueAction('/api/queue', { action: 'SERVED', messCode });
      addToast('Offline: Served action saved locally', 'info');
    }
  };

  // Check-In by 4-Digit Code or Roll
  const handleCodeCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = checkinInput.trim();
    if (!code) return;

    playDhabaSound('stamp');
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHECKIN', messCode, codeOrRoll: code }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(data.message || `Token Verified: ${code}`, 'success');
        setCheckinInput('');
        refreshQueue();
      } else {
        addToast(data.error || 'Token verification failed', 'error');
      }
    } catch {
      enqueueAction('/api/queue', { action: 'CHECKIN', messCode, codeOrRoll: code });
      addToast(`Offline: Token ${code} stored locally`, 'info');
      setCheckinInput('');
    }
  };

  // Manual Drift Headcount Adjustment
  const handleDriftAdjust = async (delta: number) => {
    playDhabaSound('press');
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DRIFT_ADJUST', messCode, delta }),
      });
      if (res.ok) {
        addToast(`Headcount adjusted by ${delta > 0 ? '+' : ''}${delta}`, 'info');
        refreshQueue();
      }
    } catch {
      enqueueAction('/api/queue', { action: 'DRIFT_ADJUST', messCode, delta });
      addToast(`Offline: Adjusted ${delta > 0 ? '+' : ''}${delta}`, 'info');
    }
  };

  const queueCount = queue?.currentQueue ?? 18;
  const waitEstimate = queue?.waitRange ?? '5-8 min';
  const serviceRate = queue?.serviceRate ?? 7.5;
  const crowdLevel = (queue?.crowdLevel ?? 'MEDIUM').toUpperCase();

  // Animated tiffin icons representing waiting students in line
  const tiffinIcons = Array.from({ length: Math.min(20, Math.max(3, queueCount)) });

  return (
    <div
      className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-3 sm:py-6 space-y-3 sm:space-y-5 pb-20"
      id="staff-control-console"
    >
      {/* Toast notifications with Undo */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* OFFLINE STRIP */}
      <AnimatePresence>
        {(!isOnline || offlineCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="p-3 bg-[#D7312B] text-white border-2 border-ink rounded-xl shadow-offset-sm flex items-center justify-between font-mono font-black text-xs sm:text-sm tracking-wider uppercase select-none"
          >
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 animate-pulse" />
              <span>
                COUNTER OFFLINE • SAVING TOKENS LOCALLY ({offlineCount})
              </span>
            </div>
            <span className="bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded text-xs border border-[#FAF5E8]">
              AUTO-SYNC PENDING
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONSOLE HEADER BOARD */}
      <div className="bg-[#FAF5E8] dark:bg-[#221D18] border-2 border-ink rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-offset-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-[#D7312B] text-white px-2 py-0.5 rounded border border-ink">
              STAFF CONSOLE
            </span>
            <span className="font-mono text-xs font-bold text-ink-muted">
              SERVING LINE #1 • {shortName.toUpperCase()}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-5xl font-black text-ink uppercase tracking-wide leading-none">
            SERVING COUNTER DECK
          </h1>
          <p className="font-serif italic text-xs sm:text-sm text-ink-muted hidden sm:block">
            High-contrast 1-tap console built for steam, noise, and rapid queue handling.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="bg-[#1C2220] dark:bg-[#151210] border-2 border-ink text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-center shadow-offset-xs">
            <div className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-[#A39B8F]">
              THROUGHPUT
            </div>
            <div className="font-display text-lg sm:text-2xl text-[#58B971] tracking-wider leading-none">
              ~{serviceRate} / MIN
            </div>
          </div>
          <StampBadge text="LIVE DISPATCH" color="saffron" />
        </div>
      </div>

      {/* 
        LAYOUT ORDER:
        Desktop: Header, then Live Board (Left 60%) next to the three huge controls (Right 40%),
                 then notes panel, then insights cards.
        Mobile:  Header, then Board on top, then controls directly below it, then notes panel, then insights last.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        {/* LEFT 60% on desktop (lg:col-span-7): Live Split-Flap Board */}
        <div className="lg:col-span-7 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-widest text-ink block">
                LIVE COUNTER STATUS
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-black text-ink uppercase leading-none">
                COUNTER QUEUE STATUS
              </h2>
            </div>
            <span className="font-mono text-[10px] sm:text-xs font-bold text-ink-muted">
              SPLIT-FLAP
            </span>
          </div>

          <SplitFlapBoard
            messLabel={shortName.toUpperCase()}
            queueCount={queueCount}
            waitRange={waitEstimate}
            crowdStatus={crowdLevel}
          />
        </div>

        {/* RIGHT 40% on desktop (lg:col-span-5): The Three Huge Controls */}
        <div className="lg:col-span-5 flex flex-col gap-2 sm:gap-3">
          {/* CONTROL 1: +1 WALK-IN */}
          <button
            type="button"
            onClick={handleWalkIn}
            className="w-full min-h-[64px] sm:min-h-[102px] p-2.5 sm:p-5 bg-[#F2B705] text-[#14110F] hover:bg-[#F7C11E] active:bg-[#DDA300] cursor-pointer text-left flex items-center justify-between gap-3 border-2 border-ink rounded-xl sm:rounded-2xl shadow-offset-md select-none transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#14110F]/70 block">
                GATE ADMISSION
              </span>
              <span className="font-display text-2xl sm:text-4xl font-black tracking-wide text-[#14110F] block leading-none">
                +1 WALK-IN
              </span>
              <span className="font-serif italic text-[11px] sm:text-xs text-[#14110F]/80 block">
                Tap when student joins serving queue
              </span>
            </div>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-[#14110F] text-[#FAF5E8] border-2 border-ink flex items-center justify-center shrink-0 shadow-offset-xs">
              <UserPlus className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
          </button>

          {/* CONTROL 2: CHECK-IN BY CODE */}
          <div className="bg-[#FAF5E8] dark:bg-[#221D18] border-2 border-ink rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-offset-md">
            <form onSubmit={handleCodeCheckIn} className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] sm:text-xs font-black uppercase text-ink flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#F28C1B]" />
                  <span>CHECK-IN BY CODE</span>
                </label>
                <span className="font-mono text-[10px] text-ink-muted">
                  CODE OR ROLL
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={checkinInput}
                  onChange={(e) => setCheckinInput(e.target.value)}
                  placeholder="e.g. 1518 or 12200014"
                  className="flex-1 bg-bg border-2 border-ink rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-base sm:text-xl font-mono font-black text-ink placeholder-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
                />
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#14110F] dark:bg-[#F4ECD8] text-[#FAF5E8] dark:text-[#14110F] hover:bg-[#2A2521] text-sm sm:text-base font-display tracking-wider uppercase rounded-lg sm:rounded-xl border-2 border-ink shrink-0 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  VERIFY &amp; ADMIT
                </button>
              </div>
            </form>
          </div>

          {/* CONTROL 3: SERVED & EXIT */}
          <button
            type="button"
            onClick={handleServed}
            className="w-full min-h-[64px] sm:min-h-[102px] p-2.5 sm:p-5 bg-[#2F6B3A] text-white hover:bg-[#377A44] active:bg-[#25572E] cursor-pointer text-left flex items-center justify-between gap-3 border-2 border-ink rounded-xl sm:rounded-2xl shadow-offset-md select-none transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white/70 block">
                COUNTER COMPLETE
              </span>
              <span className="font-display text-2xl sm:text-4xl font-black tracking-wide text-white block leading-none">
                SERVED &amp; EXIT
              </span>
              <span className="font-serif italic text-[11px] sm:text-xs text-white/80 block">
                Tap when plate is handed out (rings bell 🔔)
              </span>
            </div>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-white text-[#2F6B3A] border-2 border-ink flex items-center justify-center shrink-0 shadow-offset-xs">
              <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
          </button>
        </div>
      </div>

      {/* THEN: THE NOTES PANEL (Visual Queue Line & Headcount Drift) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Visual Line Headcount Visual */}
        <div className="bg-[#FAF5E8] dark:bg-[#221D18] border-2 border-ink rounded-2xl p-4 sm:p-5 shadow-offset-md space-y-3">
          <div className="flex items-center justify-between border-b-2 border-ink/15 pb-2">
            <span className="font-mono text-xs font-black uppercase text-ink flex items-center gap-2">
              <Users className="w-4 h-4 text-saffron" />
              <span>LINE HEADCOUNT VISUAL ({queueCount} IN QUEUE)</span>
            </span>
            <span className="font-mono text-[10px] text-ink-muted">
              SERVING HEAD ➔
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-3 bg-[#E8DFC7] dark:bg-[#1A1613] border-2 border-ink rounded-xl min-h-[56px]">
            {queueCount === 0 && (
              <span className="font-mono text-xs text-ink-muted italic">
                Abhi line khali hai (0 in queue)
              </span>
            )}
            {tiffinIcons.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="p-1.5 bg-[#FAF5E8] dark:bg-[#221D18] border-2 border-ink rounded-lg shadow-offset-xs flex items-center gap-1 group"
                title={`Student in queue #${i + 1}`}
              >
                <TiffinIcon className="w-4 h-4 text-ink" />
                <span className="font-mono text-[9px] font-bold text-ink-muted">
                  #{i + 1}
                </span>
              </motion.div>
            ))}
            {queueCount > 20 && (
              <span className="font-mono text-xs font-black px-2 py-1 bg-[#14110F] text-[#FAF5E8] dark:bg-[#FAF5E8] dark:text-[#14110F] rounded">
                +{queueCount - 20} MORE
              </span>
            )}
          </div>
        </div>

        {/* Headcount Drift Alignment */}
        <div className="bg-[#FAF5E8] dark:bg-[#221D18] border-2 border-ink rounded-2xl p-4 sm:p-5 shadow-offset-md flex flex-col justify-between gap-3">
          <div>
            <div className="font-mono text-xs font-black uppercase text-ink flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#D7312B]" />
              <span>HEADCOUNT DRIFT ALIGNMENT</span>
            </div>
            <div className="font-serif text-xs text-ink-muted mt-1 leading-relaxed">
              Correct counter line count when students leave line or skip without tapping.
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleDriftAdjust(-5)}
              className="flex-1 py-2 bg-[#FAF5E8] dark:bg-[#1A1613] text-ink font-mono text-xs font-black border-2 border-ink rounded-xl hover:bg-[#EAE1CA] dark:hover:bg-[#2D2620] shadow-offset-xs active:translate-x-[1px] active:translate-y-[1px]"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleDriftAdjust(-1)}
              className="flex-1 py-2 bg-[#FAF5E8] dark:bg-[#1A1613] text-[#D7312B] font-mono text-xs font-black border-2 border-ink rounded-xl hover:bg-[#EAE1CA] dark:hover:bg-[#2D2620] shadow-offset-xs active:translate-x-[1px] active:translate-y-[1px]"
            >
              -1 Line
            </button>
            <button
              type="button"
              onClick={() => handleDriftAdjust(1)}
              className="flex-1 py-2 bg-[#FAF5E8] dark:bg-[#1A1613] text-[#2F6B3A] dark:text-[#58B971] font-mono text-xs font-black border-2 border-ink rounded-xl hover:bg-[#EAE1CA] dark:hover:bg-[#2D2620] shadow-offset-xs active:translate-x-[1px] active:translate-y-[1px]"
            >
              +1 Line
            </button>
            <button
              type="button"
              onClick={() => handleDriftAdjust(5)}
              className="flex-1 py-2 bg-[#FAF5E8] dark:bg-[#1A1613] text-ink font-mono text-xs font-black border-2 border-ink rounded-xl hover:bg-[#EAE1CA] dark:hover:bg-[#2D2620] shadow-offset-xs active:translate-x-[1px] active:translate-y-[1px]"
            >
              +5
            </button>
          </div>
        </div>
      </div>

      {/* THEN: INSIGHTS CARDS (LAST!) */}
      <UniQInsightsPanel target="STAFF" messCode={messCode} className="mt-2" />
    </div>
  );
}
