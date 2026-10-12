'use client';

import React from 'react';

interface LoadBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function LoadBar({ value, max = 100, className = '', size = 'sm' }: LoadBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Determine color based on percentage
  let colorClass = 'bg-muted-green';
  if (percentage > 70) {
    colorClass = 'bg-muted-red';
  } else if (percentage > 40) {
    colorClass = 'bg-saffron';
  }

  const heightClass = size === 'sm' ? 'h-1' : 'h-2';

  return (
    <div
      className={`w-full bg-warm-grey-200 rounded-full overflow-hidden ${heightClass} ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
