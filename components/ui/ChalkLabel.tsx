'use client';

import React from 'react';

interface ChalkLabelProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ChalkLabel({ children, className = '', size = 'md' }: ChalkLabelProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-block font-mono tracking-wider bg-[#22252A] text-[#F4ECD8] border border-white/20 uppercase font-semibold ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export default ChalkLabel;
