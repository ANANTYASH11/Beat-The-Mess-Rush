import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLiveQueueStatus } from '@/lib/queue';

import { university } from '@/config/university';

let simTicksRemaining = 0;
let simInterval: NodeJS.Timeout | null = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const messCode = body.messCode || body.messId;

    if (!messCode) {
      return NextResponse.json({ error: 'messCode is required' }, { status: 400 });
    }

    const validMess = university.messes.find(
      (m) => m.id === messCode || m.name.toLowerCase() === messCode.toLowerCase()
    );
    if (!validMess) {
      return NextResponse.json({ error: `Invalid messCode: ${messCode}` }, { status: 404 });
    }

    const mess = await prisma.mess.findFirst({
      where: { code: validMess.id },
    });
    if (!mess) {
      return NextResponse.json({ error: 'Mess not found in database' }, { status: 404 });
    }

    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }

    simTicksRemaining = 15; // 15 ticks * 2s = 30 seconds
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    simInterval = setInterval(async () => {
      simTicksRemaining--;
      if (simTicksRemaining <= 0) {
        if (simInterval) clearInterval(simInterval);
        simInterval = null;
        return;
      }

      try {
        const arrivals = Math.floor(Math.random() * 3) + 1;
        const served = Math.floor(Math.random() * 2) + 1;
        const eventTime = new Date();

        for (let a = 0; a < arrivals; a++) {
          await prisma.queueEvent.create({
            data: {
              messId: mess.id,
              date: todayStr,
              mealType: 'Lunch',
              eventType: a === 0 ? 'CHECKIN' : 'WALKIN',
              adjustmentValue: 1,
              createdAt: eventTime,
            },
          });
        }

        for (let s = 0; s < served; s++) {
          await prisma.queueEvent.create({
            data: {
              messId: mess.id,
              date: todayStr,
              mealType: 'Lunch',
              eventType: 'SERVED',
              adjustmentValue: -1,
              createdAt: eventTime,
            },
          });
        }
      } catch (err) {
        console.error('Simulation tick error:', err);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: 'Rush hour simulation started for 30 seconds',
      ticksRemaining: simTicksRemaining,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error starting simulation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    running: simTicksRemaining > 0,
    ticksRemaining: simTicksRemaining,
  });
}
