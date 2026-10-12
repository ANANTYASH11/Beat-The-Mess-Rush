import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLiveQueueStatus } from '@/lib/queue';

let simTicksRemaining = 0;
let simInterval: NodeJS.Timeout | null = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const messCode = body.messCode || 'mess-1';

    const mess = await prisma.mess.findFirst({
      where: { code: messCode },
    });
    if (!mess) {
      return NextResponse.json({ error: 'Mess not found' }, { status: 404 });
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
