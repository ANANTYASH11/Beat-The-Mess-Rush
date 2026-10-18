'use client';

import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';

interface AttendanceChartProps {
  data: Array<{
    date: string;
    mealType: string;
    expectedPlates: number;
    actualPlates: number;
    bookedCount: number;
  }>;
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({
    displayDate: d.date.slice(5) + ` (${d.mealType[0]})`,
    Expected: d.expectedPlates,
    Actual: d.actualPlates,
    Booked: d.bookedCount,
  }));

  return (
    <div className="w-full h-56 mt-3 relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="displayDate" 
            stroke="var(--color-ink-muted)" 
            fontSize={12} 
            fontFamily="var(--font-mono)"
            tickLine={false} 
            axisLine={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }} 
          />
          <YAxis 
            stroke="var(--color-ink-muted)" 
            fontSize={12} 
            fontFamily="var(--font-mono)"
            tickLine={false} 
            axisLine={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-bg-raised)', 
              borderColor: 'var(--color-border)', 
              borderWidth: '2px',
              borderRadius: '8px',
              boxShadow: 'none',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-ink)',
              fontWeight: 700,
            }} 
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: '14px', 
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              paddingTop: '10px',
              color: 'var(--color-ink)'
            }} 
          />
          <Bar dataKey="Expected" fill="#2F6B3A" stroke="var(--color-border)" strokeWidth={1.5} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Actual" fill="#F2B705" stroke="var(--color-border)" strokeWidth={1.5} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Booked" fill="var(--color-ink-muted)" stroke="var(--color-border)" strokeWidth={1.5} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
