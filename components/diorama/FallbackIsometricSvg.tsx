'use client';

import React from 'react';
import { university } from '@/config/university';

interface FallbackProps {
  queueCount: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  waitTime: string;
}

export function FallbackIsometricSvg({
  queueCount = 18,
  crowdLevel = 'moderate',
  waitTime = '6-11 min',
}: FallbackProps) {
  const lampColor =
    crowdLevel === 'low' ? '#3F7D58' : crowdLevel === 'high' ? '#C8443A' : '#E8871E';

  return (
    <div
      className="relative w-full h-full min-h-[380px] flex items-center justify-center bg-[#ECE6DA] dark:bg-[#1C1A17] rounded-panel overflow-hidden border border-warm-grey-200"
      aria-label={`2D representation of ${university.messes[0].name} with ${queueCount} people in queue, estimated wait ${waitTime}`}
    >
      <svg
        viewBox="0 0 600 400"
        className="w-full h-full max-w-[600px] object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DDD6C8" />
            <stop offset="100%" stopColor="#CEBFAB" />
          </linearGradient>
          <linearGradient id="counterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BEB4A2" />
            <stop offset="100%" stopColor="#A89C89" />
          </linearGradient>
        </defs>

        {/* Isometric Floor */}
        <path
          d="M300 60 L540 180 L300 320 L60 180 Z"
          fill="url(#floorGrad)"
          stroke="#B5A995"
          strokeWidth="1.5"
        />

        {/* Back Wall */}
        <path d="M60 180 L60 90 L300 -10 L300 60 Z" fill="#E6DFCFA0" />
        <path d="M300 60 L300 -10 L540 90 L540 180 Z" fill="#DED6C480" />

        {/* Serving Counter at Back */}
        <g transform="translate(180, 75)">
          {/* Counter base */}
          <path d="M0 40 L160 -40 L200 -20 L40 60 Z" fill="url(#counterGrad)" />
          <path d="M0 40 L40 60 L40 85 L0 65 Z" fill="#9C8F7B" />
          <path d="M40 60 L200 -20 L200 5 L40 85 Z" fill="#887C69" />

          {/* Warm food trays */}
          <ellipse cx="60" cy="45" rx="12" ry="6" fill="#D47326" />
          <ellipse cx="100" cy="25" rx="12" ry="6" fill="#DDB058" />
          <ellipse cx="140" cy="5" rx="12" ry="6" fill="#BF5130" />

          {/* Lamp over counter */}
          <line x1="100" y1="-30" x2="100" y2="0" stroke="#7A6F5E" strokeWidth="2" />
          <circle cx="100" cy="0" r="7" fill={lampColor} />
          {/* Subtle light cone */}
          <polygon
            points="100,0 60,35 140,15"
            fill={lampColor}
            opacity="0.2"
          />
        </g>

        {/* Long Mess Tables */}
        {/* Table 1 */}
        <g transform="translate(140, 180)">
          <path d="M0 20 L80 -20 L110 -5 L30 35 Z" fill="#C5BCAB" />
          <path d="M0 20 L30 35 L30 48 L0 33 Z" fill="#A89E8D" />
          <path d="M30 35 L110 -5 L110 8 L30 48 Z" fill="#978C7B" />
          {/* Benches */}
          <path d="M-15 15 L65 -25 L75 -20 L-5 20 Z" fill="#B2A897" />
          <path d="M35 40 L115 0 L125 5 L45 45 Z" fill="#B2A897" />
        </g>

        {/* Table 2 */}
        <g transform="translate(260, 230)">
          <path d="M0 20 L80 -20 L110 -5 L30 35 Z" fill="#C5BCAB" />
          <path d="M0 20 L30 35 L30 48 L0 33 Z" fill="#A89E8D" />
          <path d="M30 35 L110 -5 L110 8 L30 48 Z" fill="#978C7B" />
          {/* Benches */}
          <path d="M-15 15 L65 -25 L75 -20 L-5 20 Z" fill="#B2A897" />
          <path d="M35 40 L115 0 L125 5 L45 45 Z" fill="#B2A897" />
        </g>

        {/* Queue of stylized peg-people */}
        {Array.from({ length: Math.min(queueCount, 14) }).map((_, i) => {
          // Snake line towards counter
          const x = 250 - i * 14 + (i > 6 ? (i - 6) * 10 : 0);
          const y = 145 + i * 9;
          const colors = ['#C86D51', '#4A6984', '#687E5A', '#9B7E4B', '#5B5B5B'];
          const personColor = colors[i % colors.length];

          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              {/* Drop shadow */}
              <ellipse cx="0" cy="18" rx="5" ry="2.5" fill="#00000020" />
              {/* Body */}
              <rect
                x="-3.5"
                y="5"
                width="7"
                height="12"
                rx="3.5"
                fill={personColor}
              />
              {/* Head */}
              <circle cx="0" cy="3" r="3.5" fill="#E8D5C4" />
            </g>
          );
        })}

        {/* Seated figures at table */}
        <g transform="translate(180, 195)">
          <ellipse cx="0" cy="12" rx="4" ry="2" fill="#00000020" />
          <rect x="-3" y="2" width="6" height="9" rx="3" fill="#687E5A" />
          <circle cx="0" cy="0" r="3" fill="#E8D5C4" />
        </g>
        <g transform="translate(210, 180)">
          <ellipse cx="0" cy="12" rx="4" ry="2" fill="#00000020" />
          <rect x="-3" y="2" width="6" height="9" rx="3" fill="#C86D51" />
          <circle cx="0" cy="0" r="3" fill="#E8D5C4" />
        </g>

        {/* Wall clock */}
        <circle cx="340" cy="30" r="10" fill="#FEFCF7" stroke="#887C69" strokeWidth="1.5" />
        <line x1="340" y1="30" x2="340" y2="24" stroke="#1B1A17" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="340" y1="30" x2="345" y2="30" stroke="#1B1A17" strokeWidth="1.5" strokeLinecap="round" />

        {/* Return hatch */}
        <rect x="90" y="145" width="28" height="24" rx="2" fill="#4A453E" />
        <rect x="92" y="147" width="24" height="20" rx="1" fill="#756D62" />
        <text x="96" y="160" fill="#FEFCF7" fontSize="6" fontFamily="sans-serif">
          RETURN
        </text>
      </svg>

      {/* Floating Status Badge */}
      <div className="absolute bottom-3 left-3 bg-bg-raised/90 backdrop-blur-sm px-3 py-1.5 rounded-pill border border-warm-grey-200 text-xs text-ink flex items-center gap-2 shadow-soft">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: lampColor }}
        />
        <span className="font-medium">{university.messes[0].name}</span>
        <span className="text-warm-grey-300">·</span>
        <span className="font-mono text-ink-muted">{queueCount} in line</span>
      </div>
    </div>
  );
}
