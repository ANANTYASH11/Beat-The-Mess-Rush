'use client';

import React from 'react';

interface MarqueeProps {
  items: string[];
  className?: string;
}

export function Marquee({ items, className = '' }: MarqueeProps) {
  const content = items.join('  ★  ');

  return (
    <div
      className={`relative w-full overflow-hidden bg-saffron text-ink border-b-2 border-ink py-2.5 sm:py-3 font-mono text-xs sm:text-sm font-bold tracking-wider uppercase select-none group ${className}`}
      style={{
        backgroundColor: '#F28C1B',
        color: '#14110F',
      }}
    >
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: '40s',
        }}
      >
        <span className="whitespace-nowrap px-4">{content}  ★  {content}</span>
        <span className="whitespace-nowrap px-4">{content}  ★  {content}</span>
      </div>
    </div>
  );
}

export default Marquee;
