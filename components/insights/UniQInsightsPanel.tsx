'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Check,
  Clock,
  X,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import { SuggestionItem } from '@/lib/suggestions';

interface UniQInsightsPanelProps {
  target: 'KITCHEN' | 'STAFF' | 'ADMIN' | 'STUDENT';
  messCode?: string;
  dateStr?: string;
  mealType?: string;
  className?: string;
}

export function UniQInsightsPanel({
  target,
  messCode,
  dateStr,
  mealType,
  className = '',
}: UniQInsightsPanelProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionStates, setActionStates] = useState<Record<string, 'ACCEPTED' | 'DISMISSED' | 'SNOOZED'>>({});

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        target,
        ...(messCode ? { messCode } : {}),
        ...(dateStr ? { date: dateStr } : {}),
        ...(mealType ? { mealType } : {}),
      });

      const res = await fetch(`/api/suggestions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.error('Failed to load suggestions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [target, messCode, dateStr, mealType]);

  const handleAction = async (item: SuggestionItem, action: 'ACCEPTED' | 'DISMISSED' | 'SNOOZED') => {
    playDhabaSound(action === 'ACCEPTED' ? 'stamp' : 'press');
    setActionStates((prev) => ({ ...prev, [item.key]: action }));

    try {
      await fetch('/api/suggestions/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: item.target,
          messCode: item.messCode,
          suggestionKey: item.key,
          recommendation: item.recommendation,
          evidence: item.evidence,
          impactExpected: item.impactRange,
          confidence: item.confidence,
          action,
        }),
      });

      setTimeout(() => {
        setSuggestions((prev) => prev.filter((s) => s.key !== item.key));
      }, 1400);
    } catch (e) {
      console.error('Failed to record suggestion feedback:', e);
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <div className={`p-5 rounded-2xl bg-[#FAF5E8] dark:bg-[#221D18] border-2 border-ink shadow-offset-sm ${className}`}>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink-muted animate-pulse">
          <Lightbulb className="w-4 h-4 text-saffron" />
          <span>Generating operational counter suggestions...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`} id={`uniq-insights-${target.toLowerCase()}`}>
      {/* ── SECTION HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-ink/20 pb-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-saffron border-2 border-ink flex items-center justify-center text-[#14110F] shadow-offset-xs shrink-0">
            <Lightbulb className="w-4 h-4 fill-current" />
          </span>
          <div>
            <div className="font-mono text-sm font-black uppercase tracking-widest text-ink">
              COUNTER SUGGESTIONS
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-wide leading-none">
              UNIQ INSIGHTS
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-saffron/20 text-ink border border-ink/40 px-2 py-0.5 rounded font-black uppercase">
            SIMULATED DATA
          </span>
        </div>
      </div>

      {/* ── CARDS: Maximum 2 per row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <AnimatePresence>
          {suggestions.map((item) => {
            const currentAction = actionStates[item.key];

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FAF5E8] dark:bg-[#221D18] border-2 border-ink rounded-2xl p-4 sm:p-5 shadow-offset-md flex flex-col justify-between h-full relative overflow-hidden"
              >
                {currentAction ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#2F6B3A] border-2 border-ink text-white flex items-center justify-center font-bold">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="font-display text-2xl font-black text-ink uppercase">
                      {currentAction === 'ACCEPTED'
                        ? 'SUGGESTION ACCEPTED'
                        : currentAction === 'SNOOZED'
                        ? 'SNOOZED FOR 6 HOURS'
                        : 'SUGGESTION DISMISSED'}
                    </div>
                    <p className="font-mono text-xs text-ink-muted">
                      Feedback logged. Counter baseline updated.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between h-full space-y-4">
                    {/* Top block */}
                    <div className="space-y-2">
                      {/* Eyebrow & Confidence badge */}
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-black text-ink uppercase tracking-wider text-xs">
                          {item.target} ADVISORY
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border border-ink ${
                            item.confidence === 'High'
                              ? 'bg-[#2F6B3A]/20 text-[#2F6B3A] dark:text-[#58B971]'
                              : item.confidence === 'Medium'
                              ? 'bg-saffron/20 text-ink'
                              : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          }`}
                        >
                          {item.confidence} CONFIDENCE
                        </span>
                      </div>

                      {/* Advisory Headline in Bebas Neue */}
                      <div className="font-display text-2xl sm:text-3xl text-ink font-black uppercase leading-tight tracking-wide">
                        {item.recommendation}
                      </div>
                    </div>

                    {/* Middle block: Aligned Evidence and Aligned Impact */}
                    <div className="space-y-3 flex-1 flex flex-col justify-end">
                      {/* Evidence & Reasoning Block */}
                      <div className="p-3 bg-[#F4ECD8] dark:bg-[#1A1613] border border-ink/20 dark:border-ink/30 rounded-xl space-y-1 min-h-[76px] flex flex-col justify-center">
                        <div className="font-mono text-[10px] font-black uppercase text-ink-muted flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-saffron shrink-0" />
                          <span>EVIDENCE &amp; REASONING</span>
                        </div>
                        <p className="font-serif text-xs text-ink leading-relaxed">
                          {item.evidence}
                        </p>
                      </div>

                      {/* Expected Impact Block (text wraps cleanly instead of running off edge) */}
                      <div className="p-2.5 bg-saffron/15 border-2 border-ink rounded-xl font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-ink-muted text-[11px] uppercase shrink-0">
                          EXPECTED IMPACT:
                        </span>
                        <span className="font-black text-ink text-left sm:text-right break-words text-wrap">
                          {item.impactRange}
                        </span>
                      </div>

                      {/* Food Safety Notice if present */}
                      {item.foodSafetyNotice && (
                        <div className="flex items-start gap-2 p-2 bg-[#D7312B]/10 border border-[#D7312B]/40 rounded-lg text-xs font-mono text-[#D7312B]">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#D7312B]" />
                          <span>{item.foodSafetyNotice}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons (Never clipped) */}
                    <div className="pt-3 border-t-2 border-dashed border-ink/20 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(item, 'DISMISSED')}
                        className="px-3 py-1.5 rounded-lg border-2 border-ink bg-[#FAF5E8] dark:bg-[#221D18] hover:bg-[#EAE1CA] dark:hover:bg-[#2E2822] text-ink font-mono text-xs font-bold uppercase transition flex items-center gap-1 shadow-offset-xs active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(item, 'SNOOZED')}
                        className="px-3 py-1.5 rounded-lg border-2 border-ink bg-[#FAF5E8] dark:bg-[#221D18] hover:bg-[#EAE1CA] dark:hover:bg-[#2E2822] text-ink font-mono text-xs font-bold uppercase transition flex items-center gap-1 shadow-offset-xs active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Snooze</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(item, 'ACCEPTED')}
                        className="px-3.5 py-1.5 rounded-lg border-2 border-ink bg-saffron hover:bg-[#E07D10] text-[#14110F] font-mono text-xs font-black uppercase transition flex items-center gap-1 shadow-offset-xs active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default UniQInsightsPanel;
