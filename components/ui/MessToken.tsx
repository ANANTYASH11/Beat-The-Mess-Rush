'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export function triggerRiceChilliConfetti() {
  if (typeof window === 'undefined') return;

  try {
    // Custom rice grain shape: slender elongated ellipse
    const ricePath = confetti.shapeFromPath({
      path: 'M 0 -8 C 2.5 -5, 2.5 5, 0 8 C -2.5 5, -2.5 -5, 0 -8 Z',
    });
    // Custom chilli flake shape: irregular jagged triangle / polygon
    const chilliPath = confetti.shapeFromPath({
      path: 'M -4 -6 L 5 -3 L 3 6 L -5 3 Z',
    });

    // Launch 1: Slender rice grains
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#FAF8F5', '#F5EFE0', '#EDE2CC', '#FFFFFF'],
      shapes: [ricePath],
      scalar: 1.15,
      ticks: 240,
      gravity: 0.85,
    });

    // Launch 2: Fiery red chilli flakes and golden mustard flecks
    confetti({
      particleCount: 45,
      spread: 90,
      origin: { y: 0.65 },
      colors: ['#D7312B', '#B91C1C', '#E11D48', '#EA580C', '#F2B705'],
      shapes: [chilliPath],
      scalar: 1.25,
      ticks: 220,
      gravity: 0.95,
    });
  } catch {
    // Graceful fallback if shapeFromPath fails
    confetti({
      particleCount: 65,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#FFFFFF', '#FAF5E9', '#D7312B', '#F28C1B', '#F2B705'],
    });
  }
}

interface MessTokenProps {
  booking?: any;
  tokenNumber?: number;
  qrDataUrl?: string;
  fourDigitCode?: string;
  slotTime?: string;
  meal?: string;
  portion?: string;
  dietType?: string;
  rollNumber?: string;
  onEdit?: () => void;
  onSkip?: () => void;
}

