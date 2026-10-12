'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GaugeRingProps {
  value: number; // e.g. 0 to 100 percentage
  size?: number;
  strokeWidth?: number;
  color?: 'green' | 'amber' | 'red' | 'saffron';
  children?: React.ReactNode;
  className?: string;
}

export function GaugeRing({
  value,
  size = 120,
  strokeWidth = 8,
  color = 'saffron',
  children,
  className = '',
}: GaugeRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const strokeColors = {
    green: '#3F7D58',
    amber: '#E8871E',
    red: '#C8443A',
    saffron: '#E8871E',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-warm-grey-200, #EAE4D8)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColors[color] || strokeColors.saffron}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {children}
      </div>
    </div>
  );
}
