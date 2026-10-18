'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { university } from '@/config/university';

export interface SplitFlapProps {
  messLabel?: string;
  queueCount?: number;
  waitRange?: string;
  crowdStatus?: string;
  className?: string;
  soundEnabled?: boolean;
  rows?: [string, string];
}

const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-| ';
const TOTAL_COLS = 32;

// Soft mechanical flap click using Web Audio API
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
  } catch {
    // Ignore audio context restrictions
  }
}

// Single mechanical split-flap cell
function FlapChar({
  targetChar,
  delayMs,
  soundEnabled,
  charColorClass = 'text-[#F4ECD8]',
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
            }, 35);
          }, 35);
        }
      };

      runCycle();
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [targetChar, isBoardInView, delayMs, soundEnabled]);

  const isSeparator = targetChar === '|';

  let topTransform = 'rotateX(0deg)';
  let bottomTransform = 'rotateX(0deg)';
  let flapOpacity = 1;

  if (isFlippingTop) {
    topTransform = 'rotateX(-90deg)';
    flapOpacity = 0.5;
  } else if (isFlippingBottom) {
    bottomTransform = 'rotateX(0deg)';
    flapOpacity = 1;
  }

  return (
    <span
      className={`relative flex items-center justify-center bg-[#1C1917] ${
        isSeparator ? 'text-[#F2B705]' : charColorClass
      } border border-black/70 font-mono font-bold select-none shadow-[0px_1px_0px_#000000] overflow-hidden min-w-0 w-full rounded-[1px]`}
      style={{
        aspectRatio: '1 / 1.45',
        maxHeight: '36px',
        fontSize: 'clamp(7px, 1.35vw, 14px)',
        perspective: '400px',
        transformStyle: 'preserve-3d',
        lineHeight: 1,
      }}
    >
      {/* Horizontal split seam */}
      <span className="absolute inset-x-0 top-1/2 h-[1px] bg-[#0A0908] z-20 pointer-events-none" />

      {/* Top half metallic highlight */}
      <span className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] z-10 pointer-events-none" />

      {/* Animated character face */}
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

// Abbreviate mess name only when needed so it fits cleanly
function formatMessBoardLabel(label: string): string {
  const clean = (label || '').trim().toUpperCase();
  if (clean.length <= 16) return clean;
  return clean
    .replace(/CENTRAL MESS /g, 'C ')
    .replace(/CENTRAL /g, 'C ')
    .replace(/BOYS HOSTEL MESS /g, 'BH ')
    .replace(/BOYS HOSTEL /g, 'BH ')
    .replace(/GIRLS HOSTEL MESS /g, 'GH ')
    .replace(/GIRLS HOSTEL /g, 'GH ')
    .replace(/BOYS STUDIO /g, 'BS ')
    .replace(/GIRLS STUDIO /g, 'GS ');
}

// Center string into a fixed column count
function padRowToCols(text: string, totalCols: number): string {
  const clean = text.trim();
  if (clean.length >= totalCols) return clean.slice(0, totalCols);
  const leftPad = Math.floor((totalCols - clean.length) / 2);
  const rightPad = totalCols - clean.length - leftPad;
  return ' '.repeat(leftPad) + clean + ' '.repeat(rightPad);
}

