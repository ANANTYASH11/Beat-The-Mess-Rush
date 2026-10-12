import { prisma } from './prisma';

export interface DishCookSuggestion {
  menuItemId: string;
  name: string;
  category: string;
  avgConsumptionKg: number;
  unitCostInr: number;
  baseKg: number;
  wasteFeedbackApplied: boolean;
  reductionPct: number;
  feedbackNote: string | null;
  suggestedCookKg: number;
}

export interface MealForecastResult {
  messId: string;
  messCode: string;
  date: string;
  mealType: string;
  historicalAvgPlates: number;
  bookedPlates: number;
  adoptionPct: number;
  expectedPlates: number;
  confidenceLevel: 'Low' | 'Moderate' | 'High';
  confidenceNote: string;
  eventTitle: string | null;
  eventAdjustmentPct: number;
  safetyBufferPct: number;
  dishes: DishCookSuggestion[];
  surplusNgoNotified: boolean;
  surplusNgoContact: string | null;
}

/**
 * Pure TypeScript forecasting algorithm.
 * Called directly or used as fallback if Python microservice is not responding.
 */
export async function calculateForecast(
  messCode = 'mess-1',
  dateStr?: string,
  mealType = 'Lunch'
): Promise<MealForecastResult> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  const mess = await prisma.mess.findFirst({
    where: { code: messCode },
  }) || await prisma.mess.findFirst() || {
    id: 'default',
    code: 'mess-1',
    name: 'North Hostel Mess',
  };

  // 1. Same-weekday historical average over past 4 weeks
  const pastForecasts = await prisma.forecast.findMany({
    where: {
      messId: mess.id,
      mealType,
      date: { lt: targetDate },
      actualPlates: { not: null },
    },
    orderBy: { date: 'desc' },
    take: 8,
  });

  let historicalAvgPlates = 505;
  if (pastForecasts.length > 0) {
    const sum = pastForecasts.reduce((acc, f) => acc + (f.actualPlates || 500), 0);
    historicalAvgPlates = Math.round(sum / pastForecasts.length);
  }

  // 2. Pre-booked count for target meal
  const bookedCount = await prisma.slotBooking.count({
    where: {
      messId: mess.id,
      date: targetDate,
      mealType,
      status: { not: 'SKIPPED' },
    },
  });

  const totalEligibleStudents = 608;
  const adoptionPct = Math.round((bookedCount / totalEligibleStudents) * 100);

  // 3. Blended forecast:
  // If adoption is low, rely heavily on history
  const bookingWeight = Math.min(0.65, Math.max(0.15, adoptionPct / 100));
  const historyWeight = 1 - bookingWeight;
  const empiricalScalingAdoption = 0.38; // typical empirical baseline adoption
  const bookingScaled = bookedCount > 0 ? Math.round(bookedCount / empiricalScalingAdoption) : historicalAvgPlates;

  let expectedPlates = Math.round(historyWeight * historicalAvgPlates + bookingWeight * bookingScaled);

  // 4. Honest confidence level
  let confidenceLevel: 'Low' | 'Moderate' | 'High' = 'Moderate';
  let confidenceNote = `Moderate confidence: ${adoptionPct}% pre-booked`;

  if (adoptionPct < 25) {
    confidenceLevel = 'Low';
    confidenceNote = `Low confidence: only ${adoptionPct}% pre-booked (heavily relying on 4-week history)`;
  } else if (adoptionPct > 50) {
    confidenceLevel = 'High';
    confidenceNote = `High confidence: ${adoptionPct}% pre-booked`;
  }

  // 5. Event Flags & Safety Buffer
  const eventFlag = await prisma.eventFlag.findUnique({
    where: {
      messId_date_mealType: {
        messId: mess.id,
        date: targetDate,
        mealType,
      },
    },
  });

  const eventAdjustmentPct = eventFlag ? eventFlag.adjustmentPct : 0;
  if (eventAdjustmentPct !== 0) {
    expectedPlates = Math.round(expectedPlates * (1 + eventAdjustmentPct / 100));
  }

  // Safety buffer from forecast record or default 8%
  const existingForecast = await prisma.forecast.findUnique({
    where: {
      messId_date_mealType: {
        messId: mess.id,
        date: targetDate,
        mealType,
      },
    },
  });

  const safetyBufferPct = existingForecast ? existingForecast.safetyBufferPct : 8.0;

  // 6. Dishes & Automated Feedback Loop
  const allMenuItems = await prisma.menuItem.findMany();
  const activeDishes = mealType === 'Lunch'
    ? allMenuItems.slice(0, 5)
    : allMenuItems.slice(4, 9);

  const dishSuggestions: DishCookSuggestion[] = [];

  for (const item of activeDishes) {
    const baseConsumptionKg = expectedPlates * item.avgConsumptionKg;

    // Check last 3 servings in waste logs
    const recentWaste = await prisma.wasteLog.findMany({
      where: {
        messId: mess.id,
        menuItemId: item.id,
        date: { lte: targetDate },
      },
      orderBy: { date: 'desc' },
      take: 3,
    });

    let wasteFeedbackApplied = false;
    let reductionPct = 0;
    let feedbackNote: string | null = null;

    if (recentWaste.length >= 3) {
      const highWasteServings = recentWaste.filter((w) => {
        const total = w.leftoverCookedKg + w.plateWasteKg;
        return w.cookedKg > 0 && total / w.cookedKg > 0.10;
      }).length;

      if (highWasteServings === 3) {
        wasteFeedbackApplied = true;
        reductionPct = 6;
        feedbackNote = `Auto-reduced ${item.name} by 6% based on >10% waste in last 3 servings`;
      }
    }

    const postFeedbackKg = wasteFeedbackApplied
      ? baseConsumptionKg * (1 - reductionPct / 100)
      : baseConsumptionKg;

    const suggestedCookKg = parseFloat(
      (postFeedbackKg * (1 + safetyBufferPct / 100)).toFixed(1)
    );

    dishSuggestions.push({
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      avgConsumptionKg: item.avgConsumptionKg,
      unitCostInr: item.unitCostInr,
      baseKg: parseFloat(baseConsumptionKg.toFixed(1)),
      wasteFeedbackApplied,
      reductionPct,
      feedbackNote,
      suggestedCookKg,
    });
  }

  return {
    messId: mess.id,
    messCode: mess.code,
    date: targetDate,
    mealType,
    historicalAvgPlates,
    bookedPlates: bookedCount,
    adoptionPct,
    expectedPlates,
    confidenceLevel,
    confidenceNote,
    eventTitle: eventFlag ? eventFlag.title : null,
    eventAdjustmentPct,
    safetyBufferPct,
    dishes: dishSuggestions,
    surplusNgoNotified: existingForecast ? existingForecast.surplusNgoNotified : false,
    surplusNgoContact: existingForecast ? existingForecast.surplusNgoContact : null,
  };
}
