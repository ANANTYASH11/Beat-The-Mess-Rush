import { NextRequest, NextResponse } from 'next/server';
import { calculateArrivalCurve, WhatIfShift } from '@/lib/timetable';
import { getFeatureFlags } from '@/lib/feature-flags';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universitySlug = searchParams.get('universitySlug') || searchParams.get('slug') || 'lpu';
    const messId = searchParams.get('messId') || 'central-mess-north';
    const dayOfWeek = searchParams.get('dayOfWeek') || 'Wednesday';
    const mealType = searchParams.get('mealType') || 'Lunch';

    // Parse What-if shifts if provided in query (e.g. shifts=Block 34:15,Block 32:-10)
    const whatIfParam = searchParams.get('shifts');
    const whatIfShifts: WhatIfShift[] = [];
    if (whatIfParam) {
      whatIfParam.split(',').forEach((part) => {
        const [blockName, shiftStr] = part.split(':');
        if (blockName && shiftStr) {
          whatIfShifts.push({
            blockName: blockName.trim(),
            shiftMinutes: parseInt(shiftStr, 10) || 0,
          });
        }
      });
    }

    const flags = await getFeatureFlags(universitySlug);

    const result = await calculateArrivalCurve({
      universitySlug,
      messId,
      dayOfWeek,
      mealType,
      whatIfShifts,
    });

    return NextResponse.json({
      featureEnabled: flags.timetable,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
