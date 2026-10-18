import { prisma } from './prisma';
import { university, generateSlotsForMeal } from '@/config/university';

export interface LiveQueueResult {
  messId: string;
  messCode: string;
  messName: string;
  currentQueue: number;
  serviceRate: number; // students / minute
  waitRange: string;   // e.g. "5-8 min"
  crowdLevel: 'Low' | 'Medium' | 'High';
  thresholds: {
    low: number;
    high: number;
  };
  manualDriftOffset: number;
  upcomingBooked15min: number;
  timeCurve: Array<{ time: string; wait: string; queue: number; label: string }>;
  satelliteMessComparison?: {
    id: string;
    name: string;
    queue: number;
    estimatedWait: string;
  };
}

export async function markExpiredNoShows(todayStr: string) {
  try {
    const now = new Date();
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();

    const activeBookings = await prisma.slotBooking.findMany({
      where: {
        date: todayStr,
        status: 'BOOKED',
      },
      select: {
        id: true,
        slotStart: true,
      },
    });

    for (const b of activeBookings) {
      const [h, m] = b.slotStart.split(':').map(Number);
      // Slot ends after 15 min. No-show threshold is 20 min after slot end => +35 min total
      const noShowThresholdMin = (h * 60 + m) + 35;
      if (currentTotalMin > noShowThresholdMin) {
        await prisma.slotBooking.update({
          where: { id: b.id },
          data: { status: 'NO_SHOW' },
        });
      }
    }
  } catch (err) {
    console.error('Error marking no-shows:', err);
  }
}

export async function getLiveQueueStatus(messCode = university.messes[0]?.id || 'central-mess-north'): Promise<LiveQueueResult> {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Auto clean up no shows
  await markExpiredNoShows(todayStr);

  // 1. Get Mess
  const defaultMess = university.messes[0];
  const mess = await prisma.mess.findFirst({
    where: { code: messCode },
  }) || await prisma.mess.findFirst() || {
    id: 'default',
    code: defaultMess.id,
    name: defaultMess.name,
    capacity: defaultMess.seats,
    queueLowThresh: 15,
    queueHighThresh: 35,
  };

  // 2. Compute live queue: Checked-in + Walk-ins - Served + Drift Offset
  const events = await prisma.queueEvent.findMany({
    where: {
      messId: mess.id,
      date: todayStr,
    },
    select: {
      eventType: true,
      adjustmentValue: true,
      createdAt: true,
    },
  });

  let checkinAndWalkinCount = 0;
  let servedCount = 0;

  for (const e of events) {
    if (e.eventType === 'CHECKIN' || e.eventType === 'WALKIN') {
      checkinAndWalkinCount += e.adjustmentValue;
    } else if (e.eventType === 'SERVED') {
      servedCount += Math.abs(e.adjustmentValue);
    }
  }

  // Drift offset from Setting
  const driftKey = `drift_offset_${mess.code}`;
  const driftSetting = await prisma.setting.findUnique({
    where: { key: driftKey },
  });
  const manualDriftOffset = driftSetting ? parseInt(driftSetting.value, 10) || 0 : 0;

  // Queue length = checked-in minus served + manual drift offset
  const computedQueue = Math.max(0, checkinAndWalkinCount - servedCount + manualDriftOffset);

  // 3. Rolling Service Rate: served events in the last 10 minutes / 10
  const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const servedLast10Min = events.filter(
    (e) => e.eventType === 'SERVED' && new Date(e.createdAt) >= tenMinAgo
  ).length;

  let serviceRate = servedLast10Min / 10;
  if (serviceRate < 1.0) {
    serviceRate = 7.5; // baseline typical line rate (6-10 students/min)
  }
  serviceRate = parseFloat(serviceRate.toFixed(1));

  // 4. Upcoming pre-booked students in next 15 minutes
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const slotMin = Math.floor(currentMin / 15) * 15;
  const currentSlotStr = `${currentHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;

  const upcomingBookedCount = await prisma.slotBooking.count({
    where: {
      messId: mess.id,
      date: todayStr,
      slotStart: currentSlotStr,
      status: 'BOOKED',
    },
  });

  // Estimated wait = queue length / service rate + adjustment for upcoming booked
  const baseWait = computedQueue / serviceRate;
  const upcomingAdj = (upcomingBookedCount * 0.35) / serviceRate;
  const totalWaitMinutes = baseWait + upcomingAdj;

  const waitMin = Math.max(1, Math.floor(totalWaitMinutes - 1.5));
  const waitMax = Math.max(waitMin + 2, Math.ceil(totalWaitMinutes + 2));
  const waitRangeStr = `${waitMin}-${waitMax} min`;

  // Crowd level categorization
  let crowdLevel: 'Low' | 'Medium' | 'High' = 'Medium';
  if (computedQueue < mess.queueLowThresh) {
    crowdLevel = 'Low';
  } else if (computedQueue > mess.queueHighThresh) {
    crowdLevel = 'High';
  }

  // Curve of wait by time of day generated dynamically from meal slots
  const lunchSlots = generateSlotsForMeal('Lunch').slice(0, 6);
  const timeCurve = lunchSlots.map((slot, idx) => {
    const isPeak = slot === university.peakWindows.lunch;
    const isQuiet = idx === 0 || idx === lunchSlots.length - 1;
    return {
      time: slot,
      wait: isPeak ? '12-16 min' : (isQuiet ? '3-5 min' : '6-9 min'),
      queue: isPeak ? 38 : (isQuiet ? 8 : 18),
      label: isPeak ? 'Peak Rush' : (isQuiet ? 'Quiet' : 'Moderate'),
    };
  });

  // Satellite Mess comparison
  const otherMess = await prisma.mess.findFirst({
    where: { code: { not: mess.code } },
  });

  return {
    messId: mess.id,
    messCode: mess.code,
    messName: mess.name,
    currentQueue: computedQueue,
    serviceRate,
    waitRange: waitRangeStr,
    crowdLevel,
    thresholds: {
      low: mess.queueLowThresh,
      high: mess.queueHighThresh,
    },
    manualDriftOffset,
    upcomingBooked15min: upcomingBookedCount,
    timeCurve,
    satelliteMessComparison: otherMess
      ? {
          id: otherMess.id,
          name: otherMess.name,
          queue: 8,
          estimatedWait: '3-5 min',
        }
      : undefined,
  };
}
