import { NextRequest, NextResponse } from 'next/server';
import { recordFeedback } from '@/lib/suggestions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      universitySlug = 'lpu',
      target,
      messCode,
      suggestionKey,
      recommendation,
      evidence,
      impactExpected,
      confidence,
      action,
      reason,
    } = body;

    if (!target || !suggestionKey || !action || !recommendation) {
      return NextResponse.json(
        { error: 'Missing required feedback fields (target, suggestionKey, action, recommendation)' },
        { status: 400 }
      );
    }

    const recorded = await recordFeedback({
      universitySlug,
      target,
      messCode,
      suggestionKey,
      recommendation,
      evidence,
      impactExpected,
      confidence,
      action,
      reason,
    });

    return NextResponse.json({
      success: true,
      id: recorded.id,
      action: recorded.action,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
