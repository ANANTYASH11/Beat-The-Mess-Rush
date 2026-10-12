'use client';

import React from 'react';

interface StatProps {
  value: string | number;
  label: string;
  className?: string;
}

export function Stat({ value, label, className = '' }: StatProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="font-mono text-3xl sm:text-2xl font-semibold text-ink tracking-tight">
        {value}
      </div>
      <div className="text-sm text-ink-muted mt-1">{label}</div>
    </div>
  );
}
