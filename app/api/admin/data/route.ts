import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { university } from '@/config/university';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldExport = searchParams.get('export') === 'true';

    // Fetch data mode
    const modeSetting = await prisma.setting.findUnique({
      where: { key: 'data_mode' },
    });
    const dataMode = (modeSetting?.value as 'demo' | 'live') || 'demo';

    // Count distinct dates in queue events or waste logs to see how many days collected
    const events = await prisma.queueEvent.findMany({
      select: { date: true },
      distinct: ['date'],
    });
    const daysCollected = events.length;

    // Counts
    const [bookingsCount, queueEventsCount, wasteLogsCount, forecastsCount] = await Promise.all([
      prisma.slotBooking.count(),
      prisma.queueEvent.count(),
      prisma.wasteLog.count(),
      prisma.forecast.count(),
    ]);

    if (shouldExport) {
      const [messes, students, menuItems, slotBookings, queueEvents, wasteLogs, forecasts, settings] =
        await Promise.all([
          prisma.mess.findMany(),
          prisma.student.findMany(),
          prisma.menuItem.findMany(),
          prisma.slotBooking.findMany(),
          prisma.queueEvent.findMany(),
          prisma.wasteLog.findMany(),
          prisma.forecast.findMany(),
          prisma.setting.findMany(),
        ]);

      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        university: university.name,
        dataMode,
        summary: {
          messes: messes.length,
          students: students.length,
          menuItems: menuItems.length,
          slotBookings: slotBookings.length,
          queueEvents: queueEvents.length,
          wasteLogs: wasteLogs.length,
          forecasts: forecasts.length,
        },
        data: {
          messes,
          students,
          menuItems,
          slotBookings,
          queueEvents,
          wasteLogs,
          forecasts,
          settings,
        },
      });
    }

    return NextResponse.json({
      dataMode,
      daysCollected,
      requiredDays: 28,
      isSufficientData: daysCollected >= 28,
      counts: {
        bookingsCount,
        queueEventsCount,
        wasteLogsCount,
        forecastsCount,
      },
      university: university.name,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching data status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dataMode = body.dataMode === 'live' ? 'live' : 'demo';

    await prisma.setting.upsert({
      where: { key: 'data_mode' },
      update: { value: dataMode },
      create: { key: 'data_mode', value: dataMode },
    });

    return NextResponse.json({ success: true, dataMode });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating data mode';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Wipe demo / simulated historical tables while keeping core Mess, Student and MenuItem
    const [deletedBookings, deletedEvents, deletedWaste, deletedForecasts] = await Promise.all([
      prisma.slotBooking.deleteMany({}),
      prisma.queueEvent.deleteMany({}),
      prisma.wasteLog.deleteMany({}),
      prisma.forecast.deleteMany({}),
    ]);

    // Also switch data_mode to live
    await prisma.setting.upsert({
      where: { key: 'data_mode' },
      update: { value: 'live' },
      create: { key: 'data_mode', value: 'live' },
    });

    return NextResponse.json({
      success: true,
      cleared: {
        bookings: deletedBookings.count,
        queueEvents: deletedEvents.count,
        wasteLogs: deletedWaste.count,
        forecasts: deletedForecasts.count,
      },
      dataMode: 'live',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error wiping demo data';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
