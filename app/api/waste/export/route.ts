import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const messCode = searchParams.get('messCode') || 'mess-1';

  try {
    const mess = await prisma.mess.findFirst({
      where: { code: messCode },
    });
    if (!mess) {
      return new NextResponse('Mess not found', { status: 404 });
    }

    const forecasts = await prisma.forecast.findMany({
      where: { messId: mess.id },
      orderBy: { date: 'desc' },
      take: 30,
    });

    let csv = 'Date,Meal Type,Expected Plates,Actual Plates,Booked Count,Confidence Level,Buffer Pct,Surplus Donated,NGO Contact\n';
    for (const f of forecasts) {
      csv += `"${f.date}","${f.mealType}",${f.expectedPlates},${f.actualPlates || 'N/A'},${f.bookedCount},"${f.confidenceLevel}",${f.safetyBufferPct},"${f.surplusNgoNotified ? 'Yes' : 'No'}","${f.surplusNgoContact || 'N/A'}"\n`;
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=mess_waste_report_${mess.code}_${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error exporting CSV';
    return new NextResponse(msg, { status: 500 });
  }
}
