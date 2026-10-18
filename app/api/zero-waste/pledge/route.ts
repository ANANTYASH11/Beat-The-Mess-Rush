import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const challengeId = body.challengeId;
    const messId = body.messId || 'central-mess-north';

    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required.' }, { status: 400 });
    }

    // PRIVACY: Anonymous pledge recorded without student roll number or name
    await prisma.zeroWastePledge.create({
      data: {
        challengeId,
        messId,
      },
    });

    const totalPledges = await prisma.zeroWastePledge.count({
      where: { challengeId, messId },
    });

    return NextResponse.json({
      success: true,
      messId,
      messPledgesToday: totalPledges,
      message: 'Pledge recorded anonymously. Thank you for committing to zero plate waste!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
