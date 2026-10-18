import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateChallengeLeaderboard } from '@/lib/zero-waste';
import { getFeatureFlags } from '@/lib/feature-flags';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universitySlug = searchParams.get('universitySlug') || searchParams.get('slug') || 'lpu';
    let challengeId = searchParams.get('challengeId');

    const flags = await getFeatureFlags(universitySlug);

    // If challengeId not passed, find or create default active challenge for tenant
    if (!challengeId) {
      let activeChallenge = await prisma.zeroWasteChallenge.findFirst({
        where: { universityId: universitySlug, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (!activeChallenge) {
        activeChallenge = await prisma.zeroWasteChallenge.create({
          data: {
            universityId: universitySlug,
            title: 'Campus Zero Waste Week - Autumn 2026',
            startDate: '2026-10-12',
            endDate: '2026-10-18',
            status: 'ACTIVE',
            prizeText: 'Winning mess gets recognized on all entrance display screens',
            divisions: JSON.stringify(['Central', 'Boys Hostel', 'Girls Hostel', 'Studio']),
            isDemo: true,
          },
        });
      }
      challengeId = activeChallenge.id;
    }

    const leaderboard = await calculateChallengeLeaderboard(challengeId);

    return NextResponse.json({
      featureEnabled: flags.challenge,
      displayTickerEnabled: flags.display_challenge_ticker,
      ...leaderboard,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    // Handle Manager Confirmation of Real Winner
    if (action === 'confirm_winner') {
      const challengeId = body.challengeId;
      const winnerMessId = body.winnerMessId;

      if (!challengeId || !winnerMessId) {
        return NextResponse.json({ error: 'challengeId and winnerMessId are required.' }, { status: 400 });
      }

      const challenge = await prisma.zeroWasteChallenge.findUnique({
        where: { id: challengeId },
      });

      // Data honesty rule: Simulated data cannot produce a published winner!
      if (challenge?.isDemo && !body.allowDemoConfirmation) {
        return NextResponse.json({
          error: 'Simulated demo challenge data cannot be published as a certified winner without manager live audit.',
        }, { status: 403 });
      }

      const updated = await prisma.zeroWasteChallenge.update({
        where: { id: challengeId },
        data: {
          publishedWinnerMessId: winnerMessId,
          managerConfirmedAt: new Date(),
          status: 'COMPLETED',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Winner confirmed and published to university leaderboard.',
        challenge: updated,
      });
    }

    // Create New Challenge
    const universitySlug = body.universitySlug || body.slug || 'lpu';
    const newChallenge = await prisma.zeroWasteChallenge.create({
      data: {
        universityId: universitySlug,
        title: body.title || 'Campus Zero Waste Week',
        startDate: body.startDate || '2026-10-19',
        endDate: body.endDate || '2026-10-25',
        status: 'ACTIVE',
        prizeText: body.prizeText || 'Recognition on entrance displays and certificate from Dean of Student Welfare',
        divisions: JSON.stringify(body.divisions || ['Central', 'Boys Hostel', 'Girls Hostel', 'Studio']),
        isDemo: Boolean(body.isDemo),
      },
    });

    return NextResponse.json({
      success: true,
      challenge: newChallenge,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
