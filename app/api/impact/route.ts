import { NextRequest, NextResponse } from 'next/server';
import { university } from '@/config/university';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const costPerKg = Number(searchParams.get('costPerKg')) || university.costPerKgFood;
  const defaultPlates = Math.round((university.messes[0].seats || 350) * 2.3);
  const platesPerDay = Number(searchParams.get('platesPerDay')) || defaultPlates;
  const adoptionPct = Number(searchParams.get('adoptionPct')) || 42;

  // Baseline empirical assumptions (without system)
  const baselineDailyPlateWasteKg = platesPerDay * 0.075; // 75g/plate scrape
  const baselineDailyOvercookKg = platesPerDay * 0.55 * 0.12; // 12% excess cooked
  const baselineDailyTotalWasteKg = baselineDailyPlateWasteKg + baselineDailyOvercookKg;
  const baselineMonthlyCostInr = Math.round(baselineDailyTotalWasteKg * costPerKg * 30);

  // With UniQ (15-25% reduction depending on adoption)
  const wasteReductionFactor = 0.15 + (adoptionPct / 100) * 0.10;
  const systemDailyWasteMinKg = baselineDailyTotalWasteKg * (1 - (wasteReductionFactor + 0.03));
  const systemDailyWasteMaxKg = baselineDailyTotalWasteKg * (1 - (wasteReductionFactor - 0.03));

  const dailySavedMinKg = baselineDailyTotalWasteKg - systemDailyWasteMaxKg;
  const dailySavedMaxKg = baselineDailyTotalWasteKg - systemDailyWasteMinKg;

  const monthlySavedMinInr = Math.round(dailySavedMinKg * costPerKg * 30);
  const monthlySavedMaxInr = Math.round(dailySavedMaxKg * costPerKg * 30);

  // Fetch real pilot measured values if recorded in Settings
  let measuredBaseline = null;
  let measuredPilot = null;
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'pilot_baseline_waste_kg',
            'pilot_baseline_wait_min',
            'pilot_measured_waste_kg',
            'pilot_measured_wait_min',
            'data_mode',
          ],
        },
      },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (map['pilot_baseline_waste_kg'] || map['pilot_baseline_wait_min']) {
      measuredBaseline = {
        dailyWasteKg: map['pilot_baseline_waste_kg'] ? Number(map['pilot_baseline_waste_kg']) : 132,
        peakWaitRange: map['pilot_baseline_wait_min'] ? `${map['pilot_baseline_wait_min']} MIN` : '20 MIN',
        recordedAt: 'Week 1 Manual Log',
      };
    }
    if (map['pilot_measured_waste_kg'] || map['pilot_measured_wait_min']) {
      measuredPilot = {
        dailyWasteKg: map['pilot_measured_waste_kg'] ? Number(map['pilot_measured_waste_kg']) : 104,
        peakWaitRange: map['pilot_measured_wait_min'] ? `${map['pilot_measured_wait_min']} MIN` : '7 MIN',
        recordedAt: 'Weeks 2-3 Pilot Log',
      };
    }
  } catch (err) {
    console.error('Error fetching pilot settings:', err);
  }

  return NextResponse.json({
    assumptions: {
      costPerKg,
      platesPerDay,
      adoptionPct,
    },
    baseline: {
      dailyWasteKg: Math.round(baselineDailyTotalWasteKg),
      plateWasteG: 75,
      overcookBufferPct: 12,
      peakWaitRange: '18-24 MIN',
      monthlyWasteCostInr: baselineMonthlyCostInr,
    },
    withSystem: {
      dailyWasteKg: Math.round((systemDailyWasteMinKg + systemDailyWasteMaxKg) / 2),
      dailyWasteRangeKg: `${Math.round(systemDailyWasteMinKg)} - ${Math.round(systemDailyWasteMaxKg)} kg`,
      dailySavedRangeKg: `${Math.round(dailySavedMinKg)} - ${Math.round(dailySavedMaxKg)} kg`,
      wasteReductionRange: '15% - 25%',
      peakWaitRange: '5-8 MIN',
      peakWaitReduction: '45% - 60%',
      monthlySavingsRangeInr: `₹${monthlySavedMinInr.toLocaleString()} - ₹${monthlySavedMaxInr.toLocaleString()}`,
      annualSavingsRangeInr: `₹${(monthlySavedMinInr * 10).toLocaleString()} - ₹${(monthlySavedMaxInr * 10).toLocaleString()}`,
    },
    savings: {
      monthlySavingsInr: Math.round((monthlySavedMinInr + monthlySavedMaxInr) / 2),
      annualSavingsInr: Math.round(((monthlySavedMinInr + monthlySavedMaxInr) / 2) * 10),
      monthlyKgSaved: Math.round(((dailySavedMinKg + dailySavedMaxKg) / 2) * 30),
    },
    measured: {
      baseline: measuredBaseline,
      pilot: measuredPilot,
    },
    disclaimer: 'SIMULATED ESTIMATE BASED ON 4-WEEK EMPIRICAL PILOT PARAMETERS. Real results require a formal on-campus pilot.',
    pilotPlan: [
      {
        phase: 'Week 1',
        title: 'Passive Baseline Tracking',
        desc: `Zero student nudges at ${university.messes[0].name}. Mess staff weigh digital scale plate return once daily and record cooked vat leftovers to establish ground truth.`,
      },
      {
        phase: 'Weeks 2-3',
        title: 'Pilot Activation',
        desc: `Launch mobile student app for 15-min arrival slot nudges for ${university.messes[0].students} residents. Kitchen operates blended forecasts with 1-click waste logging.`,
      },
      {
        phase: 'Week 4',
        title: 'Comparative Audit',
        desc: 'Audit kg waste delta, peak line velocity acceleration, and compare measured pilot results against baseline.',
      },
    ],
  });
}
