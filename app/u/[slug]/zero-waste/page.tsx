'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  HelpCircle,
  FileSpreadsheet,
  HeartHandshake,
  Share2,
  Sparkles,
  Info,
} from 'lucide-react';
import { university } from '@/config/university';
import { t } from '@/lib/i18n';

interface Props {
  params: {
    slug: string;
  };
}

export default function ZeroWasteLeaderboardPage({ params }: Props) {
  const slug = params.slug || 'lpu';

  const [loading, setLoading] = useState(true);
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedDivision, setSelectedDivision] = useState('Central');
  const [showHowScoringWorks, setShowHowScoringWorks] = useState(false);
  const [pledged, setPledged] = useState(false);
  const [pledgeCount, setPledgeCount] = useState(142);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Load Leaderboard
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/zero-waste/challenge?slug=${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setFeatureEnabled(json.featureEnabled !== false);
        if (json.divisions && json.divisions.length > 0) {
          setSelectedDivision(json.divisions[0]);
        }
        if (json.campusTotals?.totalPledges) {
          setPledgeCount(json.campusTotals.totalPledges);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [slug]);

  // Handle Anonymous Student Pledge
  const handlePledge = async () => {
    if (pledged) return;
    try {
      const res = await fetch('/api/zero-waste/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: data?.challenge?.id,
          messId: 'central-mess-north',
        }),
      });
      if (res.ok) {
        setPledged(true);
        setPledgeCount((prev) => prev + 1);
        setStatusMsg('Thank you for pledging! Plate waste down starts with mindful servings.');
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!data && loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-20 text-center font-mono">
        Loading Zero Waste Challenge leaderboard...
      </div>
    );
  }

  const divisionMesses = data?.leaderboardByDivision?.[selectedDivision] || [];
  const topMess = divisionMesses[0] || null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 pt-4" id="zero-waste-page">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-4 relative overflow-hidden">
        {/* Demo Watermark */}
        {data?.challenge?.isDemo && (
          <div className="absolute -right-12 top-6 rotate-12 bg-saffron text-ink font-mono text-[10px] font-black uppercase px-14 py-1 border-2 border-ink shadow-sm pointer-events-none">
            {t('challenge_demo_watermark', 'en')}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/u/${slug}/admin/setup`}
            className="font-mono text-[11px] font-black uppercase tracking-wider text-[#14110F] hover:underline"
          >
            ← SETUP ADMIN
          </Link>
          <span className="text-[#14110F]/40">•</span>
          <span className="font-mono text-[11px] font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded">
            CAMPUS SUSTAINABILITY
          </span>
          <span className="font-mono text-[11px] font-black uppercase tracking-wider bg-saffron text-ink px-2 py-0.5 rounded border border-ink">
            {t('simulated_data', 'en')}
          </span>
          {!featureEnabled && (
            <span className="font-mono text-[11px] font-black uppercase tracking-wider bg-[#D7312B] text-white px-2 py-0.5 rounded">
              FEATURE FLAG OFF IN SETUP
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-4xl sm:text-5xl font-black text-[#14110F] uppercase tracking-wide leading-none">
              {t('challenge_title', 'en')}
            </h1>
            <p className="font-serif italic text-sm text-[#5C554F]">
              Fair division standings scored against each mess&apos;s own 4-week historical baseline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowScoringWorks(true)}
              className="px-3 py-1.5 border-2 border-[#14110F] bg-white rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-[#FAF5E8]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-saffron" />
              {t('challenge_how_scoring_works', 'en')}
            </button>
            <a
              href={`/api/zero-waste/export?challengeId=${data?.challenge?.id}`}
              download="zero_waste_standings.csv"
              className="px-3 py-1.5 border-2 border-[#14110F] bg-[#14110F] text-[#FAF5E8] rounded-lg font-mono text-xs font-black flex items-center gap-1.5 hover:bg-black"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-saffron" />
              Export CSV
            </a>
          </div>
        </div>

        {/* Challenge Period & Prize text */}
        <div className="p-3.5 rounded-xl bg-[#14110F]/5 border-2 border-[#14110F]/20 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-bold text-[#14110F]">PRIZE RECOGNITION: </span>
            <span className="text-[#5C554F]">{data?.challenge?.prizeText}</span>
          </div>
          <div className="text-[11px] font-bold text-[#5C554F]">
            Dates: {data?.challenge?.startDate} to {data?.challenge?.endDate}
          </div>
        </div>
      </div>

      {/* ── CAMPUS TOTAL IMPACT ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 shadow-brutal-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase text-[#5C554F]">CAMPUS PLATES SAVED</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 border border-[#14110F]/30 rounded">
              {t('simulated_data', 'en')}
            </span>
          </div>
          <div className="font-display text-4xl font-black text-[#2F6B3A] my-2">
            {data?.campusTotals?.totalPlatesSaved?.toLocaleString() || '1,840'}
          </div>
          <div className="font-serif text-xs text-[#5C554F]">
            Equivalent complete meal plates spared from disposal this week.
          </div>
        </div>

        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 shadow-brutal-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase text-[#5C554F]">FOOD WASTE PREVENTED</span>
            <Flame className="w-4 h-4 text-saffron" />
          </div>
          <div className="font-display text-4xl font-black text-[#14110F] my-2">
            {data?.campusTotals?.totalKgSaved?.toLocaleString() || '220'} kg
          </div>
          <div className="font-serif text-xs text-[#5C554F]">
            Across {data?.campusTotals?.participatingMessesCount || 19} participating campus kitchens.
          </div>
        </div>

        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 shadow-brutal-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase text-[#5C554F]">STUDENT CLEAN PLATE PLEDGES</span>
            <HeartHandshake className="w-4 h-4 text-[#D7312B]" />
          </div>
          <div className="font-display text-4xl font-black text-[#14110F] my-2">
            {pledgeCount}
          </div>
          <div className="font-serif text-xs text-[#5C554F]">
            Students anonymously committed to finishing their plates today.
          </div>
        </div>
      </div>

      {/* ── STUDENT PROGRESS RING & PLEDGE CARD ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Visual Progress Ring */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#14110F"
                  strokeWidth="6"
                  strokeOpacity="0.15"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#2F6B3A"
                  strokeWidth="6"
                  strokeDasharray="163"
                  strokeDashoffset="35"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-mono text-sm font-black text-[#14110F]">-18%</span>
            </div>

            <div>
              <h2 className="font-display text-2xl font-black uppercase text-[#14110F] leading-none">
                {t('challenge_student_standing', 'en', { pct: 18 })}
              </h2>
              <p className="font-serif italic text-xs text-[#5C554F] mt-1">
                Central Mess North is leading the Central Division in plate return reduction.
              </p>
            </div>
          </div>

          {/* Anonymous Pledge Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePledge}
              disabled={pledged}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-black uppercase transition-all shadow-brutal-sm flex items-center gap-2 ${
                pledged
                  ? 'bg-[#2F6B3A] text-white border-2 border-[#2F6B3A]'
                  : 'bg-saffron text-ink border-2 border-[#14110F] hover:bg-saffron/90'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              {pledged ? 'Pledged for Today ✓' : t('challenge_pledge_button', 'en')}
            </button>
          </div>
        </div>

        {/* Seconds Policy Tip Card */}
        <div className="p-3 bg-white border-2 border-[#14110F]/20 rounded-xl font-mono text-xs text-[#5C554F] flex items-center gap-2">
          <Info className="w-4 h-4 text-saffron shrink-0" />
          <span>{t('challenge_tip_seconds', 'en')}</span>
        </div>

        {statusMsg && (
          <div className="font-mono text-xs font-bold text-[#2F6B3A] animate-fadeIn">
            ✓ {statusMsg}
          </div>
        )}
      </div>

      {/* ── DIVISION LEADERBOARD ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-6">
        {/* Division Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#14110F]/15 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {data?.divisions?.map((divName: string) => (
              <button
                key={divName}
                onClick={() => setSelectedDivision(divName)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-black uppercase border-2 transition-all ${
                  selectedDivision === divName
                    ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-sm'
                    : 'bg-white text-[#14110F] border-[#14110F]/30 hover:border-[#14110F]'
                }`}
              >
                {divName}
              </button>
            ))}
          </div>

          <span className="font-mono text-xs text-[#5C554F] font-bold">
            Division Leaderboard • Ranked by % Improvement
          </span>
        </div>

        {/* Mess Ranking Cards */}
        <div className="space-y-4">
          {divisionMesses.map((m: any) => (
            <div
              key={m.messId}
              className={`p-5 rounded-xl border-2 transition-all ${
                m.isFlagged
                  ? 'bg-[#D7312B]/5 border-[#D7312B]'
                  : m.rankInDivision === 1
                  ? 'bg-white border-2 border-[#2F6B3A] shadow-brutal-sm'
                  : 'bg-white border-2 border-[#14110F]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: Rank & Mess Name */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-full font-mono text-sm font-black flex items-center justify-center border-2 ${
                      m.rankInDivision === 1
                        ? 'bg-[#2F6B3A] text-white border-[#2F6B3A]'
                        : 'bg-[#14110F]/10 text-[#14110F] border-[#14110F]'
                    }`}
                  >
                    #{m.rankInDivision}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-black uppercase text-[#14110F]">
                        {m.messName}
                      </h3>
                      {m.rankInDivision === 1 && !m.isFlagged && (
                        <span className="font-mono text-[10px] font-black uppercase bg-[#2F6B3A] text-white px-2 py-0.5 rounded">
                          LEADER
                        </span>
                      )}
                    </div>
                    <div className="font-serif italic text-xs text-[#5C554F]">
                      Baseline: {m.baselineGramsPerStudent}g/plate • Current: {m.currentGramsPerStudent}g/plate • {m.daysLogged} days logged
                    </div>
                  </div>
                </div>

                {/* Right: Improvement % & Badges */}
                <div className="text-right">
                  {m.isFlagged ? (
                    <div className="font-mono text-xs font-black text-[#D7312B] flex items-center gap-1 justify-end">
                      <AlertTriangle className="w-4 h-4" />
                      DISQUALIFIED
                    </div>
                  ) : (
                    <div className="font-display text-3xl font-black text-[#2F6B3A]">
                      -{m.improvementPct}%
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 justify-end mt-1">
                    {m.badges?.map((badge: string) => (
                      <span
                        key={badge}
                        className="font-mono text-[9px] font-black uppercase bg-saffron/20 text-[#14110F] border border-saffron px-1.5 py-0.5 rounded"
                      >
                        🏅 {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flag Warning If Underlogging or Satisfaction drop */}
              {m.isFlagged && (
                <div className="mt-3 p-2.5 rounded bg-[#D7312B]/10 border border-[#D7312B]/40 font-mono text-xs text-[#D7312B] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{m.flagReason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW SCORING WORKS MODAL ── */}
      {showHowScoringWorks && (
        <div className="fixed inset-0 z-50 bg-[#14110F]/60 flex items-center justify-center p-4">
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl max-w-xl w-full p-6 shadow-brutal-lg space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#14110F]/15 pb-2">
              <h2 className="font-display text-2xl font-black uppercase text-[#14110F]">
                {t('challenge_how_scoring_works', 'en')}
              </h2>
              <button
                onClick={() => setShowHowScoringWorks(false)}
                className="font-mono text-xs font-bold px-2 py-1 border border-[#14110F] rounded hover:bg-white"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="space-y-3 font-serif text-xs text-[#14110F] leading-relaxed">
              <div className="p-3 bg-white border border-[#14110F]/20 rounded-xl space-y-1">
                <span className="font-mono font-black uppercase text-xs block text-[#14110F]">
                  PRIMARY FORMULA
                </span>
                <p>{t('challenge_scoring_formula', 'en')}</p>
              </div>

              <div className="p-3 bg-white border border-[#14110F]/20 rounded-xl space-y-1">
                <span className="font-mono font-black uppercase text-xs block text-[#14110F]">
                  FAIRNESS &amp; UNDERLOGGING GUARD
                </span>
                <p>{t('challenge_fairness_rule', 'en')}</p>
                <p className="text-[#D7312B] font-mono text-[11px] pt-1">
                  Messes with &lt; 80% waste logging completeness are disqualified so skipping logs cannot win.
                </p>
              </div>

              <div className="p-3 bg-white border border-[#14110F]/20 rounded-xl space-y-1">
                <span className="font-mono font-black uppercase text-xs block text-[#14110F]">
                  SATISFACTION GUARD
                </span>
                <p>
                  Thumbs-up ratings and student complaints are continuously evaluated. If a mess reduces portions below nutritional floors to game the waste score, it is automatically flagged and disqualified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
