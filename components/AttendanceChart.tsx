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
      {/* Handwritten annotation watermark */}
      <div className="absolute top-2 right-4 font-serif italic text-xs text-[#A39B8F] pointer-events-none z-10">
        ← Exam dip (-14%) vs Fest spike
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="displayDate" 
            stroke="#A39B8F" 
            fontSize={10} 
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
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: '11px', 
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              paddingTop: '10px' 
            }} 
          />
          <Bar dataKey="Expected" fill="#2F6B3A" stroke="#14110F" strokeWidth={1.5} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Actual" fill="#F2B705" stroke="#14110F" strokeWidth={1.5} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Booked" fill="#F28C1B" stroke="#14110F" strokeWidth={1.5} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
