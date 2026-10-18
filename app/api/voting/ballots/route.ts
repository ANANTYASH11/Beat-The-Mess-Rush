import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWeeklyBallot, CreateBallotInput } from '@/lib/voting';
import { getFeatureFlags } from '@/lib/feature-flags';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universitySlug = searchParams.get('universitySlug') || searchParams.get('slug') || 'lpu';
    const messId = searchParams.get('messId');

    const flags = await getFeatureFlags(universitySlug);

    const whereClause: any = { universityId: universitySlug };
    if (messId) {
      whereClause.messId = messId;
    }

    const ballots = await prisma.ballot.findMany({
      where: whereClause,
      include: {
        slots: true,
        _count: {
          select: { votes: true, participations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      featureEnabled: flags.voting,
      ballots: ballots.map((b) => ({
        id: b.id,
        title: b.title,
        messId: b.messId,
        weekStart: b.weekStart,
        weekEnd: b.weekEnd,
        openAt: b.openAt,
        closeAt: b.closeAt,
        status: b.status,
        minVotesRequired: b.minVotesRequired,
        committeeApproved: b.committeeApproved,
        totalVotes: b._count.votes,
        totalParticipants: b._count.participations,
        slots: b.slots.map((s) => ({
          id: s.id,
          dayOfWeek: s.dayOfWeek,
          mealType: s.mealType,
          candidateDishes: JSON.parse(s.candidateDishes || '[]'),
        })),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    // Handle Admin Action: Close Early or Void Ballot
    if (action === 'close_early' || action === 'void' || action === 'approve') {
      const ballotId = body.ballotId;
      if (!ballotId) {
        return NextResponse.json({ error: 'ballotId is required.' }, { status: 400 });
      }

      let newStatus = 'CLOSED';
      let committeeApproved = false;

      if (action === 'void') {
        newStatus = 'VOIDED';
      } else if (action === 'approve') {
        newStatus = 'CLOSED';
        committeeApproved = true;
      }

      const updated = await prisma.ballot.update({
        where: { id: ballotId },
        data: {
          status: newStatus,
          committeeApproved: committeeApproved,
          finalMenuNotes: body.notes || 'Advisory, final menu set by the mess committee',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Ballot ${ballotId} status updated to ${newStatus}.`,
        ballot: updated,
      });
    }

    // Create New Ballot
    const ballotInput: CreateBallotInput = {
      universitySlug: body.universitySlug || body.slug || 'lpu',
      messId: body.messId || 'central-mess-north',
      title: body.title || 'Weekly Menu Vote',
      weekStart: body.weekStart,
      weekEnd: body.weekEnd,
      openAt: body.openAt || new Date().toISOString(),
      closeAt: body.closeAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      minVotesRequired: body.minVotesRequired || 20,
      slots: body.slots || [],
    };

    const ballot = await createWeeklyBallot(ballotInput);

    return NextResponse.json({
      success: true,
      ballot,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
