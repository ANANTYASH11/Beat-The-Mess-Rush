'use client';

import React from 'react';

interface StickyNoteProps {
  children: React.ReactNode;
  rotate?: string;
  className?: string;
}

export function StickyNote({ children, rotate = '-1.5deg', className = '' }: StickyNoteProps) {
  return (
    <div
      style={{ transform: `rotate(${rotate})` }}
      className={`bg-turmeric/90 text-ink p-4 border-2 border-ink shadow-offset-md font-mono text-xs leading-relaxed select-none ${className}`}
    >
      <div className="w-8 h-2 bg-black/10 mx-auto -mt-3 mb-2 rounded-sm" />
      {children}
    </div>
  );
}

export default StickyNote;
