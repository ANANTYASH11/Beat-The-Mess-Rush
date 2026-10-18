'use client';

import React from 'react';

interface ChalkLabelProps {
  children?: React.ReactNode;
  label?: string;
  value?: string;
  color?: 'saffron' | 'turmeric' | 'curry' | 'chilli' | string;
  sublabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ChalkLabel({
  children,
  label,
  value,
  color = 'saffron',
  sublabel,
  className = '',
  size = 'md',
}: ChalkLabelProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const colorBorderMap: Record<string, string> = {
    saffron: 'border-[#F28C1B] text-[#F28C1B]',
    turmeric: 'border-[#F2B705] text-[#F2B705]',
    curry: 'border-[#2F6B3A] text-[#2F6B3A]',
    chilli: 'border-[#D7312B] text-[#D7312B]',
  };

  if (label || value) {
    const accentClass = colorBorderMap[color] || 'border-white/20 text-[#F4ECD8]';
    return (
      <div className={`inline-flex flex-col bg-[#22252A] border-2 ${accentClass} p-2 rounded font-mono ${className}`}>
        {label && <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider">{label}</span>}
        {value && <span className="text-base font-black text-[#F4ECD8]">{value}</span>}
        {sublabel && <span className="text-[9px] text-[#78716C]">{sublabel}</span>}
      </div>
    );
  }

  return (
    <span
      className={`inline-block font-mono tracking-wider bg-[#22252A] text-[#F4ECD8] border border-white/20 uppercase font-semibold ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export default ChalkLabel;
