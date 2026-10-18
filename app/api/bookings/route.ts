import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { university, generateSlotsForMeal, getSlotEnd, isValidRollNumber } from '@/config/university';

const bookingSchema = z.object({
  rollNumber: z.string().min(1),
  messCode: z.string().default('central-mess-north'),
  mealType: z.enum(['Breakfast', 'Lunch', 'Snacks', 'Dinner']),
  slotStart: z.string().optional(),
  portion: z.enum(['Small', 'Regular', 'Large']).default('Regular'),
  dietType: z.string().default('Veg'),
  isSkipping: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!checkRateLimit(ip, 300)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const messCode = searchParams.get('messCode') || 'mess-1';
  const mealType = searchParams.get('mealType') || 'Lunch';
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const rollNumber = searchParams.get('rollNumber')?.trim().toUpperCase();

  try {
    const mess = await prisma.mess.findFirst({
      where: { code: messCode },
    });
    if (!mess) {
      return NextResponse.json({ error: 'Mess not found' }, { status: 404 });
    }

    const slots = generateSlotsForMeal(mealType);

    // Current bookings per slot
    const bookings = await prisma.slotBooking.findMany({
      where: {
        messId: mess.id,
        date: dateStr,
        mealType,
        status: { not: 'SKIPPED' },
      },
      select: {
        slotStart: true,
      },
    });

    const counts: Record<string, number> = {};
    for (const b of bookings) {
      counts[b.slotStart] = (counts[b.slotStart] || 0) + 1;
    }

    let minProjected = Infinity;
    let suggestedSlot = slots[0];

    const slotStatuses = slots.map((slot, sIdx) => {
      const booked = counts[slot] || 0;
      // Historical average baseline
      const isPeak = slot === university.peakWindows.lunch || slot === university.peakWindows.dinner;
      const isFirstOrLast = sIdx === 0 || sIdx === slots.length - 1;
      const histAvg = isPeak ? 65 : (isFirstOrLast ? 22 : 38);
      const projected = Math.round(booked + histAvg * 0.45);

      if (projected < minProjected) {
        minProjected = projected;
        suggestedSlot = slot;
      }

      let congestion: 'Quiet' | 'Moderate' | 'Busy' = 'Moderate';
      let waitEstimate = '5-8 min';
      const isOffPeak = projected < 38;

      if (projected < 38) {
        congestion = 'Quiet';
        waitEstimate = '2-5 min';
      } else if (projected > 60) {
        congestion = 'Busy';
        waitEstimate = '10-15 min';
      }

      const [h, m] = slot.split(':').map(Number);
      const endM = (m + 15) % 60;
      const endH = m + 15 >= 60 ? h + 1 : h;
      const slotEndStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      return {
        slotStart: slot,
        slotEnd: slotEndStr,
        currentBookings: booked,
        projectedTotal: projected,
        capacityGuide: 70, // soft guideline, not hard lockout
        congestion,
        isOffPeak,
        waitEstimate,
      };
    });

    // Student's existing booking & streak
    let studentBooking = null;
    let studentData = null;

    if (rollNumber) {
      const student = await prisma.student.findUnique({
        where: { rollNumber },
        include: { mealPlan: true },
      });
      if (student) {
        studentData = student;
        studentBooking = await prisma.slotBooking.findUnique({
          where: {
            studentId_date_mealType: {
              studentId: student.id,
              date: dateStr,
              mealType,
            },
          },
        });
      }
    }

    return NextResponse.json({
      messCode: mess.code,
      messName: mess.name,
      date: dateStr,
      mealType,
      slots: slotStatuses,
      suggestedSlot,
      suggestedArrivalWindow: `${suggestedSlot} - ${slotStatuses.find(s => s.slotStart === suggestedSlot)?.slotEnd || ''}`,
      student: studentData,
      currentBooking: studentBooking,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error retrieving booking options';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    const { rollNumber, messCode, mealType, slotStart, portion, dietType, isSkipping } = parsed.data;
    const cleanRoll = rollNumber.trim().toUpperCase();
    if (!isValidRollNumber(cleanRoll)) {
      return NextResponse.json(
        { error: `Invalid roll number. Must match format e.g. ${university.rollNumberExample}` },
        { status: 400 }
      );
    }
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const mess = await prisma.mess.findFirst({
      where: { code: messCode },
    });
    if (!mess) {
      return NextResponse.json({ error: 'Mess not found' }, { status: 404 });
    }

    // Ensure student exists (privacy-safe: only roll number, no personal names or photos)
    let student = await prisma.student.findUnique({
      where: { rollNumber: cleanRoll },
      include: { mealPlan: true },
    });
    if (!student) {
      student = await prisma.student.create({
        data: {
          rollNumber: cleanRoll,
          name: `Student ${cleanRoll}`,
          hostel: university.messes[0].hostel,
          dietPref: dietType,
          streak: 0,
        },
        include: { mealPlan: true },
      });
    }

    // Enforce student meal plan restriction
    if (student?.mealPlan) {
      try {
        const allowedMeals: string[] = JSON.parse(student.mealPlan.meals);
        if (!allowedMeals.includes(mealType)) {
          return NextResponse.json(
            { error: `Your ${student.mealPlan.name} meal plan does not include ${mealType}.` },
            { status: 403 }
          );
        }
      } catch {
        // fallback
      }
    }

    if (isSkipping) {
      const skippedBooking = await prisma.slotBooking.upsert({
        where: {
          studentId_date_mealType: {
            studentId: student.id,
            date: dateStr,
            mealType,
          },
        },
        update: {
          status: 'SKIPPED',
        },
        create: {
          studentId: student.id,
          messId: mess.id,
          date: dateStr,
          mealType,
          slotStart: slotStart || 'SKIP',
          slotEnd: 'SKIP',
          portion,
          dietType,
          status: 'SKIPPED',
          checkinCode: '0000',
          isOffPeak: false,
        },
      });
      return NextResponse.json({
        success: true,
        message: 'Meal marked as skipped. Thank you for reducing food waste!',
        booking: skippedBooking,
      });
    }

    if (!slotStart) {
      return NextResponse.json({ error: 'Arrival slot is required' }, { status: 400 });
    }

    const slotEndStr = getSlotEnd(slotStart);
    const mealSlots = generateSlotsForMeal(mealType);
    const isOffPeak = slotStart === mealSlots[0] || slotStart === mealSlots[mealSlots.length - 1];

    // Generate unique 4-digit check-in code
    const checkinCode = (1000 + Math.floor(Math.random() * 9000)).toString();

    const booking = await prisma.slotBooking.upsert({
      where: {
        studentId_date_mealType: {
          studentId: student.id,
          date: dateStr,
          mealType,
        },
      },
      update: {
        messId: mess.id,
        slotStart,
        slotEnd: slotEndStr,
        portion,
        dietType,
        status: 'BOOKED',
        checkinCode,
        isOffPeak,
      },
      create: {
        studentId: student.id,
        messId: mess.id,
        date: dateStr,
        mealType,
        slotStart,
        slotEnd: slotEndStr,
        portion,
        dietType,
        status: 'BOOKED',
        checkinCode,
        isOffPeak,
      },
    });

    let streakCount = student.streak;
    if (isOffPeak) {
      const updated = await prisma.student.update({
        where: { id: student.id },
        data: { streak: { increment: 1 } },
      });
      streakCount = updated.streak;
    }

    return NextResponse.json({
      success: true,
      booking,
      streak: streakCount,
      isOffPeak,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error creating booking';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
