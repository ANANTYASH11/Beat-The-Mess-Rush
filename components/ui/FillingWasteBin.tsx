'use client';

import React from 'react';

interface FillingWasteBinProps {
  currentKg: number;
}

export function FillingWasteBin({ currentKg }: FillingWasteBinProps) {
  const maxCap = 80;
  const fillPct = Math.min(100, Math.max(10, Math.round((currentKg / maxCap) * 100)));

  return (
    <div className="flex items-center gap-3 p-3 bg-[#FAF5E8] border-2 border-[#14110F] rounded-xl shadow-brutal-xs">
      {/* Waste Bin Graphic */}
      <div className="relative w-9 h-12 bg-[#D4CEC5] border-2 border-[#14110F] rounded-b-md overflow-hidden flex flex-col justify-end">
        {/* Fill level */}
        <div
          className="w-full bg-[#D7312B] transition-all duration-300"
          style={{ height: `${fillPct}%` }}
        />
        {/* Rim */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#14110F]" />
      </div>

      <div>
        <span className="font-mono text-[9px] font-black uppercase text-[#5C554F] block">
          LOGGED SCRAP
        </span>
        <span className="font-display text-2xl font-black text-[#D7312B] leading-none">
          {currentKg} KG
        </span>
      </div>
    </div>
  );
}
