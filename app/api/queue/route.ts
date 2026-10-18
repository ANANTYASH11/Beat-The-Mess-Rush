import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLiveQueueStatus } from '@/lib/queue';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

import { university } from '@/config/university';
import { getSession } from '@/lib/auth';

const queueActionSchema = z.object({
  action: z.enum(['CHECKIN', 'WALKIN', 'SERVED', 'DRIFT_ADJUST']),
  messCode: z.string().min(1, 'messCode is required'),
  codeOrRoll: z.string().optional(),
  delta: z.number().optional(),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!checkRateLimit(ip, 300)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const messCode = searchParams.get('messCode') || searchParams.get('messId');

  if (!messCode) {
    return NextResponse.json({ error: 'messId parameter is required' }, { status: 400 });
  }

  const validMess = university.messes.find(
    (m) => m.id === messCode || m.name.toLowerCase() === messCode.toLowerCase()
  );
  if (!validMess) {
    return NextResponse.json(
      { error: `Invalid messId: ${messCode}. Does not belong to ${university.name}` },
      { status: 404 }
    );
  }

  // Validate allowed mess for locked staff/kitchen session
  const session = await getSession();
  if (session && (session.role === 'staff' || session.role === 'kitchen')) {
    const lockedMess = session.messId || session.messCode;
    if (lockedMess && lockedMess !== validMess.id) {
      return NextResponse.json(
        { error: `Unauthorized messId: ${messCode}. Role locked to ${lockedMess}` },
        { status: 403 }
      );
    }
  }

  try {
    const status = await getLiveQueueStatus(validMess.id);
    return NextResponse.json(status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching queue status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = queueActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid queue action payload', details: parsed.error.issues }, { status: 400 });
    }

    const { action, messCode, codeOrRoll, delta } = parsed.data;

    const validMess = university.messes.find(
      (m) => m.id === messCode || m.name.toLowerCase() === messCode.toLowerCase()
    );
    if (!validMess) {
      return NextResponse.json({ error: `Mess not found: ${messCode}` }, { status: 404 });
    }

    // Validate role permissions
    const session = await getSession();
    if (session && (session.role === 'staff' || session.role === 'kitchen')) {
      const lockedMess = session.messId || session.messCode;
      if (lockedMess && lockedMess !== validMess.id) {
        return NextResponse.json(
          { error: `Unauthorized mess: ${messCode}. Account locked to ${lockedMess}` },
          { status: 403 }
        );
      }
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const mealType = hour >= 16 || hour < 4 ? 'Dinner' : 'Lunch';

    const mess = await prisma.mess.findFirst({
      where: { code: validMess.id },
    });
    if (!mess) {
      return NextResponse.json({ error: 'Mess not found in database' }, { status: 404 });
    }

    let message = '';
    let matchedRoll: string | null = null;

    if (action === 'CHECKIN') {
      if (codeOrRoll) {
        const query = codeOrRoll.trim().toUpperCase();
        // Look up by 4-digit check-in code or student roll number
        const booking = await prisma.slotBooking.findFirst({
          where: {
            messId: mess.id,
            date: todayStr,
            status: 'BOOKED',
            OR: [
              { checkinCode: query },
              { student: { rollNumber: query } },
            ],
          },
          include: { student: true },
        });

        if (booking) {
          matchedRoll = booking.student.rollNumber;
          await prisma.slotBooking.update({
            where: { id: booking.id },
            data: { status: 'ARRIVED' },
          });
          message = `Checked in student ${matchedRoll} (Code ${booking.checkinCode})`;
        } else {
          message = `Admitted student ${query} to queue`;
        }
      }

      await prisma.queueEvent.create({
        data: {
          messId: mess.id,
          date: todayStr,
          mealType,
          eventType: 'CHECKIN',
          studentRoll: matchedRoll,
          adjustmentValue: 1,
        },
      });
    } else if (action === 'WALKIN') {
      await prisma.queueEvent.create({
        data: {
          messId: mess.id,
          date: todayStr,
          mealType,
          eventType: 'WALKIN',
          studentRoll: null,
          adjustmentValue: 1,
        },
      });
      message = '+1 Walk-in student admitted to line';
    } else if (action === 'SERVED') {
      await prisma.queueEvent.create({
        data: {
          messId: mess.id,
          date: todayStr,
          mealType,
          eventType: 'SERVED',
          studentRoll: null,
          adjustmentValue: -1,
        },
      });
      message = '1 Student served & exited line';
    } else if (action === 'DRIFT_ADJUST') {
      const change = delta || 0;
      const driftKey = `drift_offset_${mess.code}`;

      const existing = await prisma.setting.findUnique({
        where: { key: driftKey },
      });
      const currentVal = existing ? parseInt(existing.value, 10) || 0 : 0;
      const newVal = currentVal + change;

      await prisma.setting.upsert({
        where: { key: driftKey },
        update: { value: newVal.toString() },
        create: { key: driftKey, value: newVal.toString() },
      });

      await prisma.queueEvent.create({
        data: {
          messId: mess.id,
          date: todayStr,
          mealType,
          eventType: 'DRIFT_ADJUST',
          adjustmentValue: change,
        },
      });
      message = `Queue count corrected by ${change > 0 ? '+' : ''}${change}`;
    }

    const updated = await getLiveQueueStatus(mess.code);
    return NextResponse.json({ success: true, message, queue: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Queue update error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
