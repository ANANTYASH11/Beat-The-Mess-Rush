'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Clock,
  Building2,
  Users,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { university } from '@/config/university';
import { t } from '@/lib/i18n';

interface Props {
  params: {
    slug: string;
  };
}

export default function AdminTimetablePage({ params }: Props) {
  const slug = params.slug || 'lpu';

  const [loading, setLoading] = useState(true);
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [selectedMessId, setSelectedMessId] = useState(university.messes[0].id);
  const [selectedDay, setSelectedDay] = useState('Wednesday');
  const [selectedMeal, setSelectedMeal] = useState('Lunch');

  // Arrival curve data
  const [curveData, setCurveData] = useState<any[]>([]);
  const [peakArrivals, setPeakArrivals] = useState(0);
  const [peakTime, setPeakTime] = useState('12:50');
  const [totalVolume, setTotalVolume] = useState(0);
  const [spikeAlert, setSpikeAlert] = useState<any>(null);
  const [blocksIncluded, setBlocksIncluded] = useState<string[]>([]);
  const [varianceExplainedPct, setVarianceExplainedPct] = useState(26);

  // What-if sliders state (minutes shift: -20 to +20)
  const [shiftBlock32, setShiftBlock32] = useState(0);
  const [shiftBlock34, setShiftBlock34] = useState(0);

  // CSV upload state
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success?: boolean; message?: string; errors?: any[] } | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  // Load Arrival Curve
  const loadArrivalCurve = async () => {
    try {
      setLoading(true);
      const shifts = `Block 32:${shiftBlock32},Block 34:${shiftBlock34}`;
      const res = await fetch(
        `/api/timetable/arrival-curve?slug=${slug}&messId=${selectedMessId}&dayOfWeek=${selectedDay}&mealType=${selectedMeal}&shifts=${encodeURIComponent(shifts)}`
      );
      if (res.ok) {
        const data = await res.json();
        setCurveData(data.curve || []);
        setPeakArrivals(data.peakArrivals || 0);
        setPeakTime(data.peakTime || '12:50');
        setTotalVolume(data.totalVolume || 0);
        setSpikeAlert(data.spikeAlert || null);
        setBlocksIncluded(data.blocksIncluded || []);
        setVarianceExplainedPct(data.varianceExplainedPct || 26);
        setFeatureEnabled(data.featureEnabled !== false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArrivalCurve();
  }, [slug, selectedMessId, selectedDay, selectedMeal, shiftBlock32, shiftBlock34]);

  // Handle File Upload & Validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setUploadStatus({ success: false, message: 'CSV file is empty or missing headers.' });
          setUploading(false);
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const vals = line.split(',').map((v) => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => {
            obj[h] = vals[i];
          });
          return obj;
        });

        // Send to upload API
        const res = await fetch('/api/timetable/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            universitySlug: slug,
            filename: file.name,
            rows,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setUploadStatus({
            success: true,
            message: data.message || `Imported ${data.rowsImported} rows successfully.`,
          });
          setPreviewRows([]);
          loadArrivalCurve();
        } else {
          setUploadStatus({
            success: false,
            message: data.error || 'Validation errors detected in CSV.',
            errors: data.errors || [],
          });
          setPreviewRows(data.previewRows || []);
        }
      } catch (err: any) {
        setUploadStatus({ success: false, message: err.message });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  // Handle Undo Last Import
  const handleUndo = async () => {
    try {
      setUploading(true);
      const res = await fetch('/api/timetable/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universitySlug: slug,
          action: 'undo',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus({ success: true, message: data.message });
        loadArrivalCurve();
      } else {
        setUploadStatus({ success: false, message: data.error });
      }
    } catch (e: any) {
      setUploadStatus({ success: false, message: e.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 pt-4" id="timetable-admin-page">
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
            CLASS TIMETABLE PREDICTION
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

        <div className="space-y-1">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[#14110F] uppercase tracking-wide leading-none">
            {t('timetable_title', 'en')}
          </h1>
          <p className="font-serif italic text-sm text-[#5C554F]">
            Aggregate class-schedule arrival curves, counter-spike detection, and schedule what-if analysis.
          </p>
        </div>

        {/* Feature Flag Notice */}
        {!featureEnabled && (
          <div className="p-4 rounded-xl bg-[#FAF5E8] border-2 border-dashed border-[#D7312B] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D7312B] shrink-0" />
              <div className="text-xs font-mono text-[#14110F]">
                {t('feature_disabled', 'en')} Enable &quot;Class-Timetable Arrival Prediction&quot; in Setup to activate live insights for students and staff.
              </div>
            </div>
            <Link
              href={`/u/${slug}/admin/setup`}
              className="px-3 py-1.5 bg-[#14110F] text-[#FAF5E8] rounded-lg font-mono text-xs font-black uppercase hover:bg-black shrink-0"
            >
              Open Setup
            </Link>
          </div>
        )}
      </div>

      {/* ── IMPACT & COLD-START METRIC ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 shadow-brutal-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase text-[#5C554F]">TIMETABLE IMPACT</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 border border-[#14110F]/30 rounded">
              {t('simulated_data', 'en')}
            </span>
          </div>
          <div className="font-display text-4xl font-black text-[#14110F] my-2">
            +{varianceExplainedPct}%
          </div>
          <div className="font-serif text-xs text-[#5C554F]">
            Share of forecast variance explained by timetable class releases.
          </div>
        </div>

        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 shadow-brutal-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase text-[#5C554F]">PROJECTED SPIKE</span>
            <Clock className="w-4 h-4 text-[#F28C1B]" />
          </div>
          <div className="font-display text-4xl font-black text-[#14110F] my-2">
            {peakTime}
          </div>
          <div className="font-serif text-xs text-[#5C554F]">
            Peak arrival rate: ~{peakArrivals} students per 5-minute interval.
          </div>
        </div>

        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 shadow-brutal-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase text-[#5C554F]">TOTAL TIMETABLE VOLUME</span>
            <Users className="w-4 h-4 text-[#2F6B3A]" />
          </div>
          <div className="font-display text-4xl font-black text-[#14110F] my-2">
            {totalVolume}
          </div>
          <div className="font-serif text-xs text-[#5C554F]">
            Aggregated student headcount released across {blocksIncluded.length} campus blocks.
          </div>
        </div>
      </div>

      {/* ── SPIKE WARNING CARD (KITCHEN & STAFF DISCOVERY) ── */}
      {spikeAlert && (
        <div className="bg-[#FAF5E8] border-[3px] border-[#F28C1B] rounded-2xl p-6 shadow-brutal-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F28C1B] animate-pulse" />
            <h2 className="font-display text-2xl font-black uppercase text-[#14110F] tracking-wide">
              EARLY COUNTER SPIKE RECOMMENDATION
            </h2>
          </div>
          <p className="font-mono text-base font-bold text-[#14110F]">
            &quot;Expected spike at {spikeAlert.spikeTime}: about {spikeAlert.expectedMin}–{spikeAlert.expectedMax} students from {spikeAlert.releasingBlocks.join(' and ')}. {spikeAlert.counterRecommendation}&quot;
          </p>
          <div className="p-3 bg-[#14110F]/5 rounded-xl border border-[#14110F]/15 font-serif text-xs text-[#5C554F]">
            <strong>Why this occurs:</strong> {spikeAlert.evidenceText} Walking delay assumption: 8–10 minutes + 5-minute stagger distribution.
          </div>
        </div>
      )}

      {/* ── ARRIVAL CURVE CHART & WHAT-IF SIMULATION ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#14110F]/15 pb-4">
          <div>
            <h2 className="font-display text-2xl font-black uppercase text-[#14110F] tracking-wide">
              EXPECTED ARRIVAL CURVE (5-MIN INTERVALS)
            </h2>
            <p className="font-serif italic text-xs text-[#5C554F]">
              Showing staggered arrivals calculated from class end times, walking buffer, and spread.
            </p>
          </div>

          {/* Filters: Mess, Day, Meal */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedMessId}
              onChange={(e) => setSelectedMessId(e.target.value)}
              className="px-3 py-1.5 border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold bg-white"
            >
              {university.messes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-3 py-1.5 border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold bg-white"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              className="px-3 py-1.5 border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold bg-white"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#14110F" opacity={0.15} />
              <XAxis dataKey="time" stroke="#14110F" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#14110F" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const pt = payload[0].payload;
                  return (
                    <div className="bg-[#14110F] text-[#FAF5E8] p-3 rounded-xl border border-[#FAF5E8]/30 font-mono text-xs shadow-xl space-y-1">
                      <div className="font-black text-saffron text-sm">{label} Arrival Spike</div>
                      <div className="font-bold">Total: {pt.totalArrivals} students / 5m</div>
                      <div className="border-t border-[#FAF5E8]/20 pt-1 text-[11px] text-[#A8A095]">
                        {Object.entries(pt.blockBreakdown || {}).map(([bName, cnt]) => (
                          <div key={bName}>
                            {bName}: {cnt as number} students
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="totalArrivals"
                name="Expected Arrivals"
                stroke="#14110F"
                strokeWidth={3}
                fill="#F28C1B"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── WHAT-IF SIMULATION SLIDERS ── */}
        <div className="bg-[#14110F]/5 p-5 rounded-xl border-2 border-dashed border-[#14110F]/25 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-black uppercase text-[#14110F] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-saffron" />
              {t('timetable_what_if', 'en')}
            </h3>
            <span className="font-serif text-xs italic text-[#5C554F]">
              Label: Estimate only. Does not change real university timetable.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs font-bold">
                <span>Block 32 Release Time Shift:</span>
                <span className="text-saffron">{shiftBlock32 > 0 ? `+${shiftBlock32}m` : `${shiftBlock32}m`}</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="5"
                value={shiftBlock32}
                onChange={(e) => setShiftBlock32(parseInt(e.target.value, 10))}
                className="w-full accent-saffron"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#5C554F]">
                <span>-20 min</span>
                <span>Normal (12:45)</span>
                <span>+20 min</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs font-bold">
                <span>Block 34 Release Time Shift:</span>
                <span className="text-saffron">{shiftBlock34 > 0 ? `+${shiftBlock34}m` : `${shiftBlock34}m`}</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="5"
                value={shiftBlock34}
                onChange={(e) => setShiftBlock34(parseInt(e.target.value, 10))}
                className="w-full accent-saffron"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#5C554F]">
                <span>-20 min</span>
                <span>Normal (12:50)</span>
                <span>+20 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CSV IMPORT & VALIDATION SECTION ── */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#14110F]/15 pb-4">
          <div>
            <h2 className="font-display text-2xl font-black uppercase text-[#14110F] tracking-wide">
              {t('timetable_import_csv', 'en')}
            </h2>
            <p className="font-serif italic text-xs text-[#5C554F]">
              Columns: block, day_of_week, class_end_time, students_count, optional building_to_mess_minutes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/timetable/template?type=template"
              download="timetable_template.csv"
              className="px-3 py-1.5 border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-white"
            >
              <Download className="w-3.5 h-3.5" />
              {t('timetable_template_download', 'en')}
            </a>
            <a
              href="/api/timetable/template?type=example"
              download="timetable_example_lpu.csv"
              className="px-3 py-1.5 border-2 border-[#14110F] rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-white"
            >
              <Download className="w-3.5 h-3.5" />
              {t('timetable_example_download', 'en')}
            </a>
            <button
              onClick={handleUndo}
              disabled={uploading}
              className="px-3 py-1.5 border-2 border-[#D7312B] text-[#D7312B] rounded-lg font-mono text-xs font-black flex items-center gap-1.5 hover:bg-[#D7312B]/10 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('timetable_undo_last', 'en')}
            </button>
          </div>
        </div>

        {/* Dropzone */}
        <div className="border-2 border-dashed border-[#14110F]/40 rounded-xl p-8 text-center bg-white space-y-3">
          <Upload className="w-8 h-8 text-[#14110F]/60 mx-auto" />
          <div className="space-y-1">
            <label className="cursor-pointer font-mono text-sm font-black text-saffron uppercase hover:underline">
              <span>Click to select CSV file</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="font-serif text-xs text-[#5C554F]">
              Strict privacy: Aggregate headcount only. No individual student identities or roll numbers.
            </p>
          </div>
        </div>

        {/* Upload Status / Errors */}
        {uploadStatus && (
          <div
            className={`p-4 rounded-xl border-2 ${
              uploadStatus.success
                ? 'bg-[#2F6B3A]/10 border-[#2F6B3A] text-[#2F6B3A]'
                : 'bg-[#D7312B]/10 border-[#D7312B] text-[#D7312B]'
            } font-mono text-xs space-y-2`}
          >
            <div className="font-black flex items-center gap-2">
              {uploadStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{uploadStatus.message}</span>
            </div>

            {uploadStatus.errors && uploadStatus.errors.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto pt-2 border-t border-[#D7312B]/30">
                <span className="font-bold">Row-level Validation Errors:</span>
                {uploadStatus.errors.map((err, i) => (
                  <div key={i} className="text-[11px]">
                    • Row {err.row} ({err.column}): {err.message} [Value: &quot;{err.value}&quot;]
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