export function SplitFlap({
  messLabel = university.messes[0]?.shortName.toUpperCase() || 'CENTRAL NORTH',
  queueCount = 20,
  waitRange = '6-11 MIN',
  crowdStatus = 'BUSY',
  className = '',
  soundEnabled: initialSound = false,
  rows,
}: SplitFlapProps) {
  const [soundOn, setSoundOn] = useState(initialSound);
  const [inView, setInView] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (boardRef.current) {
      observer.observe(boardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const normalizedStatus = crowdStatus.toUpperCase();

  const getStatusColor = (status: string) => {
    if (status.includes('LOW')) return 'text-[#58B971]';
    if (status.includes('MED')) return 'text-[#F2B705]';
    return 'text-[#D7312B]';
  };

  const statusColorClass = getStatusColor(normalizedStatus);

  // Compute Row 1 and Row 2 per specification:
  // Row 1: "CENTRAL SOUTH" (abbreviated only if needed: "C SOUTH")
  // Row 2: "QUEUE 20 | WAIT 6-11 MIN | BUSY"
  const rawRow1 = rows?.[0] || formatMessBoardLabel(messLabel);
  const rawRow2 =
    rows?.[1] ||
    `QUEUE ${queueCount} | WAIT ${waitRange.toUpperCase()} | ${normalizedStatus}`;

  const row1Text = padRowToCols(rawRow1, TOTAL_COLS);
  const row2Text = padRowToCols(rawRow2, TOTAL_COLS);

  const renderRow = (text: string, baseIndex: number, defaultColor = 'text-[#F4ECD8]') => {
    const statusStartIndex = text.indexOf(normalizedStatus);
    const statusEndIndex = statusStartIndex >= 0 ? statusStartIndex + normalizedStatus.length : -1;

    return text.split('').map((ch, idx) => {
      let colorClass = defaultColor;
      if (statusStartIndex >= 0 && idx >= statusStartIndex && idx < statusEndIndex) {
        colorClass = statusColorClass;
      }

      return (
        <FlapChar
          key={`${baseIndex}-${idx}`}
          targetChar={ch}
          delayMs={(baseIndex + idx) * 20}
          soundEnabled={soundOn}
          charColorClass={colorClass}
          isBoardInView={inView}
        />
      );
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {/* ── MECHANICAL CHASSIS (Deep ink enclosure with brass bezel accent) ── */}
      <section
        ref={boardRef}
        className="w-full bg-[#14110F] dark:bg-[#120F0D] border-2 border-ink rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-offset-md select-none relative overflow-hidden"
        role="status"
        aria-live="polite"
      >
        <div className="w-full flex flex-col items-center gap-1.5 sm:gap-3">
          {/* Subtle top board tag */}
          <div className="font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-[#8E857C] text-center">
            UNIQ LIVE COUNTER STATUS
          </div>

          {/* ── ROW 1: MESS SHORT NAME (Fixed 32 columns, zero overflow) ── */}
          <div
            className="w-full grid gap-[1px]"
            style={{
              gridTemplateColumns: `repeat(${TOTAL_COLS}, minmax(0, 1fr))`,
            }}
          >
            {renderRow(row1Text, 0, 'text-[#F4ECD8]')}
          </div>

          {/* ── ROW 2: QUEUE 20 | WAIT 6-11 MIN | BUSY (Fixed 32 columns, zero overflow) ── */}
          <div
            className="w-full grid gap-[1px]"
            style={{
              gridTemplateColumns: `repeat(${TOTAL_COLS}, minmax(0, 1fr))`,
            }}
          >
            {renderRow(row2Text, row1Text.length + 2)}
          </div>
        </div>
      </section>

      {/* ── MUTE / SOUND TOGGLE: Positioned below board, right-aligned, zero overlapping ── */}
      <div className="flex justify-end items-center mt-2 px-1">
        <button
          type="button"
          onClick={() => setSoundOn(!soundOn)}
          title={soundOn ? 'Click sound enabled (click to mute)' : 'Click sound muted (click to enable)'}
          aria-label={soundOn ? 'Mute split-flap sound' : 'Enable split-flap sound'}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-ink-muted hover:text-ink bg-bg-raised border border-ink/40 rounded-lg shadow-offset-xs transition-colors"
        >
          {soundOn ? <Volume2 size={13} className="text-saffron" /> : <VolumeX size={13} />}
          <span>{soundOn ? 'FLAP SOUND: ON' : 'FLAP SOUND: MUTED'}</span>
        </button>
      </div>
    </div>
  );
}

export { SplitFlap as SplitFlapBoard };
export default SplitFlap;
