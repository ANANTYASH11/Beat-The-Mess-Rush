import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateThresholdsSchema = z.object({
  messCode: z.string(),
  queueLowThresh: z.number().min(1),
  queueHighThresh: z.number().min(2),
});

export async function GET() {
  try {
    const messes = await prisma.mess.findMany({
      orderBy: { code: 'asc' },
    });
    const students = await prisma.student.findMany({
      take: 20,
      orderBy: { rollNumber: 'asc' },
    });
    return NextResponse.json({ messes, students });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching admin data';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateThresholdsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid threshold configuration' }, { status: 400 });
    }

    const { messCode, queueLowThresh, queueHighThresh } = parsed.data;

    const updated = await prisma.mess.update({
      where: { code: messCode },
      data: {
        queueLowThresh,
        queueHighThresh,
      },
    });

    return NextResponse.json({ success: true, mess: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating thresholds';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
