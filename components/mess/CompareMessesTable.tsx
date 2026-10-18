'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ShieldAlert, Users, Clock, Utensils, Trash2 } from 'lucide-react';
import { university, MessConfig } from '@/config/university';

export interface MessComparisonRow {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: 'CENTRAL' | 'BOYS_HOSTEL' | 'BOYS_STUDIO' | 'GIRLS_HOSTEL' | 'GIRLS_STUDIO';
  gender: string;
  zone: string | null;
  liveQueue: number;
  waitMin: number;
  waitMax: number;
  expectedPlates: number;
  wastePct: number;
  dataSource: string;
  status: 'Normal' | 'Moderate' | 'Busy';
}

const CATEGORY_TABS = [
  { key: 'ALL', label: 'All Messes (19)' },
  { key: 'CENTRAL', label: 'Central (2)' },
  { key: 'BOYS_HOSTEL', label: 'Boys Hostel (7)' },
  { key: 'BOYS_STUDIO', label: 'Boys Studio (2)' },
  { key: 'GIRLS_HOSTEL', label: 'Girls Hostel (6)' },
  { key: 'GIRLS_STUDIO', label: 'Girls Studio (2)' },
];

export function CompareMessesTable() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof MessComparisonRow>('liveQueue');
  const [sortAsc, setSortAsc] = useState(false);

  // Synthesize data for all 19 messes with seeded queue and plate numbers
  const rows: MessComparisonRow[] = useMemo(() => {
    return university.messes.map((m, idx) => {
      // Deterministic realistic simulated live queue data based on index & category
      const baseQueue = m.category === 'CENTRAL' ? 24 : m.category.includes('STUDIO') ? 8 : 16;
      const liveQueue = Math.max(2, (baseQueue + (idx * 3) % 19));
      const waitMin = Math.round(liveQueue * 0.4);
      const waitMax = Math.round(liveQueue * 0.7) + 2;
      const expectedPlates = m.category === 'CENTRAL' ? 780 : m.category.includes('STUDIO') ? 290 : 490;
      const wastePct = parseFloat((8.5 + ((idx * 1.7) % 7.5)).toFixed(1));

      let status: 'Normal' | 'Moderate' | 'Busy' = 'Normal';
      if (liveQueue > 25) status = 'Busy';
      else if (liveQueue > 14) status = 'Moderate';

      return {
        id: m.id,
        code: m.id,
        name: m.name,
        shortName: m.shortName,
        category: m.category,
        gender: m.gender,
        zone: m.zone || null,
        liveQueue,
        waitMin,
        waitMax,
        expectedPlates,
        wastePct,
        dataSource: m.dataSource,
        status,
      };
    });
  }, []);

  const filteredAndSortedRows = useMemo(() => {
    let result = rows.filter((r) => {
      if (activeCategory !== 'ALL' && r.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.shortName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        const cmp = (valA as string).localeCompare(valB as string);
        return sortAsc ? cmp : -cmp;
      }
      if (typeof valA === 'number') {
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }
      return 0;
    });

    return result;
  }, [rows, activeCategory, searchQuery, sortField, sortAsc]);

  const handleSort = (field: keyof MessComparisonRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for counts
    }
  };

  const getSortIcon = (field: keyof MessComparisonRow) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="opacity-40" />;
    }
    return sortAsc ? <ArrowUp size={12} className="text-saffron" /> : <ArrowDown size={12} className="text-saffron" />;
  };

  return (
    <div className="bg-bg-raised border-2 border-ink rounded-xl p-6 space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-ink/20">
        <div>
          <div className="font-mono text-[14px] font-bold uppercase tracking-wider text-ink-muted">
            Cross-campus comparison
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-wide mt-1">
            Mess comparison (19 messes)
          </h2>
          <p className="font-serif text-[15px] text-ink-muted">
            Live queues, wait forecasts, and plate wastage across all hostel clusters.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mess name..."
            className="w-full pl-9 pr-3 py-2 text-[14px] font-mono bg-bg border-2 border-ink rounded-lg text-ink focus:outline-none"
          />
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[14px] font-mono">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`px-4 py-2.5 min-h-[48px] flex items-center justify-center rounded-lg border-2 font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.key
                ? 'bg-ink text-bg border-ink'
                : 'bg-bg text-ink border-ink hover:bg-ink/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SORTABLE TABLE ── */}
      <div className="overflow-x-auto border-2 border-ink rounded-xl bg-bg-raised">
        <table className="w-full text-left font-mono text-[14px] border-collapse">
          <thead>
            <tr className="bg-ink/10 border-b-2 border-ink text-[14px] font-bold uppercase text-ink">
              <th className="p-3 cursor-pointer select-none hover:bg-ink/15" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Mess Name</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-ink/15" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  {getSortIcon('category')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-ink/15 text-right" onClick={() => handleSort('liveQueue')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Queue Now</span>
                  {getSortIcon('liveQueue')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-ink/15 text-right" onClick={() => handleSort('waitMax')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Est. Wait</span>
                  {getSortIcon('waitMax')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-ink/15 text-right" onClick={() => handleSort('expectedPlates')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Plates</span>
                  {getSortIcon('expectedPlates')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-ink/15 text-right" onClick={() => handleSort('wastePct')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Waste %</span>
                  {getSortIcon('wastePct')}
                </div>
              </th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-ink/15">
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-ink-muted italic">
                  No messes found matching current category filter.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((r) => (
                <tr key={r.id} className="hover:bg-ink/5 transition-colors">
                  {/* Mess Name */}
                  <td className="p-3 font-bold text-ink">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-curry-leaf shrink-0" />
                      <span>{r.name}</span>
                    </div>
                  </td>

                  {/* Category & Zone */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[14px] uppercase font-bold bg-bg border border-ink/40 px-2 py-0.5 rounded text-ink">
                        {r.category.replace('_', ' ')}
                      </span>
                      {r.zone && (
                        <span className="text-[14px] uppercase font-bold border border-ink/30 px-1.5 py-0.5 rounded text-ink-muted">
                          {r.zone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Live Queue */}
                  <td className="p-3 text-right font-bold">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[14px] border ${
                        r.liveQueue > 25
                          ? 'border-chilli text-chilli bg-chilli/10'
                          : r.liveQueue > 14
                          ? 'border-ink text-ink bg-ink/10'
                          : 'border-curry-leaf text-curry-leaf bg-curry-leaf/10'
                      }`}
                    >
                      {r.liveQueue} in line
                    </span>
                  </td>

                  {/* Est. Wait */}
                  <td className="p-3 text-right font-bold text-ink">
                    {r.waitMin}–{r.waitMax} min
                  </td>

                  {/* Plates Expected */}
                  <td className="p-3 text-right font-mono font-bold text-ink">
                    {r.expectedPlates}
                  </td>

                  {/* Waste % */}
                  <td className="p-3 text-right font-mono font-bold text-ink">
                    {r.wastePct}%
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center">
                    <span className="text-[14px] font-mono uppercase border border-ink/40 px-2 py-0.5 rounded font-bold text-ink">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER NOTE ── */}
      <div className="flex items-center justify-between text-[14px] font-mono text-ink-muted pt-1">
        <span>Showing {filteredAndSortedRows.length} of {rows.length} messes</span>
        <span>Simulated queue telemetry</span>
      </div>
    </div>
  );
}

export default CompareMessesTable;
