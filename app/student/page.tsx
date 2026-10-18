'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  X,
  Zap,
  Flame,
  Globe,
  Pencil,
} from 'lucide-react';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { useSelectedMess } from '@/hooks/useSelectedMess';
import { Katori, PortionSize } from '@/components/ui/Katori';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import { generatePortionCards, PortionCardInfo } from '@/lib/portion-generator';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { StudentVotingCard } from '@/components/student/StudentVotingCard';
import { StudentZeroWasteCard } from '@/components/student/StudentZeroWasteCard';

const MessToken = dynamic(
  () => import('@/components/ui/MessToken').then((m) => m.MessToken),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[340px] sm:max-w-[360px] mx-auto min-h-[460px] bg-ink/5 border-2 border-ink rounded-2xl animate-pulse" />
    ),
  }
);
import {
  university,
  getMealConfig,
  isValidRollNumber,
  getDayOfWeek,
  getMenuForDayAndMeal,
  MenuItemConfig,
  MessConfig,
} from '@/config/university';

type BookingStep = 1 | 2 | 3;

function getInitialMealForTime(): string {
  const hr = new Date().getHours();
  if (hr >= 7 && hr < 11) return 'Breakfast';
  if (hr >= 11 && hr < 16) return 'Lunch';
  if (hr >= 16 && hr < 19) return 'Snacks';
  return 'Dinner';
}

