'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  CheckCircle,
  Hash,
  WifiOff,
  Bell,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { SplitFlapBoard } from '@/components/ui/SplitFlap';
import { TiffinIcon } from '@/components/ui/DhabaIcons';
import { StampBadge } from '@/components/ui/StampBadge';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';

export default function StaffPage() {
  const [messCode, setMessCode] = useState('mess-1');
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

  // Split-flap formatted rows
  const splitFlapRows = [
    `MESS 1   WAIT ${waitEstimate.toUpperCase().padEnd(8, ' ')} QUEUE ${String(queueCount).padStart(2, '0')}`,
    `STATUS   ${crowdLevel.padEnd(8, ' ')} RATE  ${serviceRate}/MIN`,
  ];

  // Animated tiffin icons representing waiting students in line
  const tiffinIcons = Array.from({ length: Math.min(20, Math.max(3, queueCount)) });

  return (
    <div className="w-full space-y-7 pb-16" id="staff-control-console">
      {/* Toast notifications with Undo */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* OFFLINE STRIP: "COUNTER CLOSED - SAVING TOKENS LOCALLY (N)" */}
      <AnimatePresence>
        {(!isOnline || offlineCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="p-4 bg-[#D7312B] text-[#FAF5E8] border-[3px] border-[#14110F] rounded-xl shadow-brutal-md flex items-center justify-between font-mono font-black text-xs sm:text-sm tracking-wider uppercase select-none"
          >
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 animate-pulse" />
              <span>
                COUNTER OFFLINE • SAVING TOKENS LOCALLY ({offlineCount})
              </span>
            </div>
            <span className="bg-[#14110F] text-[#FAF5E8] px-3 py-1 rounded text-xs border border-[#FAF5E8]">
              AUTO-SYNC PENDING
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONSOLE HEADER BOARD */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 sm:p-7 shadow-brutal-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#D7312B] text-[#FAF5E8] px-2.5 py-0.5 rounded border border-[#14110F]">
              STAFF CONSOLE
            </span>
            <span className="font-mono text-xs font-bold text-[#5C554F]">
              SERVING LINE #1 • BHARAT MESS
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[#14110F] uppercase tracking-wide">
            SERVING COUNTER DECK
          </h1>
          <p className="font-serif text-sm text-[#5C554F]">
            High-contrast 1-tap console built for steam, noise, and rapid queue handling.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="bg-[#1C2220] border-2 border-[#14110F] text-[#FAF5E8] px-4 py-2 rounded-xl text-center shadow-brutal-sm">
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#A39B8F]">
              THROUGHPUT
            </div>
            <div className="font-display text-2xl text-[#58B971] tracking-wider leading-none">
              ~{serviceRate} / MIN
            </div>
          </div>
          <StampBadge text="LIVE DISPATCH" color="saffron" />
        </div>
      </div>

      {/* 1. SPLIT-FLAP DEPARTURE QUEUE BOARD */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-xs font-black uppercase tracking-widest text-[#14110F]">
            COUNTER QUEUE STATUS (SPLIT-FLAP)
          </span>
          <span className="font-mono text-[10px] text-[#5C554F]">
            MECHANICAL TELEMETRY
          </span>
        </div>

        <SplitFlapBoard rows={splitFlapRows} maxCols={36} />
      </div>

      {/* 2. VISUAL TIFFIN / STUDENT QUEUE LINE */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 shadow-brutal-md space-y-3">
        <div className="flex items-center justify-between border-b-2 border-[#14110F]/15 pb-2">
          <span className="font-mono text-xs font-black uppercase text-[#14110F] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F28C1B]" />
            <span>LINE HEADCOUNT VISUAL ({queueCount} STUDENTS IN QUEUE)</span>
          </span>
          <span className="font-mono text-[10px] text-[#5C554F]">
            SERVING HEAD ➔
          </span>
        </div>

        {/* Row of animated tiffin icons */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-[#E8DFC7] border-2 border-[#14110F] rounded-xl min-h-[56px]">
          {tiffinIcons.map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="p-1.5 bg-[#FAF5E8] border-2 border-[#14110F] rounded-lg shadow-brutal-xs flex items-center gap-1 group"
              title={`Student in queue #${i + 1}`}
            >
              <TiffinIcon className="w-5 h-5 text-[#14110F]" />
              <span className="font-mono text-[9px] font-bold text-[#5C554F]">
                #{i + 1}
              </span>
            </motion.div>
          ))}
          {queueCount > 20 && (
            <span className="font-mono text-xs font-black px-2 py-1 bg-[#14110F] text-[#FAF5E8] rounded">
              +{queueCount - 20} MORE
            </span>
          )}
        </div>
      </div>

      {/* 3. GIANT TACTILE BUTTONS: +1 WALK-IN & SERVED & EXIT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Giant +1 WALK-IN Button (Collapsing shadow on press) */}
        <button
          type="button"
          onClick={handleWalkIn}
          className="dhaba-btn dhaba-btn-giant w-full min-h-[140px] p-6 bg-[#F2B705] text-[#14110F] hover:bg-[#F7C11E] active:bg-[#DDA300] cursor-pointer text-left flex items-center justify-between gap-4 border-[3px] border-[#14110F] select-none transition-all"
        >
          <div className="space-y-1">
            <span className="font-mono text-xs font-black uppercase tracking-widest text-[#14110F]/70 block">
              GATE ADMISSION
            </span>
            <span className="font-display text-4xl sm:text-5xl font-black tracking-wide text-[#14110F] block leading-none">
              +1 WALK-IN
            </span>
            <span className="font-serif italic text-xs text-[#14110F]/80 block pt-1">
              Tap when student joins serving queue
            </span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#14110F] text-[#FAF5E8] border-2 border-[#14110F] flex items-center justify-center shrink-0 shadow-brutal-xs">
            <UserPlus className="w-8 h-8" />
          </div>
        </button>

        {/* Giant SERVED & EXIT Button */}
        <button
          type="button"
          onClick={handleServed}
          className="dhaba-btn dhaba-btn-giant w-full min-h-[140px] p-6 bg-[#2F6B3A] text-[#FAF5E8] hover:bg-[#377A44] active:bg-[#25572E] cursor-pointer text-left flex items-center justify-between gap-4 border-[3px] border-[#14110F] select-none transition-all"
        >
          <div className="space-y-1">
            <span className="font-mono text-xs font-black uppercase tracking-widest text-[#FAF5E8]/70 block">
              COUNTER COMPLETE
            </span>
            <span className="font-display text-4xl sm:text-5xl font-black tracking-wide text-[#FAF5E8] block leading-none">
              SERVED & EXIT
            </span>
            <span className="font-serif italic text-xs text-[#FAF5E8]/80 block pt-1">
              Tap when plate is handed out (rings bell 🔔)
            </span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#FAF5E8] text-[#14110F] border-2 border-[#14110F] flex items-center justify-center shrink-0 shadow-brutal-xs">
            <CheckCircle className="w-8 h-8 text-[#2F6B3A]" />
          </div>
        </button>
      </div>

      {/* 4. 4-DIGIT TICKET CODE PUNCH-IN BOX */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 sm:p-6 shadow-brutal-md">
        <form onSubmit={handleCodeCheckIn} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-mono text-xs font-black uppercase text-[#14110F] flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-[#F28C1B]" />
              <span>TOKEN VERIFIER (PUNCH 4-DIGIT CODE OR ROLL NUMBER)</span>
            </label>
            <span className="font-mono text-[10px] text-[#5C554F]">
              ZERO CAMERA NEEDED
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={checkinInput}
              onChange={(e) => setCheckinInput(e.target.value)}
              placeholder="e.g. 1518 or 22CS014"
              className="flex-1 bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-xl px-4 py-3 text-2xl font-mono font-black text-[#14110F] placeholder-[#5C554F]/50 focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
            />
            <button
              type="submit"
              className="dhaba-btn px-8 py-3 bg-[#14110F] text-[#FAF5E8] hover:bg-[#2A2521] text-lg font-display tracking-wider uppercase shrink-0"
            >
              VERIFY & ADMIT
            </button>
          </div>
        </form>
      </div>

      {/* 5. MANUAL HEADCOUNT DRIFT CORRECTION */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 shadow-brutal-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs font-black uppercase text-[#14110F] flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#D7312B]" />
            <span>HEADCOUNT DRIFT ALIGNMENT</span>
          </div>
          <div className="font-serif text-xs text-[#5C554F] mt-0.5">
            Correct counter line count when students leave line or skip without tapping.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDriftAdjust(-5)}
            className="dhaba-btn px-3 py-1.5 bg-[#FAF5E8] text-[#14110F] font-mono text-xs font-black hover:bg-[#EAE1CA]"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => handleDriftAdjust(-1)}
            className="dhaba-btn px-3 py-1.5 bg-[#FAF5E8] text-[#D7312B] font-mono text-xs font-black hover:bg-[#EAE1CA]"
          >
            -1 Line
          </button>
          <button
            type="button"
            onClick={() => handleDriftAdjust(1)}
            className="dhaba-btn px-3 py-1.5 bg-[#FAF5E8] text-[#2F6B3A] font-mono text-xs font-black hover:bg-[#EAE1CA]"
          >
            +1 Line
          </button>
          <button
            type="button"
            onClick={() => handleDriftAdjust(5)}
            className="dhaba-btn px-3 py-1.5 bg-[#FAF5E8] text-[#14110F] font-mono text-xs font-black hover:bg-[#EAE1CA]"
          >
            +5
          </button>
        </div>
      </div>
    </div>
  );
}
