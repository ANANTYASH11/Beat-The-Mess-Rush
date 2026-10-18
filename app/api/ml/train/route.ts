import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerMlTraining } from '@/lib/ml-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const universitySlug = body.universitySlug || 'lpu';
    const modelType = body.modelType || 'attendance_forecast';
    const dataMode = body.dataMode || 'SIMULATED';
    const testDays = body.testDays || 14;

    // Trigger Python ML microservice training
    const trainResponse = await triggerMlTraining({
      universitySlug,
      modelType,
      dataMode,
      testDays,
      daysToGenerate: 84, // 12 weeks
    });

    const result = trainResponse.result;

    // If promoted, deactivate previous versions in DB
    if (result.is_promoted) {
      await prisma.modelRun.updateMany({
        where: {
          universityId: universitySlug,
          modelName: result.model_name,
          active: true,
        },
        data: { active: false },
      });
    }

    // Persist new ModelRun record in SQLite
    const modelRun = await prisma.modelRun.create({
      data: {
        universityId: universitySlug,
        modelName: result.model_name,
        version: result.version,
        trainedAt: new Date(result.trained_at),
        rows: result.rows,
        metrics: JSON.stringify(result.metrics),
        dataMode: result.data_mode,
        active: Boolean(result.is_promoted),
        artefactPath: result.artefact_path,
        features: JSON.stringify(result.top_features),
        notes: result.promotion_reason,
      },
    });

    return NextResponse.json({
      success: true,
      modelRun: {
        id: modelRun.id,
        version: modelRun.version,
        active: modelRun.active,
        metrics: result.metrics,
        notes: modelRun.notes,
        is_promoted: result.is_promoted,
        promotion_reason: result.promotion_reason,
        top_features: result.top_features,
        chart_data: result.chart_data,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
