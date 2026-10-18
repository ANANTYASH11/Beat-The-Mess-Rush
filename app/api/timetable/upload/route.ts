import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTimetableRows, TimetableRowInput } from '@/lib/timetable';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const universitySlug = body.universitySlug || body.slug || 'lpu';
    const isPreview = Boolean(body.preview);
    const action = body.action;

    // Handle Undo action
    if (action === 'undo') {
      const latestImport = await prisma.timetableImportHistory.findFirst({
        where: { universityId: universitySlug, status: 'ACTIVE' },
        orderBy: { version: 'desc' },
      });

      if (!latestImport) {
        return NextResponse.json({ error: 'No active import found to undo.' }, { status: 400 });
      }

      // Delete entries from this version
      await prisma.timetableEntry.deleteMany({
        where: {
          universityId: universitySlug,
          version: latestImport.version,
        },
      });

      // Mark import history as REVERTED
      await prisma.timetableImportHistory.update({
        where: { id: latestImport.id },
        data: { status: 'REVERTED' },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully reverted import version ${latestImport.version} (${latestImport.filename}).`,
        revertedVersion: latestImport.version,
      });
    }

    const rows = body.rows || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No CSV rows provided.' }, { status: 400 });
    }

    // Get known blocks for validation
    const existingBlocks = await prisma.block.findMany({
      where: { universityId: universitySlug },
      select: { name: true },
    });
    const knownBlockNames = existingBlocks.map((b) => b.name);

    // Validate rows
    const { validRows, errors } = validateTimetableRows(rows, knownBlockNames);

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        valid: false,
        totalRows: rows.length,
        errorCount: errors.length,
        errors,
        previewRows: validRows.slice(0, 10),
      }, { status: 422 });
    }

    // If preview only, return validation success without writing to DB
    if (isPreview) {
      return NextResponse.json({
        success: true,
        valid: true,
        totalRows: rows.length,
        errorCount: 0,
        previewRows: validRows.slice(0, 15),
      });
    }

    // Determine next version
    const lastImport = await prisma.timetableImportHistory.findFirst({
      where: { universityId: universitySlug },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (lastImport?.version || 0) + 1;

    // Ensure all blocks exist in DB
    const uniqueBlocks = Array.from(new Set(validRows.map((r) => r.block)));
    for (const bName of uniqueBlocks) {
      await prisma.block.upsert({
        where: {
          universityId_name: {
            universityId: universitySlug,
            name: bName,
          },
        },
        create: {
          universityId: universitySlug,
          name: bName,
          walkingMinutes: JSON.stringify({ 'central-mess-north': 8 }),
          shareDistribution: JSON.stringify({ 'central-mess-north': 0.65 }),
        },
        update: {},
      });
    }

    // Fetch block map for IDs
    const allBlocks = await prisma.block.findMany({
      where: { universityId: universitySlug },
    });
    const blockIdMap = new Map(allBlocks.map((b) => [b.name, b.id]));

    // Insert versioned timetable entries
    const entriesToCreate = validRows.map((row) => ({
      universityId: universitySlug,
      blockId: blockIdMap.get(row.block) || allBlocks[0].id,
      dayOfWeek: row.day_of_week,
      classEndTime: row.class_end_time,
      studentsCount: row.students_count,
      buildingToMessMinutes: row.building_to_mess_minutes || 8,
      version: nextVersion,
    }));

    await prisma.timetableEntry.createMany({
      data: entriesToCreate,
    });

    // Record import history
    await prisma.timetableImportHistory.create({
      data: {
        universityId: universitySlug,
        version: nextVersion,
        filename: body.filename || `timetable_v${nextVersion}.csv`,
        rowsCount: validRows.length,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      version: nextVersion,
      rowsImported: validRows.length,
      message: `Successfully imported ${validRows.length} rows as version ${nextVersion}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
