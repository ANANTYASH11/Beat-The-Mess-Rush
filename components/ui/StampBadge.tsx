'use client';

import React from 'react';

interface StampBadgeProps {
  children?: React.ReactNode;
  text?: string;
  variant?: 'saffron' | 'chilli' | 'curry' | 'ink' | 'turmeric' | 'green';
  color?: string;
  rotate?: boolean;
  className?: string;
}

export function StampBadge({
  children,
  text,
  variant,
  color,
  rotate = true,
  className = '',
}: StampBadgeProps) {
  const chosenVariant = variant || (color === 'green' ? 'curry' : (color as any)) || 'saffron';

  const variantStyles: Record<string, string> = {
    saffron: 'text-saffron border-saffron bg-saffron/10',
    chilli: 'text-chilli border-chilli bg-chilli/10',
    curry: 'text-curry-leaf border-curry-leaf bg-curry-leaf/10',
    green: 'text-curry-leaf border-curry-leaf bg-curry-leaf/10',
    ink: 'text-ink border-ink bg-bg-raised',
    turmeric: 'text-turmeric border-turmeric bg-turmeric/10',
  };

  const style = variantStyles[chosenVariant] || variantStyles.saffron;

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 border-2 border-dashed font-mono font-bold text-[14px] uppercase tracking-wider select-none ${
        rotate ? 'rotate-[-2deg]' : ''
      } ${style} ${className}`}
    >
      {children || text}
    </span>
  );
}

export default StampBadge;
