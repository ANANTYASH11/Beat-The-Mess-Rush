'use client';

import React from 'react';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'saffron' | 'curry' | 'chilli' | 'paper';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function TactileButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: TactileButtonProps) {
  const base =
    'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider border-2 border-ink transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs shadow-offset-sm',
    md: 'px-5 py-2.5 text-sm shadow-offset-md hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-offset-sm',
    lg: 'px-7 py-3.5 text-base shadow-offset-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-offset-md',
  };

  const variantClasses = {
    primary: 'bg-saffron text-ink hover:bg-saffron/90',
    saffron: 'bg-saffron text-ink hover:bg-saffron/90',
    secondary: 'bg-bg-raised text-ink hover:bg-warm-grey-100',
    paper: 'bg-bg-raised text-ink hover:bg-warm-grey-100',
    danger: 'bg-chilli text-white hover:bg-chilli/90',
    chilli: 'bg-chilli text-white hover:bg-chilli/90',
    success: 'bg-curry-leaf text-white hover:bg-curry-leaf/90',
    curry: 'bg-curry-leaf text-white hover:bg-curry-leaf/90',
    ghost: 'bg-transparent border-transparent shadow-none hover:bg-ink/5',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default TactileButton;
