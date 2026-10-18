'use client';

import React from 'react';

interface UniQLogoProps {
  /** Font size in px for the letters "Uni", default 32 */
  size?: number;
  className?: string;
  huge?: boolean;
  /** Force light cream text for dark containers like footer */
  lightText?: boolean;
}

export function UniQLogo({
  size = 32,
  className = '',
  huge = false,
  lightText = false,
}: UniQLogoProps) {
  // Bebas Neue capital cap height is ~72% of font size.
  // We scale the Q mark proportionally to sit squarely on the baseline and cap height.
  const capHeight = Math.round(size * 0.73);
  const strokeRim = Math.max(1.5, Math.round(size * 0.045));
  const strokeTail = Math.max(2, Math.round(size * 0.07));
  const dotRadius = Math.max(1.5, Math.round(size * 0.08));

  if (huge) {
    return (
      <div
        className={`inline-flex items-center justify-center font-condensed tracking-tighter uppercase leading-[0.72] select-none whitespace-nowrap ${className}`}
      >
        <span className="text-[#221E1A]">Uni</span>
        <span
          className="inline-flex items-center justify-center ml-[0.04em] shrink-0"
          style={{
            width: '0.73em',
            height: '0.73em',
            marginBottom: '0.04em',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            {/* Matte black thali circle */}
            <circle
              cx="48"
              cy="50"
              r="42"
              fill="#1C1814"
              stroke="#2A231C"
              strokeWidth="5"
            />
            {/* Inner rim contour */}
            <circle
              cx="48"
              cy="50"
              r="38"
              fill="none"
              stroke="#15120E"
              strokeWidth="2"
            />
            {/* Central saffron dot */}
            <circle cx="48" cy="50" r="8" fill="#F28C1B" opacity={0.6} />
            {/* Q queue tail */}
            <line
              x1="72"
              y1="74"
              x2="95"
              y2="95"
              stroke="#2A231C"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-baseline font-condensed tracking-wide uppercase select-none whitespace-nowrap leading-none ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      {/* "Uni" in ink #14110F (cream in dark mode or when lightText is set) */}
      <span
        className={`${
          lightText ? 'text-[#F4ECD8]' : 'text-[#14110F] dark:text-[#F4ECD8]'
        } leading-none transition-colors`}
      >
        Uni
      </span>

      {/* "Q" custom SVG thali mark sitting on the same baseline and cap height */}
      <span
        className="inline-flex items-center justify-center ml-[1.5px] shrink-0 align-baseline"
        style={{
          width: `${capHeight}px`,
          height: `${capHeight}px`,
          transform: `translateY(${Math.max(1, Math.round(size * 0.04))}px)`,
        }}
        aria-label="Q"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          role="img"
          aria-hidden="true"
        >
          {/* Matte black thali circle with thin brass rim */}
          <circle
            cx="48"
            cy="50"
            r="42"
            fill="#15120E"
            stroke="#B8893A"
            strokeWidth="5"
          />
          {/* Inner subtle rim shadow */}
          <circle
            cx="48"
            cy="50"
            r="38"
            fill="none"
            stroke="#221E19"
            strokeWidth="1.5"
          />
          {/* Small saffron dot inside */}
          <circle cx="48" cy="50" r="7.5" fill="#F28C1B" />
          {/* Q's tail: short brass line (queue tail) */}
          <line
            x1="72"
            y1="74"
            x2="95"
            y2="95"
            stroke="#B8893A"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </div>
  );
}

export default UniQLogo;
