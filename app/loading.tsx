import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      <span className="text-sm font-semibold tracking-wide">Loading mess telemetry...</span>
    </div>
  );
}
