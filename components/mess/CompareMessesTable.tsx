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
    <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-5 sm:p-7 shadow-brutal-lg space-y-5">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-[#14110F]/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-[#14110F] text-[#FAF5E8] px-2.5 py-0.5 rounded">
              PLATFORM AUDIT VIEW
            </span>
            <span className="text-[10px] font-mono bg-saffron/20 border border-ink/40 text-ink px-2 py-0.5 rounded font-bold">
              MESS COMMITTEE &amp; COUNCIL
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-[#14110F] uppercase tracking-wide mt-1">
            CROSS-CAMPUS MESS COMPARISON (19 MESSES)
          </h2>
          <p className="font-serif italic text-xs text-[#5C554F]">
            Sort and inspect live queues, wait forecasts, and plate wastage across all hostel clusters.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C554F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mess name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-[#FAF5E8] border-2 border-[#14110F] rounded-lg text-[#14110F] focus:outline-none focus:ring-1 focus:ring-saffron"
          />
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`px-3 py-1.5 rounded-lg border-2 font-bold whitespace-nowrap transition-all ${
              activeCategory === tab.key
                ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs'
                : 'bg-[#FAF5E8] text-[#5C554F] border-[#14110F]/40 hover:border-[#14110F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SORTABLE TABLE ── */}
      <div className="overflow-x-auto border-2 border-[#14110F] rounded-xl bg-[#FAF5E8]">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#E8DFC7] border-b-2 border-[#14110F] text-[11px] font-black uppercase text-[#14110F]">
              <th className="p-3 cursor-pointer select-none hover:bg-[#DDD2B5]" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Mess Name</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-[#DDD2B5]" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  {getSortIcon('category')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-[#DDD2B5] text-right" onClick={() => handleSort('liveQueue')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Queue Now</span>
                  {getSortIcon('liveQueue')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-[#DDD2B5] text-right" onClick={() => handleSort('waitMax')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Est. Wait</span>
                  {getSortIcon('waitMax')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-[#DDD2B5] text-right" onClick={() => handleSort('expectedPlates')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Plates Expected</span>
                  {getSortIcon('expectedPlates')}
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none hover:bg-[#DDD2B5] text-right" onClick={() => handleSort('wastePct')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Waste %</span>
                  {getSortIcon('wastePct')}
                </div>
              </th>
              <th className="p-3 text-center">Data Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#14110F]/15">
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#5C554F] italic">
                  No messes found matching current category filter.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((r, i) => (
                <tr key={r.id} className="hover:bg-[#EAE1CA] transition-colors">
                  {/* Mess Name */}
                  <td className="p-3 font-bold text-[#14110F]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-curry-leaf shrink-0" />
                      <span>{r.name}</span>
                    </div>
                  </td>

                  {/* Category & Zone */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold bg-[#FAF5E8] border border-[#14110F]/30 px-1.5 py-0.5 rounded">
                        {r.category.replace('_', ' ')}
                      </span>
                      {r.zone && (
                        <span className="text-[9px] uppercase font-bold bg-saffron/20 border border-ink/30 px-1 py-0.2 rounded">
                          {r.zone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Live Queue */}
                  <td className="p-3 text-right font-black">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-xs ${
                        r.liveQueue > 25
                          ? 'bg-[#D7312B]/15 text-[#D7312B] border border-[#D7312B]'
                          : r.liveQueue > 14
                          ? 'bg-[#F28C1B]/20 text-[#B25900] border border-[#F28C1B]'
                          : 'bg-[#2F6B3A]/15 text-[#2F6B3A] border border-[#2F6B3A]'
                      }`}
                    >
                      {r.liveQueue} in line
                    </span>
                  </td>

                  {/* Est. Wait */}
                  <td className="p-3 text-right font-bold text-[#14110F]">
                    {r.waitMin}-{r.waitMax} min
                  </td>

                  {/* Plates Expected */}
                  <td className="p-3 text-right font-mono font-bold text-[#14110F]">
                    {r.expectedPlates}
                  </td>

                  {/* Waste % */}
                  <td className="p-3 text-right font-mono font-bold text-[#D7312B]">
                    ~{r.wastePct}%
                  </td>

                  {/* Data Health */}
                  <td className="p-3 text-center">
                    <span className="text-[9px] font-mono uppercase bg-[#F28C1B]/15 text-[#14110F] border border-[#F28C1B] px-1.5 py-0.5 rounded font-bold">
                      Unverified details
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER NOTE ── */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#5C554F] pt-1">
        <span>Showing {filteredAndSortedRows.length} of {rows.length} messes</span>
        <span className="italic">All live queue counts &amp; plate forecasts are marked SIMULATED until mess office verification</span>
      </div>
    </div>
  );
}

export default CompareMessesTable;
