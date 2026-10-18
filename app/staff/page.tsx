'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  CheckCircle,
  Hash,
  WifiOff,
  Sliders,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  FileText,
  MoreHorizontal,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useSelectedMess } from '@/hooks/useSelectedMess';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import { university } from '@/config/university';

const UniQInsightsDrawer = dynamic(
  () => import('@/components/insights/UniQInsightsPanel').then((m) => m.UniQInsightsDrawer),
  { ssr: false }
);

const SplitFlapBoard = dynamic(
  () => import('@/components/ui/SplitFlap').then((m) => m.SplitFlapBoard),
  {
    ssr: false,
    loading: () => <div className="h-16 w-full bg-ink/5 border-2 border-ink rounded-xl animate-pulse" />,
  }
);

export default function StaffPage() {
  const { messId, mess: activeMess, shortName, isLocked, isChanging } = useSelectedMess();
  const messCode = messId;
  const [checkinInput, setCheckinInput] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Drawer & Accordion States
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [suggestionCount, setSuggestionCount] = useState(2);
  const [notesOpen, setNotesOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // SWR live queue with fast 4s polling for staff
  const { queue, refreshQueue } = useQueueStatus(messId, 4000);

  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'success', onUndo?: () => void) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, message: msg, type, onUndo };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Offline queue hook
  const { isOnline, offlineCount, getPendingActionsForMess, enqueueAction } = useOfflineQueue(() => {
    refreshQueue();
    addToast('Tokens synced with server.', 'info');
  });

  // Track previous mess for change detection & unsynced warnings
  const prevMessIdRef = React.useRef<string>(messId);
  const isInitialMountRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (prevMessIdRef.current !== messId) {
      const oldMessId = prevMessIdRef.current;
      prevMessIdRef.current = messId;

      // Check if there are unsynced actions for the previous mess
      const unsyncedOld = getPendingActionsForMess(oldMessId);
      if (unsyncedOld.length > 0) {
        const oldMess = university.messes.find((m) => m.id === oldMessId);
        const oldName = oldMess?.shortName || oldMess?.name || 'Central South';
        addToast(`${unsyncedOld.length} actions for ${oldName} are still syncing`, 'error');
      }

      // Clear local queue view, notes & suggestions
      setCheckinInput('');
      setNotesOpen(false);
      setInsightsOpen(false);
    }
  }, [messId, getPendingActionsForMess]);

  // 1-Tap Walk-in Action (Primary Action)
  const handleWalkIn = async () => {
    playDhabaSound('press');
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'WALKIN', messCode: messId }),
      });

      if (res.ok) {
        addToast('+1 Walk-in Student Admitted', 'success', () => handleDriftAdjust(-1));
        refreshQueue();
      } else {
        throw new Error('Server error');
      }
    } catch {
      enqueueAction('/api/queue', { action: 'WALKIN', messCode: messId }, messId);
      addToast('Offline: Walk-in saved locally', 'info');
    }
  };

  // 1-Tap Served Action
  const handleServed = async () => {
    playDhabaSound('ding');
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SERVED', messCode: messId }),
      });

      if (res.ok) {
        addToast('Student Served & Line Advanced 🔔', 'success', () => handleDriftAdjust(1));
        refreshQueue();
      } else {
        throw new Error('Server error');
      }
    } catch {
      enqueueAction('/api/queue', { action: 'SERVED', messCode: messId }, messId);
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
        body: JSON.stringify({ action: 'CHECKIN', messCode: messId, codeOrRoll: code }),
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
      enqueueAction('/api/queue', { action: 'CHECKIN', messCode: messId, codeOrRoll: code }, messId);
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
        body: JSON.stringify({ action: 'DRIFT_ADJUST', messCode: messId, delta }),
      });
      if (res.ok) {
        addToast(`Headcount adjusted by ${delta > 0 ? '+' : ''}${delta}`, 'info');
        refreshQueue();
      }
    } catch {
      enqueueAction('/api/queue', { action: 'DRIFT_ADJUST', messCode: messId, delta }, messId);
      addToast(`Offline: Adjusted ${delta > 0 ? '+' : ''}${delta}`, 'info');
    }
  };

  const queueCount = queue?.currentQueue ?? 18;
  const waitEstimate = queue?.waitRange ?? '5-8 min';
  const serviceRate = queue?.serviceRate ?? 7.5;
  const crowdLevel = (queue?.crowdLevel ?? 'MEDIUM').toUpperCase();

  return (
    <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8 pb-24 font-mono text-[14px] text-ink">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ── 7. OFFLINE STRIP: THIN TOP STRIP ONLY WHEN OFFLINE, NOTHING OTHERWISE ── */}
      {!isOnline && (
        <div className="py-2 px-4 bg-[#D7312B] text-white rounded-lg flex items-center justify-between text-[14px] font-mono font-bold">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>COUNTER OFFLINE • SAVING LOCALLY ({offlineCount})</span>
          </div>
          <span>AUTO-SYNC PENDING</span>
        </div>
      )}

      {/* ── 1. SLIM ONE-LINE HEADER ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b-2 border-ink">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[22px] sm:text-[24px] font-black uppercase text-ink tracking-wide leading-none">
            Staff — {shortName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[14px]">
          {/* Live Throughput */}
          <span className="font-bold text-ink">
            ~{serviceRate} served / min
          </span>

          {/* Online/Offline Status Dot */}
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className={`w-2.5 h-2.5 rounded-full border border-ink ${
                isOnline ? 'bg-[#2F6B3A]' : 'bg-[#D7312B]'
              }`}
            />
            <span>{isOnline ? 'Live' : 'Offline'}</span>
          </div>

          {/* 4. UniQ Insights Badge in Header */}
          <button
            type="button"
            onClick={() => setInsightsOpen(true)}
            className="min-h-[48px] px-3.5 border-2 border-ink rounded-lg font-mono text-[14px] font-bold text-ink hover:bg-saffron transition-colors cursor-pointer flex items-center"
          >
            {suggestionCount} suggestions
          </button>

          {/* 6. "More" Menu Button */}
          <button
            type="button"
            onClick={() => setMoreMenuOpen(true)}
            className="min-h-[48px] px-3.5 border-2 border-ink rounded-lg font-mono text-[14px] font-bold text-ink hover:bg-ink hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>
      </header>

      {/* ── 5. SHIFT NOTES: COLLAPSED BAR "NOTES (1 NEW)" THAT EXPANDS IN PLACE ── */}
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => setNotesOpen(!notesOpen)}
          className="w-full min-h-[56px] px-6 py-4 border-2 border-ink rounded-xl bg-white dark:bg-[#1E1A17] flex items-center justify-between font-mono text-[14px] font-bold text-ink hover:bg-ink/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-saffron" />
            <span>Shift Notes (1 new)</span>
          </div>
          {notesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {notesOpen && (
          <div className="p-6 bg-white dark:bg-[#1E1A17] border-2 border-ink rounded-xl space-y-2 animate-in fade-in-50 duration-200">
            <div className="font-display text-[24px] font-black uppercase text-ink">
              KITCHEN HANDOVER NOTES
            </div>
            <p className="font-serif text-[18px] text-ink leading-relaxed">
              &quot;Dinner prep on schedule. Extra sambhar and dal handi prepared for peak batch at 20:00. 
              Counter #2 dedicated to zero-wait express pass check-ins.&quot;
            </p>
            <div className="font-mono text-[14px] text-ink-muted pt-1">
              Logged by Head Chef at 18:15 • Verified
            </div>
          </div>
        )}
      </section>

      {/* 
        LAYOUT ORDER:
        Desktop: Left 60% = Live Board, Right 40% = The Three Large Controls.
        Mobile: Controls FIRST (Order 1), Live Board BELOW (Order 2).
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 
          ── CONTROLS (RIGHT 40% ON DESKTOP, ORDER 1 ON MOBILE) ── 
          Each button at least 96px tall, card padding 24px (p-6), single 2px border!
        */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-6">
          {/* PRIMARY BUTTON: +1 WALK-IN (Saffron accent, at least 96px tall) */}
          <button
            type="button"
            id="staff-btn-walkin"
            onClick={handleWalkIn}
            className="w-full min-h-[96px] p-6 bg-saffron text-ink border-2 border-ink rounded-2xl shadow-offset-sm hover:-translate-y-0.5 active:translate-y-0 text-left flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer"
          >
            <div className="space-y-1">
              <span className="font-display text-[40px] font-black tracking-wide leading-none block">
                +1 WALK-IN
              </span>
              <span className="font-mono text-[14px] font-bold block opacity-90">
                Tap when student joins line
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-ink text-white flex items-center justify-center shrink-0 border border-ink">
              <UserPlus className="w-6 h-6" />
            </div>
          </button>

          {/* CONTROL 2: CHECK-IN BY CODE (At least 96px tall, single 2px border, p-4 sm:p-6) */}
          <div className="w-full min-h-[96px] p-4 sm:p-6 bg-white dark:bg-[#1E1A17] border-2 border-ink rounded-2xl">
            <form onSubmit={handleCodeCheckIn} className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[14px] font-bold text-ink">
                <span className="flex items-center gap-1.5 uppercase">
                  <Hash className="w-4 h-4 text-saffron" />
                  <span>Check-in by code</span>
                </span>
                <span className="text-ink-muted text-[13px] sm:text-[14px]">4-digit code</span>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={checkinInput}
                  onChange={(e) => setCheckinInput(e.target.value)}
                  placeholder="e.g. 1518"
                  className="flex-1 min-w-0 min-h-[56px] px-3 sm:px-4 font-mono text-[16px] sm:text-[18px] font-bold bg-white dark:bg-[#14110F] border-2 border-ink rounded-xl text-ink focus:outline-none focus:border-saffron"
                />
                <button
                  type="submit"
                  className="min-h-[56px] px-4 sm:px-6 shrink-0 bg-ink text-white font-mono text-[14px] font-black uppercase rounded-xl border-2 border-ink hover:bg-ink/90 active:translate-y-0.5 transition-colors cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>

          {/* CONTROL 3: SERVED & EXIT (At least 96px tall, single 2px border, p-6) */}
          <button
            type="button"
            id="staff-btn-served"
            onClick={handleServed}
            className="w-full min-h-[96px] p-6 bg-white dark:bg-[#1E1A17] text-ink border-2 border-ink rounded-2xl shadow-offset-sm hover:-translate-y-0.5 active:translate-y-0 text-left flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer"
          >
            <div className="space-y-1">
              <span className="font-display text-[40px] font-black tracking-wide leading-none block">
                SERVED &amp; EXIT
              </span>
              <span className="font-mono text-[14px] font-bold block text-ink-muted">
                Tap when thali is handed out 🔔
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl border-2 border-ink bg-white dark:bg-[#14110F] text-[#2F6B3A] dark:text-[#58B971] flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
          </button>
        </div>

        {/* 
          ── 3. LIVE BOARD (LEFT 60% ON DESKTOP, ORDER 2 ON MOBILE) ── 
          Shows big queue number, wait range, and status badge as simple large text.
          Single short split-flap row auto-scales and never clips.
        */}
        <div className="lg:col-span-7 order-2 lg:order-1 space-y-6">
          <div className="p-6 bg-white dark:bg-[#1E1A17] border-2 border-ink rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b-2 border-ink/20 pb-3 font-mono text-[14px]">
              <span className="font-black uppercase text-ink">
                Live Counter Board
              </span>
              <span className="font-bold text-ink-muted">
                {shortName.toUpperCase()}
              </span>
            </div>

            {/* Simple Large Text: Big Queue Number, Wait Range & Colored Status Badge */}
            <div className="grid grid-cols-3 gap-4 text-center items-center">
              <div className="space-y-1">
                <span className="font-mono text-[14px] text-ink-muted block uppercase">
                  Queue
                </span>
                <span className="font-display text-[40px] font-black leading-none text-ink block">
                  {queueCount}
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[14px] text-ink-muted block uppercase">
                  Wait Range
                </span>
                <span className="font-display text-[24px] font-black leading-none text-ink block">
                  {waitEstimate}
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[14px] text-ink-muted block uppercase">
                  Status
                </span>
                <span
                  className={`inline-block px-3 py-1 font-mono text-[14px] font-black uppercase rounded border-2 border-ink ${
                    crowdLevel === 'QUIET' || crowdLevel === 'LOW'
                      ? 'bg-[#2F6B3A]/20 text-[#2F6B3A] dark:text-[#58B971]'
                      : crowdLevel === 'BUSY' || crowdLevel === 'HIGH'
                      ? 'bg-[#D7312B]/20 text-[#D7312B]'
                      : 'bg-saffron/20 text-ink'
                  }`}
                >
                  {crowdLevel}
                </span>
              </div>
            </div>

            {/* Single Short Row Split-Flap that auto-scales and never clips */}
            <div className="pt-2">
              <SplitFlapBoard
                messLabel={shortName.toUpperCase()}
                queueCount={queueCount}
                waitRange={waitEstimate}
                crowdStatus={crowdLevel}
                soundEnabled={soundEnabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. UNIQ INSIGHTS RIGHT DRAWER ── */}
      <UniQInsightsDrawer
        isOpen={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        target="STAFF"
        messCode={messCode}
        onCountChange={setSuggestionCount}
      />

      {/* ── 6. "MORE" MODAL FOR DRIFT CORRECTION, SOUND SETTING & MANUAL ENTRY ── */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setMoreMenuOpen(false)}
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity duration-200"
          />
          <div
            className="relative w-full max-w-lg bg-[#FAF5E8] dark:bg-[#1E1A17] border-2 border-ink rounded-2xl p-6 shadow-2xl z-10 space-y-6 transition-all duration-200"
          >
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <h3 className="font-display text-[24px] font-black uppercase text-ink">
                Counter Controls &amp; Settings
              </h3>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(false)}
                className="w-12 h-12 min-w-[48px] min-h-[48px] border-2 border-ink rounded-lg flex items-center justify-center text-ink hover:bg-ink hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drift Correction (+/-) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-[14px] font-bold text-ink">
                <Sliders className="w-4 h-4 text-saffron" />
                <span>Headcount Drift Correction</span>
              </div>
              <p className="font-serif text-[18px] text-ink-muted leading-snug">
                Align headcount when students leave or enter line without tapping.
              </p>
              <div className="grid grid-cols-4 gap-3 pt-1">
                {[-5, -1, 1, 5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleDriftAdjust(delta)}
                    className="min-h-[56px] border-2 border-ink rounded-xl font-mono text-[14px] font-black bg-white dark:bg-[#14110F] text-ink hover:bg-saffron transition-colors"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Setting (Flap audio) */}
            <div className="pt-4 border-t-2 border-ink/20 flex items-center justify-between">
              <div>
                <div className="font-mono text-[14px] font-bold text-ink">
                  Split-Flap Mechanical Audio
                </div>
                <div className="font-serif text-[18px] text-ink-muted">
                  Click sound during counter updates
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="min-h-[56px] px-4 border-2 border-ink rounded-xl font-mono text-[14px] font-bold flex items-center gap-2 bg-white dark:bg-[#14110F] text-ink"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-5 h-5 text-saffron" />
                    <span>Sound: On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span>Sound: Muted</span>
                  </>
                )}
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setMoreMenuOpen(false)}
              className="w-full min-h-[56px] bg-ink text-white font-mono text-[14px] font-black uppercase rounded-xl border-2 border-ink"
            >
              Close Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
