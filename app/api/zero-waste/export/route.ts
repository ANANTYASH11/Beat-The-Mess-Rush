import { NextRequest, NextResponse } from 'next/server';
import { calculateChallengeLeaderboard } from '@/lib/zero-waste';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('challengeId');

    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required.' }, { status: 400 });
    }

    const summary = await calculateChallengeLeaderboard(challengeId);

    const csvRows = [
      '# UniQ Zero Waste Week Official Standings',
      `# Challenge: ${summary.challenge.title} (${summary.challenge.startDate} to ${summary.challenge.endDate})`,
      `# Total Campus Plates Saved: ${summary.campusTotals.totalPlatesSaved}`,
      `# Total Campus Food Saved: ${summary.campusTotals.totalKgSaved} kg`,
      '',
      'division,rank,mess_name,improvement_pct,baseline_grams_per_student,current_grams_per_student,days_logged,logging_completeness_pct,satisfaction_pct,status,flag_reason',
    ];

    Object.entries(summary.leaderboardByDivision).forEach(([division, messes]) => {
      messes.forEach((m) => {
        csvRows.push(
          `"${division}",${m.rankInDivision},"${m.messName}",${m.improvementPct}%,${m.baselineGramsPerStudent}g,${m.currentGramsPerStudent}g,${m.daysLogged},${m.loggingCompletenessPct}%,${m.satisfactionPct}%,"${m.isFlagged ? 'FLAGGED' : 'QUALIFIED'}","${m.flagReason || 'None'}"`
        );
      });
    });

    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="zero_waste_week_${challengeId}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
