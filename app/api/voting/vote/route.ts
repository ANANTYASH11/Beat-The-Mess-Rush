import { NextRequest, NextResponse } from 'next/server';
import { castVote, CastVoteInput } from '@/lib/voting';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.ballotId || !body.slotId || !body.rollNumber || !body.dishName) {
      return NextResponse.json({
        error: 'Missing required voting parameters: ballotId, slotId, rollNumber, dishName.',
      }, { status: 400 });
    }

    const voteInput: CastVoteInput = {
      ballotId: body.ballotId,
      slotId: body.slotId,
      rollNumber: body.rollNumber,
      dishName: body.dishName,
      reasonChip: body.reasonChip,
      deviceFingerprint: body.deviceFingerprint,
      idempotencyKey: body.idempotencyKey,
    };

    const result = await castVote(voteInput);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