export function MessToken({
  booking,
  tokenNumber,
  qrDataUrl = '',
  fourDigitCode,
  slotTime,
  meal,
  portion,
  dietType,
  rollNumber = '22CS014',
  onEdit,
  onSkip,
}: MessTokenProps) {
  const [stampLanded, setStampLanded] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Normalize props from booking object if passed
  const tokenNum =
    tokenNumber ??
    booking?.tokenNumber ??
    (booking?.checkinCode ? parseInt(booking.checkinCode.slice(-2), 10) : 47) ??
    47;
  const pin =
    fourDigitCode ??
    booking?.checkinCode ??
    '8492';
  const slot =
    slotTime ??
    (booking?.slotStart ? `${booking.slotStart} - ${booking.slotEnd || ''}` : '12:30 - 12:45');
  const mealName = meal ?? booking?.mealType ?? 'Lunch';
  const portionName = portion ?? booking?.portion ?? 'Regular';
  const diet = dietType ?? booking?.dietType ?? 'Veg';
  const dateStr = booking?.date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Trigger screen shake right when stamp slams down
    const stampTimer = setTimeout(() => {
      setStampLanded(true);
      setShaking(true);
      triggerRiceChilliConfetti();
    }, 550);

    const shakeTimer = setTimeout(() => {
      setShaking(false);
    }, 950);

    return () => {
      clearTimeout(stampTimer);
      clearTimeout(shakeTimer);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto select-none space-y-3">
      {/* 1. DISPENSER CASING SLOT AT TOP */}
      <div className="bg-[#241F1C] border-[3px] border-[#14110F] dark:border-[#F4ECD8] rounded-t-2xl px-5 py-3 relative z-20 shadow-md">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#3E3832]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8893A] border border-[#14110F]" />
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#D4CEC5]">
              AUTOMATIC TOKEN DISPENSER • MODEL T-47
            </span>
          </div>
          <span className="font-mono text-[9px] font-bold text-[#F28C1B] uppercase">
            STATUS: PRINTED
          </span>
        </div>

        {/* Physical Narrow Slot Opening */}
        <div className="mt-2 w-4/5 mx-auto h-3 bg-[#0A0807] rounded-full border border-[#4A423A] shadow-inner relative flex items-center justify-center">
          <div className="w-2/3 h-0.5 bg-[#14110F]" />
        </div>
      </div>

      {/* 2. THE PRINTED TOKEN TICKET SLIDING OUT OF THE SLOT */}
      <div className="overflow-visible -mt-2">
        <motion.div
          initial={{ y: -90, opacity: 0 }}
          animate={
            shaking
              ? { y: 0, opacity: 1, x: [0, -5, 5, -3, 3, 0] }
              : { y: 0, opacity: 1, x: 0 }
          }
          transition={{
            y: { type: 'spring', damping: 20, stiffness: 220 },
            x: { duration: 0.35 },
          }}
          className="bg-[#FAF5E8] border-[3px] border-[#14110F] dark:border-[#F4ECD8] rounded-b-2xl shadow-brutal-xl relative overflow-hidden text-[#14110F]"
        >
          {/* Punched Hole at Top Left */}
          <div
            aria-label="Punched Hole"
            className="absolute top-4 left-4 w-5 h-5 rounded-full bg-[#F4ECD8] border-2 border-[#14110F] shadow-inner z-10"
          />

          {/* Ticket Header */}
          <div className="bg-[#F28C1B] border-b-[3px] border-[#14110F] px-4 py-3 pl-12 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-widest block text-[#14110F]/80 truncate">
                CAMPUS MESS BOARDING PASS
              </span>
              <h2 className="font-condensed text-xl sm:text-2xl font-black text-[#14110F] tracking-wide uppercase leading-none mt-0.5 whitespace-nowrap">
                {mealName} ENTRY
              </h2>
            </div>
            <div className="text-right shrink-0 bg-[#FAF5E8] border-2 border-[#14110F] px-2.5 py-1 rounded-lg shadow-brutal-xs">
              <span className="font-mono text-[8px] font-black uppercase text-[#5C554F] block leading-none">
                TOKEN
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-[#14110F] leading-tight block">
                Token {tokenNum}
              </span>
            </div>
          </div>

          {/* Perforated Divider with Side Notches */}
          <div className="relative py-2 px-4 flex items-center justify-between">
            <div className="w-5 h-5 rounded-full bg-[#F4ECD8] -ml-7 border-2 border-[#14110F]" />
            <div className="w-full border-b-2 border-dashed border-[#14110F]/40 mx-2" />
            <div className="w-5 h-5 rounded-full bg-[#F4ECD8] -mr-7 border-2 border-[#14110F]" />
          </div>

          {/* Ticket Details Body in Plex Mono */}
          <div className="p-5 sm:p-6 pt-1 space-y-4 font-mono">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#EFE7D0] p-3 rounded-xl border-2 border-[#14110F]/20">
              <div>
                <span className="text-[10px] text-[#5C554F] block">ROLL NO:</span>
                <span className="font-black text-[#14110F]">{rollNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5C554F] block">SLOT:</span>
                <span className="font-black text-[#14110F]">{slot}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5C554F] block">PORTION:</span>
                <span className="font-black text-[#14110F]">{portionName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5C554F] block">DIET:</span>
                <span className="font-black text-[#14110F]">{diet}</span>
              </div>
            </div>

            {/* QR Code & 4-Digit Verification PIN */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-black tracking-wider text-[#5C554F] uppercase block">
                    COUNTER 4-DIGIT VERIFICATION PIN
                  </span>
                  <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-[#14110F] leading-none mt-1">
                    PIN: {pin}
                  </div>
                </div>
                <p className="text-[11px] text-[#5C554F] leading-tight max-w-[240px]">
                  Show QR to scanner at Turnstile #1 or speak PIN to the mess warden.
                </p>
                <div className="text-[10px] text-[#8E857C]">
                  Valid Date: {dateStr}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="w-28 sm:w-32 h-28 sm:h-32 p-2 bg-white border-[2.5px] border-[#14110F] rounded-xl shadow-brutal-xs shrink-0 flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Token QR ${pin}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center font-mono text-[9px] font-bold text-[#14110F]">
                    [QR CODE]<br />PIN: {pin}
                  </div>
                )}
              </div>
            </div>

            {/* Perforated Divider 2 */}
            <div className="border-b-2 border-dashed border-[#14110F]/30 pt-1" />

            {/* Barcode Strip */}
            <div className="pt-1 flex flex-col items-center">
              <div className="w-full h-9 flex items-stretch justify-center gap-[2px] overflow-hidden py-1">
                {[
                  3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 5, 2, 1, 3, 4, 1, 2, 1, 3, 2,
                  4, 1, 2, 5, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 5, 1, 2, 4,
                  2, 1, 3, 1, 4, 2, 3, 1, 5, 2, 1, 4, 3, 1, 2
                ].map((width, idx) => (
                  <span
                    key={idx}
                    className="bg-[#14110F] h-full"
                    style={{ width: `${width}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] font-bold text-[#5C554F] tracking-widest mt-0.5">
                *MR-PASS-{dateStr.replace(/-/g, '')}-{tokenNum}-{pin}*
              </span>
            </div>

            {/* "CONFIRMED" Stamp Slam Animation */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <motion.div
                initial={{ scale: 3.5, opacity: 0, rotate: -28 }}
                animate={{ scale: 1, opacity: 0.95, rotate: -10 }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 24,
                  delay: 0.5,
                }}
                className="border-[4px] border-[#D7312B] text-[#D7312B] bg-[#D7312B]/10 font-mono font-black text-3xl sm:text-4xl tracking-widest px-6 py-2 uppercase rounded-md shadow-lg"
                style={{
                  textShadow: '1px 1px 0px rgba(215, 49, 43, 0.4)',
                }}
              >
                CONFIRMED
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ticket Action Buttons (Edit slot, Skip meal) */}
      {(onEdit || onSkip) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 px-1">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="font-mono text-xs font-bold text-[#14110F] dark:text-[#F4ECD8] underline hover:text-[#F28C1B] transition-colors"
            >
              ← Change arrival slot / portion
            </button>
          )}

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="font-mono text-xs font-bold text-[#D7312B] hover:underline transition-colors ml-auto"
            >
              Cancel pass (Mark as skipped)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MessToken;
