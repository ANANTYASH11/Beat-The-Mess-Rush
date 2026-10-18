'use client';

import React from 'react';

interface KitchenScaleDialProps {
  score?: number; // 0 to 100
  label?: string;
  sublabel?: string;
}

export function KitchenScaleDial({ score = 70, label = 'Moderate Confidence', sublabel }: KitchenScaleDialProps) {
  const rotation = Math.min(180, Math.max(0, (score / 100) * 180)) - 90; // -90 to +90 deg

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center select-none">
      {/* Dial Face */}
      <div className="relative w-36 h-24 overflow-hidden flex items-end justify-center">
        {/* Arc Track */}
        <svg viewBox="0 0 140 80" className="w-36 h-20">
          <path
            d="M 15 75 A 55 55 0 0 1 125 75"
            fill="none"
            stroke="#D4CEC5"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 15 75 A 55 55 0 0 1 125 75"
            fill="none"
            stroke="#F28C1B"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="172"
            strokeDashoffset={172 - (score / 100) * 172}
          />
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-1 w-1.5 h-14 bg-[#14110F] origin-bottom rounded-full transition-transform duration-500 shadow-sm"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        {/* Centre Pivot */}
        <div className="absolute bottom-0 w-5 h-5 rounded-full bg-[#14110F] border-2 border-[#FAF5E8] shadow" />
      </div>

      <div className="font-display text-lg font-black text-[#14110F] uppercase mt-2 tracking-wide leading-tight">
        {label}
      </div>
      {sublabel && (
        <p className="font-serif text-[11px] text-[#5C554F] max-w-[200px] mt-0.5 leading-snug">
          {sublabel}
        </p>
      )}
    </div>
  );
}
