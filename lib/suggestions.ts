import { prisma } from './prisma';
import { university } from '@/config/university';
import { calculateForecast } from './forecast';
import { predictWasteMl } from './ml-client';

export interface SuggestionItem {
  id: string;
  key: string;
  target: 'KITCHEN' | 'STAFF' | 'ADMIN' | 'STUDENT';
  messCode?: string;
  recommendation: string;
  evidence: string;
  impactRange: string;
  confidence: 'High' | 'Medium' | 'Low';
  foodSafetyNotice?: string;
  guardrailNote?: string;
  suggestedAdjustmentPct?: number;
  dataMode: 'SIMULATED' | 'REAL';
}

/**
 * Generates domain-tailored suggestions with guardrails:
 * - Never auto-changes quantities or settings.
 * - Caps quantity adjustments at +/-20%.
 * - Includes food-safety reminders on food items.
 * - Enforces minimum serving floor.
 * - Omits dismissed or snoozed suggestions for the current session.
 */
export async function getSuggestions(params: {
  target: 'KITCHEN' | 'STAFF' | 'ADMIN' | 'STUDENT';
  messCode?: string;
  dateStr?: string;
  mealType?: string;
  universitySlug?: string;
}): Promise<SuggestionItem[]> {
  const universitySlug = params.universitySlug || 'lpu';
  const messCode = params.messCode || university.messes[0].id;
  const targetDate = params.dateStr || new Date().toISOString().split('T')[0];
  const mealType = params.mealType || 'Lunch';

  // Check recent dismissed/snoozed feedback in DB for today to avoid nagging
  const recentFeedback = await prisma.suggestionFeedback.findMany({
    where: {
      universityId: universitySlug,
      target: params.target,
      action: { in: ['DISMISSED', 'SNOOZED'] },
      createdAt: { gte: new Date(Date.now() - 6 * 3600 * 1000) }, // last 6 hours
    },
  });

  const inactiveKeys = new Set(recentFeedback.map((f) => f.suggestionKey));

  const items: SuggestionItem[] = [];

  if (params.target === 'KITCHEN') {
    // 1. Cook Quantity right-sizing suggestion
    const forecast = await calculateForecast(messCode, targetDate, mealType);
    const usualPlates = forecast.historicalAvgPlates || 505;
    const mlPlates = forecast.expectedPlates || 490;
    const diffPct = Math.round(((mlPlates - usualPlates) / usualPlates) * 100);
    const cappedPct = Math.max(-20, Math.min(20, diffPct));

    const usualRiceKg = 62;
    const suggestedRiceKg = Math.max(30, Math.round(usualRiceKg * (1 + cappedPct / 100)));

    if (!inactiveKeys.has('kitchen_rice_batch')) {
      items.push({
        id: 'sug-k-1',
        key: 'kitchen_rice_batch',
        target: 'KITCHEN',
        messCode,
        recommendation: `Cook ${suggestedRiceKg - 3}–${suggestedRiceKg + 3} kg Steamed Basmati Rice for ${mealType.toLowerCase()} (usual ${usualRiceKg} kg).`,
        evidence: `Exam week scheduling and current booking velocity indicate attendance will be ${diffPct}% lower than 4-week weekday average.`,
        impactRange: `Save 4–8 kg cooked rice (~₹160–₹280 food cost) while maintaining safe buffer.`,
        confidence: forecast.isMlActive ? 'High' : 'Medium',
        foodSafetyNotice: 'Food safety notice: Maintain core serving temperature above 65°C. Never cut below 30 kg emergency serving floor.',
        guardrailNote: `Adjustment capped at ${cappedPct}% (within ±20% guardrail limit).`,
        suggestedAdjustmentPct: cappedPct,
        dataMode: 'SIMULATED',
      });
    }

    // 2. Dish-level waste reduction suggestion
    if (!inactiveKeys.has('kitchen_lauki_waste')) {
      items.push({
        id: 'sug-k-2',
        key: 'kitchen_lauki_waste',
        target: 'KITCHEN',
        messCode,
        recommendation: 'Lauki Chana Dal: Reduce batch preparation by 12% for upcoming serving.',
        evidence: 'Consistent plate & pot waste exceeded 24% over the last 4 servings. Student pickup rate decreases during mid-week.',
        impactRange: 'Prevent 3.5–5.2 kg surplus waste (~₹190–₹260 food procurement cost).',
        confidence: 'High',
        foodSafetyNotice: 'Food safety notice: Prepare in staggered 15 kg half-batches to ensure freshness and hot holding.',
        guardrailNote: 'Adjustment capped at -12% (within ±20% safety guardrail limit).',
        suggestedAdjustmentPct: -12,
        dataMode: 'SIMULATED',
      });
    }
  } else if (params.target === 'STAFF') {
    if (!inactiveKeys.has('staff_counter_open')) {
      items.push({
        id: 'sug-s-1',
        key: 'staff_counter_open',
        target: 'STAFF',
        messCode,
        recommendation: 'Open a second service counter at 12:50 PM.',
        evidence: 'Pre-booking intake (+18 students/hr) predicts arrival burst exceeding 25 students between 12:45–13:05 PM.',
        impactRange: 'Reduces queue wait time from ~11 min down to 4–6 min per student.',
        confidence: 'High',
        guardrailNote: 'Operational advisory: Staff discretion required before counter reassignment.',
        dataMode: 'SIMULATED',
      });
    }

    if (!inactiveKeys.has('staff_noshow_rate')) {
      items.push({
        id: 'sug-s-2',
        key: 'staff_noshow_rate',
        target: 'STAFF',
        messCode,
        recommendation: 'Expected no-show rate for 13:30 slot: 16–20%.',
        evidence: 'Historical late-slot attendance on sunny Fridays shows regular hostel drift away from dining hall.',
        impactRange: 'Allows admitting 12–15 walk-in students without exceeding seating capacity.',
        confidence: 'Medium',
        guardrailNote: 'Crowd management guidance: Monitor walk-in headcount at entry terminal.',
        dataMode: 'SIMULATED',
      });
    }
  } else if (params.target === 'ADMIN') {
    if (!inactiveKeys.has('admin_snacks_split')) {
      items.push({
        id: 'sug-a-1',
        key: 'admin_snacks_split',
        target: 'ADMIN',
        recommendation: 'Snacks forecast is consistently over by 11% — review Basic plan share.',
        evidence: 'Basic / Custom plan share is currently 38% (3-meal plan excluding snacks). Standard recipes are over-catering snacks.',
        impactRange: 'Right-sizing snacks procurement saves ₹4,200–₹6,800 weekly across campus messes.',
        confidence: 'High',
        guardrailNote: 'Contractual note: Verify hostel student plan allocations with university registrar.',
        dataMode: 'SIMULATED',
      });
    }

    if (!inactiveKeys.has('admin_cluster_pattern')) {
      items.push({
        id: 'sug-a-2',
        key: 'admin_cluster_pattern',
        target: 'ADMIN',
        recommendation: 'Central Mess North has demand pattern matching Boys Hostel Mess 1.',
        evidence: 'K-Means clustering indicates both facilities experience 68% of dinner volume in the first 40 minutes.',
        impactRange: 'Share counter staging and batch replenishment practices between mess supervisors.',
        confidence: 'Medium',
        guardrailNote: 'Cluster insight: Operational comparison based on 12-week arrival patterns.',
        dataMode: 'SIMULATED',
      });
    }
  } else if (params.target === 'STUDENT') {
    items.push({
      id: 'sug-stu-1',
      key: 'student_slot_recommend',
      target: 'STUDENT',
      messCode,
      recommendation: '12:55 PM slot is predicted to be 5–8 minutes faster than 13:05 PM.',
      evidence: 'Student arrivals peak sharply between 13:05 and 13:20 after academic lecture blocks.',
      impactRange: 'Estimated queue time 3–5 min vs 11–14 min.',
      confidence: 'Medium',
      guardrailNote: 'Prediction range estimate only; not a guaranteed service duration.',
      dataMode: 'SIMULATED',
    });
  }

  return items;
}

/**
 * Persists user action (ACCEPTED, DISMISSED, SNOOZED) to the SuggestionFeedback table.
 */
export async function recordFeedback(params: {
  universitySlug?: string;
  target: string;
  messCode?: string;
  suggestionKey: string;
  recommendation: string;
  evidence?: string;
  impactExpected?: string;
  confidence?: string;
  action: 'ACCEPTED' | 'DISMISSED' | 'SNOOZED';
  reason?: string;
}) {
  return await prisma.suggestionFeedback.create({
    data: {
      universityId: params.universitySlug || 'lpu',
      target: params.target,
      messCode: params.messCode,
      suggestionKey: params.suggestionKey,
      recommendation: params.recommendation,
      evidence: params.evidence,
      impactExpected: params.impactExpected,
      confidence: params.confidence,
      action: params.action,
      reason: params.reason,
    },
  });
}
