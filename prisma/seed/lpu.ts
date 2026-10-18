import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ==============================================================================
// 1. TOP ARRAY: LPU MESS DEFINITIONS (19 TOTAL)
// Edit names, seats, studentsAssigned, and counters in this single location.
// ==============================================================================
export interface LpuMessEntry {
  code: string;
  name: string;
  shortName: string;
  category: 'CENTRAL' | 'BOYS_HOSTEL' | 'BOYS_STUDIO' | 'GIRLS_HOSTEL' | 'GIRLS_STUDIO';
  gender: 'BOYS' | 'GIRLS' | 'ALL';
  zone: 'NORTH' | 'SOUTH' | null;
  dietType: string;
  dietFlag: string | null;
  seats: number | null;            // NULL until verified by LPU mess office ("Not set yet")
  studentsAssigned: number | null; // NULL until verified by LPU mess office
  counters: number | null;         // NULL until verified by LPU mess office
  serviceRatePerCounter: number | null;
  dataSource: 'unverified' | 'verified';
  notes: string | null;
  // Simulated defaults active only in Demo mode so queue maths can run:
  demoCounters: number;
  demoServiceRate: number; // students per minute per counter
  demoSeats: number;
  demoStudents: number;
}

export const LPU_MESSES: LpuMessEntry[] = [
  // ── CENTRAL (2) ──
  {
    code: 'central-mess-north',
    name: 'Central Mess North',
    shortName: 'Central North',
    category: 'CENTRAL',
    gender: 'ALL',
    zone: 'NORTH',
    dietType: 'mixed/unknown',
    dietFlag: 'confirm',
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Central dining complex (North Zone). Diet is mixed/unknown, flagged confirm.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 500,
    demoStudents: 900,
  },
  {
    code: 'central-mess-south',
    name: 'Central Mess South',
    shortName: 'Central South',
    category: 'CENTRAL',
    gender: 'ALL',
    zone: 'SOUTH',
    dietType: 'mixed/unknown',
    dietFlag: 'confirm',
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Central dining complex (South Zone). Diet is mixed/unknown, flagged confirm.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 500,
    demoStudents: 900,
  },

  // ── BOYS_HOSTEL (7) ──
  {
    code: 'boys-hostel-1',
    name: 'Boys Hostel Mess 1',
    shortName: 'Boys Hostel 1',
    category: 'BOYS_HOSTEL',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys Hostel 1 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 600,
  },
  {
    code: 'boys-hostel-2',
    name: 'Boys Hostel Mess 2',
    shortName: 'Boys Hostel 2',
    category: 'BOYS_HOSTEL',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys Hostel 2 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 600,
  },
  {
    code: 'boys-hostel-3',
    name: 'Boys Hostel Mess 3',
    shortName: 'Boys Hostel 3',
    category: 'BOYS_HOSTEL',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys Hostel 3 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 600,
  },
  {
    code: 'boys-hostel-4',
    name: 'Boys Hostel Mess 4',
    shortName: 'Boys Hostel 4',
    category: 'BOYS_HOSTEL',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys Hostel 4 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 600,
  },
  {
    code: 'boys-hostel-5',
    name: 'Boys Hostel Mess 5',
    shortName: 'Boys Hostel 5',
    category: 'BOYS_HOSTEL',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys Hostel 5 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 600,
  },
  {
    code: 'boys-hostel-6',
    name: 'Boys Hostel Mess 6',
    shortName: 'Boys Hostel 6',
    category: 'BOYS_HOSTEL',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys Hostel 6 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 600,
  },
  {
    code: 'boys-hostel-7',
    name: 'Boys Hostel Mess 7',
    shortName: 'Boys Hostel 7',
    category: 'BOYS_HOSTEL',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys Hostel 7 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 600,
  },

  // ── BOYS_STUDIO (2) ──
  {
    code: 'boys-studio-1',
    name: 'Boys Studio Mess 1',
    shortName: 'Boys Studio 1',
    category: 'BOYS_STUDIO',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys studio apartment mess 1.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 250,
    demoStudents: 400,
  },
  {
    code: 'boys-studio-2',
    name: 'Boys Studio Mess 2',
    shortName: 'Boys Studio 2',
    category: 'BOYS_STUDIO',
    gender: 'BOYS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Boys studio apartment mess 2.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 250,
    demoStudents: 400,
  },

  // ── GIRLS_HOSTEL (6) ──
  {
    code: 'girls-hostel-1',
    name: 'Girls Hostel Mess 1',
    shortName: 'Girls Hostel 1',
    category: 'GIRLS_HOSTEL',
    gender: 'GIRLS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Girls Hostel 1 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 550,
  },
  {
    code: 'girls-hostel-2',
    name: 'Girls Hostel Mess 2',
    shortName: 'Girls Hostel 2',
    category: 'GIRLS_HOSTEL',
    gender: 'GIRLS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Girls Hostel 2 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 550,
  },
  {
    code: 'girls-hostel-3',
    name: 'Girls Hostel Mess 3',
    shortName: 'Girls Hostel 3',
    category: 'GIRLS_HOSTEL',
    gender: 'GIRLS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Girls Hostel 3 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 550,
  },
  {
    code: 'girls-hostel-4',
    name: 'Girls Hostel Mess 4',
    shortName: 'Girls Hostel 4',
    category: 'GIRLS_HOSTEL',
    gender: 'GIRLS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Girls Hostel 4 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 550,
  },
  {
    code: 'girls-hostel-5',
    name: 'Girls Hostel Mess 5',
    shortName: 'Girls Hostel 5',
    category: 'GIRLS_HOSTEL',
    gender: 'GIRLS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Girls Hostel 5 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 550,
  },
  {
    code: 'girls-hostel-6',
    name: 'Girls Hostel Mess 6',
    shortName: 'Girls Hostel 6',
    category: 'GIRLS_HOSTEL',
    gender: 'GIRLS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Girls Hostel 6 dining hall. Standard vegetarian mess.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 350,
    demoStudents: 550,
  },

  // ── GIRLS_STUDIO (2) ──
  {
    code: 'girls-studio-1',
    name: 'Girls Studio Mess 1',
    shortName: 'Girls Studio 1',
    category: 'GIRLS_STUDIO',
    gender: 'GIRLS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Girls studio apartment mess 1.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 250,
    demoStudents: 400,
  },
  {
    code: 'girls-studio-2',
    name: 'Girls Studio Mess 2',
    shortName: 'Girls Studio 2',
    category: 'GIRLS_STUDIO',
    gender: 'GIRLS',
    zone: null,
    dietType: 'veg',
    dietFlag: null,
    seats: null,
    studentsAssigned: null,
    counters: null,
    serviceRatePerCounter: null,
    dataSource: 'unverified',
    notes: 'Girls studio apartment mess 2.',
    demoCounters: 4,
    demoServiceRate: 3.0,
    demoSeats: 250,
    demoStudents: 400,
  },
];

