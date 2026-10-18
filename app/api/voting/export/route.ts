import { NextRequest, NextResponse } from 'next/server';
import { getBallotResults } from '@/lib/voting';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ballotId = searchParams.get('ballotId');

    if (!ballotId) {
      return NextResponse.json({ error: 'ballotId is required.' }, { status: 400 });
    }

    const results = await getBallotResults(ballotId);

    // Build CSV
    const csvRows = [
      '# UniQ Weekly Menu Voting Committee Report',
      `# Ballot: ${results.ballot.title}`,
      `# Advisory Note: ${results.advisoryDisclaimer}`,
      `# Turnout: ${results.totalParticipants} / ${results.eligibleStudentCount} (${results.turnoutPct}%)`,
      '',
      'day_of_week,meal_type,dish_name,vote_count,vote_pct,waste_pct,satisfaction_pct',
    ];

    results.slots.forEach((slot) => {
      slot.dishes.forEach((dish) => {
        csvRows.push(
          `"${slot.dayOfWeek}","${slot.mealType}","${dish.name}",${dish.voteCount},${dish.percentage}%,${dish.wastePct}%,${dish.satisfactionPct}%`
        );
      });
      if (slot.noneOfTheseVotes > 0) {
        csvRows.push(`"${slot.dayOfWeek}","${slot.mealType}","None of these",${slot.noneOfTheseVotes},-,0%,-`);
      }
    });

    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="voting_results_${ballotId}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
