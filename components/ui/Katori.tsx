'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type PortionSize = 'Small' | 'Regular' | 'Large';

export interface KatoriProps {
  portion: PortionSize;
  selected: boolean;
  onSelect?: (p: PortionSize) => void;
  onClick?: () => void;
  sublabel?: string;
  cal?: string;
}

export function Katori({
  portion,
  selected,
  onSelect,
  onClick,
  sublabel,
  cal,
}: KatoriProps) {
  const handleClick = () => {
    if (onSelect) onSelect(portion);
    if (onClick) onClick();
  };

  // Portion metadata
  const meta = {
    Small: {
      fillPercent: 38,
      title: 'Small Bowl',
      desc: '1 Katori Dal + 1 Roti',
      cal: cal || '320 kcal • Light bite',
      bowlScale: 0.88,
    },
    Regular: {
      fillPercent: 68,
      title: 'Standard Thali',
      desc: '2 Roti + Sabzi + Rice + Dal',
      cal: cal || '650 kcal • Balanced',
      bowlScale: 1.0,
    },
    Large: {
      fillPercent: 96,
      title: 'Full Portion',
      desc: '3 Roti + Double Rice + Dal',
      cal: cal || '920 kcal • Heavy hunger',
      bowlScale: 1.1,
    },
  }[portion];

  const fillHeight = selected ? meta.fillPercent : 16;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className={`relative w-full text-left p-4 sm:p-5 rounded-2xl border-[3px] transition-all flex flex-col justify-between select-none ${
        selected
          ? 'bg-[#FAF5E8] dark:bg-[#221D18] border-[#14110F] dark:border-[#F4ECD8] shadow-offset-md -translate-y-1 ring-2 ring-[#F28C1B]'
          : 'bg-[#F4ECD8] dark:bg-[#1A1613] border-[#14110F]/80 dark:border-[#F4ECD8]/40 hover:-translate-y-0.5 hover:shadow-offset-xs opacity-90 hover:opacity-100'
      }`}
    >
      {/* Selection Stamp Tag */}
      {selected && (
        <span className="absolute top-3 right-3 font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#F28C1B] text-[#14110F] border border-[#14110F] rounded">
          SELECTED
        </span>
      )}

      {/* Illustrated Bowl (Matte Black with Brass Rim) */}
      <div className="w-full flex items-center justify-center py-3 relative min-h-[100px]">
        {/* Steam Wisps when selected */}
        {selected && (
          <div className="absolute top-0 inset-x-0 flex justify-center gap-2 pointer-events-none">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 0.7, 0], y: [-2, -14] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
              className="text-[#B8893A] font-serif text-xs font-bold"
            >
              ~
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 0.8, 0], y: [-2, -16] }}
              transition={{ repeat: Infinity, duration: 2.1, delay: 0.4, ease: 'easeOut' }}
              className="text-[#DFB76C] font-serif text-sm font-bold"
            >
              ~
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 0.6, 0], y: [-2, -12] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: 0.8, ease: 'easeOut' }}
              className="text-[#B8893A] font-serif text-xs font-bold"
            >
              ~
            </motion.span>
          </div>
        )}

        {/* SVG Matte Black Bowl with Brass Rim */}
        <svg
          viewBox="0 0 120 80"
          className="w-24 sm:w-28 h-18 sm:h-20 drop-shadow-md transition-transform duration-300"
          style={{ transform: `scale(${meta.bowlScale})` }}
        >
          <defs>
            {/* Matte Black cast iron gradient */}
            <linearGradient id={`matteBlack-${portion}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#25211B" />
              <stop offset="50%" stopColor="#17140F" />
              <stop offset="100%" stopColor="#0E0C09" />
            </linearGradient>

            {/* Brushed Brass Rim Gradient */}
            <linearGradient id={`brassRim-${portion}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8F6522" />
              <stop offset="25%" stopColor="#DFB76C" />
              <stop offset="50%" stopColor="#F5D78E" />
              <stop offset="75%" stopColor="#B8893A" />
              <stop offset="100%" stopColor="#7A5217" />
            </linearGradient>

            {/* Rich Food Fill (Golden Spiced Dal / Ghee texture) */}
            <linearGradient id={`foodGradient-${portion}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>

            {/* Inner Bowl Clip Path */}
            <clipPath id={`bowlClip-${portion}`}>
              <path d="M 12 28 C 14 56, 30 72, 60 72 C 90 72, 106 56, 108 28 Z" />
            </clipPath>
          </defs>

          {/* Cast Iron Outer Shell */}
          <path
            d="M 10 26 C 12 60, 28 75, 60 75 C 92 75, 108 60, 110 26 Z"
            fill={`url(#matteBlack-${portion})`}
            stroke="#14110F"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Bowl Base Stand (Foot Ring) */}
          <ellipse
            cx="60"
            cy="74"
            rx="24"
            ry="4"
            fill="#14110F"
          />

          {/* Inner Bowl Cavity with Filling Food */}
          <g clipPath={`url(#bowlClip-${portion})`}>
            {/* Dark Bowl Interior */}
            <rect x="0" y="0" width="120" height="80" fill="#17140F" />

            {/* Food Fill Layer (Visibly rises on selection) */}
            <rect
              x="8"
              y={72 - (fillHeight * 46) / 100}
              width="104"
              height="50"
              fill={`url(#foodGradient-${portion})`}
              className="transition-all duration-500 ease-out"
            />

            {/* Food Surface Curvature & Coriander Garnish when selected */}
            {selected && (
              <>
                {/* Food surface highlight */}
                <ellipse
                  cx="60"
                  cy={72 - (fillHeight * 46) / 100}
                  rx="38"
                  ry="5"
                  fill="#FDE68A"
                  fillOpacity="0.8"
                  className="transition-all duration-500"
                />
                {/* Coriander & Cumin flecks */}
                <circle cx="50" cy={72 - (fillHeight * 46) / 100 + 2} r="1.5" fill="#2F6B3A" />
                <circle cx="68" cy={72 - (fillHeight * 46) / 100 + 1} r="1.5" fill="#2F6B3A" />
                <circle cx="58" cy={72 - (fillHeight * 46) / 100 + 3} r="1.2" fill="#D7312B" />
                <circle cx="75" cy={72 - (fillHeight * 46) / 100 + 2} r="1" fill="#78350F" />
              </>
            )}
          </g>

          {/* Brushed Brass Rolled Outer Rim */}
          <ellipse
            cx="60"
            cy="26"
            rx="50"
            ry="7.5"
            fill="none"
            stroke={`url(#brassRim-${portion})`}
            strokeWidth="3.5"
          />

          {/* Inner Brass Rim Highlight */}
          <ellipse
            cx="60"
            cy="26"
            rx="48"
            ry="6"
            fill="none"
            stroke="#14110F"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
        </svg>
      </div>

      {/* Portion Information */}
      <div className="space-y-1 pt-2 border-t-2 border-[#14110F]/15 dark:border-[#F4ECD8]/20">
        <div className="flex items-baseline justify-between">
          <span className="font-mono font-black text-base text-[#14110F] dark:text-[#F4ECD8] uppercase tracking-wide">
            {portion}
          </span>
          <span className="font-mono text-[10px] font-bold text-[#F28C1B]">
            {fillHeight}% Fill
          </span>
        </div>
        <p className="font-serif text-xs text-[#5C554F] dark:text-[#B8B0A2] leading-tight">
          {sublabel || meta.desc}
        </p>
        <div className="font-mono text-[10px] text-[#8E857C] dark:text-[#8E857C] pt-0.5">
          {meta.cal}
        </div>
      </div>
    </button>
  );
}

export default Katori;
