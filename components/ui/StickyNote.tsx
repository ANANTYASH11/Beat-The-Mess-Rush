'use client';

import React from 'react';

interface StickyNoteProps {
  children?: React.ReactNode;
  text?: string;
  subtext?: string;
  color?: string;
  rotate?: string | number;
  className?: string;
}

export function StickyNote({
  children,
  text,
  subtext,
  rotate = '-1.5deg',
  className = '',
}: StickyNoteProps) {
  const rotVal = typeof rotate === 'number' ? `${rotate}deg` : rotate;

  return (
    <div
      style={{ transform: `rotate(${rotVal})` }}
      className={`bg-turmeric/90 text-ink p-3 border-2 border-ink shadow-offset-md font-mono text-xs leading-relaxed select-none ${className}`}
    >
      <div className="w-8 h-1.5 bg-black/10 mx-auto -mt-2 mb-1.5 rounded-sm" />
      {children ? (
        children
      ) : (
        <div>
          <div className="font-bold text-xs">{text}</div>
          {subtext && <div className="text-[10px] opacity-80 mt-0.5">{subtext}</div>}
        </div>
      )}
    </div>
  );
}

export default StickyNote;
