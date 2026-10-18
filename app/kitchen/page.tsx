'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Sliders,
  ChevronDown,
  Download,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';
import { useForecast } from '@/hooks/useForecast';
import { FillingWasteBin } from '@/components/ui/FillingWasteBin';
import { SteelWeightButton } from '@/components/ui/SteelWeightButton';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import dynamic from 'next/dynamic';
import { university } from '@/config/university';
import { useSelectedMess } from '@/hooks/useSelectedMess';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

const AttendanceChart = dynamic(
  () => import('@/components/AttendanceChart'),
  {
    ssr: false,
    loading: () => <div className="h-[220px] w-full bg-ink/5 border-2 border-ink rounded-xl animate-pulse" />,
  }
);

const CompareMessesTable = dynamic(
  () => import('@/components/mess/CompareMessesTable').then((m) => m.CompareMessesTable),
  {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-ink/5 border-2 border-ink rounded-xl animate-pulse" />,
  }
);

export default function KitchenPage() {
  const [activeTab, setActiveTab] = useState<'forecast' | 'waste' | 'reports' | 'compare'>('forecast');
  const { messId, mess: activeMess, shortName } = useSelectedMess();
  const messCode = messId;
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('Lunch');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Hook for blended forecast (SWR keyed with messId)
  const { forecast, isLoading, refreshForecast } = useForecast(messId, dateStr, mealType);

  // Configuration state
  const [eventTitle, setEventTitle] = useState('');
  const [eventAdjustmentPct, setEventAdjustmentPct] = useState(0);
  const [safetyBufferPct, setSafetyBufferPct] = useState(8);
  const [savingConfig, setSavingConfig] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);

  // Cooking quantities override state
  const [dishOverrides, setDishOverrides] = useState<Record<string, number>>({});
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});

  // 30-Second Waste Logger state
  const [dishLeftovers, setDishLeftovers] = useState<Record<string, number>>({});
  const [plateWasteTotalKg, setPlateWasteTotalKg] = useState(28);
  const [actualPlates, setActualPlates] = useState(Math.round((activeMess.seats || 350) * 1.15));
  const [wasteSuccessMsg, setWasteSuccessMsg] = useState('');
  const [surplusNotice, setSurplusNotice] = useState<{ kg: number; message: string } | null>(null);
  const [ngoContactInput, setNgoContactInput] = useState(university.ngoContact);

  // Reports state
  const [reportsData, setReportsData] = useState<any>(null);

  // Offline queue hook for warning on unsynced actions
  const { getPendingActionsForMess } = useOfflineQueue();
  const prevMessIdRef = useRef<string>(messId);
  const isInitialMountRef = useRef<boolean>(true);

  // Reset dependent state on mess change
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (prevMessIdRef.current !== messId) {
      const oldMessId = prevMessIdRef.current;
      prevMessIdRef.current = messId;

      // Check unsynced offline actions for old mess
      const unsyncedOld = getPendingActionsForMess(oldMessId);
      if (unsyncedOld.length > 0) {
        const oldMess = university.messes.find((m) => m.id === oldMessId);
        const oldName = oldMess?.shortName || oldMess?.name || 'Central South';
        setStatusMessage(`${unsyncedOld.length} actions for ${oldName} are still syncing`);
      } else {
        setStatusMessage(`Loaded ${activeMess.name}`);
      }

      setDishLeftovers({});
      setDishOverrides({});
      setExpandedOverrides({});
      setReportsData(null);
      setWasteSuccessMsg('');
      setSurplusNotice(null);
    }
  }, [messId, activeMess.name, getPendingActionsForMess]);

  // Sync forecast fields
  useEffect(() => {
    if (forecast) {
      setEventTitle(forecast.eventTitle || '');
      setEventAdjustmentPct(forecast.eventAdjustmentPct || 0);
      setSafetyBufferPct(forecast.safetyBufferPct || 8);

      const initialLeftovers: Record<string, number> = {};
      forecast.dishes.forEach((d) => {
        initialLeftovers[d.menuItemId] = 2;
      });
      setDishLeftovers(initialLeftovers);
    }
  }, [forecast]);

  // Load reports when tab is opened
  useEffect(() => {
    if (activeTab === 'reports') {
      fetch(`/api/waste?messCode=${messCode}`)
        .then((res) => res.json())
        .then((data) => setReportsData(data))
        .catch(console.error);
    }
  }, [activeTab, messCode]);

  // Save Event Flag & Safety Buffer
  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      playDhabaSound('press');
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messCode,
          date: dateStr,
          mealType,
          eventTitle: eventTitle || null,
          eventAdjustmentPct,
          safetyBufferPct,
        }),
      });

      if (res.ok) {
        setStatusMessage('Adjustment applied and forecast recalculated.');
        refreshForecast();
        playDhabaSound('stamp');
        setTimeout(() => setStatusMessage(''), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingConfig(false);
    }
  };

  // Toggle dish override input
  const toggleOverride = (menuItemId: string) => {
    setExpandedOverrides((prev) => ({
      ...prev,
      [menuItemId]: !prev[menuItemId],
    }));
  };

  const handleOverrideChange = (menuItemId: string, val: number) => {
    setDishOverrides((prev) => ({
      ...prev,
      [menuItemId]: val,
    }));
  };

  const resetOverride = (menuItemId: string) => {
    setDishOverrides((prev) => {
      const next = { ...prev };
      delete next[menuItemId];
      return next;
    });
  };

  // Preset Leftover Button Tap (Under 30s UX)
  const setDishKg = (menuItemId: string, kg: number) => {
    playDhabaSound('press');
    setDishLeftovers((prev) => ({
      ...prev,
      [menuItemId]: kg,
    }));
  };

  // Submit Waste Log
  const handleSubmitWaste = async () => {
    try {
      playDhabaSound('stamp');
      const leftoverList = Object.entries(dishLeftovers).map(([menuItemId, kg]) => ({
        menuItemId,
        leftoverCookedKg: Number(kg) || 0,
      }));

      const res = await fetch('/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messCode,
          date: dateStr,
          mealType,
          dishLeftovers: leftoverList,
          plateWasteTotalKg: Number(plateWasteTotalKg) || 0,
          actualPlates: Number(actualPlates) || 495,
          surplusNgoContact: ngoContactInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setWasteSuccessMsg(
          `Waste logged! Leftovers: ${data.totalLeftoverCookedKg} kg | Plate Return: ${data.totalPlateWasteKg} kg`
        );
        if (data.surplusAvailable) {
          setSurplusNotice({
            kg: data.totalLeftoverCookedKg,
            message: data.surplusMessage,
          });
        } else {
          setSurplusNotice(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Forecast numbers
  const expectedPlates = forecast?.expectedPlates ?? (mealType === 'Snacks' ? 320 : 505);
  const p10Plates = forecast?.mlRange?.p10 ?? Math.round((expectedPlates * 0.94) / 10) * 10;
  const p90Plates = forecast?.mlRange?.p90 ?? Math.round((expectedPlates * 1.08) / 10) * 10;
  const rangeDisplay = `About ${p10Plates}–${p90Plates} plates`;
  const bookedCount = forecast?.bookedPlates ?? 0;
  const adoptionPct = forecast?.adoptionPct ?? 0;
  const confidenceLevel = forecast?.confidenceLevel ?? (bookedCount === 0 ? 'Low' : 'Moderate');
  const displayConfidence = confidenceLevel === 'Moderate' ? 'Medium' : confidenceLevel;

  const confidenceSentence =
    bookedCount === 0
      ? 'Low confidence: nobody has pre-booked yet, so this relies on past weeks.'
      : `${displayConfidence} confidence: ${
          forecast?.confidenceNote || 'Relying on past weeks and student booking trends.'
        }`;

  // Calculate total waste logged for the filling bin graphic
  const totalLeftoversKg = Object.values(dishLeftovers).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalCombinedWaste = totalLeftoversKg + (Number(plateWasteTotalKg) || 0);

  return (
    <div
      className="w-full max-w-[1280px] mx-auto px-6 lg:px-8 py-6 space-y-8 pb-24 text-[14px] text-ink font-body"
      id="kitchen-page"
    >
      {/* ── 1. PLAIN HEADER ── */}
      <header className="space-y-4">
        <div className="space-y-1">
          <div className="font-mono text-[14px] font-bold uppercase tracking-wider text-ink-muted">
            Kitchen — {activeMess.name || shortName}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase tracking-wide">
            Forecast
          </h1>
          <p className="font-serif text-[16px] text-ink-muted">
            Blended historical attendance, student bookings, and automated portion sizing.
          </p>
        </div>

        {/* Simple Underlined Tab Row */}
        <nav className="flex border-b-2 border-ink/20 gap-6 overflow-x-auto text-[14px] font-mono">
          {[
            { id: 'forecast', label: 'Forecast' },
            { id: 'waste', label: 'Waste log' },
            { id: 'reports', label: 'Reports' },
            { id: 'compare', label: 'Compare messes (19)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                playDhabaSound('press');
              }}
              className={`py-3.5 min-h-[48px] flex items-center font-bold uppercase transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-b-2 border-ink text-ink -mb-[2px]'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Date and Meal Pills in One Row */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[14px]">
          <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-ink rounded-lg bg-bg-raised">
            <Calendar className="w-4 h-4 text-ink-muted shrink-0" />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-transparent font-mono text-[14px] text-ink font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMealType(m);
                  playDhabaSound('press');
                }}
                className={`px-3 py-1.5 font-mono text-[14px] font-bold rounded-lg border-2 transition cursor-pointer ${
                  mealType === m
                    ? 'bg-ink text-bg border-ink'
                    : 'bg-bg-raised text-ink border-ink hover:bg-ink/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── 2. TAB 1: FORECAST ── */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* FORECAST HERO CARD */}
          <section className="bg-bg-raised border-2 border-ink rounded-xl p-6 sm:p-8 space-y-5">
            {/* Range & Tag row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-4xl sm:text-5xl font-black text-ink tracking-tight leading-none">
                  {rangeDisplay}
                </span>
                <span className="px-2.5 py-1 border-2 border-ink rounded font-mono text-[14px] font-bold text-ink">
                  {forecast?.isMlActive ? 'Using ML forecast' : 'Using baseline forecast'}
                </span>
              </div>

              {forecast?.dataMode === 'demo' && (
                <span className="px-2 py-0.5 border-2 border-ink rounded font-mono text-[14px] font-bold uppercase text-ink">
                  Simulated data
                </span>
              )}
            </div>

            {/* Point Estimate Smaller */}
            <div className="font-mono text-[15px] text-ink-muted font-bold">
              Point estimate: ~{expectedPlates} plates
            </div>

            {/* Confidence Sentence */}
            <p className="font-serif text-[16px] text-ink leading-relaxed">
              {confidenceSentence}
            </p>

            {/* Simple 3-Segment Bar (Low / Medium / High) */}
            <div className="space-y-1.5">
              <div className="font-mono text-[14px] font-bold text-ink uppercase tracking-wide">
                Confidence level
              </div>
              <div className="grid grid-cols-3 gap-2 max-w-sm">
                {(['Low', 'Medium', 'High'] as const).map((level) => {
                  const isCurrent =
                    (level === 'Low' && (confidenceLevel === 'Low' || bookedCount === 0)) ||
                    (level === 'Medium' && (confidenceLevel === 'Moderate' && bookedCount > 0)) ||
                    (level === 'High' && confidenceLevel === 'High');

                  return (
                    <div
                      key={level}
                      className={`py-2 px-3 border-2 border-ink rounded-lg text-center font-mono text-[14px] font-bold transition-colors ${
                        isCurrent
                          ? 'bg-ink text-bg'
                          : 'bg-transparent text-ink-muted border-ink/40'
                      }`}
                    >
                      {level}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two Stats at Full Contrast */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t-2 border-ink/20 font-mono text-[14px] font-bold text-ink">
              <div>
                Pre-booked: {bookedCount} ({adoptionPct}%)
              </div>
              <div>
                4-week average: {forecast?.historicalAvgPlates ?? (mealType === 'Snacks' ? 320 : 505)}
              </div>
            </div>

            {/* Baseline and Plan-share note under forecast */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-[14px] text-ink-muted">
              <div>
                Baseline:{' '}
                {forecast?.baselinePlates ??
                  forecast?.historicalAvgPlates ??
                  (mealType === 'Snacks' ? 320 : 505)}{' '}
                plates
              </div>
              <span>•</span>
              <div>
                {forecast?.planSplitLabel ||
                  `${mealType}: 62% of students on a plan with ${mealType.toLowerCase()} (assumption)`}
              </div>
            </div>
          </section>

          {/* ── 3. COLLAPSED "ADJUST FORECAST" PANEL (Single Saffron Action) ── */}
          <section className="bg-bg-raised border-2 border-ink rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setAdjustOpen(!adjustOpen)}
              className="flex items-center justify-between w-full p-4 font-mono text-[14px] font-bold text-ink hover:bg-ink/5 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-ink" />
                <span>Adjust forecast</span>
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${adjustOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {adjustOpen && (
              <div className="p-6 border-t-2 border-ink space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2 font-mono text-[14px] font-bold text-ink">
                    <label htmlFor="safety-buffer-input">
                      Safety buffer: {safetyBufferPct}%
                    </label>
                  </div>
                  <input
                    id="safety-buffer-input"
                    type="range"
                    min="0"
                    max="20"
                    value={safetyBufferPct}
                    onChange={(e) => setSafetyBufferPct(Number(e.target.value))}
                    className="w-full accent-saffron cursor-pointer"
                  />
                </div>

                <div>
                  <label
                    htmlFor="campus-event-input"
                    className="block font-mono text-[14px] font-bold text-ink mb-2"
                  >
                    Campus event
                  </label>
                  <select
                    id="campus-event-input"
                    value={eventAdjustmentPct}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEventAdjustmentPct(val);
                      setEventTitle(
                        val === -14
                          ? 'Exam Day'
                          : val === 20
                          ? 'College Fest'
                          : val === -25
                          ? 'Long Weekend'
                          : ''
                      );
                    }}
                    className="w-full bg-bg border-2 border-ink rounded-lg px-3 py-2 font-mono text-[14px] font-bold text-ink focus:outline-none cursor-pointer"
                  >
                    <option value={0}>Normal Day (0% adjustment)</option>
                    <option value={-14}>Exam Day (-14% attendance)</option>
                    <option value={20}>College Fest (+20% attendance)</option>
                    <option value={-25}>Long Weekend (-25% attendance)</option>
                  </select>
                </div>

                {/* THE ONLY SAFFRON BUTTON ON THE SCREEN */}
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="w-full py-3 px-4 bg-saffron text-ink border-2 border-ink rounded-lg font-mono text-[14px] font-bold uppercase hover:bg-saffron/90 transition cursor-pointer"
                >
                  {savingConfig ? 'Applying...' : 'Apply adjustment'}
                </button>

                {statusMessage && (
                  <div className="font-mono text-[14px] font-bold text-ink text-center">
                    {statusMessage}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── 4. COOKING QUANTITIES (Clean List, One Dish Per Row) ── */}
          <section className="bg-bg-raised border-2 border-ink rounded-xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink/20 pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-wide">
                Cooking quantities
              </h2>
              <span className="font-mono text-[14px] font-bold text-ink">
                {forecast?.dishes?.length ?? 0} dishes
              </span>
            </div>

            <div className="divide-y-2 divide-ink/15">
              {forecast?.dishes?.map((dish) => {
                const isOverridden = dishOverrides[dish.menuItemId] !== undefined;
                const displayKg = isOverridden
                  ? dishOverrides[dish.menuItemId]
                  : dish.suggestedCookKg;
                const minKg = Math.round(dish.baseKg);
                const maxKg = Math.round(dish.suggestedCookKg);
                const rangeKg = `${minKg}–${maxKg} kg`;
                const isExpanded = expandedOverrides[dish.menuItemId];
                const wastePct = dish.reductionPct > 0 ? dish.reductionPct : 6;
                const realStatus =
                  dish.reductionPct > 0
                    ? `Waste ${wastePct}%, reduction applied`
                    : `Waste ${wastePct}%, on target`;

                return (
                  <div key={dish.menuItemId} className="py-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Dish name, portion std & real status */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-display text-xl sm:text-2xl font-bold text-ink uppercase">
                            {dish.name}
                          </span>
                          <span className="px-2 py-0.5 border-2 border-ink rounded font-mono text-[14px] font-bold text-ink">
                            Waste {wastePct}%
                          </span>
                          <span className="font-mono text-[14px] font-medium text-ink-muted">
                            {realStatus}
                          </span>
                        </div>
                        <div className="font-mono text-[14px] text-ink-muted">
                          Portion: {Math.round(dish.avgConsumptionKg * 1000)}g / plate • Base:{' '}
                          {Math.round(dish.baseKg)} kg
                        </div>
                      </div>

                      {/* Right: Suggested quantity range & Override link */}
                      <div className="flex items-center gap-4 sm:text-right shrink-0">
                        <div>
                          <div className="font-mono text-[18px] sm:text-[20px] font-black text-ink">
                            {displayKg} kg
                          </div>
                          <div className="font-mono text-[14px] text-ink-muted">
                            Suggested: {rangeKg}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleOverride(dish.menuItemId)}
                          className="font-mono text-[14px] font-bold text-ink underline cursor-pointer hover:text-ink-muted"
                        >
                          {isExpanded ? 'Done' : 'Override'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Override Input */}
                    {isExpanded && (
                      <div className="p-4 border-2 border-ink rounded-lg bg-bg flex items-center gap-3 font-mono text-[14px]">
                        <label
                          htmlFor={`override-${dish.menuItemId}`}
                          className="font-bold text-ink"
                        >
                          Override quantity:
                        </label>
                        <input
                          id={`override-${dish.menuItemId}`}
                          type="number"
                          min="1"
                          max="500"
                          value={dishOverrides[dish.menuItemId] ?? dish.suggestedCookKg}
                          onChange={(e) =>
                            handleOverrideChange(dish.menuItemId, Number(e.target.value))
                          }
                          className="w-24 px-3 py-1 bg-bg-raised border-2 border-ink rounded font-bold text-ink focus:outline-none"
                        />
                        <span className="text-ink-muted">kg</span>
                        {isOverridden && (
                          <button
                            type="button"
                            onClick={() => resetOverride(dish.menuItemId)}
                            className="text-ink-muted underline hover:text-ink text-[14px] ml-2"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}

                    {/* Feedback-loop note: inline note under dish */}
                    {dish.feedbackNote && (
                      <div className="font-mono text-[14px] text-ink-muted">
                        ↳ Note: {dish.feedbackNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ── 5. TAB 2: WASTE LOG ── */}
      {activeTab === 'waste' && (
        <section className="bg-bg-raised border-2 border-ink rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-ink/20 pb-4 gap-4">
            <div>
              <div className="font-mono text-[14px] font-bold uppercase tracking-wider text-ink-muted">
                Waste logger
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-ink uppercase tracking-wide mt-1">
                Log leftovers &amp; plate return
              </h2>
              <p className="font-serif text-[15px] text-ink-muted">
                Tap weight buttons per dish. Single reading for return bins.
              </p>
            </div>

            <FillingWasteBin currentKg={totalCombinedWaste} />
          </div>

          {/* Dish-by-Dish Leftover Weights */}
          <div className="space-y-4">
            <label className="font-mono text-[14px] font-bold uppercase text-ink block">
              Untouched cooked leftover (tap weight to record)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {forecast?.dishes?.map((dish) => {
                const currentVal = dishLeftovers[dish.menuItemId] || 0;
                return (
                  <div
                    key={dish.menuItemId}
                    className="p-4 rounded-xl bg-bg border-2 border-ink flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-display text-lg font-bold text-ink truncate uppercase">
                        {dish.name}
                      </div>
                      <div className="font-mono text-[14px] font-bold text-ink">
                        {currentVal} kg leftover
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {[1, 2, 5, 10].map((kg) => (
                        <SteelWeightButton
                          key={kg}
                          kg={kg}
                          isSelected={currentVal === kg}
                          onClick={() => setDishKg(dish.menuItemId, kg)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plate Return Waste Single Scale Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t-2 border-ink/20">
            <div>
              <label className="font-mono text-[14px] font-bold uppercase text-ink block mb-2">
                Plate return bin total (kg)
              </label>
              <input
                type="number"
                value={plateWasteTotalKg}
                onChange={(e) => setPlateWasteTotalKg(Number(e.target.value))}
                placeholder="e.g. 28"
                className="w-full bg-bg border-2 border-ink rounded-lg px-4 py-2.5 text-xl font-mono font-bold text-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="font-mono text-[14px] font-bold uppercase text-ink block mb-2">
                Actual plates served (headcount)
              </label>
              <input
                type="number"
                value={actualPlates}
                onChange={(e) => setActualPlates(Number(e.target.value))}
                placeholder="e.g. 495"
                className="w-full bg-bg border-2 border-ink rounded-lg px-4 py-2.5 text-xl font-mono font-bold text-ink focus:outline-none"
              />
            </div>
          </div>

          {/* Surplus Alert Notice */}
          {surplusNotice && (
            <div className="p-4 rounded-xl border-2 border-ink bg-bg text-ink space-y-2">
              <div className="flex items-center gap-2 font-display text-lg uppercase font-bold text-ink">
                <HeartHandshake className="w-5 h-5 text-curry-leaf" />
                <span>Surplus food notice: {surplusNotice.kg} kg safe food</span>
              </div>
              <p className="font-serif text-[15px]">{surplusNotice.message}</p>
              <div>
                <label className="font-mono text-[14px] font-bold block mb-1">
                  Dispatch recipient / NGO:
                </label>
                <input
                  type="text"
                  value={ngoContactInput}
                  onChange={(e) => setNgoContactInput(e.target.value)}
                  className="w-full bg-bg-raised border-2 border-ink rounded-lg px-3 py-1.5 font-mono text-[14px] text-ink"
                />
              </div>
            </div>
          )}

          {/* Success message */}
          {wasteSuccessMsg && (
            <div className="p-3.5 rounded-xl border-2 border-ink bg-bg text-ink font-mono text-[14px] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-curry-leaf shrink-0" />
              <span>{wasteSuccessMsg}</span>
            </div>
          )}

          {/* Submit button is neutral ink style so Apply remains single saffron action */}
          <button
            type="button"
            className="w-full min-h-[48px] py-3.5 px-4 bg-ink text-bg border-2 border-ink rounded-lg font-mono text-[14px] font-bold uppercase hover:bg-ink/90 transition cursor-pointer flex items-center justify-center"
            onClick={handleSubmitWaste}
          >
            Submit waste log
          </button>
        </section>
      )}

      {/* ── 6. TAB 3: REPORTS & CSV EXPORT ── */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <section className="bg-bg-raised border-2 border-ink rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-ink/20">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-ink">
                  Waste &amp; attendance history
                </h2>
                <p className="font-serif text-[15px] text-ink-muted">
                  4-week historical records and dish-specific wastage percentage rankings.
                </p>
              </div>

              <a
                href={`/api/waste/export?messCode=${messCode}`}
                download
                className="px-4 py-2.5 bg-ink text-bg border-2 border-ink rounded-lg text-[14px] font-mono font-bold flex items-center gap-2 shrink-0 hover:bg-ink/90 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV report</span>
              </a>
            </div>

            {/* Attendance Chart */}
            <div className="space-y-2">
              <h3 className="font-display text-xl uppercase font-bold text-ink">
                Predicted vs actual attendance (last 7 days)
              </h3>
              <AttendanceChart data={reportsData?.predictedVsActual} />
            </div>

            {/* Ranking of Most Wasted Dishes */}
            <div className="space-y-3 pt-4 border-t-2 border-ink/20">
              <div className="flex items-center justify-between">
                <span className="font-display text-xl uppercase font-bold text-ink">
                  Wasted dishes ranking
                </span>
                <span className="font-mono text-[14px] text-ink-muted">
                  Waste % of prepared
                </span>
              </div>

              <div className="space-y-2">
                {reportsData?.ranking?.map((item: any, idx: number) => {
                  const isHigh = item.wastePct > 12;
                  return (
                    <div
                      key={item.dishName}
                      className="p-3 rounded-lg bg-bg border-2 border-ink flex items-center justify-between gap-3 text-[14px] font-mono font-bold"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-ink-muted">#{idx + 1}</span>
                        <span className="text-ink uppercase">{item.dishName}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-28 sm:w-44 bg-bg-raised h-3 border border-ink rounded overflow-hidden">
                          <div
                            className={`h-full ${
                              isHigh ? 'bg-chilli' : 'bg-curry-leaf'
                            }`}
                            style={{ width: `${Math.min(100, item.wastePct * 3.5)}%` }}
                          />
                        </div>
                        <span
                          className={`min-w-[48px] text-right ${
                            isHigh ? 'text-chilli' : 'text-ink'
                          }`}
                        >
                          {item.wastePct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── 7. TAB 4: COMPARE MESSES ── */}
      {activeTab === 'compare' && <CompareMessesTable />}
    </div>
  );
}
