'use client';

import React, { useState, useEffect, useRef } from 'react';
import { university } from '@/config/university';

export interface SplitFlapProps {
  messLabel?: string;
  queueCount?: number;
  waitRange?: string;
  crowdStatus?: string;
  className?: string;
  soundEnabled?: boolean;
  text?: string;
  rows?: string[];
}

const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ';
const FIXED_COLS = 16;

function playSoftFlapClick() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.022);

    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.024);
  } catch {}
}

function FlapChar({
  targetChar,
  delayMs,
  soundEnabled,
  charColorClass = 'text-[#FAF5E8]',
  isBoardInView = true,
}: {
  targetChar: string;
  delayMs: number;
  soundEnabled: boolean;
  charColorClass?: string;
  isBoardInView?: boolean;
}) {
  const [displayedChar, setDisplayedChar] = useState(' ');
  const [isFlippingTop, setIsFlippingTop] = useState(false);
  const [isFlippingBottom, setIsFlippingBottom] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isBoardInView) {
      setDisplayedChar(' ');
      return;
    }

    if (displayedChar === targetChar) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      let cycleCount = 0;
      const maxCycles = targetChar === ' ' ? 0 : 2;

      const runCycle = () => {
        if (cycleCount < maxCycles) {
          cycleCount++;
          const rand = RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
          setDisplayedChar(rand);
          setIsFlippingTop(true);
          if (soundEnabled) playSoftFlapClick();

          setTimeout(() => {
            setIsFlippingTop(false);
            setIsFlippingBottom(true);
            setTimeout(() => {
              setIsFlippingBottom(false);
              runCycle();
            }, 30);
          }, 30);
        } else {
          setDisplayedChar(targetChar);
          setIsFlippingTop(true);
          if (soundEnabled) playSoftFlapClick();

          setTimeout(() => {
            setIsFlippingTop(false);
            setIsFlippingBottom(true);
            setTimeout(() => {
              setIsFlippingBottom(false);
            }, 30);
          }, 30);
        }
      };

      runCycle();
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [targetChar, isBoardInView, delayMs, soundEnabled]);

  const topTransform = isFlippingTop ? 'rotateX(-90deg)' : 'rotateX(0deg)';
  const bottomTransform = isFlippingBottom ? 'rotateX(0deg)' : 'rotateX(90deg)';
  const flapOpacity = isFlippingTop || isFlippingBottom ? 0.75 : 1;

  return (
    <span
      className={`relative inline-flex items-center justify-center font-mono font-black select-none overflow-hidden rounded-[2px] transition-transform duration-75 ${charColorClass}`}
      style={{
        aspectRatio: '0.68',
        backgroundColor: '#1E1A17',
        border: '1px solid #332B25',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 1px rgba(0,0,0,0.4)',
        fontSize: 'clamp(14px, 2.2vw, 20px)',
      }}
    >
      <span className="absolute inset-x-0 top-1/2 h-[1px] bg-[#14110F] z-20 pointer-events-none" />
      <span className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] z-10 pointer-events-none" />
      <span
        className="inline-block transition-all duration-75 ease-in-out will-change-transform leading-none"
        style={{
          transform: isFlippingTop ? topTransform : bottomTransform,
          opacity: flapOpacity,
          transformOrigin: '50% 50%',
          backfaceVisibility: 'hidden',
        }}
      >
        {displayedChar === ' ' ? '\u00A0' : displayedChar}
      </span>
    </span>
  );
}

function padRowToCols(text: string, totalCols: number): string {
  const clean = text.trim();
  if (clean.length >= totalCols) return clean.slice(0, totalCols);
  const leftPad = Math.floor((totalCols - clean.length) / 2);
  const rightPad = totalCols - clean.length - leftPad;
  return ' '.repeat(leftPad) + clean + ' '.repeat(rightPad);
}

export function SplitFlap({
  messLabel = 'CENTRAL NORTH',
  queueCount = 18,
  waitRange = '5-8 MIN',
  crowdStatus = 'BUSY',
  className = '',
  soundEnabled = false,
  text,
  rows,
}: SplitFlapProps) {
  const [inView, setInView] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setInView(true);
        });
      },
      { threshold: 0.15 }
    );
    if (boardRef.current) observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  const rawRow = rows && rows.length > 0 ? rows[0] : (text || `QUEUE ${queueCount} - ${crowdStatus.toUpperCase()}`);
  const rowText = padRowToCols(rawRow, FIXED_COLS);

  return (
    <div
      ref={boardRef}
      className={`w-full bg-[#14110F] border-2 border-ink rounded-xl p-3 sm:p-4 select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="w-full grid gap-1 max-w-[420px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${FIXED_COLS}, minmax(0, 1fr))`,
        }}
      >
        {rowText.split('').map((ch, idx) => (
          <FlapChar
            key={idx}
            targetChar={ch}
            delayMs={idx * 25}
            soundEnabled={soundEnabled}
            isBoardInView={inView}
          />
        ))}
      </div>
    </div>
  );
}

export { SplitFlap as SplitFlapBoard };
export default SplitFlap;
