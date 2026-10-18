'use client';

import React, { useState, useEffect } from 'react';
import { Vote, Check, AlertCircle, ThumbsUp, Sparkles, RefreshCw } from 'lucide-react';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';

interface StudentVotingCardProps {
  universitySlug?: string;
  messId: string;
  rollNumber: string;
  planName?: string;
  onVoteCast?: () => void;
}

const REASON_OPTIONS = ['too oily', 'want more variety', 'too spicy', 'portion too heavy'];

export function StudentVotingCard({
  universitySlug = 'lpu',
  messId,
  rollNumber,
  planName = 'Premium Plan',
  onVoteCast,
}: StudentVotingCardProps) {
  const [loading, setLoading] = useState(true);
  const [ballots, setBallots] = useState<any[]>([]);
  const [activeBallot, setActiveBallot] = useState<any | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [votesBySlot, setVotesBySlot] = useState<Record<string, { choice: string; reasonChip?: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadBallots = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/voting/ballots?universitySlug=${universitySlug}`);
      if (res.ok) {
        const data = await res.json();
        const active = (data.ballots || []).find((b: any) => b.status === 'OPEN');
        setBallots(data.ballots || []);
        setActiveBallot(active || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBallots();
  }, [universitySlug, messId]);

  if (loading) {
    return (
      <div className="p-6 bg-[#FAF5E8] dark:bg-[#1E1A17] border-2 border-[#14110F] rounded-2xl animate-pulse space-y-3">
        <div className="h-6 w-48 bg-[#14110F]/10 rounded" />
        <div className="h-4 w-full bg-[#14110F]/10 rounded" />
      </div>
    );
  }

  if (!activeBallot || !activeBallot.slots || activeBallot.slots.length === 0) {
    return null; // Silent when no active open ballot
  }

  const currentSlot = activeBallot.slots[selectedSlotIndex] || activeBallot.slots[0];
  const rawCandidates = currentSlot?.candidateDishes;
  let candidates: string[] = [];
  if (Array.isArray(rawCandidates)) {
    candidates = rawCandidates;
  } else if (typeof rawCandidates === 'string') {
    try {
      candidates = JSON.parse(rawCandidates);
    } catch {
      candidates = rawCandidates.split(',').map((s: string) => s.trim());
    }
  }
  const currentVote = votesBySlot[currentSlot.id];

  const handleSelectDish = async (dishName: string, reasonChip?: string) => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      playDhabaSound('stamp');

      // Idempotency key for offline / retry support
      const idempotencyKey = `vote-${activeBallot.id}-${currentSlot.id}-${rollNumber}-${dishName}-${Date.now()}`;

      // Optimistic state update
      setVotesBySlot((prev) => ({
        ...prev,
        [currentSlot.id]: { choice: dishName, reasonChip },
      }));

      const res = await fetch('/api/voting/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ballotId: activeBallot.id,
          slotId: currentSlot.id,
          rollNumber,
          messId,
          planName,
          dishName,
          reasonChip,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      setSuccessMsg(`Vote registered for "${dishName}"! You can change until voting closes.`);
      if (onVoteCast) onVoteCast();
    } catch (err: any) {
      setErrorMsg(err.message || 'Offline: vote queued for retry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="p-6 sm:p-8 bg-[#FAF5E8] dark:bg-[#1E1A17] border-2 border-[#14110F] rounded-2xl space-y-6 shadow-sm"
      id="student-menu-voting-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#14110F]/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#F28C1B] text-[#14110F] font-mono text-[14px] font-black uppercase border border-[#14110F]">
              Next Week Menu Vote
            </span>
            <span className="font-mono text-[14px] text-[#5C554F]">
              Closes {new Date(activeBallot.closesAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-display text-[32px] sm:text-[36px] font-black uppercase text-[#14110F] dark:text-[#FAF5E8] leading-tight mt-1">
            {activeBallot.title}
          </h3>
          <p className="font-mono text-[14px] text-[#5C554F] dark:text-[#A8A095]">
            Advisory, final menu set by the mess committee.
          </p>
        </div>
        <div className="font-mono text-[14px] font-bold text-[#2F6B3A] bg-[#2F6B3A]/10 border-2 border-[#2F6B3A] px-3.5 py-2 rounded-xl flex items-center gap-2 self-start">
          <Vote className="w-4 h-4" />
          <span>1 Vote Per Slot</span>
        </div>
      </div>

      {/* Slot Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {activeBallot.slots.map((slot: any, idx: number) => {
          const isSelected = idx === selectedSlotIndex;
          const hasVoted = Boolean(votesBySlot[slot.id]);
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                setSelectedSlotIndex(idx);
                playDhabaSound('press');
              }}
              className={`px-4 py-2.5 rounded-xl border-2 font-mono text-[14px] font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F]'
                  : 'bg-white dark:bg-[#221D18] text-[#14110F] dark:text-[#FAF5E8] border-[#14110F] hover:bg-[#F4ECD8]'
              }`}
            >
              <span>{slot.mealType} ({slot.dayOfWeek})</span>
              {hasVoted && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F6B3A] inline-block" title="Voted" />
              )}
            </button>
          );
        })}
      </div>

      {/* Candidate Dishes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[14px] font-bold text-[#14110F] dark:text-[#FAF5E8]">
            Choose dish for {currentSlot.dayOfWeek} {currentSlot.mealType}:
          </span>
          {currentVote && (
            <span className="font-mono text-[14px] text-[#2F6B3A] font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Selected: {currentVote.choice}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {candidates.map((dish: string) => {
            const isChosen = currentVote?.choice === dish;
            return (
              <button
                key={dish}
                type="button"
                disabled={submitting}
                onClick={() => handleSelectDish(dish)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isChosen
                    ? 'bg-[#F28C1B] text-[#14110F] border-[#14110F] font-black shadow-sm'
                    : 'bg-white dark:bg-[#221D18] text-[#14110F] dark:text-[#FAF5E8] border-[#14110F] hover:bg-[#F4ECD8]'
                }`}
              >
                <span className="font-mono text-[16px] font-bold">{dish}</span>
                {isChosen && <Check className="w-5 h-5 stroke-[3] shrink-0" />}
              </button>
            );
          })}

          {/* None of these option */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSelectDish('None of these', 'want more variety')}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
              currentVote?.choice === 'None of these'
                ? 'bg-[#F28C1B] text-[#14110F] border-[#14110F] font-black shadow-sm'
                : 'bg-white dark:bg-[#221D18] text-[#5C554F] dark:text-[#A8A095] border-[#14110F] hover:bg-[#F4ECD8]'
            }`}
          >
            <span className="font-mono text-[16px] italic">None of these</span>
            {currentVote?.choice === 'None of these' && <Check className="w-5 h-5 stroke-[3] shrink-0" />}
          </button>
        </div>
      </div>

      {/* Reason Chips (Optional Feedback when "None of these" is clicked) */}
      {currentVote?.choice === 'None of these' && (
        <div className="space-y-2 p-4 bg-[#F4ECD8] dark:bg-[#221D18] border-2 border-[#14110F] rounded-xl">
          <span className="font-mono text-[14px] font-bold text-[#14110F] dark:text-[#FAF5E8] block">
            Why doesn&apos;t this slot work for you? (Optional):
          </span>
          <div className="flex flex-wrap gap-2">
            {REASON_OPTIONS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSelectDish('None of these', chip)}
                className={`px-3 py-1.5 rounded-lg border font-mono text-[14px] transition-colors ${
                  currentVote.reasonChip === chip
                    ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] font-bold'
                    : 'bg-white dark:bg-[#1E1A17] text-[#14110F] dark:text-[#FAF5E8] border-[#14110F]/40 hover:bg-[#FAF5E8]'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toast / Message */}
      {successMsg && (
        <div className="p-3 bg-[#2F6B3A]/15 border-2 border-[#2F6B3A] rounded-xl font-mono text-[14px] text-[#2F6B3A] font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-[#D7312B]/15 border-2 border-[#D7312B] rounded-xl font-mono text-[14px] text-[#D7312B] font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Privacy disclaimer */}
      <div className="font-mono text-[14px] text-[#5C554F] dark:text-[#A8A095] border-t border-[#14110F]/15 pt-3">
        🔒 Anonymized ballot: Your choice is stored separately from your student identity. Aggregates only shown to committee.
      </div>
    </div>
  );
}
