'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ChevronDown, Check, X, Lock } from 'lucide-react';
import { university, MessConfig } from '@/config/university';
import { useSelectedMess } from '@/hooks/useSelectedMess';

interface MessSelectorProps {
  currentMessCode?: string;
  onMessChange?: (mess: MessConfig) => void;
  className?: string;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  CENTRAL: { label: 'Central Messes', icon: '🏛️' },
  BOYS_HOSTEL: { label: 'Boys Hostel Messes', icon: '👦' },
  BOYS_STUDIO: { label: 'Boys Studio Messes', icon: '🏢' },
  GIRLS_HOSTEL: { label: 'Girls Hostel Messes', icon: '👧' },
  GIRLS_STUDIO: { label: 'Girls Studio Messes', icon: '🌸' },
};

const CATEGORY_ORDER = ['CENTRAL', 'BOYS_HOSTEL', 'BOYS_STUDIO', 'GIRLS_HOSTEL', 'GIRLS_STUDIO'];

export function MessSelector({ onMessChange, className = '' }: MessSelectorProps) {
  const { messId, mess: selectedMess, setMess, isLocked, isChanging, shortName } = useSelectedMess();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown if locked
  useEffect(() => {
    if (isLocked && isOpen) {
      setIsOpen(false);
    }
  }, [isLocked, isOpen]);

  // Click outside to close (desktop)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (targetMess: MessConfig) => {
    if (isLocked || isChanging) return;
    setMess(targetMess.id);
    setIsOpen(false);
    setSearchQuery('');
    onMessChange?.(targetMess);
  };

  // Grouped & filtered messes
  const filteredMesses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return university.messes.filter((m) => {
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.shortName.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.zone && m.zone.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  const groupedMesses = useMemo(() => {
    const groups: Record<string, MessConfig[]> = {};
    for (const cat of CATEGORY_ORDER) {
      groups[cat] = [];
    }
    for (const m of filteredMesses) {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    }
    return groups;
  }, [filteredMesses]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* ── NAV BUTTON: Short Name Only, Never Wraps, 40px Height, 300ms Disabled on Change ── */}
      <button
        type="button"
        id="nav-mess-selector-btn"
        disabled={isLocked || isChanging}
        onClick={() => {
          if (!isLocked && !isChanging) setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={
          isLocked
            ? `Assigned to: ${selectedMess.name} (locked)`
            : isChanging
            ? 'Switching mess…'
            : `Selected mess: ${selectedMess.name}`
        }
        className={`min-h-[48px] px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-[14px] font-mono font-bold bg-bg-raised border-2 border-ink shadow-offset-sm whitespace-nowrap transition-all flex-shrink-0 ${
          isLocked
            ? 'opacity-80 cursor-not-allowed bg-ink/5'
            : isChanging
            ? 'opacity-60 cursor-wait'
            : 'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer'
        }`}
      >
        {isLocked ? (
          <Lock size={14} className="text-ink-muted shrink-0" />
        ) : (
          <span
            className={`w-2 h-2 rounded-full bg-curry-leaf shrink-0 ${
              isChanging ? 'animate-ping' : 'animate-pulse'
            }`}
          />
        )}
        <span
          id="nav-mess-shortname"
          className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[65px] min-[360px]:max-w-[105px] sm:max-w-[135px]"
        >
          {shortName}
        </span>
        {!isLocked && (
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* ── DESKTOP DROPDOWN (md and above) ── */}
      {isOpen && !isLocked && (
        <div
          id="mess-selector-dropdown"
          className="hidden md:flex flex-col absolute right-0 top-12 w-80 max-h-[520px] bg-bg border-[2.5px] border-ink shadow-offset-md z-[100] rounded-xl overflow-hidden font-mono text-xs animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {/* Header & Search */}
          <div className="p-3 bg-bg-raised border-b-2 border-ink space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-ink">
              <span>SELECT LPU MESS (19 TOTAL)</span>
              <span className="text-[10px] bg-saffron/20 border border-ink/40 text-ink px-1.5 py-0.2 rounded font-bold">
                LPU TENANT
              </span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                ref={searchInputRef}
                type="text"
                id="mess-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, block or group..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-bg border-2 border-ink rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron text-ink placeholder:text-ink-muted/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Grouped Mess List */}
          <div className="overflow-y-auto max-h-[380px] p-2 space-y-3 divide-y divide-ink/10">
            {filteredMesses.length === 0 ? (
              <div className="py-6 text-center text-ink-muted text-xs">
                No mess found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              CATEGORY_ORDER.map((catKey) => {
                const list = groupedMesses[catKey];
                if (!list || list.length === 0) return null;
                const catMeta = CATEGORY_LABELS[catKey] || { label: catKey, icon: '📍' };

                return (
                  <div key={catKey} className="pt-2 first:pt-0 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-ink-muted flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>{catMeta.icon}</span>
                        <span>{catMeta.label}</span>
                      </span>
                      <span className="text-[9px] font-mono opacity-70">({list.length})</span>
                    </div>

                    <div className="space-y-0.5">
                      {list.map((m) => {
                        const isSelected = selectedMess.id === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            data-mess-id={m.id}
                            onClick={() => handleSelect(m)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-saffron text-ink font-bold shadow-xs'
                                : 'hover:bg-bg-raised text-ink'
                            }`}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="truncate text-xs font-semibold">{m.name}</span>
                              <div className="flex items-center gap-1.5 text-[9px] text-ink-muted">
                                {m.zone && (
                                  <span className="border border-ink/20 px-1 rounded uppercase">
                                    {m.zone} Zone
                                  </span>
                                )}
                                {m.dietFlag === 'confirm' ? (
                                  <span className="text-[#D7312B] font-bold">confirm diet</span>
                                ) : (
                                  <span>{m.dietType || 'veg'}</span>
                                )}
                              </div>
                            </div>
                            {isSelected && <Check size={14} className="shrink-0 text-ink stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM SHEET (below md) ── */}
      {isOpen && !isLocked && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs z-[99]"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Sheet */}
          <div
            id="mess-selector-mobile-drawer"
            className="fixed inset-x-0 bottom-0 z-[100] max-h-[82vh] flex flex-col bg-bg border-t-[3px] border-ink shadow-brutal-xl rounded-t-2xl font-mono text-xs animate-in slide-in-from-bottom duration-200"
          >
            {/* Grab Handle */}
            <div className="pt-2.5 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-ink/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="p-4 pt-1 border-b-2 border-ink space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-black text-ink uppercase tracking-wide">
                    SELECT LPU MESS
                  </h3>
                  <p className="font-serif italic text-[11px] text-ink-muted">
                    19 messes across Central, Hostel & Studio dining
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-lg border-2 border-ink bg-bg-raised flex items-center justify-center text-ink cursor-pointer"
                  aria-label="Close selector"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mess name, block or group..."
                  className="w-full pl-9 pr-8 py-2.5 text-[14px] bg-bg-raised border-2 border-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron text-ink placeholder:text-ink-muted/70"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable list of 19 messes grouped */}
            <div className="overflow-y-auto flex-1 p-3 space-y-4 pb-8 divide-y divide-ink/15">
              {filteredMesses.length === 0 ? (
                <div className="py-8 text-center text-ink-muted text-[14px]">
                  No mess found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                CATEGORY_ORDER.map((catKey) => {
                  const list = groupedMesses[catKey];
                  if (!list || list.length === 0) return null;
                  const catMeta = CATEGORY_LABELS[catKey] || { label: catKey, icon: '📍' };

                  return (
                    <div key={catKey} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="px-1 text-[14px] font-black uppercase tracking-wider text-ink-muted flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>{catMeta.icon}</span>
                          <span>{catMeta.label}</span>
                        </span>
                        <span className="text-[14px] font-mono opacity-80 font-bold">
                          {list.length} Messes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        {list.map((m) => {
                          const isSelected = selectedMess.id === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              data-mess-id={m.id}
                              onClick={() => handleSelect(m)}
                              className={`w-full min-h-[48px] text-left p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-saffron text-ink border-ink font-bold shadow-brutal-xs'
                                  : 'bg-bg-raised text-ink border-ink/30 hover:border-ink'
                              }`}
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="font-bold text-[14px] truncate">{m.name}</span>
                                <div className="flex items-center gap-2 text-[14px] text-ink-muted mt-0.5">
                                  <span className="font-mono text-[14px] uppercase tracking-wide">
                                    {m.gender}
                                  </span>
                                  {m.zone && (
                                    <span className="border border-ink/20 px-1 rounded uppercase text-[14px]">
                                      {m.zone}
                                    </span>
                                  )}
                                  {m.dietFlag === 'confirm' ? (
                                    <span className="text-[#D7312B] font-bold text-[14px]">Confirm Diet</span>
                                  ) : (
                                    <span className="text-[14px]">{m.dietType || 'Veg'}</span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-7 h-7 rounded-full bg-ink text-bg flex items-center justify-center shrink-0">
                                  <Check size={16} className="stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessSelector;
