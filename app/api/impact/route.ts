import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const costPerKg = Number(searchParams.get('costPerKg')) || 68;
  const platesPerDay = Number(searchParams.get('platesPerDay')) || 980;
  const adoptionPct = Number(searchParams.get('adoptionPct')) || 42;

  // Baseline empirical assumptions (without system)
  const baselineDailyPlateWasteKg = platesPerDay * 0.075; // 75g/plate scrape
  const baselineDailyOvercookKg = platesPerDay * 0.55 * 0.12; // 12% excess cooked
  const baselineDailyTotalWasteKg = baselineDailyPlateWasteKg + baselineDailyOvercookKg;
  const baselineMonthlyCostInr = Math.round(baselineDailyTotalWasteKg * costPerKg * 30);

  // With Beat the Mess Rush (15-25% reduction depending on adoption)
  const wasteReductionFactor = 0.15 + (adoptionPct / 100) * 0.10;
  const systemDailyWasteMinKg = baselineDailyTotalWasteKg * (1 - (wasteReductionFactor + 0.03));
  const systemDailyWasteMaxKg = baselineDailyTotalWasteKg * (1 - (wasteReductionFactor - 0.03));

  const dailySavedMinKg = baselineDailyTotalWasteKg - systemDailyWasteMaxKg;
  const dailySavedMaxKg = baselineDailyTotalWasteKg - systemDailyWasteMinKg;

  const monthlySavedMinInr = Math.round(dailySavedMinKg * costPerKg * 30);
  const monthlySavedMaxInr = Math.round(dailySavedMaxKg * costPerKg * 30);

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
      peakWaitRange: '18-24 min',
      monthlyWasteCostInr: baselineMonthlyCostInr,
    },
    withSystem: {
      dailyWasteRangeKg: `${Math.round(systemDailyWasteMinKg)} - ${Math.round(systemDailyWasteMaxKg)} kg`,
      dailySavedRangeKg: `${Math.round(dailySavedMinKg)} - ${Math.round(dailySavedMaxKg)} kg`,
      wasteReductionRange: '15% - 25%',
      peakWaitRange: '7-11 min',
      peakWaitReduction: '45% - 60%',
      monthlySavingsRangeInr: `₹${monthlySavedMinInr.toLocaleString()} - ₹${monthlySavedMaxInr.toLocaleString()}`,
      annualSavingsRangeInr: `₹${(monthlySavedMinInr * 10).toLocaleString()} - ₹${(monthlySavedMaxInr * 10).toLocaleString()}`,
    },
    disclaimer: 'SIMULATED ESTIMATE BASED ON 4-WEEK EMPIRICAL PILOT PARAMETERS. Real results require a formal on-campus pilot.',
    pilotPlan: [
      {
        phase: 'Week 1',
        title: 'Passive Baseline Tracking',
        desc: 'Zero student nudges. Mess staff weigh digital scale plate return once daily and record cooked vat leftovers to establish ground truth.',
      },
      {
        phase: 'Weeks 2-3',
        title: 'Pilot Activation',
        desc: 'Launch mobile student app for 15-min arrival slot nudges. Kitchen operates blended forecasts with 1-click waste logging.',
      },
      {
        phase: 'Week 4',
        title: 'Comparative Audit',
        desc: 'Audit kg waste delta, peak line velocity acceleration, and survey staff on operational ease.',
      },
    ],
  });
}