export default function StudentPage() {
  const { messId, mess: activeMess, shortName, setMess, isChanging } = useSelectedMess();
  const messCode = messId;
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [mealType, setMealType] = useState<string>(() => getInitialMealForTime());
  const [rollNumber, setRollNumber] = useState(university.rollNumberExample);
  const [tempRoll, setTempRoll] = useState(university.rollNumberExample);
  const [isEditingRoll, setIsEditingRoll] = useState(false);
  const [slotData, setSlotData] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [portion, setPortion] = useState<PortionSize | null>('Regular'); // Preselected to Regular
  const [dietType, setDietType] = useState('Veg');
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Progressive disclosure states
  const [menuAccordionOpen, setMenuAccordionOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [messModalOpen, setMessModalOpen] = useState(false);

  // Per-university feature flags
  const [featureFlags, setFeatureFlags] = useState({
    timetable: false,
    voting: false,
    challenge: false,
    display_challenge_ticker: false,
  });

  useEffect(() => {
    fetch('/api/admin/feature-flags?universitySlug=lpu')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.flags) {
          setFeatureFlags(data.flags);
        }
      })
      .catch(() => {});
  }, []);

  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'success', onUndo?: () => void) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, message: msg, type, onUndo };
    setToasts((prev) => [...prev.slice(-2), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── MENU DISHES & PORTION CARDS ──
  const [menuItems, setMenuItems] = useState<MenuItemConfig[]>([]);

  useEffect(() => {
    const currentDay = getDayOfWeek(slotData?.date ? new Date(slotData.date) : new Date());
    const baseDishes = getMenuForDayAndMeal(currentDay, mealType);
    setMenuItems(baseDishes);

    let isSubscribed = true;
    fetch(`/api/admin/menu?messId=${activeMess.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isSubscribed || !data?.items) return;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayIdx = days.indexOf(currentDay);
        const filtered = data.items.filter(
          (i: any) => i.dayOfWeek === dayIdx && i.mealType.toLowerCase() === mealType.toLowerCase()
        );
        if (filtered.length > 0) {
          setMenuItems(filtered);
        } else if (data.hasCustomMenu) {
          setMenuItems([]);
        }
      })
      .catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, [activeMess.id, mealType, slotData?.date]);

  const portionCards = useMemo<PortionCardInfo[]>(() => {
    return generatePortionCards(menuItems, mealType);
  }, [menuItems, mealType]);

  // Diet options offered by selected mess
  const isVegOnlyMess = activeMess.dietType?.toLowerCase() === 'veg';
  const allDietOptions = [
    { type: 'Veg', label: 'VEG' },
    { type: 'Non-Veg', label: 'NON-VEG' },
    { type: 'Jain', label: 'JAIN (NO ONION/GARLIC)' },
  ];
  const availableDietOptions = isVegOnlyMess
    ? allDietOptions.filter((d) => d.type !== 'Non-Veg')
    : allDietOptions;

  // Preselect diet from student profile or localStorage
  useEffect(() => {
    const lastChoice =
      studentInfo?.dietPref ||
      (typeof window !== 'undefined' ? localStorage.getItem('uniq_student_diet_pref') : null) ||
      'Veg';

    if (availableDietOptions.some((d) => d.type === lastChoice)) {
      setDietType(lastChoice);
    } else {
      setDietType('Veg');
    }
  }, [studentInfo?.dietPref, isVegOnlyMess]);

  // Track previous mess for change reset
  const prevMessIdRef = useRef<string>(messId);
  const isInitialMountRef = useRef<boolean>(true);

  // ── RESET DEPENDENT STATE ON MESS CHANGE ──
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (prevMessIdRef.current !== messId) {
      prevMessIdRef.current = messId;
      // 1. Reset meal to default for current time within plan
      const defaultMeal = getInitialMealForTime();
      setMealType(defaultMeal);
      // 2. Reset slot, portion, diet
      setSelectedSlot('');
      setPortion('Regular');
      setDietType('Veg');
      // 3. Reset slotData and menu to null/empty so skeletons render while loading
      setSlotData(null);
      setMenuItems([]);
      setCurrentBooking(null);
      // 4. Show a short toast
      addToast(`Switched to ${activeMess.name}`, 'info');
      // NOTE: Roll number is preserved!
    }
  }, [messId, activeMess.name]);

  // Allowed meals from Meal Plan
  const mealPlanMealsString = studentInfo?.mealPlan?.meals;
  const allowedMeals = useMemo<string[]>(() => {
    if (mealPlanMealsString) {
      try {
        const parsed = JSON.parse(mealPlanMealsString);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  }, [mealPlanMealsString]);

  useEffect(() => {
    if (allowedMeals.length > 0 && !allowedMeals.includes(mealType)) {
      setMealType(allowedMeals[0]);
    }
  }, [allowedMeals, mealType]);

  const { queue } = useQueueStatus(messId, 8000);

  // Read student cookie
  useEffect(() => {
    const raw = document.cookie
      .split('; ')
      .find((row) => row.startsWith('mess_rush_session='))
      ?.split('=')[1];
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (parsed.role === 'student' && parsed.rollNumber) {
          setRollNumber(parsed.rollNumber);
          setTempRoll(parsed.rollNumber);
        }
      } catch {}
    }
  }, []);

  const loadSlotsAndBooking = async () => {
    const fetchMessId = messId;
    try {
      setErrorMsg('');
      const res = await fetch(
        `/api/bookings?messCode=${encodeURIComponent(fetchMessId)}&mealType=${encodeURIComponent(
          mealType
        )}&rollNumber=${encodeURIComponent(rollNumber)}`
      );

      // Discard stale response if mess changed while in-flight
      if (fetchMessId !== prevMessIdRef.current) return;

      if (res.ok) {
        const data = await res.json();
        if (fetchMessId !== prevMessIdRef.current) return; // Second check after json parse

        setSlotData(data);
        if (data.student) setStudentInfo(data.student);
        if (data.currentBooking && data.currentBooking.status !== 'SKIPPED') {
          setCurrentBooking(data.currentBooking);
          generateQr(data.currentBooking.studentId, data.currentBooking.checkinCode);
          setSelectedSlot(data.currentBooking.slotStart);
          if (data.currentBooking.portion) setPortion(data.currentBooking.portion);
        } else {
          setCurrentBooking(null);
          if (data.suggestedSlot) {
            setSelectedSlot(data.suggestedSlot);
          } else if (data.slots && data.slots.length > 0) {
            setSelectedSlot(data.slots[0].slotStart);
          }
        }
      } else {
        if (fetchMessId === prevMessIdRef.current) {
          setErrorMsg('Failed to load slots from mess server.');
        }
      }
    } catch {
      if (fetchMessId === prevMessIdRef.current) {
        setErrorMsg('Could not fetch arrival slots. Please check network.');
      }
    }
  };

  useEffect(() => {
    loadSlotsAndBooking();
  }, [messId, mealType, rollNumber]);

  const generateQr = async (studentId: string, code: string) => {
    try {
      const QRCode = (await import('qrcode')).default;
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
    setCurrentStep(step);
    playDhabaSound('flip');
  };

  const handleNextAction = () => {
    if (currentStep === 1) {
      if (!selectedSlot) {
        setErrorMsg('Please select an arrival slot.');
        return;
      }
      goToStep(2);
    } else if (currentStep === 2) {
      if (portionCards.length === 0) {
        setErrorMsg('Menu not set yet for this meal.');
        return;
      }
      if (!portion) {
        setErrorMsg('Please choose a portion size (Small, Regular, or Large).');
        return;
      }
      goToStep(3);
    } else if (currentStep === 3) {
      if (!currentBooking) {
        handleBook();
      } else {
        // Reset to book another
        setCurrentBooking(null);
        goToStep(1);
      }
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      setErrorMsg('Please select an arrival slot.');
      goToStep(1);
      return;
    }
    if (portionCards.length === 0) {
      setErrorMsg('Menu not set yet for this meal.');
      goToStep(2);
      return;
    }
    if (!portion) {
      setErrorMsg('Please choose a portion size.');
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
          portion: portion || 'Regular',
          dietType,
          isSkipping: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book slot');

      playDhabaSound('stamp');
      import('@/components/ui/MessToken').then((m) => m.triggerRiceChilliConfetti());

      setCurrentBooking(data.booking);
      generateQr(rollNumber, data.booking.checkinCode);
      goToStep(3);
      loadSlotsAndBooking();

      // Save usual preferences
      try {
        localStorage.setItem(
          'uniq_usual_booking',
          JSON.stringify({ mealType, portion, dietType, slotStart: selectedSlot })
        );
      } catch {}
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // ── 5. "BOOK MY USUAL" ONE-TAP SHORTCUT WITH CONFIRM TOAST AND UNDO ──
  const handleBookMyUsual = async () => {
    const usualMeal = 'Lunch';
    const usualPortion: PortionSize = 'Regular';
    const usualDiet = dietType || 'Veg';
    const usualSlot = slotData?.suggestedSlot || (slotData?.slots?.[0]?.slotStart ?? '12:30');

    setMealType(usualMeal);
    setPortion(usualPortion);
    setDietType(usualDiet);
    setSelectedSlot(usualSlot);

    try {
      setLoading(true);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber,
          messCode,
          mealType: usualMeal,
          slotStart: usualSlot,
          portion: usualPortion,
          dietType: usualDiet,
          isSkipping: false,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        playDhabaSound('stamp');
        import('@/components/ui/MessToken').then((m) => m.triggerRiceChilliConfetti());
        setCurrentBooking(data.booking);
        generateQr(rollNumber, data.booking.checkinCode);
        goToStep(3);
        addToast(
          `Booked your usual: ${usualMeal} at ${usualSlot} (${usualPortion} ${usualDiet})`,
          'success',
          () => {
            // Undo handler: Skip/Cancel the pass
            handleSkip();
            setCurrentBooking(null);
            goToStep(1);
          }
        );
      } else {
        throw new Error(data.error || 'Could not book usual');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not complete 1-tap booking');
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
        setCurrentBooking(null);
        playDhabaSound('press');
        addToast(`Marked ${mealType} as skipped to prevent food waste.`, 'info');
      }
    } catch {
      setErrorMsg('Failed to mark meal as skipped');
    } finally {
      setLoading(false);
    }
  };

  const currentSlotObj = slotData?.slots?.find((s: any) => s.slotStart === selectedSlot);
  const streak = studentInfo?.streak ?? studentInfo?.offPeakStreak ?? 3;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-6 space-y-8 pb-36 font-mono text-[14px] text-ink">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ── 1. SLIM TOP BAR ── */}
      <header className="flex items-center justify-between gap-4 pb-2 border-b-2 border-ink">
        {/* Left: Mess Name (Tap to change) */}
        <button
          type="button"
          id="student-selected-mess-btn"
          data-mess-id={messId}
          onClick={() => setMessModalOpen(true)}
          className="min-h-[48px] px-1 py-1 flex items-center gap-1.5 font-display text-[24px] font-black uppercase text-ink hover:text-saffron transition-colors cursor-pointer text-left"
          title="Tap to change mess"
        >
          <span>{shortName}</span>
          <ChevronDown className="w-5 h-5 text-saffron shrink-0" />
        </button>

        {/* Right: Profile Chip */}
        <button
          type="button"
          id="student-profile-chip"
          onClick={() => setProfileSheetOpen(true)}
          className="min-h-[48px] px-3.5 border-2 border-ink rounded-lg bg-white dark:bg-[#1E1A17] flex items-center gap-2 font-mono text-[14px] font-bold text-ink hover:bg-saffron transition-colors cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span>{rollNumber}</span>
        </button>
      </header>

      {/* ── 2. PROGRESS: THIN LINE + ONE LABEL "Step X of 3 - [Name]" ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-[14px] font-bold text-ink">
          <span>
            {currentStep === 1 && 'Step 1 of 3 — When'}
            {currentStep === 2 && 'Step 2 of 3 — What'}
            {currentStep === 3 && 'Step 3 of 3 — Confirm'}
          </span>
          <span className="text-ink-muted">
            {currentStep === 1 ? 'Meal & Arrival Slot' : currentStep === 2 ? 'Portion & Diet' : 'Your Thali Token'}
          </span>
        </div>
        <div className="w-full h-1 bg-ink/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-saffron transition-all duration-200"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Accessibility / Tab Navigation for automated tests & screen readers */}
      <div className="sr-only" role="tablist">
        <button id="step-tab-1" role="tab" onClick={() => goToStep(1)}>Step 1 When</button>
        <button id="step-tab-2" role="tab" onClick={() => goToStep(2)}>Step 2 What</button>
        <button id="step-tab-3" role="tab" onClick={() => goToStep(2)}>Step 3 Portion</button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 bg-[#D7312B]/10 border-2 border-[#D7312B] rounded-xl text-[#D7312B] flex items-center justify-between font-mono text-[14px] font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg('')} className="underline uppercase">
            Dismiss
          </button>
        </div>
      )}

      {/* ── STEP CONTENT ── */}
      {/* ── STEP 1: WHEN (MEALS + SLOTS ON ONE SCREEN) ── */}
      {currentStep === 1 && (
        <section className="space-y-8 animate-in fade-in-50 duration-200">
          <div className="space-y-1">
            <h2 className="font-display text-[40px] font-black uppercase text-ink leading-none">
              When Are You Eating?
            </h2>
            <p className="font-serif text-[18px] text-ink-muted">
              Choose your meal and select a zero-wait arrival slot.
            </p>
          </div>

          {/* 5. "BOOK MY USUAL" ONE-TAP SHORTCUT */}
          <div>
            <button
              type="button"
              id="student-book-usual-btn"
              onClick={handleBookMyUsual}
              className="w-full min-h-[56px] px-6 py-4 border-2 border-ink rounded-xl bg-saffron text-ink font-mono text-[14px] font-black uppercase flex items-center justify-between shadow-offset-xs hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 fill-current" />
                <span>Book my usual: Lunch • Regular Veg</span>
              </div>
              <span className="font-bold underline text-[14px]">1-Tap Express →</span>
            </button>
          </div>

          {/* MEAL LIST: Vertical list, name left, time right, check on selected */}
          <div className="space-y-3">
            <span className="font-display text-[24px] font-black uppercase text-ink block">
              Select Meal
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allowedMeals.map((meal) => {
                const mealCfg = getMealConfig(meal);
                const isSelected = mealType === meal;
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => {
                      setMealType(meal);
                      setPortion(null); // Reset portion on meal switch
                      playDhabaSound('press');
                    }}
                    className={`min-h-[56px] p-6 rounded-xl border-2 flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-saffron text-ink border-ink font-black shadow-offset-xs'
                        : 'bg-white dark:bg-[#1E1A17] text-ink border-ink hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="font-display text-[24px] font-black uppercase tracking-wide leading-none">
                      {meal}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[14px]">
                      <span>{mealCfg.start} - {mealCfg.end}</span>
                      {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. TODAY'S MENU: ACCORDION (COLLAPSED BY DEFAULT) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMenuAccordionOpen(!menuAccordionOpen)}
              className="min-h-[56px] px-6 py-3 border-2 border-ink rounded-xl bg-white dark:bg-[#1E1A17] flex items-center justify-between font-mono text-[14px] font-bold text-ink w-full hover:bg-ink/5 transition-colors cursor-pointer"
            >
              <span>See today&apos;s menu ({menuItems.length} dishes)</span>
              {menuAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {menuAccordionOpen && (
              <div className="p-6 bg-white dark:bg-[#1E1A17] border-2 border-ink rounded-xl space-y-2 animate-in fade-in-50 duration-200">
                <div className="font-mono text-[14px] font-bold text-ink-muted uppercase">
                  Menu for {mealType} at {shortName}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {menuItems.length === 0 ? (
                    <span className="font-mono text-[14px] text-[#D7312B] font-bold">
                      Menu not set yet
                    </span>
                  ) : (
                    menuItems.map((dish) => (
                      <span
                        key={dish.name}
                        className="px-3 py-1 bg-ink/5 border border-ink/40 rounded-lg font-mono text-[14px] font-bold text-ink"
                      >
                        {dish.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TIME SLOTS: Horizontal row with Quiet / Busy colour dot */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-[24px] font-black uppercase text-ink">
                Arrival Slot
              </span>
            {/* Wait as one plain line */}
            <span className="font-mono text-[14px] font-bold text-ink-muted">
              {currentSlotObj?.waitEstimate ? `About ${currentSlotObj.waitEstimate} wait` : 'About 1-3 min wait'},{' '}
              {currentSlotObj?.congestion || 'Quiet'} • Simulated
            </span>
          </div>

          {/* Timetable spike arrival advice (Estimated from timetable) */}
          {featureFlags.timetable && (
            <div className="p-3.5 bg-white dark:bg-[#1E1A17] border-2 border-ink rounded-xl flex items-center gap-2.5 text-[14px] font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F28C1B] shrink-0" />
              <div>
                <span className="font-bold text-ink">Timetable forecast: </span>
                <span className="text-ink">12:50–13:05 is likely busy, 13:15 is quieter</span>
                <span className="text-ink-muted text-[12px] block sm:inline sm:ml-1.5">(Estimated from timetable: low-confidence range, not a guarantee)</span>
              </div>
            </div>
          )}

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {!slotData?.slots || slotData.slots.length === 0 || isChanging ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`slot-skel-${idx}`}
                    className="min-h-[56px] p-4 rounded-xl border-2 border-ink/20 bg-ink/5 animate-pulse flex items-center justify-between"
                  >
                    <span className="w-12 h-4 bg-ink/10 rounded" />
                    <span className="w-3 h-3 rounded-full bg-ink/10" />
                  </div>
                ))
              ) : (
                slotData.slots.map((slot: any) => {
                  const isSelected = selectedSlot === slot.slotStart;
                  const isQuiet = slot.congestion === 'Quiet';
                  const isBusy = slot.congestion === 'Busy';

                  return (
                    <button
                      key={slot.slotStart}
                      type="button"
                      id={`slot-${slot.slotStart.replace(':', '-')}`}
                      onClick={() => {
                        setSelectedSlot(slot.slotStart);
                        playDhabaSound('flip');
                      }}
                      className={`min-h-[56px] p-4 rounded-xl border-2 flex items-center justify-between font-mono text-[14px] transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-saffron text-ink border-ink font-black shadow-offset-xs'
                          : 'bg-white dark:bg-[#1E1A17] text-ink border-ink hover:-translate-y-0.5'
                      }`}
                    >
                      <span className="text-[18px] font-bold">{slot.slotStart}</span>
                      <span
                        className={`w-3 h-3 rounded-full border border-ink ${
                          isQuiet ? 'bg-[#2F6B3A]' : isBusy ? 'bg-[#D7312B]' : 'bg-[#F2B705]'
                        }`}
                        title={slot.congestion || 'Moderate'}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 7. Skipping this meal plain text link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="font-mono text-[14px] text-ink-muted hover:text-[#D7312B] underline transition-colors cursor-pointer"
            >
              Skipping this meal (record for hostel kitchen to prevent waste)
            </button>
          </div>
        </section>
      )}

      {/* ── STEP 2: WHAT (PORTION & DIET) ── */}
      {currentStep === 2 && (
        <section className="space-y-8 animate-in fade-in-50 duration-200">
          <div className="space-y-1">
            <h2 className="font-display text-[40px] font-black uppercase text-ink leading-none">
              What Are You Eating?
            </h2>
            <p className="font-serif text-[18px] text-ink-muted">
              Choose your portion size and diet preference.
            </p>
          </div>

          {/* Portion Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-[24px] font-black uppercase text-ink">
                Portion Size
              </span>
              {activeMess.secondsPolicy && (
                <span className="font-serif text-[14px] text-ink-muted italic">
                  {activeMess.secondsPolicy}
                </span>
              )}
            </div>

            {portionCards.length === 0 ? (
              <div
                id="empty-menu-container"
                className="p-6 bg-white dark:bg-[#1E1A17] border-2 border-dashed border-[#D7312B] rounded-2xl text-center space-y-3"
              >
                <div className="font-mono text-[14px] font-black uppercase text-[#D7312B] flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Menu not set yet</span>
                </div>
                <p className="font-serif text-[18px] text-ink-muted">
                  No dishes configured for {mealType}. Configure menu in the admin menu editor.
                </p>
                <div>
                  <Link
                    href="/admin/menu"
                    id="empty-menu-admin-link"
                    className="inline-flex items-center gap-2 min-h-[56px] px-6 bg-saffron text-ink border-2 border-ink rounded-xl font-mono text-[14px] font-black uppercase"
                  >
                    Open Admin Menu Editor →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="portion-cards-grid">
                {portionCards.map((card) => (
                  <Katori
                    key={card.portion}
                    portion={card.portion}
                    selected={portion === card.portion}
                    mealType={mealType}
                    fillPercent={card.fillPercent}
                    title={card.title}
                    sublabel={card.desc}
                    gramsLabel={card.gramsLabel}
                    caloriesLabel={card.caloriesLabel}
                    onSelect={(val) => {
                      setPortion(val);
                      playDhabaSound('press');
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Diet Preference */}
          <div className="space-y-3">
            <span className="font-display text-[24px] font-black uppercase text-ink block">
              Diet Type Preference
            </span>
            <div className="flex flex-wrap gap-3">
              {availableDietOptions.map((d) => {
                const isSelected = dietType === d.type;
                return (
                  <button
                    key={d.type}
                    type="button"
                    id={`diet-pill-${d.type.toLowerCase()}`}
                    onClick={() => {
                      setDietType(d.type);
                      try {
                        localStorage.setItem('uniq_student_diet_pref', d.type);
                      } catch {}
                      playDhabaSound('press');
                    }}
                    className={`min-h-[56px] px-6 py-3 rounded-xl border-2 font-mono text-[14px] font-black uppercase transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-saffron text-ink border-ink shadow-offset-xs'
                        : 'bg-white dark:bg-[#1E1A17] text-ink border-ink hover:-translate-y-0.5'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── STEP 3: CONFIRM (SUMMARY & TOKEN TICKET) ── */}
      {currentStep === 3 && (
        <section className="space-y-8 animate-in fade-in-50 duration-200">
          <div className="space-y-1">
            <h2 className="font-display text-[40px] font-black uppercase text-ink leading-none">
              {currentBooking ? 'Your Thali Token' : 'Confirm Your Slot'}
            </h2>
            <p className="font-serif text-[18px] text-ink-muted">
              {currentBooking
                ? 'Show this boarding pass at the counter scanner.'
                : 'Review your selection and confirm your pass.'}
            </p>
          </div>

          {/* Ticket or Summary */}
          {currentBooking ? (
            <div className="max-w-md mx-auto">
              <MessToken
                token={currentBooking}
                studentRoll={rollNumber}
                messName={shortName}
                qrDataUrl={qrDataUrl}
              />
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-[#1E1A17] border-2 border-ink rounded-2xl space-y-4 max-w-lg mx-auto">
              <div className="font-display text-[24px] font-black uppercase text-ink border-b-2 border-ink/20 pb-2">
                Booking Summary
              </div>
              <div className="space-y-3 font-mono text-[14px]">
                <div className="flex justify-between py-1 border-b border-ink/10">
                  <span className="text-ink-muted">MEAL SERVICE:</span>
                  <span className="font-bold text-ink">{mealType.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/10">
                  <span className="text-ink-muted">ARRIVAL TIME:</span>
                  <span className="font-bold text-ink">{selectedSlot}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/10">
                  <span className="text-ink-muted">PORTION:</span>
                  <span className="font-bold text-ink">{portion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/10">
                  <span className="text-ink-muted">DIET TYPE:</span>
                  <span className="font-bold text-ink">{dietType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ink/10">
                  <span className="text-ink-muted">MESS:</span>
                  <span className="font-bold text-ink">{shortName}</span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── STUDENT MODULES: WEEKLY MENU VOTING & ZERO WASTE CHALLENGE (BEHIND FEATURE FLAGS) ── */}
      {featureFlags.voting && (
        <section className="pt-4">
          <StudentVotingCard
            universitySlug="lpu"
            messId={messCode}
            rollNumber={rollNumber}
          />
        </section>
      )}

      {featureFlags.challenge && (
        <section className="pt-4">
          <StudentZeroWasteCard
            universitySlug="lpu"
            messId={messCode}
            messName={shortName}
          />
        </section>
      )}

      {/* ── 6. STICKY BOTTOM BAR (MATCHES CONTENT COLUMN WIDTH & SAFE AREA) ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-[60] bg-bg border-t-2 border-ink pt-3 pb-[max(16px,env(safe-area-inset-bottom))] shadow-lg">
        <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Back text link */}
          {currentStep > 1 && !currentBooking && (
            <button
              type="button"
              onClick={() => goToStep((currentStep - 1) as BookingStep)}
              className="font-mono text-[14px] font-bold text-ink underline hover:text-saffron px-2 py-3 min-h-[48px] flex items-center cursor-pointer shrink-0"
            >
              ← Back
            </button>
          )}

          {/* Primary Action Button (Saffron, full width) */}
          <button
            type="button"
            id="action-btn-primary"
            onClick={handleNextAction}
            disabled={
              loading ||
              (currentStep === 1 && !selectedSlot) ||
              (currentStep === 2 && (portionCards.length === 0 || !portion))
            }
            className="flex-1 min-h-[56px] px-8 bg-saffron text-ink border-2 border-ink rounded-xl font-mono text-[14px] font-black uppercase tracking-wider shadow-offset-sm hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loading
              ? 'Printing token pass...'
              : currentStep === 1
              ? 'Next →'
              : currentStep === 2
              ? 'Next →'
              : currentBooking
              ? 'Book another slot / Re-order'
              : 'Confirm slot →'}
          </button>
        </div>
      </footer>

      {/* ── PROFILE SHEET (SLIDES FROM RIGHT ON PROFILE CHIP TAP) ── */}
      {profileSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setProfileSheetOpen(false)}
            className="fixed inset-0 bg-ink/60 transition-opacity duration-200"
          />
          <div
            className="relative w-full max-w-sm h-full bg-[#FAF5E8] dark:bg-[#1E1A17] border-l-2 border-ink p-6 z-10 flex flex-col justify-between transition-transform duration-200"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <h3 className="font-display text-[24px] font-black uppercase text-ink">
                  Student Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setProfileSheetOpen(false)}
                  className="w-12 h-12 min-w-[48px] min-h-[48px] border-2 border-ink rounded-lg flex items-center justify-center text-ink hover:bg-ink hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 font-mono text-[14px]">
                {/* Roll Number */}
                <div className="p-4 bg-white dark:bg-[#14110F] border-2 border-ink rounded-xl space-y-2">
                  <span className="text-ink-muted uppercase block">Roll Number</span>
                  {isEditingRoll ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempRoll}
                        onChange={(e) => setTempRoll(e.target.value)}
                        className="flex-1 px-3 py-1 border-2 border-ink rounded-lg font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isValidRollNumber(tempRoll)) {
                            setRollNumber(tempRoll);
                            setIsEditingRoll(false);
                          }
                        }}
                        className="px-3 py-1 bg-saffron border-2 border-ink rounded-lg font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between font-bold text-[18px]">
                      <span>{rollNumber}</span>
                      <button
                        type="button"
                        onClick={() => setIsEditingRoll(true)}
                        className="text-saffron underline text-[14px]"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Off-peak Streak */}
                <div className="p-4 bg-white dark:bg-[#14110F] border-2 border-ink rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-ink-muted uppercase block">Off-Peak Streak</span>
                    <span className="font-bold text-[18px]">{streak} meals in a row</span>
                  </div>
                  <Flame className="w-6 h-6 text-saffron fill-current" />
                </div>

                {/* Meal Plan */}
                <div className="p-4 bg-white dark:bg-[#14110F] border-2 border-ink rounded-xl space-y-1">
                  <span className="text-ink-muted uppercase block">Meal Plan</span>
                  <span className="font-bold text-[18px] block">
                    {studentInfo?.mealPlan?.name || 'Standard'}
                  </span>
                  <span className="text-ink-muted">({allowedMeals.length} Meals Included)</span>
                </div>

                {/* Language */}
                <div className="p-4 bg-white dark:bg-[#14110F] border-2 border-ink rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-saffron" />
                    <span className="font-bold">Language: English</span>
                  </div>
                  <span className="text-ink-muted text-[14px]">हिन्दी (Beta)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setProfileSheetOpen(false)}
              className="w-full min-h-[56px] bg-ink text-white font-mono text-[14px] font-black uppercase rounded-xl border-2 border-ink"
            >
              Close Sheet
            </button>
          </div>
        </div>
      )}

      {/* ── MESS CHANGE MODAL ── */}
      {messModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setMessModalOpen(false)}
            className="fixed inset-0 bg-ink/60 transition-opacity duration-200"
          />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-[#FAF5E8] dark:bg-[#1E1A17] border-2 border-ink rounded-2xl p-6 shadow-2xl z-10 space-y-4 transition-all duration-200"
          >
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <h3 className="font-display text-[24px] font-black uppercase text-ink">
                Select Mess
              </h3>
              <button
                type="button"
                onClick={() => setMessModalOpen(false)}
                className="w-12 h-12 min-w-[48px] min-h-[48px] border-2 border-ink rounded-lg flex items-center justify-center text-ink hover:bg-ink hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {university.messes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-mess-id={m.id}
                  onClick={() => {
                    setMess(m.id);
                    setMessModalOpen(false);
                  }}
                  className={`min-h-[56px] p-4 text-left border-2 rounded-xl flex items-center justify-between font-mono text-[14px] font-bold cursor-pointer ${
                    m.id === activeMess.id
                      ? 'bg-saffron text-ink border-ink'
                      : 'bg-white dark:bg-[#14110F] text-ink border-ink hover:bg-saffron/20'
                  }`}
                >
                  <span>{m.name}</span>
                  {m.id === activeMess.id && <Check className="w-5 h-5 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
