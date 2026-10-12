'use client';

import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'saffron' | 'green' | 'red';
  size?: 'sm' | 'md';
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Pill({
  children,
  variant = 'neutral',
  size = 'md',
  active = false,
  onClick,
  className = '',
}: PillProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-pill transition-all duration-200 select-none';
  
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-sm',
  };

  const variantClasses = {
    neutral: active
      ? 'bg-ink text-bg font-semibold'
      : 'bg-warm-grey-100 text-ink-muted hover:bg-warm-grey-200 hover:text-ink border border-warm-grey-200',
    saffron: active
      ? 'bg-saffron text-white shadow-soft'
      : 'bg-saffron/10 text-saffron hover:bg-saffron/20 border border-saffron/20',
    green: active
      ? 'bg-muted-green text-white'
      : 'bg-muted-green/10 text-muted-green hover:bg-muted-green/20 border border-muted-green/20',
    red: active
      ? 'bg-muted-red text-white'
      : 'bg-muted-red/10 text-muted-red hover:bg-muted-red/20 border border-muted-red/20',
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Component>
  );
}