// Helper to hash 4-digit PINs
function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

export async function seedLpu() {
  console.log('================================================================');
  console.log('   UniQ SEEDER: LOVELY PROFESSIONAL UNIVERSITY (LPU) TENANT     ');
  console.log('   University Slug: "lpu" | Messes: 19 | Mode: Multi-Tenant    ');
  console.log('================================================================\n');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Clean existing records for a fresh slate
  console.log('Cleaning existing records...');
  await prisma.slotBooking.deleteMany();
  await prisma.queueEvent.deleteMany();
  await prisma.wasteLog.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.eventFlag.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.student.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.mess.deleteMany();

  // 2. Seed Meal Plans
  console.log('\nSeeding Meal Plans for LPU...');
  const standardPlan = await prisma.mealPlan.create({
    data: {
      universitySlug: 'lpu',
      name: 'Standard',
      meals: JSON.stringify(['Breakfast', 'Lunch', 'Snacks', 'Dinner']),
      description: 'Standard 4-meal plan: Breakfast, Lunch, Evening Snacks, and Dinner.',
    },
  });

  const basicPlan = await prisma.mealPlan.create({
    data: {
      universitySlug: 'lpu',
      name: 'Basic / Custom',
      meals: JSON.stringify(['Breakfast', 'Lunch', 'Dinner']),
      description: '3-meal plan: Breakfast, Lunch, Dinner (Excludes Evening Snacks).',
    },
  });

  console.log(`  -> Plan 1: ${standardPlan.name} (Breakfast, Lunch, Snacks, Dinner)`);
  console.log(`  -> Plan 2: ${basicPlan.name} (Breakfast, Lunch, Dinner - No Snacks)`);

  // 3. Generate PINs & Seed 19 Messes
  console.log('\nGenerating 19 mess records with hashed PINs (PINs printed once below):');
  console.log('----------------------------------------------------------------------');
  console.log('| Mess Code            | Name                   | Staff PIN | Kitchen PIN |');
  console.log('----------------------------------------------------------------------');

  const createdMesses: any[] = [];
  const messPinMap: Array<{ code: string; name: string; staffPin: string; kitchenPin: string }> = [];

  for (let i = 0; i < LPU_MESSES.length; i++) {
    const m = LPU_MESSES[i];
    // Deterministic 4-digit PINs for ease of test/demo while isolated:
    // Staff PIN: 4001..4019, Kitchen PIN: 7001..7019
    const staffPin = (4001 + i).toString();
    const kitchenPin = (7001 + i).toString();

    const mess = await prisma.mess.create({
      data: {
        code: m.code,
        name: m.name,
        category: m.category,
        gender: m.gender,
        zone: m.zone,
        dietType: m.dietType,
        dietFlag: m.dietFlag,
        // Capacities stay NULL ("Not set yet") as instructed:
        seats: m.seats,
        studentsAssigned: m.studentsAssigned,
        counters: m.counters,
        serviceRatePerCounter: m.serviceRatePerCounter,
        dataSource: m.dataSource,
        notes: m.notes,
        staffPinHash: hashPin(staffPin),
        kitchenPinHash: hashPin(kitchenPin),
        universitySlug: 'lpu',
        // Operational demo fallbacks for queue math:
        capacity: m.demoSeats,
        servingLines: m.demoCounters,
        queueLowThresh: 15,
        queueHighThresh: 35,
        active: true,
      },
    });

    createdMesses.push(mess);
    messPinMap.push({ code: m.code, name: m.name, staffPin, kitchenPin });
    console.log(
      `| ${m.code.padEnd(20)} | ${m.name.padEnd(22)} | ${staffPin}      | ${kitchenPin}        |`
    );
  }
  console.log('----------------------------------------------------------------------\n');

  // 4. Seed Sample Dishes ("sample, replace with real menu")
  console.log('Seeding Sample Dishes (Starting menu, marked sample)...');
  const sampleDishes = [
    // Breakfast
    { name: 'Stuffed Aloo Paratha', category: 'Bread', avgConsumptionKg: 0.18, unitCostInr: 35 },
    { name: 'Ven Pongal', category: 'Main', avgConsumptionKg: 0.15, unitCostInr: 32 },
    { name: 'Steamed Idli & Sambhar', category: 'Main', avgConsumptionKg: 0.14, unitCostInr: 28 },
    { name: 'Bread Butter Toast', category: 'Bread', avgConsumptionKg: 0.08, unitCostInr: 22 },
    { name: 'Masala Chai', category: 'Side', avgConsumptionKg: 0.12, unitCostInr: 15 },
    { name: 'Filter Coffee', category: 'Side', avgConsumptionKg: 0.12, unitCostInr: 18 },
    { name: 'Hot Milk', category: 'Side', avgConsumptionKg: 0.15, unitCostInr: 20 },

    // Lunch
    { name: 'Steamed Basmati Rice', category: 'Main', avgConsumptionKg: 0.16, unitCostInr: 35 },
    { name: 'Tawa Phulka Roti', category: 'Bread', avgConsumptionKg: 0.08, unitCostInr: 30 },
    { name: 'Amritsari Chhole', category: 'Curry', avgConsumptionKg: 0.14, unitCostInr: 55 },
    { name: 'South Indian Sambhar', category: 'Curry', avgConsumptionKg: 0.12, unitCostInr: 35 },
    { name: 'Seasonal Sabzi', category: 'Curry', avgConsumptionKg: 0.11, unitCostInr: 45 },
    { name: 'Fresh Curd / Dahi', category: 'Side', avgConsumptionKg: 0.09, unitCostInr: 25 },

    // Snacks
    { name: 'Veg Grilled Sandwich', category: 'Main', avgConsumptionKg: 0.13, unitCostInr: 40 },
    { name: 'Evening Masala Tea', category: 'Side', avgConsumptionKg: 0.12, unitCostInr: 15 },
    { name: 'Evening Coffee', category: 'Side', avgConsumptionKg: 0.12, unitCostInr: 18 },

    // Dinner
    { name: 'Dal Tadka', category: 'Curry', avgConsumptionKg: 0.13, unitCostInr: 40 },
    { name: 'Jeera Veg Pulao', category: 'Main', avgConsumptionKg: 0.16, unitCostInr: 42 },
    { name: 'Aloo Gobi Matar', category: 'Curry', avgConsumptionKg: 0.11, unitCostInr: 45 },
    { name: 'Butter Roti', category: 'Bread', avgConsumptionKg: 0.08, unitCostInr: 32 },
    { name: 'Desi Ghee Suji Halwa', category: 'Sweet', avgConsumptionKg: 0.09, unitCostInr: 50 },
  ];

  for (const d of sampleDishes) {
    await prisma.menuItem.create({
      data: {
        name: d.name,
        category: d.category,
        avgConsumptionKg: d.avgConsumptionKg,
        unitCostInr: d.unitCostInr,
        isPopular: ['Amritsari Chhole', 'Stuffed Aloo Paratha', 'Desi Ghee Suji Halwa'].includes(d.name),
      },
    });
  }
  console.log(`  -> Created ${sampleDishes.length} sample dishes.`);

  // 5. Seed Students (Roll numbers only + meal plan, no personal names)
  console.log('\nCreating privacy-safe student records (Roll numbers + Meal Plans only)...');
  const totalStudents = 600;
  let standardCount = 0;
  let basicCount = 0;

  for (let s = 1; s <= totalStudents; s++) {
    // 62% on Standard plan, 38% on Basic / Custom plan
    const isStandard = s % 100 < 62;
    const plan = isStandard ? standardPlan : basicPlan;
    if (isStandard) standardCount++;
    else basicCount++;

    const rollNumber = `122${s.toString().padStart(5, '0')}`; // e.g. 12200001
    const hostel = LPU_MESSES[s % LPU_MESSES.length].name;

    await prisma.student.create({
      data: {
        rollNumber,
        name: `Student ${rollNumber}`, // Strictly roll number, zero personal names
        hostel,
        dietPref: s % 8 === 0 ? 'Jain' : 'Veg',
        streak: s % 5 === 0 ? Math.floor((s % 6) + 2) : 0,
        mealPlanId: plan.id,
      },
    });
  }

  console.log(`  -> Created ${totalStudents} students:`);
  console.log(`     • ${standardCount} (${Math.round((standardCount / totalStudents) * 100)}%) on "Standard" plan (4 meals)`);
  console.log(`     • ${basicCount} (${Math.round((basicCount / totalStudents) * 100)}%) on "Basic / Custom" plan (3 meals, no snacks)`);

  // Ensure test demo students exist:
  // 12200014: Standard plan
  // 12200015: Basic plan (no snacks)
  const testStudentStandard = await prisma.student.upsert({
    where: { rollNumber: '12200014' },
    update: { mealPlanId: standardPlan.id },
    create: {
      rollNumber: '12200014',
      name: 'Student 12200014',
      hostel: 'Boys Hostel Mess 1',
      dietPref: 'Veg',
      streak: 5,
      mealPlanId: standardPlan.id,
    },
  });

  const testStudentBasic = await prisma.student.upsert({
    where: { rollNumber: '12200015' },
    update: { mealPlanId: basicPlan.id },
    create: {
      rollNumber: '12200015',
      name: 'Student 12200015',
      hostel: 'Boys Hostel Mess 1',
      dietPref: 'Veg',
      streak: 2,
      mealPlanId: basicPlan.id,
    },
  });

  console.log(`  -> Primary Demo Student 12200014: Standard Plan (All 4 meals)`);
  console.log(`  -> Basic Demo Student 12200015: Basic Plan (3 meals, no snacks)`);

  // 6. Settings (Data mode SIMULATED by default)
  await prisma.setting.createMany({
    data: [
      { key: 'data_mode', value: 'demo' },
      { key: 'university_slug', value: 'lpu' },
      { key: 'university_name', value: 'Lovely Professional University' },
      { key: 'plan_split_snacks_pct', value: '62' },
      { key: 'slot_length_minutes', value: '15' },
      { key: 'meal_timings_default', value: JSON.stringify({
        Breakfast: { start: '08:00', end: '09:30', slotLength: 15, dataSource: 'unverified' },
        Lunch: { start: '12:30', end: '14:30', slotLength: 15, dataSource: 'unverified' },
        Snacks: { start: '17:00', end: '18:30', slotLength: 15, dataSource: 'unverified' },
        Dinner: { start: '19:30', end: '21:30', slotLength: 15, dataSource: 'unverified' },
      })},
    ],
  });

  // 7. Seed Simulated Queue Events and Forecasts for the 19 messes
  console.log('\nSeeding historical SIMULATED forecasts and sample live queue data...');
  const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  for (const mess of createdMesses) {
    // Live queue events for today
    await prisma.queueEvent.create({
      data: {
        messId: mess.id,
        date: todayStr,
        mealType: 'Lunch',
        eventType: 'CHECKIN',
        adjustmentValue: Math.floor(Math.random() * 12) + 6,
      },
    });

    // Past 4 weeks historical forecasts
    for (const meal of mealTypes) {
      // Snack forecast is naturally 62% of main meal forecast because Basic plan excludes snacks!
      const baseExpected = meal === 'Snacks' ? 320 : (meal === 'Breakfast' ? 440 : 510);
      await prisma.forecast.create({
        data: {
          messId: mess.id,
          date: todayStr,
          mealType: meal,
          historicalAvg: baseExpected,
          bookedCount: Math.round(baseExpected * 0.42),
          expectedPlates: baseExpected,
          actualPlates: null,
          confidenceLevel: 'Moderate',
          confidenceNote: 'Simulated baseline for multi-mess distribution.',
          safetyBufferPct: 8.0,
          surplusNgoNotified: false,
        },
      });
    }
  }

  console.log('\n================================================================');
  console.log('   LPU SEED COMPLETE! 19 MESSES & MEAL PLANS READY              ');
  console.log('================================================================\n');
}

// Allow direct CLI invocation: npx tsx prisma/seed/lpu.ts
if (require.main === module) {
  seedLpu()
    .catch((err) => {
      console.error('LPU Seed failed:', err);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
