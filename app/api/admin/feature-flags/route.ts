import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlags, setFeatureFlags, resetFeatureFlags } from '@/lib/feature-flags';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universitySlug = searchParams.get('universitySlug') || searchParams.get('slug') || 'lpu';
    const flags = await getFeatureFlags(universitySlug);

    return NextResponse.json({
      universitySlug,
      flags,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const universitySlug = body.universitySlug || body.slug || 'lpu';

    if (body.reset) {
      const flags = await resetFeatureFlags(universitySlug);
      return NextResponse.json({ success: true, universitySlug, flags });
    }

    const updates = {
      ...(typeof body.timetable === 'boolean' ? { timetable: body.timetable } : {}),
      ...(typeof body.voting === 'boolean' ? { voting: body.voting } : {}),
      ...(typeof body.challenge === 'boolean' ? { challenge: body.challenge } : {}),
      ...(typeof body.display_challenge_ticker === 'boolean' ? { display_challenge_ticker: body.display_challenge_ticker } : {}),
    };

    const flags = await setFeatureFlags(universitySlug, updates);
    return NextResponse.json({ success: true, universitySlug, flags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
