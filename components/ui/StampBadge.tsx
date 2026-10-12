'use client';

import React from 'react';

interface StampBadgeProps {
  children: React.ReactNode;
  variant?: 'saffron' | 'chilli' | 'curry' | 'ink' | 'turmeric';
  rotate?: boolean;
  className?: string;
}

export function StampBadge({
  children,
  variant = 'saffron',
  rotate = true,
  className = '',
}: StampBadgeProps) {
  const variantStyles = {
    saffron: 'text-saffron border-saffron bg-saffron/10',
    chilli: 'text-chilli border-chilli bg-chilli/10',
    curry: 'text-curry-leaf border-curry-leaf bg-curry-leaf/10',
    ink: 'text-ink border-ink bg-bg-raised',
    turmeric: 'text-turmeric border-turmeric bg-turmeric/10',
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 border-2 border-dashed font-mono font-bold text-xs uppercase tracking-wider select-none ${
        rotate ? 'rotate-[-2deg]' : ''
      } ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default StampBadge;
