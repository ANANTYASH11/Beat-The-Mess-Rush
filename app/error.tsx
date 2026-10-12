'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js route error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center select-none">
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-brutal-xl">
        <AlertTriangle className="w-12 h-12 text-[#D7312B] mx-auto mb-3" />
        <h2 className="text-2xl font-display font-black uppercase text-[#14110F]">
          COUNTER SERVICE DISRUPTION
        </h2>
        <p className="font-serif text-xs text-[#5C554F] mt-2 mb-5">
          {error.message || 'Failed to communicate with mess server.'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="dhaba-btn py-2.5 px-6 bg-[#F28C1B] text-[#14110F] font-display text-sm uppercase inline-flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RETRY COUNTER</span>
        </button>
      </div>
    </div>
  );
}
