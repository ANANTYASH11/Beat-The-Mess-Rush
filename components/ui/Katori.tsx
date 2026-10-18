'use client';

import React from 'react';

export type PortionSize = 'Small' | 'Regular' | 'Large';

export interface KatoriProps {
  portion: PortionSize;
  selected: boolean;
  onSelect?: (p: PortionSize) => void;
  onClick?: () => void;
  mealType?: string; // 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'
  fillPercent?: number; // 40, 70, 100
  title?: string;
  sublabel?: string;
  gramsLabel?: string;
  caloriesLabel?: string;
  cal?: string;
}

export function Katori({
  portion,
  selected,
  onSelect,
  onClick,
  mealType = 'Lunch',
  fillPercent: passedFill,
  title,
  sublabel,
  gramsLabel,
  caloriesLabel,
  cal,
}: KatoriProps) {
  const handleClick = () => {
    if (onSelect) onSelect(portion);
    if (onClick) onClick();
  };

  const defaultFill = {
    Small: 40,
    Regular: 70,
    Large: 100,
  }[portion];

  const fillPercent = passedFill ?? defaultFill;

  const bowlScale = {
    Small: 0.9,
    Regular: 1.0,
    Large: 1.1,
  }[portion];

  const normalizedMeal = (mealType || 'Lunch').toLowerCase();

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      data-portion={portion}
      data-fill={fillPercent}
      className={`relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between min-h-[160px] select-none cursor-pointer ${
        selected
          ? 'bg-saffron text-ink border-ink shadow-offset-sm -translate-y-0.5'
          : 'bg-white dark:bg-[#1E1A17] text-ink border-ink hover:-translate-y-0.5 hover:shadow-offset-xs'
      }`}
    >
      {/* Selection Pill */}
      {selected && (
        <span className="absolute top-4 right-4 font-mono text-[14px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-ink text-white rounded border border-ink">
          SELECTED
        </span>
      )}

      {/* ── MEAL-SPECIFIC ILLUSTRATION AREA ── */}
      <div className="w-full flex items-center justify-center py-2 relative min-h-[96px]">
        {/* Steam Wisps when selected */}
        {selected && (
          <div className="absolute top-0 inset-x-0 flex justify-center gap-2 pointer-events-none z-10">
            <span className="text-ink font-serif text-[18px] font-bold opacity-75">
              ~
            </span>
            <span className="text-ink font-serif text-[18px] font-bold opacity-75">
              ~
            </span>
          </div>
        )}

        {/* 1. SNACKS & TEA: DHABA CUTTING CHAI CUP & SNACK PLATE */}
        {normalizedMeal.includes('snack') && (
          <div className="flex items-end justify-center gap-4 py-1">
            {/* Dhaba Snack Plate */}
            <div className="relative flex items-center justify-center">
              <svg width="68" height="42" viewBox="0 0 68 42" className="overflow-visible">
                <ellipse cx="34" cy="24" rx="32" ry="14" fill="#14110F" stroke="#14110F" strokeWidth="2" />
                <ellipse cx="34" cy="23" rx="28" ry="11" fill="#FAF5E8" />
                {portion === 'Small' && (
                  <polygon points="34,16 26,28 42,28" fill="#D97706" stroke="#92400E" strokeWidth="1" />
                )}
                {portion === 'Regular' && (
                  <>
                    <polygon points="30,16 22,28 38,28" fill="#D97706" stroke="#92400E" strokeWidth="1" />
                    <circle cx="42" cy="24" r="3" fill="#15803D" />
                  </>
                )}
                {portion === 'Large' && (
                  <>
                    <polygon points="28,15 20,27 36,27" fill="#D97706" stroke="#92400E" strokeWidth="1" />
                    <polygon points="38,16 30,28 46,28" fill="#F59E0B" stroke="#92400E" strokeWidth="1" />
                    <circle cx="48" cy="25" r="3" fill="#DC2626" />
                  </>
                )}
              </svg>
            </div>

            {/* Cutting Chai Glass with relative fill */}
            <div className="relative flex flex-col items-center">
              <svg width="34" height="54" viewBox="0 0 34 54" className="overflow-visible">
                <defs>
                  <linearGradient id={`chaiGrad-${portion}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C26A20" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                </defs>
                <polygon points="3,4 31,4 27,50 7,50" fill="none" stroke="#14110F" strokeWidth="2" />
                {/* Chai liquid fill */}
                {(() => {
                  const liquidHeight = (fillPercent / 100) * 40;
                  const topY = 48 - liquidHeight;
                  const inset = (liquidHeight / 40) * 2;
                  const leftX = 7 - inset;
                  const rightX = 27 + inset;
                  return (
                    <polygon
                      points={`${leftX},${topY} ${rightX},${topY} 26,49 8,49`}
                      fill={`url(#chaiGrad-${portion})`}
                      opacity="0.9"
                    />
                  );
                })()}
                {/* Fluted glass lines */}
                <line x1="12" y1="8" x2="11" y2="46" stroke="#FAF5E8" strokeWidth="1" strokeOpacity="0.6" />
                <line x1="17" y1="8" x2="17" y2="46" stroke="#FAF5E8" strokeWidth="1.2" strokeOpacity="0.8" />
                <line x1="22" y1="8" x2="23" y2="46" stroke="#FAF5E8" strokeWidth="1" strokeOpacity="0.6" />
                <ellipse cx="17" cy="4" rx="14" ry="3" fill="none" stroke="#14110F" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        )}

        {/* 2. BREAKFAST: DHABA BREAKFAST PLATE */}
        {normalizedMeal.includes('breakfast') && (
          <div className="flex items-center justify-center py-1">
            <svg width="100" height="56" viewBox="0 0 100 56" className="overflow-visible">
              <defs>
                <linearGradient id={`bfPlateGrad-${portion}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14110F" />
                  <stop offset="100%" stopColor="#2A2521" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="32" rx="46" ry="18" fill={`url(#bfPlateGrad-${portion})`} stroke="#14110F" strokeWidth="2" />
              <ellipse cx="50" cy="30" rx="42" ry="15" fill="#FAF5E8" stroke="#14110F" strokeWidth="1.5" />
              {/* Food layer */}
              {(() => {
                const parathaRadiusX = 14 + (fillPercent / 100) * 8;
                const parathaRadiusY = 6 + (fillPercent / 100) * 3;
                return (
                  <ellipse
                    cx="48"
                    cy="30"
                    rx={parathaRadiusX}
                    ry={parathaRadiusY}
                    fill="#D97706"
                    stroke="#92400E"
                    strokeWidth="1.5"
                  />
                );
              })()}
              {portion !== 'Small' && <circle cx="30" cy="27" r="5" fill="#DC2626" opacity="0.85" />}
              {portion === 'Large' && <circle cx="68" cy="27" r="5" fill="#15803D" opacity="0.85" />}
            </svg>
          </div>
        )}

        {/* 3. LUNCH & DINNER: SIGNATURE KATORI BOWL */}
        {!normalizedMeal.includes('snack') && !normalizedMeal.includes('breakfast') && (
          <svg
            width="110"
            height="68"
            viewBox="0 0 120 76"
            className="overflow-visible"
            style={{ transform: `scale(${bowlScale})`, transformOrigin: 'center center' }}
          >
            <defs>
              <linearGradient id={`curryGrad-${portion}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="60%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>

            {/* Bowl Body */}
            <path
              d="M 12 26 C 14 56, 38 72, 60 72 C 82 72, 106 56, 108 26 Z"
              fill="#14110F"
              stroke="#14110F"
              strokeWidth="2"
            />

            {/* Rising Curry/Dal Fill */}
            {(() => {
              const fillY = 70 - (fillPercent * 44) / 100;
              const fillRx = 24 + (fillPercent * 24) / 100;
              const fillRy = 4 + (fillPercent * 5) / 100;

              return (
                <g id={`fill-group-${portion}`}>
                  <path
                    d={`M ${60 - fillRx} ${fillY} C ${60 - fillRx * 0.8} 68, ${60 + fillRx * 0.8} 68, ${60 + fillRx} ${fillY} Z`}
                    fill={`url(#curryGrad-${portion})`}
                  />
                  <ellipse
                    cx="60"
                    cy={fillY}
                    rx={fillRx}
                    ry={fillRy}
                    fill={`url(#curryGrad-${portion})`}
                    stroke="#D97706"
                    strokeWidth="1"
                  />
                </g>
              );
            })()}

            {/* Brass Outer Rim */}
            <ellipse cx="60" cy="26" rx="48" ry="7" fill="none" stroke="#D97706" strokeWidth="2.5" />
          </svg>
        )}
      </div>

      {/* ── PORTION INFORMATION ── */}
      <div className="space-y-1 pt-3 border-t-2 border-ink/20">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[24px] font-black uppercase tracking-wide leading-none">
            {portion}
          </span>
          <span className="font-mono text-[14px] font-bold">
            {fillPercent}% Fill
          </span>
        </div>
        <p className="font-serif text-[18px] leading-snug line-clamp-2">
          {sublabel || title || portion}
        </p>
        <div className="font-mono text-[14px] font-bold opacity-80 pt-1">
          {caloriesLabel || gramsLabel || cal || ''}
        </div>
      </div>
    </button>
  );
}

export default Katori;
