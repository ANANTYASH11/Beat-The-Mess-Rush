import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMlModelsStatus, checkMlServiceHealth } from '@/lib/ml-client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const universitySlug = searchParams.get('universitySlug') || 'lpu';

  try {
    const isServiceOnline = await checkMlServiceHealth();

    // Query recorded model runs from database
    const modelRuns = await prisma.modelRun.findMany({
      where: { universityId: universitySlug },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const activeDbModel = modelRuns.find((m) => m.active);

    // Query live python service metadata if online
    let liveServiceStatus = null;
    if (isServiceOnline) {
      liveServiceStatus = await getMlModelsStatus(universitySlug);
    }

    return NextResponse.json({
      serviceOnline: isServiceOnline,
      universitySlug,
      activeModel: activeDbModel ? {
        id: activeDbModel.id,
        modelName: activeDbModel.modelName,
        version: activeDbModel.version,
        dataMode: activeDbModel.dataMode,
        trainedAt: activeDbModel.trainedAt,
        metrics: JSON.parse(activeDbModel.metrics || '{}'),
        notes: activeDbModel.notes,
      } : null,
      history: modelRuns.map((m) => ({
        id: m.id,
        version: m.version,
        modelName: m.modelName,
        dataMode: m.dataMode,
        active: m.active,
        trainedAt: m.trainedAt,
        rows: m.rows,
        metrics: JSON.parse(m.metrics || '{}'),
        notes: m.notes,
      })),
      liveService: liveServiceStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
