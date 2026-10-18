import { NextRequest, NextResponse } from 'next/server';
import { calculateForecast } from '@/lib/forecast';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

import { university } from '@/config/university';

const updateForecastSchema = z.object({
  messCode: z.string().default(university.messes[0]?.id || 'central-mess-north'),
  date: z.string(),
  mealType: z.enum(['Breakfast', 'Lunch', 'Snacks', 'Dinner']),
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
  const messCode = searchParams.get('messCode') || searchParams.get('messId');

  if (!messCode) {
    return NextResponse.json({ error: 'messCode parameter is required' }, { status: 400 });
  }

  const validMess = university.messes.find(
    (m) => m.id === messCode || m.name.toLowerCase() === messCode.toLowerCase()
  );
  if (!validMess) {
    return NextResponse.json(
      { error: `Invalid messCode: ${messCode}. Does not belong to ${university.name}` },
      { status: 404 }
    );
  }

  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const mealType = searchParams.get('mealType') || 'Lunch';

  try {
    const forecast = await calculateForecast(validMess.id, dateStr, mealType);
    return NextResponse.json(forecast);
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

    const validMess = university.messes.find(
      (m) => m.id === messCode || m.name.toLowerCase() === messCode.toLowerCase()
    );
    if (!validMess) {
      return NextResponse.json({ error: `Mess not found: ${messCode}` }, { status: 404 });
    }

    const mess = await prisma.mess.findFirst({
      where: { code: validMess.id },
    });
    if (!mess) {
      return NextResponse.json({ error: 'Mess not found in database' }, { status: 404 });
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
