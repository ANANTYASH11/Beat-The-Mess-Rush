import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { university } from '@/config/university';

export async function GET() {
  try {
    const keys = [
      'pilot_baseline_waste_kg',
      'pilot_baseline_wait_min',
      'pilot_measured_waste_kg',
      'pilot_measured_wait_min',
      'pilot_phase',
      'pilot_checklist',
      'pilot_notes',
    ];

    const settings = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });

    const data: Record<string, string> = {};
    settings.forEach((s) => {
      data[s.key] = s.value;
    });

    return NextResponse.json({
      university: university.name,
      messName: university.messes[0].name,
      baseline: {
        wasteKg: data['pilot_baseline_waste_kg'] || '',
        waitMin: data['pilot_baseline_wait_min'] || '',
      },
      measured: {
        wasteKg: data['pilot_measured_waste_kg'] || '',
        waitMin: data['pilot_measured_wait_min'] || '',
      },
      phase: Number(data['pilot_phase']) || 1,
      checklist: data['pilot_checklist'] ? JSON.parse(data['pilot_checklist']) : {},
      notes: data['pilot_notes'] || '',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching pilot settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const updates: { key: string; value: string }[] = [];

    if (body.baselineWasteKg !== undefined) {
      updates.push({ key: 'pilot_baseline_waste_kg', value: String(body.baselineWasteKg) });
    }
    if (body.baselineWaitMin !== undefined) {
      updates.push({ key: 'pilot_baseline_wait_min', value: String(body.baselineWaitMin) });
    }
    if (body.measuredWasteKg !== undefined) {
      updates.push({ key: 'pilot_measured_waste_kg', value: String(body.measuredWasteKg) });
    }
    if (body.measuredWaitMin !== undefined) {
      updates.push({ key: 'pilot_measured_wait_min', value: String(body.measuredWaitMin) });
    }
    if (body.phase !== undefined) {
      updates.push({ key: 'pilot_phase', value: String(body.phase) });
    }
    if (body.checklist !== undefined) {
      updates.push({ key: 'pilot_checklist', value: JSON.stringify(body.checklist) });
    }
    if (body.notes !== undefined) {
      updates.push({ key: 'pilot_notes', value: String(body.notes) });
    }

    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error saving pilot values';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
