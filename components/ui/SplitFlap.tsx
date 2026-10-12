'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SplitFlapProps {
  messLabel?: string;
  queueCount?: number | string;
  waitRange?: string;
  crowdStatus?: string;
  className?: string;
  soundEnabled?: boolean;
}

const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Web Audio API mechanical split-flap click sound (subtle, 18ms duration)
function playSoftFlapClick() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.016);

    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.016);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.018);
  } catch {}
}

// Single 3D Split-Flap Character Tile (at least 56px tall on desktop)
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
      // Cycle through 2 random letters before settling
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
            }, 35);
          }, 35);
        } else {
          // Settle on final targetChar
          setDisplayedChar(targetChar);
          setIsFlippingTop(true);
          if (soundEnabled) playSoftFlapClick();

          setTimeout(() => {
            setIsFlippingTop(false);
            setIsFlippingBottom(true);
            setTimeout(() => {
              setIsFlippingBottom(false);
            }, 40);
          }, 40);
        }
      };

      runCycle();
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [targetChar, isBoardInView, delayMs, soundEnabled]);

  const isSeparator = targetChar === '|';
  const isSpace = targetChar === ' ';

  if (isSpace) {
    return <span className="inline-block w-2 sm:w-3 h-12 sm:h-14" />;
  }

  // 3D rotation transforms strictly using transform and opacity
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
      className={`relative inline-flex items-center justify-center w-6 h-12 sm:w-9 sm:h-14 bg-[#1C1917] ${
        isSeparator ? 'text-[#F2B705]' : charColorClass
      } border border-black/60 font-mono font-bold text-base sm:text-2xl select-none shadow-[1px_2px_0px_#000000] overflow-hidden`}
      style={{
        perspective: '450px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Horizontal split seam */}
      <span className="absolute inset-x-0 top-1/2 h-[1px] bg-[#0A0908] z-20 pointer-events-none" />

      {/* Top half subtle metallic reflection */}
      <span className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04] z-10 pointer-events-none" />

      {/* Animated character face with CSS 3D rotateX and opacity transitions */}
      <span
        className="inline-block transition-all duration-75 ease-in-out will-change-transform"
        style={{
          transform: isFlippingTop ? topTransform : bottomTransform,
          opacity: flapOpacity,
          transformOrigin: '50% 50%',
          backfaceVisibility: 'hidden',
        }}
      >
        {displayedChar}
      </span>
    </span>
  );
}

export function SplitFlap({
  messLabel = 'MESS A',
  queueCount = 20,
  waitRange = '6-11 MIN',
  crowdStatus = 'BUSY',
  className = '',
  soundEnabled: initialSound = false,
}: SplitFlapProps) {
  const [soundOn, setSoundOn] = useState(initialSound);
  const [inView, setInView] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Trigger when scrolled into view
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

  // Status colors: green LOW, turmeric MEDIUM, red BUSY
  const getStatusColor = (status: string) => {
    if (status.includes('LOW')) return 'text-[#2F6B3A]';
    if (status.includes('MED')) return 'text-[#F2B705]';
    return 'text-[#D7312B]'; // BUSY
  };

  const statusColorClass = getStatusColor(normalizedStatus);

  // Cells for modular desktop (1 row) vs mobile (2 rows of 2 cells)
  const cell1 = `${messLabel.toUpperCase()}`;
  const cell2 = `QUEUE ${queueCount}`;
  const cell3 = `WAIT ${waitRange.toUpperCase()}`;
  const cell4 = `STATUS ${normalizedStatus}`;

  // Helper to render an array of characters
  const renderCellChars = (text: string, baseIndex: number, customColor?: string) => {
    return text.split('').map((ch, idx) => (
      <FlapChar
        key={`${baseIndex}-${idx}`}
        targetChar={ch}
        delayMs={(baseIndex + idx) * 40} // 40ms stagger per brief
        soundEnabled={soundOn}
        charColorClass={customColor || 'text-[#F4ECD8]'}
        isBoardInView={inView}
      />
    ));
  };

  return (
    <section
      ref={boardRef}
      className={`w-full bg-[#14110F] border-y-2 border-ink py-4 px-4 sm:px-6 shadow-offset-sm select-none relative ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* ── DESKTOP & TABLET: ONE full width row ── */}
        <div className="hidden md:flex w-full items-center justify-center overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap py-1">
            {/* Cell 1: MESS A */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {renderCellChars(cell1, 0)}
            </div>

            {/* Separator */}
            <div className="px-1">{renderCellChars('|', cell1.length)}</div>

            {/* Cell 2: QUEUE 20 */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {renderCellChars(cell2, cell1.length + 1)}
            </div>

            {/* Separator */}
            <div className="px-1">{renderCellChars('|', cell1.length + cell2.length + 1)}</div>

            {/* Cell 3: WAIT 6-11 MIN */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {renderCellChars(cell3, cell1.length + cell2.length + 2)}
            </div>

            {/* Separator */}
            <div className="px-1">{renderCellChars('|', cell1.length + cell2.length + cell3.length + 2)}</div>

            {/* Cell 4: STATUS BUSY (Colored by status) */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {renderCellChars(cell4, cell1.length + cell2.length + cell3.length + 3, statusColorClass)}
            </div>
          </div>
        </div>

        {/* ── MOBILE (375px): TWO rows of two cells ── */}
        <div className="flex md:hidden w-full flex-col items-center gap-2.5 py-1">
          {/* Row 1: MESS A | QUEUE 20 */}
          <div className="flex items-center gap-1 flex-nowrap">
            <div className="flex items-center gap-0.5">{renderCellChars(cell1, 0)}</div>
            <div className="px-1">{renderCellChars('|', cell1.length)}</div>
            <div className="flex items-center gap-0.5">{renderCellChars(cell2, cell1.length + 1)}</div>
          </div>

          {/* Row 2: WAIT 6-11 MIN | STATUS BUSY */}
          <div className="flex items-center gap-1 flex-nowrap">
            <div className="flex items-center gap-0.5">{renderCellChars(cell3, cell1.length + cell2.length + 2)}</div>
            <div className="px-1">{renderCellChars('|', cell1.length + cell2.length + cell3.length + 2)}</div>
            <div className="flex items-center gap-0.5">
              {renderCellChars(cell4, cell1.length + cell2.length + cell3.length + 3, statusColorClass)}
            </div>
          </div>
        </div>

        {/* Optional soft click sound toggle button (off by default) */}
        <button
          onClick={() => setSoundOn(!soundOn)}
          title={soundOn ? 'Click sound enabled (mute)' : 'Click sound muted (enable)'}
          aria-label={soundOn ? 'Mute split-flap sound' : 'Enable split-flap sound'}
          className="flex-shrink-0 p-2 text-ink-muted hover:text-saffron transition-colors border border-white/10 bg-black/40 text-xs font-mono"
        >
          {soundOn ? <Volume2 size={16} className="text-saffron" /> : <VolumeX size={16} />}
        </button>
      </div>
    </section>
  );
}

export default SplitFlap;
