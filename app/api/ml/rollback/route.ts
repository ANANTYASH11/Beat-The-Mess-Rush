import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rollbackMlModel } from '@/lib/ml-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const universitySlug = body.universitySlug || 'lpu';
    const modelName = body.modelName || 'attendance_forecast';

    const rollbackResult = await rollbackMlModel({
      universitySlug,
      modelName,
    });

    const activeMeta = rollbackResult.active_model;

    if (activeMeta) {
      // Deactivate current active in DB and activate rolled back version
      await prisma.modelRun.updateMany({
        where: { universityId: universitySlug, modelName },
        data: { active: false },
      });

      await prisma.modelRun.updateMany({
        where: {
          universityId: universitySlug,
          modelName,
          version: activeMeta.version,
        },
        data: { active: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: rollbackResult.message,
      activeVersion: activeMeta?.version,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
