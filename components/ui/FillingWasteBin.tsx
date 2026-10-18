'use client';

import React from 'react';

interface FillingWasteBinProps {
  currentKg: number;
}

export function FillingWasteBin({ currentKg }: FillingWasteBinProps) {
  const maxCap = 80;
  const fillPct = Math.min(100, Math.max(10, Math.round((currentKg / maxCap) * 100)));

  return (
    <div className="flex items-center gap-3 p-3 bg-bg-raised border-2 border-ink rounded-xl">
      {/* Waste Bin Graphic */}
      <div className="relative w-8 h-10 bg-bg border-2 border-ink rounded-b-md overflow-hidden flex flex-col justify-end">
        {/* Fill level */}
        <div
          className="w-full bg-[#D7312B] transition-all duration-300"
          style={{ height: `${fillPct}%` }}
        />
        {/* Rim */}
        <div className="absolute top-0 inset-x-0 h-1 bg-ink" />
      </div>

      <div>
        <span className="font-mono text-[14px] font-bold uppercase text-ink-muted block">
          Total scrap
        </span>
        <span className="font-display text-2xl font-black text-ink leading-none">
          {currentKg} kg
        </span>
      </div>
    </div>
  );
}
