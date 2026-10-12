import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeSession, SESSION_COOKIE_NAME, UserSession } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  role: z.enum(['student', 'staff', 'kitchen', 'admin']),
  rollNumber: z.string().optional(),
  pin: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid login parameters' }, { status: 400 });
    }

    const { role, rollNumber, pin } = parsed.data;

    let session: UserSession;

    if (role === 'student') {
      const cleanRoll = (rollNumber || '').trim().toUpperCase();
      if (!cleanRoll) {
        return NextResponse.json({ error: 'Please enter your Roll Number.' }, { status: 400 });
      }

      let student = await prisma.student.findUnique({
        where: { rollNumber: cleanRoll },
      });

      if (!student) {
        student = await prisma.student.create({
          data: {
            rollNumber: cleanRoll,
            name: `Student ${cleanRoll}`,
            hostel: 'Block A',
            dietPref: 'Veg',
            streak: 0,
          },
        });
      }

      session = {
        role: 'student',
        rollNumber: student.rollNumber,
        name: student.name,
      };
    } else if (role === 'staff') {
      if ((pin || '').trim() !== '1234') {
        return NextResponse.json({ error: 'Invalid Staff PIN (Demo PIN: 1234)' }, { status: 401 });
      }
      session = {
        role: 'staff',
        name: 'Service Line Staff',
      };
    } else {
      // kitchen or admin
      if ((pin || '').trim() !== '5678') {
        return NextResponse.json({ error: 'Invalid Kitchen/Admin PIN (Demo PIN: 5678)' }, { status: 401 });
      }
      session = {
        role,
        name: role === 'kitchen' ? 'Mess Kitchen Manager' : 'Hostel Mess Administrator',
      };
    }

    const response = NextResponse.json({ success: true, session });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: serializeSession(session),
      path: '/',
      httpOnly: false, // accessible to client for fast hydration
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
