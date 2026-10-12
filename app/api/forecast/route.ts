import { NextRequest, NextResponse } from 'next/server';
import { calculateForecast } from '@/lib/forecast';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const updateForecastSchema = z.object({
  messCode: z.string().default('mess-1'),
  date: z.string(),
  mealType: z.enum(['Lunch', 'Dinner']),
  eventTitle: z.string().nullable().optional(),
  eventAdjustmentPct: z.number().default(0),
  safetyBufferPct: z.number().default(8.0),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!checkRateLimit(ip, 300)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const messCode = searchParams.get('messCode') || 'mess-1';
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const mealType = searchParams.get('mealType') || 'Lunch';

  try {
    // Attempt calling Python microservice if available
    let pythonForecast = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600); // 600ms timeout
      const pyRes = await fetch(
        `http://127.0.0.1:8000/forecast?mess_code=${messCode}&date=${dateStr}&meal_type=${mealType}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (pyRes.ok) {
        pythonForecast = await pyRes.json();
      }
    } catch {
      // Python microservice not running, fall back gracefully
    }

    if (pythonForecast) {
      return NextResponse.json({ ...pythonForecast, source: 'FASTAPI_MICROSERVICE' });
    }

    // Pure TypeScript Fallback
    const tsForecast = await calculateForecast(messCode, dateStr, mealType);
    return NextResponse.json({ ...tsForecast, source: 'TYPESCRIPT_FALLBACK' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error calculating forecast';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateForecastSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
    }

    const { messCode, date, mealType, eventTitle, eventAdjustmentPct, safetyBufferPct } = parsed.data;

    const mess = await prisma.mess.findFirst({
      where: { code: messCode },
    });
    if (!mess) {
      return NextResponse.json({ error: 'Mess not found' }, { status: 404 });
    }

    // Upsert Event Flag
    if (eventTitle) {
      await prisma.eventFlag.upsert({
        where: {
          messId_date_mealType: {
            messId: mess.id,
            date,
            mealType,
          },
        },
        update: {
          title: eventTitle,
          adjustmentPct: eventAdjustmentPct,
        },
        create: {
          messId: mess.id,
          date,
          mealType,
          title: eventTitle,
          adjustmentPct: eventAdjustmentPct,
        },
      });
    } else {
      await prisma.eventFlag.deleteMany({
        where: {
          messId: mess.id,
          date,
          mealType,
        },
      });
    }

    // Upsert Forecast record with safety buffer
    await prisma.forecast.upsert({
      where: {
        messId_date_mealType: {
          messId: mess.id,
          date,
          mealType,
        },
      },
      update: {
        safetyBufferPct,
      },
      create: {
        messId: mess.id,
        date,
        mealType,
        historicalAvg: 505,
        bookedCount: 180,
        expectedPlates: 500,
        confidenceLevel: 'Moderate',
        confidenceNote: 'Updated configuration',
        safetyBufferPct,
      },
    });

    const updated = await calculateForecast(messCode, date, mealType);
    return NextResponse.json({ success: true, forecast: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating forecast';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
