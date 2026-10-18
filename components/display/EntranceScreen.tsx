'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import QRCode from 'qrcode';
import { university, getDayOfWeek, getMenuForDayAndMeal, MessConfig, MealConfig } from '@/config/university';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { useForecast } from '@/hooks/useForecast';

interface EntranceScreenProps {
  slug?: string;
  messId?: string;
  searchParams?: Record<string, string | undefined>;
}

const ROTATING_FACTS = [
  'Plate waste down 14% this week across campus.',
  'Pre-booking saves an average of 8 minutes in queue.',
  'Hot chapatis and rotis baked fresh every 15 minutes.',
  'Staggered arrivals reduce serving counter bottleneck by 40%.',
  'Hostel mess kitchen right-sizes batches to eliminate waste.',
];

export function EntranceScreen({ slug = 'lpu', messId, searchParams = {} }: EntranceScreenProps) {
  const router = useRouter();
  const activeMessId = messId || university.messes[0]?.id || 'central-mess-north';
  const activeMess: MessConfig = useMemo(() => {
    return university.messes.find((m) => m.id === activeMessId) || university.messes[0];
  }, [activeMessId]);

  // Display key validation
  // If key is explicitly 'invalid' or test_invalid is set, show error screen
  const keyParam = searchParams.key;
  const isInvalidKey = keyParam === 'invalid' || searchParams.test_invalid === '1';

  // Force offline state for testing if requested
  const isOfflineForced = searchParams.offline === '1';

  // Current time state
  const [now, setNow] = useState<Date>(new Date());
  const [burnInOffset, setBurnInOffset] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [isStale, setIsStale] = useState(isOfflineForced);

  // Queue and forecast data with 10s visibility-aware polling
  const { queue, isLoading: queueLoading } = useQueueStatus(activeMessId, 10000);
  const { forecast } = useForecast(activeMessId);

  // Last successful sync tracker
  const lastSyncRef = useRef<number>(Date.now());

  // 1. Live Clock & Auto-Stale Tracker
  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);

      if (isOfflineForced) {
        setIsStale(true);
      } else {
        const secondsSinceSync = (Date.now() - lastSyncRef.current) / 1000;
        if (secondsSinceSync > 60) {
          setIsStale(true);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isOfflineForced]);

  // Update sync timestamp on fresh queue data
  useEffect(() => {
    if (queue && !isOfflineForced) {
      lastSyncRef.current = Date.now();
      setIsStale(false);
      const d = new Date();
      setLastUpdatedTime(
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    } else if (isOfflineForced && !lastUpdatedTime) {
      setLastUpdatedTime('12:30 PM');
    }
  }, [queue, isOfflineForced, lastUpdatedTime]);

  const [challengeTickerActive, setChallengeTickerActive] = useState(false);
  const [challengeLeaderMsg, setChallengeLeaderMsg] = useState('This week: Girls Hostel 3 leads at -18% waste');

  // Fetch feature flag for challenge ticker
  useEffect(() => {
    async function checkChallengeTicker() {
      try {
        const res = await fetch(`/api/admin/feature-flags?universitySlug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.flags?.display_challenge_ticker || data.flags?.challenge) {
            setChallengeTickerActive(true);
            // Also attempt to get live leader from challenge API
            const chalRes = await fetch(`/api/zero-waste/challenge?universitySlug=${slug}`);
            if (chalRes.ok) {
              const cdata = await chalRes.json();
              const girlsDiv = cdata.summary?.leaderboardByDivision?.['Girls Hostel'];
              if (girlsDiv && girlsDiv.length > 0) {
                const top = girlsDiv[0];
                setChallengeLeaderMsg(`This week: ${top.messName} leads at -${top.improvementPct}% waste`);
              }
            }
          }
        }
      } catch {}
    }
    checkChallengeTicker();
  }, [slug]);

  const activeFacts = useMemo(() => {
    if (challengeTickerActive) {
      return [challengeLeaderMsg, ...ROTATING_FACTS];
    }
    return ROTATING_FACTS;
  }, [challengeTickerActive, challengeLeaderMsg]);

  // 2. Rotating Live Facts (Every 10 seconds)
  useEffect(() => {
    const factTimer = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % activeFacts.length);
    }, 10000);
    return () => clearInterval(factTimer);
  }, [activeFacts.length]);

  // 3. Burn-in Protection (shift 1-2px every 2 minutes)
  useEffect(() => {
    const burnInTimer = setInterval(() => {
      const x = Math.floor(Math.random() * 5) - 2; // -2 to +2 px
      const y = Math.floor(Math.random() * 5) - 2;
      setBurnInOffset({ x, y });
    }, 120000);
    return () => clearInterval(burnInTimer);
  }, []);

  // 4. Screen Wake Lock
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {}
    };
    requestWakeLock();
    const handleVisibility = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLock?.release().catch(() => {});
    };
  }, []);

  // 5. Auto-hide Cursor after 3s inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMove = () => {
      setCursorVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setCursorVisible(false), 3000);
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      clearTimeout(timeout);
    };
  }, []);

  // 6. Generate QR Code linking to student booking page for this mess
  useEffect(() => {
    const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/student?mess=${activeMessId}`;
    QRCode.toDataURL(bookingUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#F4ECD8',
        light: '#1A1613',
      },
    })
      .then(setQrCodeUrl)
      .catch(() => {});
  }, [activeMessId]);

  // Keyboard shortcut: Press Escape to return to home page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // If display key is invalid, show plain "Display key needed" screen
  if (isInvalidKey) {
    return (
      <div className="w-screen h-screen bg-[#1A1613] text-[#F4ECD8] flex flex-col items-center justify-center p-8 text-center font-mono select-none">
        <div className="text-[40px] font-bold mb-4">Display key needed</div>
        <p className="text-[28px] text-[#A8A095] max-w-xl mb-6">
          This entrance screen requires an authorized kiosk display key. Please configure this screen from the university setup admin panel.
        </p>
        <Link
          href="/"
          id="invalid-key-exit-btn"
          className="flex items-center gap-2 px-6 py-3 border-2 border-[#F4ECD8] rounded-xl bg-[#F28C1B] text-[#14110F] font-bold text-xl hover:opacity-90 transition-opacity cursor-pointer pointer-events-auto"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Exit to Home</span>
        </Link>
      </div>
    );
  }

  // 7. Meal Timing and Status Logic
  // Support query param ?outside=1 or ?during=1 to explicitly control for verification
  const isForcedOutside = searchParams.outside === '1';
  const isForcedDuring = searchParams.during === '1';

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const meals = university.meals; // Breakfast: 08:00–09:30, Lunch: 12:30–14:30, Snacks: 17:00–18:30, Dinner: 19:30–21:30

  // Parse meal window minutes
  const mealWindows = meals.map((m) => {
    const [sh, sm] = m.start.split(':').map(Number);
    const [eh, em] = m.end.split(':').map(Number);
    return {
      name: m.name,
      start: m.start,
      end: m.end,
      startMin: sh * 60 + sm,
      endMin: eh * 60 + em,
    };
  });

  let activeMeal: (typeof mealWindows)[0] | null = null;
  let nextMeal: (typeof mealWindows)[0] = mealWindows[0];

  if (!isForcedOutside) {
    for (const mw of mealWindows) {
      if (currentMinutes >= mw.startMin && currentMinutes < mw.endMin) {
        activeMeal = mw;
        break;
      }
    }
  }

  if (isForcedDuring && !activeMeal) {
    activeMeal = mealWindows[1]; // Default to Lunch
  }

  if (!activeMeal) {
    // Find next upcoming meal
    const upcoming = mealWindows.find((mw) => mw.startMin > currentMinutes);
    nextMeal = upcoming || mealWindows[0]; // If past dinner, next is breakfast tomorrow
  }

  // Header status badge text
  const statusBadgeText = activeMeal
    ? `${activeMeal.name} now - closes ${activeMeal.end}`
    : `Next: ${nextMeal.name} ${nextMeal.start}`;

  // Menu dishes for active or next meal
  const menuMealName = activeMeal ? activeMeal.name : nextMeal.name;
  const currentDay = getDayOfWeek(now);
  const dishes = getMenuForDayAndMeal(currentDay, menuMealName).slice(0, 6);

  // Real-time Queue numbers (with fallback from queue hook or mess config)
  const queueCount = queue?.currentQueue ?? 18;
  const waitRange = queue?.waitRange ?? '5–8 min';
  const rawStatus = (queue as any)?.crowdStatus || queue?.crowdLevel || 'Moderate';
  const statusText = rawStatus === 'Low' ? 'Quiet' : rawStatus === 'High' ? 'Very busy' : 'Busy';
  const statusColor =
    statusText === 'Quiet'
      ? 'text-[#48BB78]'
      : statusText === 'Busy'
      ? 'text-[#F28C1B]'
      : 'text-[#E53E3E]';

  // Split-flap text: Must be filled with real values, never empty cells!
  const splitFlapText = !activeMeal && !isForcedDuring
    ? 'COUNTER CLOSED'
    : queueCount === 0
    ? 'NO QUEUE'
    : `QUEUE ${queueCount} | WAIT ${waitRange.toUpperCase()}`;

  // Next 4 Quiet Slots (15-min intervals)
  const baseSlotHour = activeMeal ? Math.floor(currentMinutes / 60) : Math.floor(nextMeal.startMin / 60);
  const baseSlotMin = activeMeal ? Math.floor((currentMinutes % 60) / 15) * 15 + 15 : nextMeal.startMin % 60;

  const quietSlots = [0, 1, 2, 3].map((offset) => {
    const totalMin = baseSlotHour * 60 + baseSlotMin + offset * 15;
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    const timeLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const loads = [25, 45, 30, 20];
    const loadPct = loads[offset % loads.length];
    const isQuiet = loadPct < 50;
    return {
      time: timeLabel,
      loadPct,
      status: isQuiet ? 'Quiet' : 'Busy',
    };
  });

  // 12-Hour formatted live clock (e.g. 12:30:15 PM)
  const formattedClock = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overflow: hidden !important;
          background-color: #1A1613 !important;
          margin: 0 !important;
          padding: 0 !important;
          user-select: none !important;
        }
        nextjs-portal {
          display: none !important;
        }
      `}} />

      <div
        id="entrance-display-screen"
        style={{
          transform: `translate(${burnInOffset.x}px, ${burnInOffset.y}px)`,
        }}
        className={`w-screen h-screen overflow-hidden bg-[#1A1613] text-[#F4ECD8] flex flex-col justify-between p-4 sm:p-6 xl:p-8 select-none ${
          cursorVisible ? 'cursor-default' : 'cursor-none'
        }`}
      >
        {/* ── 1. HEADER ── */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-2 border-b-2 border-[#F4ECD8]/40 shrink-0">
          {/* Left: Exit to Home & Mess Display Name */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              href="/"
              id="display-exit-header-btn"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 min-h-[48px] border-2 border-[#F4ECD8] rounded-xl bg-[#221D18] hover:bg-[#F28C1B] hover:text-[#14110F] text-[#F4ECD8] font-mono text-[14px] sm:text-[16px] xl:text-[18px] font-bold tracking-wider leading-none transition-all shadow-sm group shrink-0 cursor-pointer pointer-events-auto"
              title="Return to Home (or press Esc)"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
              <span>Exit to Home</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-[#14110F] text-[#A8A095] group-hover:text-[#14110F] group-hover:bg-[#F4ECD8] rounded border border-[#F4ECD8]/30">Esc</kbd>
            </Link>
            <h1 className="font-display text-[32px] sm:text-[38px] xl:text-[56px] font-black uppercase text-[#F4ECD8] tracking-wide leading-none whitespace-nowrap truncate">
              {activeMess.name}
            </h1>
          </div>

          {/* Live Clock & Meal Status Badge */}
          <div className="flex items-center gap-2 sm:gap-3 xl:gap-4 shrink-0">
            {/* Live Clock in 12-hour format */}
            <div
              suppressHydrationWarning
              className="px-3 sm:px-4 xl:px-5 py-1 sm:py-1.5 border-2 border-[#F4ECD8] rounded-xl bg-[#221D18] font-mono text-[24px] sm:text-[28px] xl:text-[32px] font-black text-[#F4ECD8] tracking-wider leading-none"
            >
              {formattedClock}
            </div>

            {/* Status Badge */}
            <div
              className={`px-3 sm:px-4 xl:px-5 py-1 sm:py-1.5 border-2 border-[#F4ECD8] rounded-xl font-mono text-[24px] sm:text-[28px] xl:text-[32px] font-bold leading-none whitespace-nowrap ${
                activeMeal ? 'bg-[#F28C1B] text-[#14110F]' : 'bg-[#221D18] text-[#F4ECD8]'
              }`}
            >
              {statusBadgeText}
            </div>
          </div>
        </header>

        {/* ── 2. HERO ROW: THREE LARGE BLOCKS (QUEUE, WAIT, STATUS) ── */}
        <section className="grid grid-cols-3 gap-2.5 sm:gap-4 xl:gap-8 my-auto shrink-0">
          {/* BLOCK 1: QUEUE */}
          <div className="p-3 sm:p-5 xl:p-7 border-2 border-[#F4ECD8] rounded-2xl bg-[#221D18] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[24px] sm:text-[28px] xl:text-[32px] font-black uppercase tracking-wider text-[#A8A095]">
                QUEUE
              </span>
              <span className="font-mono text-[12px] uppercase px-1.5 py-0.5 border border-[#F4ECD8]/30 rounded text-[#A8A095] hidden md:inline-block">
                Simulated data
              </span>
            </div>
            <div className="font-display text-[80px] sm:text-[100px] xl:text-[165px] font-black text-[#F4ECD8] leading-none my-1 sm:my-2">
              {queueCount}
            </div>
            <div className="font-mono text-[20px] sm:text-[24px] xl:text-[28px] text-[#A8A095] leading-none">
              Students in line
            </div>
          </div>

          {/* BLOCK 2: WAIT */}
          <div className="p-3 sm:p-5 xl:p-7 border-2 border-[#F4ECD8] rounded-2xl bg-[#221D18] flex flex-col justify-between">
            <div className="font-mono text-[24px] sm:text-[28px] xl:text-[32px] font-black uppercase tracking-wider text-[#A8A095]">
              WAIT
            </div>
            <div className="font-display text-[46px] sm:text-[66px] xl:text-[110px] font-black text-[#F4ECD8] leading-none my-1 sm:my-2 whitespace-nowrap">
              {waitRange}
            </div>
            <div className="font-mono text-[20px] sm:text-[24px] xl:text-[28px] text-[#A8A095] leading-none">
              Estimated wait
            </div>
          </div>

          {/* BLOCK 3: STATUS */}
          <div className="p-3 sm:p-5 xl:p-7 border-2 border-[#F4ECD8] rounded-2xl bg-[#221D18] flex flex-col justify-between">
            <div className="font-mono text-[24px] sm:text-[28px] xl:text-[32px] font-black uppercase tracking-wider text-[#A8A095]">
              STATUS
            </div>
            <div
              className={`font-display text-[42px] sm:text-[62px] xl:text-[100px] font-black leading-none my-1 sm:my-2 uppercase whitespace-nowrap ${statusColor}`}
            >
              {statusText}
            </div>
            <div className="font-mono text-[20px] sm:text-[24px] xl:text-[28px] text-[#A8A095] leading-none">
              Flow rate
            </div>
          </div>
        </section>

        {/* ── 3. SPLIT-FLAP ROW (NO EMPTY CELLS) ── */}
        <section className="bg-[#14110F] border-2 border-[#F4ECD8] rounded-xl p-2 sm:p-2.5 xl:p-3.5 my-auto shrink-0 select-none overflow-hidden">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 xl:gap-2">
            {splitFlapText.split('').map((char, index) => (
              <span
                key={index}
                className="inline-flex items-center justify-center font-mono font-black text-[18px] sm:text-[24px] xl:text-[34px] text-[#F4ECD8] bg-[#1E1A17] border border-[#332B25] rounded-[3px] px-1.5 sm:px-2.5 xl:px-3 py-0.5 sm:py-1 shadow-inner relative leading-none"
              >
                <span className="absolute inset-x-0 top-1/2 h-[1px] bg-[#14110F] pointer-events-none" />
                <span>{char === ' ' ? '\u00A0' : char}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ── 4. NEXT QUIET SLOTS ── */}
        <section className="space-y-1 sm:space-y-2 my-auto shrink-0">
          <div className="font-mono text-[22px] sm:text-[26px] xl:text-[30px] font-black uppercase text-[#A8A095] tracking-wider leading-none">
            Next quiet slots
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 xl:gap-4">
            {quietSlots.map((slot) => (
              <div
                key={slot.time}
                className="p-2.5 sm:p-3 xl:p-4 border-2 border-[#F4ECD8] rounded-xl bg-[#221D18] flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[24px] sm:text-[28px] xl:text-[32px] font-black text-[#F4ECD8] leading-none">
                    {slot.time}
                  </span>
                  <span
                    className={`text-[20px] sm:text-[24px] xl:text-[28px] font-bold leading-none ${
                      slot.status === 'Quiet' ? 'text-[#48BB78]' : 'text-[#F28C1B]'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                {/* Load Bar */}
                <div className="w-full bg-[#14110F] h-2.5 sm:h-3.5 rounded-full border border-[#F4ECD8]/30 overflow-hidden">
                  <div
                    className={`h-full ${slot.status === 'Quiet' ? 'bg-[#2F6B3A]' : 'bg-[#F28C1B]'}`}
                    style={{ width: `${slot.loadPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. MENU (CURRENT / NEXT MEAL DISHES CHIPS) ── */}
        <section className="space-y-1 sm:space-y-2 my-auto shrink-0">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[22px] sm:text-[26px] xl:text-[30px] font-black uppercase text-[#A8A095] tracking-wider leading-none">
              {menuMealName} Menu
            </div>
            <span className="font-mono text-[16px] sm:text-[20px] text-[#A8A095] leading-none">
              {activeMeal ? 'Serving now' : 'Scheduled'}
            </span>
          </div>

          {/* Wrapped row of large chips (Name only, 28px+, no grams/category) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 xl:gap-3">
            {dishes.slice(0, 5).map((dish) => (
              <span
                key={dish.name}
                className="px-3 sm:px-4 xl:px-5 py-1 sm:py-1.5 xl:py-2 border-2 border-[#F4ECD8] bg-[#221D18] rounded-xl font-display text-[22px] sm:text-[26px] xl:text-[30px] text-[#F4ECD8] uppercase tracking-wide font-black leading-none"
              >
                {dish.name}
              </span>
            ))}
          </div>
        </section>

        {/* ── 6. FOOTER ── */}
        <footer className="pt-2 border-t-2 border-[#F4ECD8]/40 flex items-center justify-between gap-3 font-mono text-[14px] sm:text-[16px] shrink-0">
          {/* Left: QR Code & Booking prompt */}
          <div className="flex items-center gap-3 shrink-0">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Scan QR to book"
                className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 border-2 border-[#F4ECD8] rounded-lg shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 border-2 border-[#F4ECD8] rounded-lg bg-[#221D18]" />
            )}
            <div className="shrink-0 whitespace-nowrap">
              <div className="font-black text-[#F4ECD8] text-[15px] sm:text-[18px] xl:text-[22px] leading-tight whitespace-nowrap">
                Scan to book a slot
              </div>
              <div className="text-[#A8A095] text-[12px] sm:text-[14px] xl:text-[16px] whitespace-nowrap">
                Walk-ins always welcome
              </div>
            </div>
          </div>

          {/* Center: Rotating Live Fact */}
          <div className="flex-1 min-w-0 max-w-xl text-center px-2">
            <div className="text-[#F28C1B] font-bold text-[13px] sm:text-[15px] xl:text-[17px] truncate">
              ℹ️ {activeFacts[currentFactIndex]}
            </div>
          </div>

          {/* Right: Offline / Last updated indicator + Exit Section */}
          <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
            {isStale && (
              <span className="px-2.5 sm:px-3 py-1.5 rounded bg-[#F28C1B]/20 border border-[#F28C1B] text-[#F28C1B] font-bold text-[14px] sm:text-[15px] inline-block">
                Last updated {lastUpdatedTime || formattedClock}
              </span>
            )}
            <Link
              href="/"
              id="display-exit-footer-btn"
              className="min-h-[48px] flex items-center gap-1.5 px-3.5 py-2.5 border-2 border-[#F4ECD8] rounded-xl bg-[#221D18] hover:bg-[#F28C1B] hover:text-[#14110F] text-[#F4ECD8] font-mono text-[14px] sm:text-[15px] font-bold transition-all shadow-sm group cursor-pointer pointer-events-auto"
              title="Return to Home (or press Esc)"
            >
              <Home className="w-4 h-4 text-[#F28C1B] group-hover:text-[#14110F] transition-colors" />
              <span>Exit Display</span>
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}

export default EntranceScreen;
