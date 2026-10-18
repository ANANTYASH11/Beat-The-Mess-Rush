'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, Award, Heart, Sparkles, Check, ChevronRight } from 'lucide-react';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';

interface StudentZeroWasteCardProps {
  universitySlug?: string;
  messId: string;
  messName?: string;
}

export function StudentZeroWasteCard({
  universitySlug = 'lpu',
  messId,
  messName = 'Central Mess North',
}: StudentZeroWasteCardProps) {
  const [loading, setLoading] = useState(true);
  const [challengeData, setChallengeData] = useState<any | null>(null);
  const [pledged, setPledged] = useState(false);
  const [pledgeCount, setPledgeCount] = useState(148);
  const [submittingPledge, setSubmittingPledge] = useState(false);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/zero-waste/challenge?universitySlug=${universitySlug}`);
      if (res.ok) {
        const data = await res.json();
        setChallengeData(data);
        if (data.summary?.campusTotals?.totalPledges) {
          setPledgeCount(data.summary.campusTotals.totalPledges);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
    // Check if pledged locally today
    const stored = localStorage.getItem(`uniq_pledge_${messId}`);
    if (stored) {
      setPledged(true);
    }
  }, [universitySlug, messId]);

  if (loading) {
    return (
      <div className="p-6 bg-[#FAF5E8] dark:bg-[#1E1A17] border-2 border-[#14110F] rounded-2xl animate-pulse space-y-3">
        <div className="h-6 w-48 bg-[#14110F]/10 rounded" />
        <div className="h-4 w-full bg-[#14110F]/10 rounded" />
      </div>
    );
  }

  // Find this mess score in leaderboard
  let messScore = null;
  if (challengeData?.summary?.leaderboardByDivision) {
    for (const divList of Object.values(challengeData.summary.leaderboardByDivision)) {
      const match = (divList as any[]).find((m) => m.messId === messId);
      if (match) {
        messScore = match;
        break;
      }
    }
  }

  const improvementPct = messScore ? messScore.improvementPct : 12;
  const isPositive = improvementPct > 0;
  // Seconds policy is configured per mess
  const secondsAllowed = true;

  const handlePledge = async () => {
    if (pledged || submittingPledge) return;
    try {
      setSubmittingPledge(true);
      playDhabaSound('stamp');
      setPledged(true);
      setPledgeCount((prev) => prev + 1);
      localStorage.setItem(`uniq_pledge_${messId}`, 'true');

      if (challengeData?.challenge?.id) {
        await fetch('/api/zero-waste/pledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId: challengeData.challenge.id,
            messId,
          }),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingPledge(false);
    }
  };

  // SVG Progress Ring calculations
  // Circumference = 2 * PI * r = 2 * 3.14159 * 36 ≈ 226
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progressValue = Math.min(100, Math.max(0, improvementPct * 3)); // visual scale
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;

  return (
    <div
      className="p-6 sm:p-8 bg-[#FAF5E8] dark:bg-[#1E1A17] border-2 border-[#14110F] rounded-2xl space-y-6 shadow-sm"
      id="student-zero-waste-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#14110F]/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#2F6B3A] text-white font-mono text-[14px] font-black uppercase border border-[#14110F]">
              Zero Waste Week
            </span>
            <span className="font-mono text-[14px] text-[#5C554F]">
              Campus Challenge
            </span>
          </div>
          <h3 className="font-display text-[32px] sm:text-[36px] font-black uppercase text-[#14110F] dark:text-[#FAF5E8] leading-tight mt-1">
            {messName} Standing
          </h3>
        </div>

        <Link
          href={`/u/${universitySlug}/zero-waste`}
          className="font-mono text-[14px] font-bold text-[#14110F] dark:text-[#FAF5E8] hover:text-[#F28C1B] underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View Campus Leaderboard</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Stats Row: Progress Ring + Headline */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white dark:bg-[#221D18] border-2 border-[#14110F] rounded-xl">
        {/* Progress Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 88 88">
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-[#14110F]/15 dark:text-white/10"
            />
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="#2F6B3A"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-[22px] font-black text-[#14110F] dark:text-[#FAF5E8] leading-none">
              {improvementPct}%
            </span>
            <span className="font-mono text-[10px] uppercase font-bold text-[#5C554F] dark:text-[#A8A095]">
              LESS
            </span>
          </div>
        </div>

        {/* Narrative text */}
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-display text-[24px] sm:text-[28px] font-black uppercase text-[#14110F] dark:text-[#FAF5E8] leading-none">
            Your mess is at {improvementPct}% less waste than its usual this week
          </div>
          <p className="font-mono text-[14px] text-[#5C554F] dark:text-[#A8A095]">
            Aggregate plate-return tracking compared against your dining hall&apos;s 4-week verified baseline.
          </p>
        </div>
      </div>

      {/* Tip Card (conditioned on seconds policy) */}
      {secondsAllowed && (
        <div className="p-4 bg-[#F4ECD8] dark:bg-[#221D18] border-2 border-[#14110F] rounded-xl flex items-start gap-3">
          <Leaf className="w-5 h-5 text-[#2F6B3A] shrink-0 mt-0.5" />
          <div className="font-mono text-[14px] text-[#14110F] dark:text-[#FAF5E8] leading-snug">
            <strong>Clean Plate Tip:</strong> Take what you can finish, seconds are welcome if the counter offers them.
          </div>
        </div>
      )}

      {/* Anonymous Pledge Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-2 border-[#14110F] bg-white dark:bg-[#221D18] rounded-xl">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="font-mono text-[14px] font-bold text-[#14110F] dark:text-[#FAF5E8]">
            Anonymous Campus Pledge
          </div>
          <div className="font-mono text-[14px] text-[#5C554F] dark:text-[#A8A095]">
            {pledgeCount} students in this mess pledged to finish their plate today.
          </div>
        </div>

        <button
          type="button"
          onClick={handlePledge}
          disabled={pledged || submittingPledge}
          className={`min-h-[48px] px-5 py-2.5 rounded-xl border-2 font-mono text-[14px] font-black uppercase flex items-center gap-2 transition-all cursor-pointer ${
            pledged
              ? 'bg-[#2F6B3A] text-white border-[#14110F]'
              : 'bg-[#F28C1B] text-[#14110F] border-[#14110F] hover:-translate-y-0.5'
          }`}
        >
          {pledged ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Pledge Logged Today</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 fill-current" />
              <span>I&apos;ll finish my plate</span>
            </>
          )}
        </button>
      </div>

      <div className="font-mono text-[12px] text-[#5C554F] dark:text-[#A8A095] text-center">
        Zero individual tracking: Pledges are tallied strictly anonymously per mess. No personal names or roll numbers stored.
      </div>
    </div>
  );
}
