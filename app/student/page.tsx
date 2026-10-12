'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Clock,
  Check,
  AlertCircle,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { TactileButton } from '@/components/ui/TactileButton';
import { StampBadge } from '@/components/ui/StampBadge';
import { Katori, PortionSize } from '@/components/ui/Katori';
import { MessToken, triggerRiceChilliConfetti } from '@/components/ui/MessToken';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';

type BookingStep = 1 | 2 | 3 | 4;

export default function StudentPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [messCode, setMessCode] = useState('mess-1');
  const [mealType, setMealType] = useState<'Lunch' | 'Dinner'>('Lunch');
  const [rollNumber, setRollNumber] = useState('22CS014');
  const [slotData, setSlotData] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [portion, setPortion] = useState<PortionSize>('Regular');
  const [dietType, setDietType] = useState('Veg');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [skipNotice, setSkipNotice] = useState(false);

  // SWR live queue hook (8-second polling)
  const { queue } = useQueueStatus(messCode, 8000);

  // Auto-detect meal by current hour
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 16 || hr < 4) {
      setMealType('Dinner');
    } else {
      setMealType('Lunch');
    }

    const raw = document.cookie
      .split('; ')
      .find((row) => row.startsWith('mess_rush_session='))
      ?.split('=')[1];
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (parsed.role === 'student' && parsed.rollNumber) {
          setRollNumber(parsed.rollNumber);
        }
      } catch {
        // default rollNumber
      }
    }
  }, []);

  const loadSlotsAndBooking = async () => {
    try {
      setDataLoading(true);
      setErrorMsg('');
      const res = await fetch(
        `/api/bookings?messCode=${messCode}&mealType=${mealType}&rollNumber=${rollNumber}`
      );
      if (res.ok) {
        const data = await res.json();
        setSlotData(data);
        if (data.student) setStudentInfo(data.student);
        if (data.currentBooking && data.currentBooking.status !== 'SKIPPED') {
          setCurrentBooking(data.currentBooking);
          generateQr(data.currentBooking.studentId, data.currentBooking.checkinCode);
        } else {
          setCurrentBooking(null);
        }
        if (!selectedSlot && data.suggestedSlot) {
          setSelectedSlot(data.suggestedSlot);
        }
      } else {
        setErrorMsg('Failed to load slots from mess server. Please retry.');
      }
    } catch {
      setErrorMsg('Could not fetch arrival slots. Please check network.');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadSlotsAndBooking();
  }, [messCode, mealType, rollNumber]);

  const generateQr = async (studentId: string, code: string) => {
    try {
      const url = await QRCode.toDataURL(JSON.stringify({ roll: rollNumber, code }), {
        width: 180,
        margin: 1,
        color: { dark: '#14110F', light: '#FAF5E8' },
      });
      setQrDataUrl(url);
    } catch (e) {
      console.error('QR generation failed', e);
    }
  };

  const goToStep = (step: BookingStep) => {
    setSlideDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    playDhabaSound('flip');
  };

  const handleNextAction = () => {
    if (currentStep === 1) {
      goToStep(2);
    } else if (currentStep === 2) {
      if (!selectedSlot) {
        setErrorMsg('Please select a 15-minute arrival slot.');
        return;
      }
      goToStep(3);
    } else if (currentStep === 3) {
      goToStep(4);
    } else if (currentStep === 4) {
      handleBook();
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      setErrorMsg('Please select an arrival slot.');
      goToStep(2);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber,
          messCode,
          mealType,
          slotStart: selectedSlot,
          portion,
          dietType,
          isSkipping: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book slot');

      playDhabaSound('stamp');
      triggerRiceChilliConfetti();

      setCurrentBooking(data.booking);
      generateQr(rollNumber, data.booking.checkinCode);
      goToStep(4);
      loadSlotsAndBooking();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber,
          messCode,
          mealType,
          isSkipping: true,
        }),
      });
      if (res.ok) {
        setSkipNotice(true);
        setCurrentBooking(null);
        playDhabaSound('press');
      }
    } catch {
      setErrorMsg('Failed to mark meal as skipped');
    } finally {
      setLoading(false);
    }
  };

  const currentWait = queue?.waitRange ?? '5-8 min';
  const queueLength = queue?.currentQueue ?? 9;
  const streak = studentInfo?.streak ?? studentInfo?.offPeakStreak ?? 6;

  const stepsList: { num: BookingStep; label: string; icon: any }[] = [
    { num: 1, label: 'Meal', icon: Utensils },
    { num: 2, label: 'Time', icon: Clock },
    { num: 3, label: 'Portion', icon: Sparkles },
    { num: 4, label: 'Confirm', icon: Ticket },
  ];

  const getActionLabel = () => {
    if (loading) return 'PRINTING TOKEN PASS...';
    if (currentStep === 1) return 'PROCEED TO TIME SELECTION →';
    if (currentStep === 2) return 'CHOOSE PORTION SIZE →';
    if (currentStep === 3) return 'REVIEW & CONFIRM PASS →';
    return `CONFIRM ${mealType.toUpperCase()} PASS`;
  };

  return (
    <div
      className="w-full max-w-[720px] mx-auto px-4 sm:px-6 py-4 pb-28 sm:pb-12 space-y-4"
      id="student-column"
    >
      {/* ── COMPACT HEADER SIGNBOARD (Sleek 1-2 line canteen header) ── */}
      <div className="bg-[#FAF5E8] dark:bg-[#25201C] border-[3px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl px-4 py-3 shadow-brutal-sm flex items-center justify-between gap-2 select-none">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-black uppercase tracking-wider bg-[#14110F] text-[#FAF5E8] px-2 py-0.5 rounded">
              GATE 1
            </span>
            <span className="font-mono text-xs font-bold text-[#5C554F] dark:text-[#B8B0A2]">
              ROLL: {rollNumber}
            </span>
          </div>
          <h1 className="font-condensed text-xl sm:text-2xl font-black text-[#14110F] dark:text-[#F4ECD8] tracking-normal uppercase leading-none mt-1">
            RESERVE YOUR THALI SLOT
          </h1>
        </div>

        {/* Off-peak Flame Streak Counter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F28C1B]/15 border-2 border-[#F28C1B] text-[#14110F] dark:text-[#F4ECD8] font-mono text-xs font-black shrink-0 shadow-brutal-xs">
          <span className="text-sm leading-none">🔥</span>
          <span>{streak} MEALS</span>
        </div>
      </div>

      {/* ── 4-STEP PROGRESS BAR: Meal -> Time -> Portion -> Confirm ── */}
      <div className="bg-[#FAF5E8] dark:bg-[#25201C] border-[3px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl p-3 shadow-brutal-sm">
        <div className="relative flex items-center justify-between">
          {/* Saffron Connecting Rail Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#14110F]/20 dark:bg-[#F4ECD8]/20 -z-0" />
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#F28C1B] transition-all duration-300 -z-0"
            style={{
              width: `${((currentStep - 1) / (stepsList.length - 1)) * 88}%`,
            }}
          />

          {stepsList.map((step) => {
            const isCompleted = step.num < currentStep;
            const isActive = step.num === currentStep;

            return (
              <button
                key={step.num}
                id={`step-tab-${step.num}`}
                type="button"
                onClick={() => goToStep(step.num)}
                aria-current={isActive ? 'step' : undefined}
                className="flex flex-col items-center gap-1 z-10 group focus:outline-none"
              >
                <div
                  className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg border-[2px] border-[#14110F] dark:border-[#F4ECD8] flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-[#F28C1B] text-[#14110F] shadow-brutal-xs -translate-y-0.5 scale-105 ring-2 ring-[#14110F]'
                      : isCompleted
                      ? 'bg-[#2F6B3A] text-[#FAF5E8]'
                      : 'bg-[#F4ECD8] dark:bg-[#1E1916] text-[#5C554F] dark:text-[#A8A096]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                </div>
                <span
                  className={`font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#14110F] dark:text-[#F4ECD8] font-black underline decoration-[#F28C1B] decoration-2 underline-offset-4'
                      : 'text-[#5C554F] dark:text-[#8E857C]'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ERROR NOTICE ── */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#D7312B]/10 border-2 border-[#D7312B] text-[#D7312B] text-xs font-mono font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={loadSlotsAndBooking}
            className="underline uppercase tracking-wider text-[11px] font-black shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── SKIPPED MEAL NOTICE ── */}
      {skipNotice && (
        <div className="p-3.5 rounded-xl bg-[#2F6B3A]/10 border-2 border-[#2F6B3A] text-[#2F6B3A] text-xs font-mono font-bold flex items-center justify-between gap-3">
          <span>✓ Meal marked as skipped for today. The hostel kitchen has been notified!</span>
          <button
            type="button"
            onClick={() => setSkipNotice(false)}
            className="underline text-[10px] uppercase font-black"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── STEP CONTENT WITH SPRING ANIMATION ── */}
      <AnimatePresence mode="wait">
        {/* ── STEP 1: MEAL SELECTION & CHALKBOARD WAIT ESTIMATE ── */}
        {currentStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: slideDirection > 0 ? 25 : -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -25 : 25 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="space-y-4"
          >
            {/* Meal Switch (Lunch / Dinner) */}
            <div className="bg-[#FAF5E8] dark:bg-[#25201C] border-[3px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl p-4 shadow-brutal-sm space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#14110F]/15 dark:border-[#F4ECD8]/20">
                <span className="font-mono text-xs font-black uppercase text-[#14110F] dark:text-[#F4ECD8]">
                  SELECT CURRENT MEAL SERVICE
                </span>
                <span className="font-serif italic text-xs text-[#5C554F] dark:text-[#A8A096]">
                  दोपहर / रात का खाना
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['Lunch', 'Dinner'] as const).map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => {
                      setMealType(meal);
                      setSelectedSlot('');
                      playDhabaSound('press');
                    }}
                    className={`py-3 px-3 border-[2.5px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                      mealType === meal
                        ? 'bg-[#F28C1B] text-[#14110F] border-[#14110F] shadow-brutal-xs -translate-y-0.5'
                        : 'bg-[#F4ECD8] dark:bg-[#1E1916] text-[#5C554F] dark:text-[#FAF5E8] border-[#14110F]/60 dark:border-[#F4ECD8]/40 hover:bg-[#EAE1CA]'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span className="font-condensed text-2xl font-black uppercase tracking-wider leading-none">
                      {meal}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#14110F]/80 dark:text-[#F4ECD8]/80">
                      {meal === 'Lunch' ? '12:30 - 14:00' : '19:30 - 21:00'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wait Estimate: Black Chalkboard Panel with Hand-lettered Range in Caveat */}
            <div className="bg-[#171C19] text-[#FAF5E8] border-[3px] border-[#14110F] dark:border-[#38423E] rounded-xl p-4 sm:p-5 shadow-brutal-md relative overflow-hidden select-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#58B971] animate-ping" />
                    <span className="font-mono text-[10px] tracking-widest text-[#A8A096] uppercase font-bold">
                      CHALKBOARD LIVE WAIT ESTIMATE
                    </span>
                  </div>

                  {/* Hand-lettered range in Caveat font */}
                  <div className="font-handwriting text-5xl sm:text-6xl text-[#F2B705] tracking-wider leading-none font-bold py-0.5">
                    {currentWait || '5-8 min'}
                  </div>

                  {/* Small honest note */}
                  <p className="font-serif italic text-xs sm:text-sm text-[#D4CEC5]/90">
                    based on pre-bookings and the last 4 weeks
                  </p>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l-2 border-[#38423E] pt-2.5 sm:pt-0 sm:pl-4 space-y-1.5">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#A8A096] block">
                      CURRENT QUEUE
                    </span>
                    <span className="font-mono text-sm font-bold text-[#FAF5E8]">
                      {queueLength} students in line
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#A8A096] block">
                      RECOMMENDED WINDOW
                    </span>
                    <span className="font-mono text-xs text-[#F2B705] font-bold">
                      {slotData?.suggestedArrivalWindow || '12:30 - 12:45'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plain text option: Skipping this meal */}
            <div className="pt-0.5 text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="font-mono text-xs text-[#5C554F] dark:text-[#A8A096] hover:text-[#D7312B] underline transition-colors"
              >
                Skipping this meal (record for hostel kitchen to prevent waste)
              </button>
            </div>

            {/* Desktop Action Button */}
            <div className="hidden sm:flex justify-end pt-1">
              <TactileButton
                id="action-btn-primary"
                variant="primary"
                size="lg"
                className="w-full py-3.5 text-base shadow-brutal-sm"
                onClick={handleNextAction}
              >
                PROCEED TO TIME SELECTION →
              </TactileButton>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: TIME — RAILWAY TIMETABLE STRIP ── */}
        {currentStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: slideDirection > 0 ? 25 : -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -25 : 25 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="space-y-4"
          >
            <div className="bg-[#FAF5E8] dark:bg-[#25201C] border-[3px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl p-4 sm:p-5 shadow-brutal-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#14110F]/15 dark:border-[#F4ECD8]/20">
                <div>
                  <h2 className="font-condensed text-xl sm:text-2xl font-black uppercase text-[#14110F] dark:text-[#F4ECD8] tracking-wide">
                    RAILWAY TIMETABLE • 15-MIN COACHES
                  </h2>
                  <p className="font-serif text-xs text-[#5C554F] dark:text-[#A8A096] mt-0.5">
                    Select your 15-minute slot. Dot figures illustrate student load density.
                  </p>
                </div>
                {slotData?.suggestedSlot && (
                  <StampBadge variant="saffron" rotate={false}>
                    {`RECOMMENDED: ${slotData.suggestedSlot}`}
                  </StampBadge>
                )}
              </div>

              {/* Horizontal Railway Timetable Strip */}
              <div className="relative pt-2 pb-3">
                {/* Rails Track Lines */}
                <div className="absolute top-[36px] inset-x-0 h-1 bg-[#14110F]/20 dark:bg-[#F4ECD8]/20 pointer-events-none" />
                <div className="absolute top-[44px] inset-x-0 h-1 bg-[#14110F]/20 dark:bg-[#F4ECD8]/20 pointer-events-none" />

                <div className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
                  {slotData?.slots?.map((slot: any) => {
                    const isSelected = selectedSlot === slot.slotStart;
                    const isBest = slot.slotStart === slotData?.suggestedSlot;
                    const congestion = slot.congestion || 'Moderate';
                    const isQuiet = congestion === 'Quiet';
                    const isBusy = congestion === 'Busy';
                    const isModerate = !isQuiet && !isBusy;

                    // Dot count based on load
                    const dotCount = isQuiet ? 3 : isModerate ? 7 : 13;
                    const loadPercent = isQuiet ? 25 : isModerate ? 60 : 92;

                    return (
                      <button
                        key={slot.slotStart}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot.slotStart);
                          playDhabaSound('flip');
                        }}
                        className={`shrink-0 w-36 sm:w-40 border-[2.5px] rounded-xl p-3 text-left transition-all relative flex flex-col justify-between select-none ${
                          isSelected
                            ? 'bg-[#F28C1B] text-[#14110F] border-[#14110F] shadow-brutal-sm -translate-y-1 ring-2 ring-[#14110F]'
                            : 'bg-[#F4ECD8] dark:bg-[#1E1916] text-[#14110F] dark:text-[#F4ECD8] border-[#14110F]/80 dark:border-[#F4ECD8]/40 hover:-translate-y-0.5 hover:shadow-brutal-xs'
                        }`}
                      >
                        {/* Coach Coupler & Best Time Stamp */}
                        <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-dashed border-[#14110F]/30 dark:border-[#F4ECD8]/30">
                          <span className="font-mono text-[9px] font-black uppercase text-[#5C554F] dark:text-[#A8A096]">
                            COACH {slot.slotStart}
                          </span>
                          {isBest ? (
                            <span className="font-mono text-[8px] font-black uppercase tracking-wider bg-[#2F6B3A] text-white px-1 py-0.5 rounded border border-[#14110F]">
                              BEST TIME
                            </span>
                          ) : (
                            <span
                              className={`w-2.5 h-2.5 rounded-full border border-[#14110F] ${
                                isQuiet
                                  ? 'bg-[#2F6B3A]'
                                  : isModerate
                                  ? 'bg-[#F2B705]'
                                  : 'bg-[#D7312B]'
                              }`}
                            />
                          )}
                        </div>

                        {/* Time in IBM Plex Mono */}
                        <div className="font-mono text-2xl sm:text-3xl font-black tracking-tight leading-none">
                          {slot.slotStart}
                        </div>

                        {/* Quiet / Moderate / Busy label */}
                        <div className="mt-1.5 flex items-center justify-between">
                          <span
                            className={`font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-[#14110F] ${
                              isQuiet
                                ? 'bg-[#2F6B3A] text-white'
                                : isModerate
                                ? 'bg-[#F2B705] text-[#14110F]'
                                : 'bg-[#D7312B] text-white'
                            }`}
                          >
                            {congestion}
                          </span>
                          <span className="font-mono text-[9px] font-bold">
                            {slot.waitEstimate || '2-5 min'}
                          </span>
                        </div>

                        {/* Load Bar */}
                        <div className="my-2 w-full bg-[#14110F]/15 dark:bg-[#F4ECD8]/15 h-1.5 rounded-full overflow-hidden border border-[#14110F]/30">
                          <div
                            className={`h-full transition-all ${
                              isQuiet
                                ? 'bg-[#2F6B3A]'
                                : isModerate
                                ? 'bg-[#F2B705]'
                                : 'bg-[#D7312B]'
                            }`}
                            style={{ width: `${loadPercent}%` }}
                          />
                        </div>

                        {/* Tiny row of dot-people matching load */}
                        <div className="bg-[#EAE1CA] dark:bg-[#2A2420] border border-[#14110F]/20 rounded-lg p-1 mb-1">
                          <div className="font-mono text-[8px] font-black uppercase text-[#5C554F] dark:text-[#A8A096] mb-0.5">
                            DENSITY ({slot.projectedTotal || slot.currentBookings || 12})
                          </div>
                          <div className="flex flex-wrap gap-1 items-center min-h-[12px]">
                            {Array.from({ length: dotCount }).map((_, i) => (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full border border-[#14110F] ${
                                  isQuiet
                                    ? 'bg-[#2F6B3A]'
                                    : isModerate
                                    ? 'bg-[#F2B705]'
                                    : 'bg-[#D7312B]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Coach Wheels at Bottom */}
                        <div className="flex justify-between px-2 -mb-4 pt-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#14110F] border border-[#FAF5E8]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#14110F] border border-[#FAF5E8]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Details Summary */}
              {selectedSlot && (
                <div className="bg-[#EFE7D0] dark:bg-[#1A1613] p-2.5 rounded-xl border border-[#14110F]/20 flex items-center justify-between text-xs font-mono">
                  <span>
                    Arrival: <strong className="font-black">{selectedSlot} - {slotData?.slots?.find((s: any) => s.slotStart === selectedSlot)?.slotEnd || ''}</strong>
                  </span>
                  <span className="font-bold text-[#2F6B3A]">✓ Zero-Wait Express Entry</span>
                </div>
              )}
            </div>

            {/* Plain text option: Skipping this meal */}
            <div className="pt-0.5 text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="font-mono text-xs text-[#5C554F] dark:text-[#A8A096] hover:text-[#D7312B] underline transition-colors"
              >
                Skipping this meal (record for hostel kitchen to prevent waste)
              </button>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="px-4 py-3.5 border-[2px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl font-mono text-xs font-black uppercase text-[#14110F] dark:text-[#F4ECD8] bg-[#F4ECD8] dark:bg-[#25201C] hover:bg-[#EAE1CA] shrink-0"
              >
                ← BACK
              </button>
              <TactileButton
                id="action-btn-primary"
                variant="primary"
                size="lg"
                className="flex-1 py-3.5 text-base shadow-brutal-sm"
                onClick={handleNextAction}
                disabled={!selectedSlot}
              >
                CHOOSE PORTION SIZE →
              </TactileButton>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: PORTION & DIET PILLS ── */}
        {currentStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: slideDirection > 0 ? 25 : -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -25 : 25 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="space-y-4"
          >
            <div className="bg-[#FAF5E8] dark:bg-[#25201C] border-[3px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl p-4 sm:p-5 shadow-brutal-sm space-y-3">
              <div className="pb-1.5 border-b border-[#14110F]/15 dark:border-[#F4ECD8]/20">
                <h2 className="font-condensed text-xl sm:text-2xl font-black uppercase text-[#14110F] dark:text-[#F4ECD8] tracking-wide">
                  PORTION SIZE • THREE KATORIS
                </h2>
                <p className="font-serif text-xs text-[#5C554F] dark:text-[#A8A096] mt-0.5">
                  Matte black bowls with brass rims. Food visibly fills when selected. Seconds are always available at the counter!
                </p>
              </div>

              {/* Three Bowl Illustrations (Small, Regular, Large) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Small', 'Regular', 'Large'] as const).map((p) => (
                  <Katori
                    key={p}
                    portion={p}
                    selected={portion === p}
                    onSelect={(val) => {
                      setPortion(val);
                      playDhabaSound('press');
                    }}
                  />
                ))}
              </div>

              {/* Diet Type as Pills */}
              <div className="pt-3 border-t border-[#14110F]/15 dark:border-[#F4ECD8]/20 space-y-1.5">
                <span className="font-mono text-xs font-black uppercase text-[#14110F] dark:text-[#F4ECD8] block">
                  DIET TYPE PREFERENCE:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { type: 'Veg', color: '#2F6B3A', label: 'VEG' },
                    { type: 'Non-Veg', color: '#D7312B', label: 'NON-VEG' },
                    { type: 'Jain', color: '#F2B705', label: 'JAIN (NO ONION/GARLIC)' },
                  ].map((d) => (
                    <button
                      key={d.type}
                      type="button"
                      onClick={() => {
                        setDietType(d.type);
                        playDhabaSound('press');
                      }}
                      className={`px-3.5 py-1.5 font-mono text-xs font-black uppercase border-2 rounded-xl transition-all flex items-center gap-2 ${
                        dietType === d.type
                          ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs -translate-y-0.5'
                          : 'bg-[#F4ECD8] dark:bg-[#1E1916] text-[#5C554F] dark:text-[#FAF5E8] border-[#14110F]/60 dark:border-[#F4ECD8]/40 hover:bg-[#EAE1CA]'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/40"
                        style={{ backgroundColor: d.color }}
                      />
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Plain text option: Skipping this meal */}
            <div className="pt-0.5 text-center">
              <button
                type="button"
                onClick={handleSkip}
                className="font-mono text-xs text-[#5C554F] dark:text-[#A8A096] hover:text-[#D7312B] underline transition-colors"
              >
                Skipping this meal (record for hostel kitchen to prevent waste)
              </button>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="px-4 py-3.5 border-[2px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl font-mono text-xs font-black uppercase text-[#14110F] dark:text-[#F4ECD8] bg-[#F4ECD8] dark:bg-[#25201C] hover:bg-[#EAE1CA] shrink-0"
              >
                ← BACK
              </button>
              <TactileButton
                id="action-btn-primary"
                variant="primary"
                size="lg"
                className="flex-1 py-3.5 text-base shadow-brutal-sm"
                onClick={handleNextAction}
              >
                REVIEW &amp; CONFIRM PASS →
              </TactileButton>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: CONFIRM & PRINTED TOKEN TICKET PASS ── */}
        {currentStep === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: slideDirection > 0 ? 25 : -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection > 0 ? -25 : 25 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="space-y-4"
          >
            {/* If Already Booked, Show the Printed Ticket Pass */}
            {currentBooking ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-condensed text-xl sm:text-2xl font-black uppercase tracking-wide text-[#14110F] dark:text-[#F4ECD8]">
                    YOUR ACTIVE MESS PASS
                  </h2>
                  <StampBadge variant="curry" rotate={false}>
                    BOARDING READY
                  </StampBadge>
                </div>

                <MessToken
                  booking={currentBooking}
                  rollNumber={rollNumber}
                  qrDataUrl={qrDataUrl}
                  onEdit={() => goToStep(2)}
                  onSkip={handleSkip}
                />

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentBooking(null);
                      goToStep(1);
                    }}
                    className="font-mono text-xs font-bold text-[#14110F] dark:text-[#F4ECD8] underline hover:text-[#F28C1B]"
                  >
                    + Book for another meal or re-choose slot
                  </button>
                </div>
              </div>
            ) : (
              /* Review Pass Summary before confirmation */
              <div className="space-y-4">
                <div className="bg-[#FAF5E8] dark:bg-[#25201C] border-[3px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl p-4 sm:p-5 shadow-brutal-sm space-y-3">
                  <div className="pb-2 border-b border-[#14110F]/15 dark:border-[#F4ECD8]/20 flex items-center justify-between">
                    <div>
                      <h2 className="font-condensed text-xl sm:text-2xl font-black uppercase text-[#14110F] dark:text-[#F4ECD8] tracking-wide">
                        FINAL PASS VERIFICATION
                      </h2>
                      <p className="font-serif text-xs text-[#5C554F] dark:text-[#A8A096]">
                        Confirm details below to print your campus mess boarding token.
                      </p>
                    </div>
                    <StampBadge variant="saffron" rotate={false}>
                      READY TO ISSUE
                    </StampBadge>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                    <div className="bg-[#EFE7D0] dark:bg-[#1E1916] p-2.5 rounded-xl border border-[#14110F]/20">
                      <span className="text-[9px] text-[#5C554F] dark:text-[#8E857C] block uppercase font-bold">
                        MEAL &amp; SERVICE
                      </span>
                      <span className="font-black text-sm text-[#14110F] dark:text-[#F4ECD8]">
                        {mealType.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-[#EFE7D0] dark:bg-[#1E1916] p-2.5 rounded-xl border border-[#14110F]/20">
                      <span className="text-[9px] text-[#5C554F] dark:text-[#8E857C] block uppercase font-bold">
                        SLOT WINDOW
                      </span>
                      <span className="font-black text-sm text-[#F28C1B]">
                        {selectedSlot || '12:30'}
                      </span>
                    </div>

                    <div className="bg-[#EFE7D0] dark:bg-[#1E1916] p-2.5 rounded-xl border border-[#14110F]/20">
                      <span className="text-[9px] text-[#5C554F] dark:text-[#8E857C] block uppercase font-bold">
                        PORTION
                      </span>
                      <span className="font-black text-sm text-[#14110F] dark:text-[#F4ECD8]">
                        {portion.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-[#EFE7D0] dark:bg-[#1E1916] p-2.5 rounded-xl border border-[#14110F]/20">
                      <span className="text-[9px] text-[#5C554F] dark:text-[#8E857C] block uppercase font-bold">
                        DIET
                      </span>
                      <span className="font-black text-sm text-[#2F6B3A]">
                        {dietType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#2F6B3A]/10 border border-[#2F6B3A] rounded-xl text-xs font-mono text-[#2F6B3A] font-bold">
                    ✓ By reserving this slot, you prevent kitchen over-preparation and secure express line priority.
                  </div>
                </div>

                {/* Plain text option: Skipping this meal */}
                <div className="pt-0.5 text-center">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="font-mono text-xs text-[#5C554F] dark:text-[#A8A096] hover:text-[#D7312B] underline transition-colors"
                  >
                    Skipping this meal (record for hostel kitchen to prevent waste)
                  </button>
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden sm:flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="px-4 py-3.5 border-[2px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl font-mono text-xs font-black uppercase text-[#14110F] dark:text-[#F4ECD8] bg-[#F4ECD8] dark:bg-[#25201C] hover:bg-[#EAE1CA] shrink-0"
                  >
                    ← BACK
                  </button>
                  <TactileButton
                    id="action-btn-primary"
                    variant="primary"
                    size="lg"
                    className="flex-1 py-3.5 text-base shadow-brutal-sm"
                    onClick={handleBook}
                    disabled={loading}
                  >
                    {loading ? 'PRINTING TOKEN PASS...' : `CONFIRM ${mealType.toUpperCase()} PASS • ${selectedSlot || '12:30'}`}
                  </TactileButton>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE-FIRST STICKY BOTTOM ACTION BAR (ONLY VISIBLE ON MOBILE) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5E8]/95 dark:bg-[#1E1916]/95 backdrop-blur-md border-t-[3px] border-[#14110F] dark:border-[#F4ECD8] p-3 shadow-lg">
        <div className="max-w-[720px] mx-auto flex items-center gap-2">
          {currentStep > 1 && !currentBooking && (
            <button
              type="button"
              onClick={() => goToStep((currentStep - 1) as BookingStep)}
              className="px-3.5 py-3 border-[2px] border-[#14110F] dark:border-[#F4ECD8] rounded-xl font-mono text-xs font-black uppercase text-[#14110F] dark:text-[#F4ECD8] bg-[#F4ECD8] dark:bg-[#25201C] active:bg-[#EAE1CA] shrink-0"
            >
              ← BACK
            </button>
          )}

          {!currentBooking ? (
            <TactileButton
              id="mobile-action-btn-primary"
              variant="primary"
              size="lg"
              className="flex-1 py-3 text-base shadow-brutal-sm"
              onClick={handleNextAction}
              disabled={loading || (currentStep === 2 && !selectedSlot)}
            >
              {getActionLabel()}
            </TactileButton>
          ) : (
            <TactileButton
              variant="secondary"
              size="lg"
              className="flex-1 py-3 text-sm shadow-brutal-sm"
              onClick={() => {
                setCurrentBooking(null);
                goToStep(1);
              }}
            >
              BOOK ANOTHER SLOT / RE-ORDER
            </TactileButton>
          )}
        </div>
      </div>
    </div>
  );
}
