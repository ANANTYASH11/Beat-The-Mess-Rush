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

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
