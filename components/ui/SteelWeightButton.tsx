'use client';

import React from 'react';

interface SteelWeightButtonProps {
  kg: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SteelWeightButton({ kg, isSelected, onClick }: SteelWeightButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-9 h-9 rounded-lg border-2 font-mono text-xs font-black transition-all flex flex-col items-center justify-center leading-none ${
        isSelected
          ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs scale-105'
          : 'bg-[#EAE1CA] text-[#423933] border-[#14110F]/60 hover:bg-[#DCD0B5] hover:border-[#14110F]'
      }`}
      title={`Record ${kg} kg`}
    >
      <span>{kg}</span>
      <span className="text-[8px] opacity-75">kg</span>
    </button>
  );
}
