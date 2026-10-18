'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Vote,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  Plus,
  Calendar,
  Layers,
  ChevronRight,
  TrendingDown,
  ThumbsUp,
  FileSpreadsheet,
} from 'lucide-react';
import { university } from '@/config/university';
import { t } from '@/lib/i18n';

interface Props {
  params: {
    slug: string;
  };
}

export default function AdminVotingPage({ params }: Props) {
  const slug = params.slug || 'lpu';

  const [loading, setLoading] = useState(true);
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [ballots, setBallots] = useState<any[]>([]);
  const [selectedBallotId, setSelectedBallotId] = useState<string | null>(null);
  const [ballotResults, setBallotResults] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Ballot Modal Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMessId, setNewMessId] = useState(university.messes[0].id);
  const [newTitle, setNewTitle] = useState('Week 43 Menu Vote (Oct 20-26)');
  const [newWeekStart, setNewWeekStart] = useState('2026-10-20');
  const [newWeekEnd, setNewWeekEnd] = useState('2026-10-26');
  const [newMinVotes, setNewMinVotes] = useState(20);

  // Slots in new ballot
  const [newSlots, setNewSlots] = useState([
    {
      dayOfWeek: 'Wednesday',
      mealType: 'Dinner',
      candidateDishes: ['Paneer Butter Masala', 'Rajma Masala', 'Dal Makhani', 'Aloo Gobi'],
    },
    {
      dayOfWeek: 'Friday',
      mealType: 'Dinner',
      candidateDishes: ['Chole Bhature', 'Veg Biryani', 'Kadhi Pakora'],
    },
  ]);

  // Load Ballots
  const loadBallots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/voting/ballots?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setBallots(data.ballots || []);
        setFeatureEnabled(data.featureEnabled !== false);
        if (data.ballots && data.ballots.length > 0) {
          setSelectedBallotId(data.ballots[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Load Selected Ballot Results
  const loadResults = async (bId: string) => {
    try {
      const res = await fetch(`/api/voting/results?ballotId=${bId}`);
      if (res.ok) {
        const data = await res.json();
        setBallotResults(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBallots();
  }, [slug]);

  useEffect(() => {
    if (selectedBallotId) {
      loadResults(selectedBallotId);
    }
  }, [selectedBallotId]);

  // Handle Admin Action (Close Early, Void, Approve)
  const handleAdminAction = async (action: 'close_early' | 'void' | 'approve') => {
    if (!selectedBallotId) return;
    try {
      const res = await fetch('/api/voting/ballots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ballotId: selectedBallotId,
          notes: 'Advisory, final menu set by the mess committee',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message);
        loadBallots();
        loadResults(selectedBallotId);
      }
    } catch (e: any) {
      setStatusMessage(e.message);
    }
  };

  // Handle Create Ballot
  const handleCreateBallot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/voting/ballots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universitySlug: slug,
          messId: newMessId,
          title: newTitle,
          weekStart: newWeekStart,
          weekEnd: newWeekEnd,
          minVotesRequired: newMinVotes,
          slots: newSlots,
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        loadBallots();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 pt-4" id="voting-admin-page">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/u/${slug}/admin/setup`}
            className="font-mono text-[11px] font-black uppercase tracking-wider text-[#14110F] hover:underline"
          >
            ← SETUP ADMIN
          </Link>
          <span className="text-[#14110F]/40">•</span>
          <span className="font-mono text-[11px] font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded">
            WEEKLY MENU VOTING
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
              {t('voting_title', 'en')}
            </h1>
            <p className="font-serif italic text-sm text-[#5C554F]">
              Student ballot creation, advisory turnout signals, and side-by-side waste &amp; rating evaluation.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#14110F] text-[#FAF5E8] rounded-xl font-mono text-xs font-black uppercase flex items-center gap-2 hover:bg-black shadow-brutal-sm"
          >
            <Plus className="w-4 h-4 text-saffron" />
            Create Weekly Ballot
          </button>
        </div>

        {/* Advisory Banner */}
        <div className="p-3.5 rounded-xl bg-saffron/15 border-2 border-saffron font-mono text-xs font-black text-[#14110F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#14110F]" />
            <span>{t('voting_advisory_disclaimer', 'en')}</span>
          </div>
          <span className="text-[11px] font-bold text-[#5C554F]">Advisory signal only</span>
        </div>
      </div>

      {/* ── BALLOT SELECTOR / LIST ── */}
      {ballots.length > 0 ? (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {ballots.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBallotId(b.id)}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black uppercase border-2 transition-all shrink-0 ${
                selectedBallotId === b.id
                  ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-sm'
                  : 'bg-[#FAF5E8] text-[#14110F] border-[#14110F]/30 hover:border-[#14110F]'
              }`}
            >
              {b.title} ({b.status})
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-[#FAF5E8] border-2 border-dashed border-[#14110F]/30 rounded-2xl font-mono text-sm">
          No ballots created yet. Click &quot;Create Weekly Ballot&quot; to launch the first student poll.
        </div>
      )}

      {/* ── ACTIVE BALLOT RESULTS CARD ── */}
      {ballotResults && (
        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-6">
          {/* Ballot Info Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#14110F]/15 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-black uppercase text-[#14110F] tracking-wide">
                  {ballotResults.ballot.title}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase border ${
                    ballotResults.ballot.status === 'OPEN'
                      ? 'bg-[#2F6B3A]/15 text-[#2F6B3A] border-[#2F6B3A]'
                      : 'bg-[#14110F]/10 text-[#14110F] border-[#14110F]'
                  }`}
                >
                  {ballotResults.ballot.status}
                </span>
              </div>
              <p className="font-serif italic text-xs text-[#5C554F]">
                Mess: {ballotResults.ballot.messId} • Minimum threshold: {ballotResults.ballot.minVotesRequired} votes
              </p>
            </div>

            {/* Actions: CSV Export, Close Early, Void */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/api/voting/export?ballotId=${ballotResults.ballot.id}`}
                download={`ballot_report_${ballotResults.ballot.id}.csv`}
                className="px-3 py-1.5 border-2 border-[#14110F] bg-white rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-[#FAF5E8]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-saffron" />
                Export CSV
              </a>

              {ballotResults.ballot.status === 'OPEN' && (
                <>
                  <button
                    onClick={() => handleAdminAction('close_early')}
                    className="px-3 py-1.5 border-2 border-[#14110F] bg-white rounded-lg font-mono text-xs font-bold hover:bg-[#FAF5E8]"
                  >
                    Close Early
                  </button>
                  <button
                    onClick={() => handleAdminAction('void')}
                    className="px-3 py-1.5 border-2 border-[#D7312B] text-[#D7312B] rounded-lg font-mono text-xs font-bold hover:bg-[#D7312B]/10"
                  >
                    Void Ballot
                  </button>
                </>
              )}

              {ballotResults.ballot.status === 'CLOSED' && !ballotResults.ballot.committeeApproved && (
                <button
                  onClick={() => handleAdminAction('approve')}
                  className="px-3 py-1.5 border-2 border-[#2F6B3A] bg-[#2F6B3A] text-white rounded-lg font-mono text-xs font-bold hover:bg-[#25552E]"
                >
                  Approve Final Menu
                </button>
              )}
            </div>
          </div>

          {/* Turnout & Anti-Abuse Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border-2 border-[#14110F] rounded-xl font-mono text-xs space-y-1">
              <span className="text-[#5C554F] uppercase font-bold">VOTER TURNOUT</span>
              <div className="font-display text-3xl font-black text-[#14110F]">
                {ballotResults.totalParticipants} / {ballotResults.eligibleStudentCount} ({ballotResults.turnoutPct}%)
              </div>
              {ballotResults.isLowTurnout && (
                <div className="text-[#D7312B] font-bold text-[11px] pt-1">
                  ⚠️ {t('voting_turnout_warning', 'en', { turnout: ballotResults.turnoutPct })}
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-2 border-[#14110F] rounded-xl font-mono text-xs space-y-1">
              <span className="text-[#5C554F] uppercase font-bold">ANTI-STUFFING AUDIT</span>
              <div className="font-display text-3xl font-black text-[#14110F]">
                {ballotResults.ballotStuffingAlerts} Burst Flags
              </div>
              <div className="text-[11px] text-[#5C554F]">
                Rapid device bursts monitored. No student identities exposed.
              </div>
            </div>

            <div className="p-4 bg-white border-2 border-[#14110F] rounded-xl font-mono text-xs space-y-1">
              <span className="text-[#5C554F] uppercase font-bold">COMMITTEE STATUS</span>
              <div className="font-display text-2xl font-black text-[#14110F] pt-1">
                {ballotResults.ballot.committeeApproved ? 'APPROVED' : 'ADVISORY REVIEW'}
              </div>
              <div className="text-[11px] text-[#5C554F]">
                Final decision rests with mess committee.
              </div>
            </div>
          </div>

          {/* Slots & Candidate Dish Results */}
          <div className="space-y-6 pt-2">
            <h3 className="font-mono text-sm font-black uppercase text-[#14110F] border-b border-[#14110F]/15 pb-2">
              MEAL SLOT BALLOT RESULTS &amp; OPERATIONAL METRICS
            </h3>

            {ballotResults.slots.map((slot: any) => (
              <div
                key={slot.slotId}
                className="p-5 bg-white border-2 border-[#14110F] rounded-xl space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-display text-xl font-black uppercase text-[#14110F]">
                    {slot.dayOfWeek} • {slot.mealType} Slot
                  </div>
                  <div className="font-mono text-xs font-bold text-[#5C554F]">
                    {slot.totalVotes} votes cast
                  </div>
                </div>

                {slot.resultsUnlocked ? (
                  <div className="space-y-3">
                    {slot.dishes.map((dish: any) => (
                      <div key={dish.name} className="space-y-1">
                        <div className="flex items-center justify-between font-mono text-xs font-bold">
                          <span className="text-sm font-black text-[#14110F]">{dish.name}</span>
                          <div className="flex items-center gap-4 text-[#5C554F]">
                            <span className="text-saffron font-black text-sm">{dish.percentage}% ({dish.voteCount} votes)</span>
                            <span className="text-[11px] text-[#D7312B] flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" /> {dish.wastePct}% waste
                            </span>
                            <span className="text-[11px] text-[#2F6B3A] flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" /> {dish.satisfactionPct}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#14110F]/10 h-3 rounded-full overflow-hidden border border-[#14110F]/20">
                          <div
                            className="bg-saffron h-full transition-all duration-500"
                            style={{ width: `${dish.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* None of these & Reason Chips */}
                    {slot.noneOfTheseVotes > 0 && (
                      <div className="pt-2 border-t border-[#14110F]/10 flex flex-wrap items-center justify-between text-xs font-mono">
                        <span className="font-bold text-[#D7312B]">
                          None of these dishes: {slot.noneOfTheseVotes} votes
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#5C554F]">Top student feedback:</span>
                          {slot.topReasons.map((r: any) => (
                            <span
                              key={r.reason}
                              className="px-2 py-0.5 bg-[#14110F]/5 border border-[#14110F]/20 rounded text-[10px] font-bold"
                            >
                              {r.reason} ({r.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-[#14110F]/5 border border-dashed border-[#14110F]/30 rounded-lg text-center font-mono text-xs text-[#5C554F] space-y-1">
                    <Lock className="w-4 h-4 mx-auto text-[#5C554F]" />
                    <div className="font-bold">
                      {t('voting_min_votes_needed', 'en', {
                        min: ballotResults.ballot.minVotesRequired,
                        current: slot.totalVotes,
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CREATE BALLOT MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#14110F]/60 flex items-center justify-center p-4">
          <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl max-w-xl w-full p-6 shadow-brutal-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#14110F]/15 pb-2">
              <h2 className="font-display text-2xl font-black uppercase text-[#14110F]">
                NEW WEEKLY MENU BALLOT
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="font-mono text-xs font-bold px-2 py-1 border border-[#14110F] rounded hover:bg-white"
              >
                ✕ CLOSE
              </button>
            </div>

            <form onSubmit={handleCreateBallot} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold text-[#14110F] mb-1">BALLOT TITLE:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#14110F] rounded-lg bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#14110F] mb-1">MESS:</label>
                  <select
                    value={newMessId}
                    onChange={(e) => setNewMessId(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#14110F] rounded-lg bg-white"
                  >
                    {university.messes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#14110F] mb-1">MIN VOTES GATING:</label>
                  <input
                    type="number"
                    value={newMinVotes}
                    onChange={(e) => setNewMinVotes(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border-2 border-[#14110F] rounded-lg bg-white"
                    min="5"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#14110F] mb-1">WEEK START:</label>
                  <input
                    type="date"
                    value={newWeekStart}
                    onChange={(e) => setNewWeekStart(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#14110F] rounded-lg bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#14110F] mb-1">WEEK END:</label>
                  <input
                    type="date"
                    value={newWeekEnd}
                    onChange={(e) => setNewWeekEnd(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#14110F] rounded-lg bg-white"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-white border border-[#14110F]/20 rounded-lg text-[11px] text-[#5C554F]">
                Included Slots: Wednesday Dinner (4 dishes), Friday Dinner (3 dishes).
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#14110F] text-[#FAF5E8] rounded-xl font-black uppercase text-sm hover:bg-black shadow-brutal-sm"
              >
                Publish Ballot to Students
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
