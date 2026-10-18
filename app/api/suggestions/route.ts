import { NextRequest, NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/suggestions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = (searchParams.get('target') || 'KITCHEN') as 'KITCHEN' | 'STAFF' | 'ADMIN' | 'STUDENT';
  const messCode = searchParams.get('messCode') || undefined;
  const dateStr = searchParams.get('date') || undefined;
  const mealType = searchParams.get('mealType') || undefined;
  const universitySlug = searchParams.get('universitySlug') || 'lpu';

  try {
    const suggestions = await getSuggestions({
      target,
      messCode,
      dateStr,
      mealType,
      universitySlug,
    });

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
