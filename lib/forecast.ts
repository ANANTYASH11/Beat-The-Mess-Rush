import { prisma } from './prisma';
import { university, getDayOfWeek, getMenuForDayAndMeal } from '@/config/university';
import { predictAttendanceMl } from './ml-client';

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
  dataMode?: 'demo' | 'live';
  daysCollected?: number;
  planSplitPct?: number;
  planSplitLabel?: string;
  // ML Quantile Regression & Driver fields
  mlRange?: {
    p10: number;
    p90: number;
    label: string;
    intervalWidth: number;
  };
  mlTopDrivers?: Array<{
    feature: string;
    label: string;
    weight: number;
  }>;
  mlEngine?: string;
  isMlActive?: boolean;
  baselinePlates?: number;
}

/**
 * Pure TypeScript forecasting algorithm.
 * Called directly or used as fallback if Python microservice is not responding.
 */
export async function calculateForecast(
  messCode = university.messes[0]?.id || 'central-mess-north',
  dateStr?: string,
  mealType = 'Lunch'
): Promise<MealForecastResult> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  const defaultMess = university.messes[0];
  const mess = await prisma.mess.findFirst({
    where: { code: messCode },
  }) || await prisma.mess.findFirst() || {
    id: 'default',
    code: defaultMess.id,
    name: defaultMess.name,
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

  // 2. Meal Plan Filter: Count only students whose plan includes target meal
  const totalStudentsInSystem = await prisma.student.count();
  const eligiblePlanStudents = await prisma.student.count({
    where: {
      mealPlan: {
        meals: {
          contains: mealType,
        },
      },
    },
  });

  const eligibleRatio = totalStudentsInSystem > 0
    ? eligiblePlanStudents / totalStudentsInSystem
    : mealType.toLowerCase() === 'snacks' ? 0.62 : 1.0;

  const baseCapacity = (mess as any).studentsAssigned || 600;
  const totalEligibleStudents = Math.max(1, Math.round(baseCapacity * eligibleRatio));

  // Scale historical baseline by plan eligibility if not already scaled
  if (mealType.toLowerCase() === 'snacks' && historicalAvgPlates > 400) {
    historicalAvgPlates = Math.round(historicalAvgPlates * eligibleRatio);
  }

  // 3. Pre-booked count for target meal
  const bookedCount = await prisma.slotBooking.count({
    where: {
      messId: mess.id,
      date: targetDate,
      mealType,
      status: { not: 'SKIPPED' },
    },
  });

  const adoptionPct = Math.round((bookedCount / totalEligibleStudents) * 100);

  // 4. Blended forecast:
  // If adoption is low, rely heavily on history
  const bookingWeight = Math.min(0.65, Math.max(0.15, adoptionPct / 100));
  const historyWeight = 1 - bookingWeight;
  const empiricalScalingAdoption = 0.38; // typical empirical baseline adoption
  const bookingScaled = bookedCount > 0 ? Math.round(bookedCount / empiricalScalingAdoption) : historicalAvgPlates;

  const baselineExpectedPlates = Math.round(historyWeight * historicalAvgPlates + bookingWeight * bookingScaled);
  let expectedPlates = baselineExpectedPlates;

  const planSplitPct = Math.round(eligibleRatio * 100);
  const planSplitLabel = `${mealType}: ${planSplitPct}% of students on a plan with ${mealType.toLowerCase()}`;

  // Check Data Mode (Demo vs Live)
  const dataModeSetting = await prisma.setting.findUnique({
    where: { key: 'data_mode' },
  });
  const dataMode = (dataModeSetting?.value === 'live' ? 'live' : 'demo') as 'demo' | 'live';
  const daysCollected = pastForecasts.length;

  // 4. Honest confidence level
  let confidenceLevel: 'Low' | 'Moderate' | 'High' = 'Moderate';
  let confidenceNote = `Moderate confidence: ${adoptionPct}% pre-booked`;

  if (dataMode === 'live' && daysCollected < 28) {
    confidenceLevel = 'Low';
    confidenceNote = `Low confidence: ${daysCollected} of 28 days collected in live mode. Fallback to baseline buffer.`;
  } else if (adoptionPct < 25) {
    confidenceLevel = 'Low';
    confidenceNote = `Low confidence: only ${adoptionPct}% pre-booked (relying heavily on history)`;
  } else if (adoptionPct > 50) {
    confidenceLevel = 'High';
    confidenceNote = `High confidence: ${adoptionPct}% pre-booked`;
  }

  // ML Quantile Inference Integration
  const targetDateObj = new Date(targetDate);
  const weekday = isNaN(targetDateObj.getTime()) ? 0 : targetDateObj.getDay() === 0 ? 6 : targetDateObj.getDay() - 1;
  const isWeekend = weekday >= 5 ? 1 : 0;
  const mealCodeMap: Record<string, number> = { Breakfast: 0, Lunch: 1, Snacks: 2, Dinner: 3 };
  const mealCode = mealCodeMap[mealType] ?? 1;

  const prebookingT1h = bookedCount;
  const prebookingT3h = Math.round(bookedCount * 0.45);
  const bookingVelocity = (prebookingT1h - prebookingT3h) / 2.0;

  let isMlActive = false;
  let mlRange: { p10: number; p90: number; label: string; intervalWidth: number } | undefined = undefined;
  let mlTopDrivers: Array<{ feature: string; label: string; weight: number }> | undefined = undefined;
  let mlEngine = 'TYPESCRIPT_BASELINE';

  const mlPrediction = await predictAttendanceMl({
    universitySlug: 'lpu',
    messCode: mess.code,
    mealType,
    features: {
      weekday,
      meal_code: mealCode,
      week_of_semester: 8,
      is_weekend: isWeekend,
      is_exam_week: 0,
      is_fest_week: 0,
      is_holiday: 0,
      prebooking_t3h: prebookingT3h,
      prebooking_t1h: prebookingT1h,
      booking_velocity: bookingVelocity,
      lag_7d: historicalAvgPlates,
      lag_14d: historicalAvgPlates,
      lag_21d: historicalAvgPlates,
      rolling_7d_mean: historicalAvgPlates,
      plan_mix_ratio: eligibleRatio,
      eligible_headcount: totalEligibleStudents,
    },
  });

  if (mlPrediction && !mlPrediction.use_baseline) {
    expectedPlates = mlPrediction.expected_plates;
    mlRange = {
      p10: mlPrediction.p10,
      p90: mlPrediction.p90,
      label: mlPrediction.range_label,
      intervalWidth: mlPrediction.interval_width,
    };
    mlTopDrivers = mlPrediction.top_drivers;
    mlEngine = mlPrediction.engine;
    isMlActive = true;
    confidenceLevel = mlPrediction.confidence_level;
    confidenceNote = `${mlPrediction.confidence_level} confidence: ${mlPrediction.range_label} (LightGBM Quantile)`;
  } else {
    confidenceNote = `${confidenceNote} • Using baseline forecast`;
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

  // 6. Dishes & Automated Feedback Loop from Config Weekly Menu
  const dateObj = new Date(targetDate);
  const dayName = isNaN(dateObj.getTime()) ? 'Monday' : getDayOfWeek(dateObj);
  const dayDishesConfig = getMenuForDayAndMeal(dayName, mealType);

  const allMenuItems = await prisma.menuItem.findMany();
  // Match with weekly menu dishes, or fallback to slice
  const matchedItems = allMenuItems.filter((item) =>
    dayDishesConfig.some((cfg) => cfg.name.toLowerCase() === item.name.toLowerCase())
  );

  const activeDishes = matchedItems.length >= 3
    ? matchedItems
    : (mealType === 'Lunch' ? allMenuItems.slice(0, 5) : allMenuItems.slice(4, 9));

  const dishSuggestions: DishCookSuggestion[] = [];

  for (const item of activeDishes) {
    const itemAvgKg = (item as any).avgGramsPerPlate ? (item as any).avgGramsPerPlate / 1000 : ((item as any).avgConsumptionKg || 0.15);
    const baseConsumptionKg = expectedPlates * itemAvgKg;

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
      avgConsumptionKg: itemAvgKg,
      unitCostInr: (item as any).unitCostInr || university.costPerKgFood,
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
    dataMode,
    daysCollected,
    planSplitPct,
    planSplitLabel: `${planSplitLabel} (assumption)`,
    mlRange,
    mlTopDrivers,
    mlEngine,
    isMlActive,
    baselinePlates: baselineExpectedPlates,
  };
}
