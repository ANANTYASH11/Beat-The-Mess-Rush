'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Check, X, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';
import { SuggestionItem } from '@/lib/suggestions';

export interface UniQInsightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  target?: 'KITCHEN' | 'STAFF' | 'ADMIN' | 'STUDENT';
  messCode?: string;
  onCountChange?: (count: number) => void;
}

export function UniQInsightsDrawer({
  isOpen,
  onClose,
  target = 'STAFF',
  messCode,
  onCountChange,
}: UniQInsightsDrawerProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionStates, setActionStates] = useState<Record<string, 'ACCEPTED' | 'DISMISSED'>>({});
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        target,
        ...(messCode ? { messCode } : {}),
      });

      const res = await fetch(`/api/suggestions?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.suggestions || [];
        setSuggestions(list);
        if (onCountChange) onCountChange(list.length);
      }
    } catch (e) {
      console.error('Failed to load suggestions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [target, messCode]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAction = async (item: SuggestionItem, action: 'ACCEPTED' | 'DISMISSED') => {
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
        setSuggestions((prev) => {
          const updated = prev.filter((s) => s.key !== item.key);
          if (onCountChange) onCountChange(updated.length);
          return updated;
        });
      }, 500);
    } catch (e) {
      console.error('Failed to send feedback:', e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md h-full bg-[#FAF5E8] dark:bg-[#1E1A17] border-l-2 border-ink shadow-2xl z-10 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b-2 border-ink flex items-center justify-between">
              <div>
                <h3 className="font-display text-[24px] font-black uppercase text-ink leading-none">
                  UNIQ INSIGHTS
                </h3>
                <span className="font-mono text-[14px] text-ink-muted">
                  {suggestions.length} operational suggestion{suggestions.length === 1 ? '' : 's'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 border-2 border-ink rounded-lg flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-colors"
                aria-label="Close insights drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading && suggestions.length === 0 ? (
                <div className="py-12 text-center font-mono text-[14px] text-ink-muted">
                  Loading suggestions...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="font-display text-[24px] text-ink">ALL CLEAR</div>
                  <p className="font-serif text-[18px] text-ink-muted">
                    No active suggestions for this mess counter right now.
                  </p>
                </div>
              ) : (
                suggestions.map((item) => {
                  const isExpanded = !!expandedKeys[item.key];
                  const state = actionStates[item.key];

                  return (
                    <div
                      key={item.key}
                      className="p-6 bg-white dark:bg-[#14110F] border-2 border-ink rounded-xl space-y-3"
                    >
                      {state ? (
                        <div className="py-4 text-center font-mono text-[14px] font-bold text-ink">
                          {state === 'ACCEPTED' ? '✓ Accepted' : '✕ Dismissed'}
                        </div>
                      ) : (
                        <>
                          {/* Eyebrow & Confidence tag */}
                          <div className="flex items-center justify-between font-mono text-[14px]">
                            <span className="font-bold uppercase text-ink">
                              {item.target}
                            </span>
                            <span className="px-2 py-0.5 border-2 border-ink rounded font-bold uppercase text-ink">
                              {item.confidence} Confidence
                            </span>
                          </div>

                          {/* Recommendation: One clean line */}
                          <div className="font-serif text-[18px] text-ink leading-snug">
                            {item.recommendation}
                          </div>

                          {/* "Why" expander button */}
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleExpand(item.key)}
                              className="font-mono text-[14px] font-bold text-saffron underline hover:text-ink flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Hide why' : 'Why? (evidence)'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Hidden Evidence and Expected Impact */}
                          {isExpanded && (
                            <div className="space-y-2 pt-2 border-t-2 border-ink/20">
                              <p className="font-serif text-[18px] text-ink-muted leading-relaxed">
                                {item.evidence}
                              </p>
                              {item.impactRange && (
                                <div className="font-mono text-[14px] font-bold text-ink">
                                  Expected impact: {item.impactRange}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Accept / Dismiss Buttons (>= 56px height) */}
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleAction(item, 'ACCEPTED')}
                              className="flex-1 min-h-[56px] px-4 bg-saffron text-ink border-2 border-ink rounded-lg font-mono text-[14px] font-black uppercase hover:bg-saffron/90 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(item, 'DISMISSED')}
                              className="min-h-[56px] px-4 border-2 border-ink rounded-lg font-mono text-[14px] font-bold text-ink hover:bg-ink/10 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-ink text-center">
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-[14px] text-ink-muted hover:text-ink underline"
              >
                Close Drawer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function UniQInsightsPanel(props: any) {
  // Legacy compatibility wrapper if needed on other pages
  return null;
}

export default UniQInsightsDrawer;
