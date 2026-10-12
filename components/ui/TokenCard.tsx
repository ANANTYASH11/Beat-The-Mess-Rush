'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface TokenCardProps {
  tokenNumber: number;
  code: string;
  slotTime: string;
  meal: string;
  portion: string;
  qrDataUrl?: string;
  estimatedWait?: string;
  className?: string;
}

export function TokenCard({
  tokenNumber,
  code,
  slotTime,
  meal,
  portion,
  qrDataUrl,
  estimatedWait,
  className = '',
}: TokenCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-bg-raised border border-warm-grey-200 rounded-panel shadow-soft overflow-hidden max-w-sm mx-auto ${className}`}
    >
      {/* Top section: Meal & Token Number */}
      <div className="p-6 pb-4 bg-warm-grey-100/50">
        <div className="flex items-center justify-between text-xs text-ink-muted uppercase tracking-wider font-mono">
          <span>{meal} Token</span>
          <span className="text-saffron font-bold">North Hostel Mess</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-ink-muted block font-sans">Token</span>
            <span className="font-mono text-3xl font-bold tracking-tight text-ink">
              #{tokenNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-ink-muted block font-sans">Slot Window</span>
            <span className="font-mono text-base font-semibold text-ink">{slotTime}</span>
          </div>
        </div>
      </div>

      {/* Perforation line */}
      <div className="relative flex items-center justify-between px-3 py-1">
        <div className="w-4 h-4 rounded-full bg-bg -ml-5 border-r border-warm-grey-200" />
        <div className="w-full border-b border-dashed border-warm-grey-300 mx-2" />
        <div className="w-4 h-4 rounded-full bg-bg -mr-5 border-l border-warm-grey-200" />
      </div>

      {/* Bottom section: 4-digit code and QR */}
      <div className="p-6 pt-3 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-ink-muted">Verification Code</div>
            <div className="font-mono text-2xl font-bold tracking-widest text-ink mt-0.5">
              {code}
            </div>
            <div className="text-xs text-ink-muted mt-2">
              Portion: <span className="font-medium text-ink capitalize">{portion}</span>
            </div>
            {estimatedWait && (
              <div className="text-xs text-muted-green font-medium mt-1">
                Wait: ~{estimatedWait}
              </div>
            )}
          </div>

          {qrDataUrl && (
            <div className="w-24 h-24 bg-white p-1.5 rounded-lg border border-warm-grey-200 flex-shrink-0">
              <img
                src={qrDataUrl}
                alt={`QR code for token ${tokenNumber}`}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        <div className="text-[11px] text-ink-muted text-center pt-2 border-t border-warm-grey-200">
          Present at the serving counter or say your 4-digit code.
        </div>
      </div>
    </motion.div>
  );
}
