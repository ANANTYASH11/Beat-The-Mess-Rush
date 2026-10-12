'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface TimeCurveProps {
  data?: Array<{ time: string; wait: string; queue: number; label: string }>;
  mealType?: 'Lunch' | 'Dinner';
  suggestedSlot?: string;
}

const defaultLunchCurve = [
  { time: '12:30', queue: 8, wait: '2-4 min', label: 'Quiet' },
  { time: '12:45', queue: 14, wait: '4-6 min', label: 'Moderate' },
  { time: '13:00', queue: 28, wait: '9-12 min', label: 'Peak' },
  { time: '13:15', queue: 24, wait: '7-10 min', label: 'Busy' },
  { time: '13:30', queue: 15, wait: '4-6 min', label: 'Moderate' },
  { time: '13:45', queue: 7, wait: '2-4 min', label: 'Quiet' },
];

const defaultDinnerCurve = [
  { time: '19:30', queue: 9, wait: '2-4 min', label: 'Quiet' },
  { time: '19:45', queue: 16, wait: '4-6 min', label: 'Moderate' },
  { time: '20:00', queue: 26, wait: '8-11 min', label: 'Busy' },
  { time: '20:15', queue: 32, wait: '11-14 min', label: 'Peak' },
  { time: '20:30', queue: 20, wait: '6-8 min', label: 'Moderate' },
  { time: '20:45', queue: 8, wait: '2-4 min', label: 'Quiet' },
];

export default function TimeCurveChart({
  data,
  mealType = 'Lunch',
  suggestedSlot,
}: TimeCurveProps) {
  const chartData =
    data && data.length > 0
      ? data
      : mealType === 'Dinner'
      ? defaultDinnerCurve
      : defaultLunchCurve;

  return (
    <div className="w-full h-44 mt-2 relative">
      {/* Chalk Annotation */}
      <div className="absolute top-1 right-2 font-serif italic text-xs text-[#F2B705] pointer-events-none z-10">
        ← Peak rush window
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="dhabaWaitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F28C1B" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#F28C1B" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            stroke="#A39B8F"
            fontSize={11}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={{ stroke: '#544E48', strokeWidth: 1.5 }}
          />
          <YAxis
            stroke="#A39B8F"
            fontSize={10}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={{ stroke: '#544E48', strokeWidth: 1.5 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FAF5E8',
              borderColor: '#14110F',
              borderWidth: '2px',
              borderRadius: '8px',
              boxShadow: '3px 3px 0px #14110F',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#14110F',
              fontWeight: 700,
            }}
            formatter={(val: any, name: any, item: any) => [
              `${val} waiting (${item?.payload?.wait || 'Wait'})`,
              'Queue Headcount',
            ]}
          />
          <Area
            type="monotone"
            dataKey="queue"
            stroke="#F28C1B"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#dhabaWaitGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
