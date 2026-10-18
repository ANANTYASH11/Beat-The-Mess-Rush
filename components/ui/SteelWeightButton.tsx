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
      className={`min-w-[48px] min-h-[48px] px-2.5 rounded-lg border-2 font-mono text-[14px] font-bold transition-all flex items-center justify-center cursor-pointer ${
        isSelected
          ? 'bg-ink text-bg border-ink'
          : 'bg-bg text-ink border-ink hover:bg-ink/10'
      }`}
      title={`Record ${kg} kg`}
    >
      <span>{kg}kg</span>
    </button>
  );
}
