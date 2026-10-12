'use client';

import React from 'react';

export function Skeleton({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = 'rounded-xl',
}: {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`bg-slate-800/60 shimmer-effect ${height} ${width} ${rounded} ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-2xl p-5 space-y-3">
      <Skeleton height="h-5" width="w-1/3" />
      <Skeleton height="h-10" width="w-full" />
      <div className="flex gap-2 pt-2">
        <Skeleton height="h-8" width="w-1/2" />
        <Skeleton height="h-8" width="w-1/2" />
      </div>
    </div>
  );
}
