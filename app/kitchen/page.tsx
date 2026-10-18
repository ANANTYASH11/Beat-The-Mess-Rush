'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Download,
  CheckCircle2,
  HeartHandshake,
  TrendingDown,
  Calendar,
  Utensils,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { useForecast } from '@/hooks/useForecast';
import { TactileButton } from '@/components/ui/TactileButton';
import { StampBadge } from '@/components/ui/StampBadge';
import { StickyNote } from '@/components/ui/StickyNote';
import { KitchenScaleDial } from '@/components/ui/KitchenScaleDial';
import { SteelWeightButton } from '@/components/ui/SteelWeightButton';
import { FillingWasteBin } from '@/components/ui/FillingWasteBin';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import AttendanceChart from '@/components/AttendanceChart';
import { university } from '@/config/university';
import { CompareMessesTable } from '@/components/mess/CompareMessesTable';
import { UniQInsightsPanel } from '@/components/insights/UniQInsightsPanel';

export default function KitchenPage() {
  const [activeTab, setActiveTab] = useState<'forecast' | 'waste' | 'reports' | 'compare'>('forecast');
  const [messCode, setMessCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('uniq_selected_mess') || university.messes[0].id;
    }
    return university.messes[0].id;
  });
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('Lunch');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Hook for blended forecast
  const { forecast, isLoading, refreshForecast } = useForecast(messCode, dateStr, mealType);

  // Configuration state
  const [eventTitle, setEventTitle] = useState('');
  const [eventAdjustmentPct, setEventAdjustmentPct] = useState(0);
  const [safetyBufferPct, setSafetyBufferPct] = useState(8);
  const [savingConfig, setSavingConfig] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showDrivers, setShowDrivers] = useState(false);

  // 30-Second Waste Logger state
  const [dishLeftovers, setDishLeftovers] = useState<Record<string, number>>({});
  const [plateWasteTotalKg, setPlateWasteTotalKg] = useState(28);
  const [actualPlates, setActualPlates] = useState(Math.round((university.messes[0].seats || 350) * 1.15));
  const [wasteSuccessMsg, setWasteSuccessMsg] = useState('');
  const [surplusNotice, setSurplusNotice] = useState<{ kg: number; message: string } | null>(null);
  const [ngoContactInput, setNgoContactInput] = useState(university.ngoContact);

  // Reports state
  const [reportsData, setReportsData] = useState<any>(null);

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
        setStatusMessage('Configuration saved. Quantities recalculated.');
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

  const confidenceScore =
    forecast?.confidenceLevel === 'High'
      ? 90
      : forecast?.confidenceLevel === 'Moderate'
      ? 65
      : 35;

  // Calculate total waste logged for the filling bin graphic
  const totalLeftoversKg = Object.values(dishLeftovers).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalCombinedWaste = totalLeftoversKg + (Number(plateWasteTotalKg) || 0);

  return (
    <div className="w-full space-y-7 pb-16" id="kitchen-chalkboard-page">
      {/* 1. KITCHEN BOARD HEADER & PAPER ORDER SLIP TABS */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 sm:p-7 shadow-brutal-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded">
                UniQ KITCHEN HEADQUARTERS
              </span>
              <span className="font-serif italic text-xs text-[#5C554F]">
                रसोई उत्पादन एवं अपशिष्ट
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-[#14110F] uppercase tracking-wide">
              CHALKBOARD MENU &amp; FORECAST
            </h1>
            <p className="font-serif text-sm text-[#5C554F]">
              Blended historical attendance, student bookings and automated portion right-sizing.
            </p>
          </div>

          {/* Subtab Switcher Styled as Paper Order Slips */}
          <div className="flex bg-[#E8DFC7] p-1.5 rounded-xl border-2 border-[#14110F] gap-1 self-stretch md:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('forecast');
                playDhabaSound('press');
              }}
              className={`px-4 py-2 font-display text-base tracking-wider uppercase rounded-lg border-2 transition-all ${
                activeTab === 'forecast'
                  ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs -translate-y-0.5'
                  : 'bg-transparent text-[#5C554F] border-transparent hover:text-[#14110F]'
              }`}
            >
              CHALKBOARD FORECAST
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('waste');
                playDhabaSound('press');
              }}
              className={`px-4 py-2 font-display text-base tracking-wider uppercase rounded-lg border-2 transition-all ${
                activeTab === 'waste'
                  ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs -translate-y-0.5'
                  : 'bg-transparent text-[#5C554F] border-transparent hover:text-[#14110F]'
              }`}
            >
              30S WASTE LOG
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('reports');
                playDhabaSound('press');
              }}
              className={`px-4 py-2 font-display text-base tracking-wider uppercase rounded-lg border-2 transition-all ${
                activeTab === 'reports'
                  ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs -translate-y-0.5'
                  : 'bg-transparent text-[#5C554F] border-transparent hover:text-[#14110F]'
              }`}
            >
              CSV REPORTS
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('compare');
                playDhabaSound('press');
              }}
              className={`px-4 py-2 font-display text-base tracking-wider uppercase rounded-lg border-2 transition-all ${
                activeTab === 'compare'
                  ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs -translate-y-0.5'
                  : 'bg-transparent text-[#5C554F] border-transparent hover:text-[#14110F]'
              }`}
            >
              COMPARE MESSES (19)
            </button>
          </div>
        </div>

        {/* Date & Meal Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t-2 border-[#14110F]/15 font-mono text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#FAF5E8] border-2 border-[#14110F] px-2.5 py-1 rounded-lg">
              <Calendar className="w-4 h-4 text-[#F28C1B]" />
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="bg-transparent font-mono text-xs text-[#14110F] font-bold focus:outline-none"
              />
            </div>

            <div className="flex gap-1 flex-wrap">
              {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMealType(m);
                    playDhabaSound('press');
                  }}
                  className={`px-3 py-1 font-display tracking-wider text-sm uppercase rounded border-2 border-[#14110F] transition ${
                    mealType === m
                      ? 'bg-[#F28C1B] text-[#14110F] font-bold shadow-brutal-xs'
                      : 'bg-[#F4ECD8] text-[#5C554F]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="font-mono text-xs font-bold text-[#5C554F]">
              BASELINE: {forecast?.historicalAvgPlates ?? (mealType === 'Snacks' ? 320 : 505)} PLATES
            </div>
            <span className="font-mono text-[11px] bg-saffron/20 border border-[#14110F]/40 text-[#14110F] px-2.5 py-0.5 rounded font-bold">
              {forecast?.planSplitLabel || `${mealType}: 62% of students on a plan with ${mealType.toLowerCase()} (assumption)`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TAB 1: CHALKBOARD MENU ON THE WALL + PAPER ORDER SLIP */}
      {activeTab === 'forecast' && (
        <div className="space-y-7">
          {/* Top Row: Paper Order Slip + Kitchen-Scale Dial + Modifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Paper Order Slip for Headcount */}
            <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md relative rotate-[-0.5deg]">
              <div className="perforated-strip -mt-3 mb-3" />
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-[10px] font-black uppercase text-[#5C554F] tracking-widest">
                  KITCHEN PRODUCTION SLIP
                </div>
                {forecast?.isMlActive ? (
                  <span className="font-mono text-[9px] bg-[#F28C1B]/20 text-[#14110F] border border-[#14110F]/30 px-2 py-0.5 rounded font-black uppercase">
                    ML 10th–90th Range
                  </span>
                ) : (
                  <span className="font-mono text-[9px] bg-[#FAF5E8] text-[#5C554F] border border-[#14110F]/20 px-2 py-0.5 rounded font-bold">
                    Using baseline forecast
                  </span>
                )}
              </div>

              {forecast?.mlRange ? (
                <div className="my-2 space-y-1">
                  <div className="font-display text-4xl sm:text-5xl font-black text-[#F28C1B] leading-none">
                    {forecast.mlRange.label}
                  </div>
                  <div className="font-mono text-xs text-[#5C554F] font-bold">
                    Point Estimate: ~{forecast.expectedPlates} plates
                  </div>
                  <div className="font-mono text-[11px] text-[#78716C] border-b border-[#14110F]/15 pb-2">
                    Baseline: {forecast.baselinePlates ?? forecast.historicalAvgPlates} plates (TypeScript fallback)
                  </div>
                </div>
              ) : (
                <div className="font-display text-5xl sm:text-6xl font-black text-[#F28C1B] leading-none my-2">
                  {forecast?.expectedPlates ?? 495}
                </div>
              )}

              <div className="font-display text-lg text-[#14110F] uppercase flex items-center justify-between mt-2">
                <span>TARGET PLATES FOR {mealType}</span>
                {forecast?.mlTopDrivers && forecast.mlTopDrivers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowDrivers(!showDrivers)}
                    className="font-mono text-xs lowercase text-[#5C554F] hover:text-[#F28C1B] underline font-bold"
                  >
                    {showDrivers ? 'hide why' : 'why?'}
                  </button>
                )}
              </div>

              {/* Drivers Popover / Panel */}
              {showDrivers && forecast?.mlTopDrivers && (
                <div className="mt-3 p-3 bg-[#14110F] text-[#FAF5E8] rounded-xl border border-[#14110F] space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[10px] text-[#A39B8F] uppercase tracking-wider font-bold">
                    <span>Top Model Drivers</span>
                    <span>Importance</span>
                  </div>
                  {forecast.mlTopDrivers.slice(0, 3).map((driver, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>• {driver.label}</span>
                        <span className="text-[#F28C1B] font-bold">{driver.weight}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#F28C1B]"
                          style={{
                            width: `${Math.min(100, Math.max(15, (driver.weight / (forecast.mlTopDrivers?.[0]?.weight || 500)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#14110F] flex items-center justify-between font-mono text-xs">
                <span>PRE-BOOKED: {forecast?.bookedPlates ?? 185}</span>
                <span className="font-bold text-[#2F6B3A]">
                  {forecast?.adoptionPct ?? 38}% ADOPTION
                </span>
              </div>
            </div>

            {/* Kitchen-Scale Dial for Confidence */}
            <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#5C554F] mb-1">
                KITCHEN SCALE CONFIDENCE
              </span>
              <KitchenScaleDial
                score={confidenceScore}
                label={`${forecast?.confidenceLevel ?? 'Moderate'} Confidence`}
                sublabel={forecast?.confidenceNote ?? 'Relying on 4-week weekday history.'}
              />
            </div>

            {/* Production Modifiers */}
            <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-3">
              <div className="flex items-center justify-between font-mono text-xs font-black uppercase text-[#14110F]">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#F28C1B]" />
                  <span>PRODUCTION MODIFIERS</span>
                </span>
                {statusMessage && (
                  <span className="text-[10px] text-[#2F6B3A] font-bold">SAVED!</span>
                )}
              </div>

              {/* Safety buffer */}
              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1">
                  <span>SAFETY BUFFER:</span>
                  <span className="text-[#F28C1B]">{safetyBufferPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={safetyBufferPct}
                  onChange={(e) => setSafetyBufferPct(Number(e.target.value))}
                  className="w-full accent-[#14110F] cursor-pointer"
                />
              </div>

              {/* Event dropdown */}
              <div>
                <label className="text-xs font-mono font-bold block mb-1">CAMPUS EVENT:</label>
                <select
                  value={eventAdjustmentPct}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEventAdjustmentPct(val);
                    setEventTitle(val === -14 ? 'Exam Day' : val === 20 ? 'College Fest' : '');
                  }}
                  className="w-full bg-[#F4ECD8] border-2 border-[#14110F] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#14110F] focus:outline-none"
                >
                  <option value={0}>Normal Day (0% adjustment)</option>
                  <option value={-14}>Exam Day (-14% attendance)</option>
                  <option value={20}>College Fest (+20% attendance)</option>
                  <option value={-25}>Long Weekend (-25% attendance)</option>
                </select>
              </div>

              <TactileButton
                variant="saffron"
                size="sm"
                className="w-full text-xs font-mono"
                onClick={handleSaveConfig}
                disabled={savingConfig}
              >
                APPLY &amp; RECALCULATE
              </TactileButton>
            </div>
          </div>

          {/* UniQ Insights: Kitchen Batching & Waste Suggestions */}
          <UniQInsightsPanel
            target="KITCHEN"
            messCode={messCode}
            dateStr={dateStr}
            mealType={mealType}
            className="my-1"
          />

          {/* Wall Chalkboard Menu Board for Dishes */}
          <div className="chalkboard-panel p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Chalkboard Wooden Frame Top Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#544E48] pb-4 gap-2">
              <div>
                <div className="font-mono text-xs text-[#F2B705] uppercase tracking-widest font-black">
                  MENU-BOARD ENTRIES • WALL CHALKBOARD
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-[#FAF5E8] uppercase tracking-wider">
                  TODAY&#39;S COOKING QUANTITIES
                </h2>
              </div>
              <StampBadge text="RIGHT-SIZED" color="curry" />
            </div>

            {/* Chalkboard Dish Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {forecast?.dishes?.map((dish) => {
                return (
                  <div
                    key={dish.menuItemId}
                    className="p-5 border-2 border-[#544E48] rounded-xl bg-[#141817] relative flex flex-col justify-between shadow-inner"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-2xl text-[#FAF5E8] uppercase tracking-wide">
                            {dish.name}
                          </h3>
                          <div className="font-mono text-xs text-[#A39B8F] mt-0.5">
                            Portion std: {Math.round(dish.avgConsumptionKg * 1000)}g / plate • Base: {Math.round(dish.baseKg)} kg
                          </div>
                        </div>

                        {/* Recommended Quantity in Chalk with Animated Underline */}
                        <div className="text-right shrink-0">
                          <div
                            className="font-display text-4xl text-[#F2B705] tracking-wider leading-none"
                            style={{ textShadow: '0 0 2px rgba(242,183,5,0.4)' }}
                          >
                            {dish.suggestedCookKg} KG
                          </div>
                          {/* Animated Chalk Underline */}
                          <div className="h-1 bg-[#F2B705] rounded-full w-full mt-1 animate-pulse" />
                          <div className="font-mono text-[10px] text-[#A39B8F] mt-0.5">
                            +{(dish.suggestedCookKg - dish.baseKg).toFixed(1)}kg buffer
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feedback-loop note as a Sticky Note stuck on dish */}
                    {dish.feedbackNote && (
                      <div className="mt-4 pt-3 border-t border-dashed border-[#544E48] flex justify-end">
                        <StickyNote
                          text={dish.feedbackNote}
                          subtext="Automated recipe feedback loop"
                          color="yellow"
                          rotate={-2}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: UNDER-30S WASTE LOGGER WITH STEEL WEIGHTS & VISIBLE FILLING BIN */}
      {activeTab === 'waste' && (
        <div className="space-y-6">
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#14110F]/15 pb-4 gap-2">
              <div>
                <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-[#2F6B3A] text-[#FAF5E8] px-2.5 py-0.5 rounded">
                  UNDER 30-SECOND FLOW
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-[#14110F] uppercase tracking-wide mt-1">
                  LOG UNTOUCHED LEFTOVERS &amp; PLATE RETURN
                </h2>
                <p className="font-serif text-xs text-[#5C554F]">
                  Tap iron weight buttons per dish. Single gross scale reading for return bins.
                </p>
              </div>

              {/* Graphic Filling Waste Bin */}
              <FillingWasteBin currentKg={totalCombinedWaste} />
            </div>

            {/* Dish-by-Dish Leftover Weights */}
            <div className="space-y-4">
              <label className="font-mono text-xs font-black uppercase text-[#14110F] block">
                UNTOUCHED COOKED LEFTOVER (TAP WEIGHT TO RECORD)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {forecast?.dishes?.map((dish) => {
                  const currentVal = dishLeftovers[dish.menuItemId] || 0;
                  return (
                    <div
                      key={dish.menuItemId}
                      className="p-4 rounded-xl bg-[#FAF5E8] border-2 border-[#14110F] shadow-brutal-sm flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-display text-lg font-bold text-[#14110F] truncate uppercase">
                          {dish.name}
                        </div>
                        <div className="font-mono text-sm font-black text-[#D7312B]">
                          {currentVal} KG LEFTOVER
                        </div>
                      </div>

                      {/* Tactile Steel Weight Buttons (1, 2, 5, 10 kg) */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t-2 border-[#14110F]/15">
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#14110F] block mb-1">
                  PLATE RETURN BIN TOTAL (KG)
                </label>
                <input
                  type="number"
                  value={plateWasteTotalKg}
                  onChange={(e) => setPlateWasteTotalKg(Number(e.target.value))}
                  placeholder="e.g. 28"
                  className="w-full bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-xl px-4 py-2.5 text-2xl font-mono font-black text-[#14110F] focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
                />
              </div>

              <div>
                <label className="font-mono text-xs font-black uppercase text-[#14110F] block mb-1">
                  ACTUAL PLATES SERVED (HEADCOUNT)
                </label>
                <input
                  type="number"
                  value={actualPlates}
                  onChange={(e) => setActualPlates(Number(e.target.value))}
                  placeholder="e.g. 495"
                  className="w-full bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-xl px-4 py-2.5 text-2xl font-mono font-black text-[#14110F] focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
                />
              </div>
            </div>

            {/* Surplus Alert Notice if untouched food > 10kg */}
            {surplusNotice && (
              <div className="p-4 rounded-xl bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] text-[#14110F] space-y-2">
                <div className="flex items-center gap-2 text-[#2F6B3A] font-display text-lg uppercase font-bold">
                  <HeartHandshake className="w-5 h-5" />
                  <span>SURPLUS FOOD NOTICE: {surplusNotice.kg} KG SAFE FOOD</span>
                </div>
                <p className="font-serif text-xs">{surplusNotice.message}</p>
                <div>
                  <label className="font-mono text-[10px] font-bold block mb-1">
                    DISPATCH RECIPIENT / NGO:
                  </label>
                  <input
                    type="text"
                    value={ngoContactInput}
                    onChange={(e) => setNgoContactInput(e.target.value)}
                    className="w-full bg-[#FAF5E8] border-2 border-[#14110F] rounded-lg px-3 py-1.5 font-mono text-xs text-[#14110F]"
                  />
                </div>
              </div>
            )}

            {/* Success message */}
            {wasteSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] text-[#2F6B3A] font-mono text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{wasteSuccessMsg}</span>
              </div>
            )}

            <TactileButton
              variant="saffron"
              size="lg"
              className="w-full text-xl py-4 shadow-brutal-lg"
              onClick={handleSubmitWaste}
            >
              SUBMIT 30-SEC WASTE LOG
            </TactileButton>
          </div>
        </div>
      )}

      {/* 4. TAB 3: REPORTS & CSV EXPORT */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-black uppercase text-[#14110F]">
                EMPIRICAL WASTE &amp; ATTENDANCE LOG
              </h2>
              <p className="font-serif text-xs text-[#5C554F]">
                4-week historical records and dish-specific wastage percentage rankings.
              </p>
            </div>

            <a
              href={`/api/waste/export?messCode=${messCode}`}
              download
              className="dhaba-btn px-4 py-2 bg-[#14110F] text-[#FAF5E8] hover:bg-[#2A2521] text-xs font-mono font-bold flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4 text-[#F28C1B]" />
              <span>EXPORT CSV REPORT</span>
            </a>
          </div>

          {/* Attendance Chart */}
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md">
            <h3 className="font-display text-xl uppercase font-bold text-[#14110F] mb-1">
              PREDICTED VS ACTUAL ATTENDANCE (LAST 7 DAYS)
            </h3>
            <AttendanceChart data={reportsData?.predictedVsActual} />
          </div>

          {/* Ranking of Most Wasted Dishes */}
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#14110F]/15 pb-2">
              <span className="font-display text-xl uppercase font-bold text-[#14110F]">
                DISHES STUDENTS WASTE MOST (EMPIRICAL RANKING)
              </span>
              <span className="font-mono text-xs text-[#5C554F]">
                WASTE % OF PREPARED
              </span>
            </div>

            <div className="space-y-2">
              {reportsData?.ranking?.map((item: any, idx: number) => {
                const isHigh = item.wastePct > 12;
                return (
                  <div
                    key={item.dishName}
                    className="p-3 rounded-xl bg-[#F4ECD8] border-2 border-[#14110F] flex items-center justify-between gap-3 text-xs font-mono font-bold"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-[#5C554F]">#{idx + 1}</span>
                      <span className="text-[#14110F] uppercase">{item.dishName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-28 sm:w-44 bg-[#E8DFC7] h-3 border border-[#14110F] rounded overflow-hidden">
                        <div
                          className={`h-full ${
                            isHigh ? 'bg-[#D7312B]' : 'bg-[#F28C1B]'
                          }`}
                          style={{ width: `${Math.min(100, item.wastePct * 3.5)}%` }}
                        />
                      </div>
                      <span
                        className={`min-w-[48px] text-right ${
                          isHigh ? 'text-[#D7312B]' : 'text-[#14110F]'
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
        </div>
      )}

      {/* 4. TAB 4: COMPARE MESSES (19 MESSES PLATFORM TABLE) */}
      {activeTab === 'compare' && <CompareMessesTable />}
    </div>
  );
}
