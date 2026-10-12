import { prisma } from '../lib/prisma';

async function seed() {
  console.log('--- SEEDING PRISMA DATABASE: BEAT THE MESS RUSH (SIMULATED DATA) ---');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Clean existing records
  await prisma.slotBooking.deleteMany();
  await prisma.queueEvent.deleteMany();
  await prisma.wasteLog.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.eventFlag.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.student.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.mess.deleteMany();

  // 2. Create Messes
  console.log('Creating messes...');
  const messA = await prisma.mess.create({
    data: {
      code: 'mess-1',
      name: 'Mess A - North Hostel (Main)',
      capacity: 220,
      servingLines: 1,
      queueLowThresh: 15,
      queueHighThresh: 35,
      active: true,
    },
  });

  const messB = await prisma.mess.create({
    data: {
      code: 'mess-2',
      name: 'Mess B - South Hostel (Satellite Demo)',
      capacity: 180,
      servingLines: 1,
      queueLowThresh: 12,
      queueHighThresh: 30,
      active: true,
    },
  });

  // 3. Create Menu Items with realistic consumption and costs
  console.log('Creating menu items...');
  const dishes = [
    { name: 'Steamed Jeera Rice', category: 'Main', avg: 0.16, cost: 42, pop: false },
    { name: 'Dal Tadka', category: 'Curry', avg: 0.12, cost: 85, pop: false },
    { name: 'Paneer Butter Masala', category: 'Special', avg: 0.14, cost: 220, pop: true },
    { name: 'Homestyle Chicken Curry', category: 'Non-Veg', avg: 0.15, cost: 190, pop: true },
    { name: 'Lauki Kofta Curry', category: 'Curry', avg: 0.10, cost: 45, pop: false },
    { name: 'Crispy Karela Fry', category: 'Side', avg: 0.06, cost: 55, pop: false },
    { name: 'Fresh Tawa Roti', category: 'Bread', avg: 0.08, cost: 50, pop: false },
    { name: 'Punjabi Rajma Masala', category: 'Curry', avg: 0.13, cost: 95, pop: true },
    { name: 'Seasonal Mix Veg', category: 'Curry', avg: 0.11, cost: 60, pop: false },
    { name: 'Warm Gulab Jamun', category: 'Sweet', avg: 0.07, cost: 160, pop: true },
  ];

  const menuItems = [];
  for (const d of dishes) {
    const item = await prisma.menuItem.create({
      data: {
        name: d.name,
        category: d.category,
        avgConsumptionKg: d.avg,
        unitCostInr: d.cost,
        isPopular: d.pop,
      },
    });
    menuItems.push(item);
  }

  // 4. Create ~600 Students
  console.log('Creating 608 students...');
  const branches = ['CS', 'EE', 'ME', 'EC'];
  const hostels = ['Block A (Aryabhatta)', 'Block B (Bhaskara)', 'Block C (Charaka)', 'Block D (Dhanvantari)'];
  const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Ananya', 'Diya', 'Ishaan', 'Aryan', 'Neha', 'Pooja', 'Tanvi', 'Kabir', 'Rhea', 'Kunal', 'Meera', 'Dev', 'Siddharth', 'Varun', 'Shreya', 'Anika'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Singh', 'Nair', 'Iyer', 'Mehta', 'Chopra', 'Rao', 'Bose', 'Das', 'Joshi', 'Mishra'];

  let studentCount = 0;
  const students = [];

  for (let yr = 22; yr <= 25; yr++) {
    for (const branch of branches) {
      for (let i = 1; i <= 38; i++) {
        studentCount++;
        const numStr = i.toString().padStart(3, '0');
        const roll = `${yr}${branch}${numStr}`;
        const fn = firstNames[studentCount % firstNames.length];
        const ln = lastNames[(studentCount * 3) % lastNames.length];
        const name = `${fn} ${ln}`;
        const hostel = hostels[(studentCount + i) % hostels.length];
        const diet = studentCount % 10 === 0 ? 'Jain' : (studentCount % 3 === 0 ? 'Non-Veg' : 'Veg');
        const streak = studentCount % 7 === 0 ? Math.floor((studentCount % 5) + 2) : 0;

        const s = await prisma.student.create({
          data: {
            rollNumber: roll,
            name,
            hostel,
            dietPref: diet,
            streak,
          },
        });
        students.push(s);
      }
    }
  }
  console.log(`Created ${students.length} students.`);

  // 5. 28 Days (4 Weeks) of Historical Data for Mess A
  console.log('Generating 4 weeks of realistic attendance, bookings, and dish waste history...');
  const lunchSlots = ['12:30', '12:45', '13:00', '13:15', '13:30', '13:45'];
  const dinnerSlots = ['19:30', '19:45', '20:00', '20:15', '20:30', '20:45'];

  for (let dayOffset = 28; dayOffset >= 1; dayOffset--) {
    const pastDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = pastDate.toISOString().split('T')[0];
    const dayOfWeek = pastDate.getDay();

    let eventTitle: string | null = null;
    let eventAdjPct = 0;

    if (dayOffset === 10) {
      eventTitle = 'Exam Day';
      eventAdjPct = -14;
    } else if (dayOffset === 18) {
      eventTitle = 'Fest';
      eventAdjPct = 20;
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      eventTitle = 'Weekend';
      eventAdjPct = -28;
    }

    if (eventTitle) {
      await prisma.eventFlag.create({
        data: {
          messId: messA.id,
          date: dateStr,
          mealType: 'Lunch',
          title: eventTitle,
          adjustmentPct: eventAdjPct,
        },
      });
    }

    for (const mealType of ['Lunch', 'Dinner']) {
      let baseAttendance = 505;
      if (dayOfWeek === 5 && mealType === 'Dinner') {
        baseAttendance = 370; // Friday dinner drop
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseAttendance = 340; // Weekend drop
      }
      if (eventTitle === 'Exam Day') {
        baseAttendance = mealType === 'Lunch' ? 415 : 510;
      } else if (eventTitle === 'Fest') {
        baseAttendance = 585;
      }

      const noise = Math.round(Math.sin(dayOffset * 3.7 + (mealType === 'Lunch' ? 1 : 4)) * 12);
      const actualAttendance = Math.max(280, baseAttendance + noise);

      const bookingAdoptionRate = 0.35 + ((dayOffset % 5) * 0.025);
      const bookedPlates = Math.round(actualAttendance * bookingAdoptionRate);

      await prisma.forecast.create({
        data: {
          messId: messA.id,
          date: dateStr,
          mealType,
          historicalAvg: 505,
          bookedCount: bookedPlates,
          expectedPlates: Math.round(505 * 0.65 + (bookedPlates / 0.38) * 0.35),
          actualPlates: actualAttendance,
          confidenceLevel: bookedPlates > 220 ? 'High' : (bookedPlates > 160 ? 'Moderate' : 'Low'),
          confidenceNote: `Simulated 4-week historical run. Adoption: ${Math.round(bookingAdoptionRate * 100)}%`,
          safetyBufferPct: 8.0,
          surplusNgoNotified: actualAttendance < 400,
          surplusNgoContact: actualAttendance < 400 ? 'Robin Hood Army Campus Chapter (+91 98765 43210)' : null,
        },
      });

      // Waste per dish:
      const activeMenuItems = mealType === 'Lunch'
        ? menuItems.slice(0, 5)
        : menuItems.slice(4, 9);

      const plateWastePerStudentKg = 0.055 + (Math.cos(dayOffset) * 0.015);
      const totalPlateWaste = parseFloat((actualAttendance * plateWastePerStudentKg).toFixed(1));

      for (const item of activeMenuItems) {
        const expectedNeedKg = actualAttendance * item.avgConsumptionKg;
        const cookedKg = parseFloat((expectedNeedKg * 1.08).toFixed(1));

        // Lauki & Karela high leftovers
        let leftoverPct = 0.07;
        if (item.name.includes('Lauki') || item.name.includes('Karela')) {
          leftoverPct = 0.18 + ((dayOffset % 3) * 0.02);
        } else if (item.name.includes('Paneer') || item.name.includes('Chicken')) {
          leftoverPct = 0.02;
        } else if (item.name.includes('Rice')) {
          leftoverPct = 0.08;
        }

        const leftoverCookedKg = parseFloat((cookedKg * leftoverPct).toFixed(1));
        const dishPlateWasteKg = parseFloat((totalPlateWaste / activeMenuItems.length).toFixed(1));

        await prisma.wasteLog.create({
          data: {
            messId: messA.id,
            menuItemId: item.id,
            date: dateStr,
            mealType,
            cookedKg,
            leftoverCookedKg,
            plateWasteKg: dishPlateWasteKg,
          },
        });
      }
    }
  }

  // 6. Today's Active Service Simulation (Bookings & Live Events)
  console.log(`Setting up today's live schedule and bookings for ${todayStr}...`);
  for (const mealType of ['Lunch', 'Dinner']) {
    const slots = mealType === 'Lunch' ? lunchSlots : dinnerSlots;
    const slotWeights = mealType === 'Lunch'
      ? [0.08, 0.16, 0.34, 0.22, 0.12, 0.08]
      : [0.06, 0.14, 0.22, 0.36, 0.14, 0.08];

    const targetBookings = mealType === 'Lunch' ? 185 : 210;
    let bIdx = 0;

    await prisma.forecast.create({
      data: {
        messId: messA.id,
        date: todayStr,
        mealType,
        historicalAvg: 505,
        bookedCount: targetBookings,
        expectedPlates: 512,
        actualPlates: null,
        confidenceLevel: 'Moderate',
        confidenceNote: 'Moderate confidence: 34% pre-booked. Relying on blended model.',
        safetyBufferPct: 8.0,
      },
    });

    for (let s = 0; s < slots.length; s++) {
      const slot = slots[s];
      const countInSlot = Math.round(targetBookings * slotWeights[s]);
      const isOffPeak = s === 0 || s === slots.length - 1;

      const [h, m] = slot.split(':').map(Number);
      const endM = (m + 15) % 60;
      const endH = m + 15 >= 60 ? h + 1 : h;
      const slotEndStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      for (let k = 0; k < countInSlot; k++) {
        const student = students[(bIdx + (mealType === 'Lunch' ? 0 : 300)) % students.length];
        bIdx++;
        const checkinCode = (1000 + ((bIdx * 37) % 9000)).toString();

        await prisma.slotBooking.create({
          data: {
            studentId: student.id,
            messId: messA.id,
            date: todayStr,
            mealType,
            slotStart: slot,
            slotEnd: slotEndStr,
            portion: k % 7 === 0 ? 'Large' : (k % 5 === 0 ? 'Small' : 'Regular'),
            dietType: student.dietPref,
            status: 'BOOKED',
            checkinCode,
            isOffPeak,
          },
        });
      }
    }
  }

  // 7. Recent Live Queue Events in the Last 10 Minutes
  console.log('Generating live queue events for rolling rate computation...');
  const tenMinAgo = now.getTime() - 10 * 60 * 1000;
  for (let m = 0; m < 75; m++) {
    const eventTime = new Date(tenMinAgo + m * 8000 + Math.floor(Math.random() * 2000));
    await prisma.queueEvent.create({
      data: {
        messId: messA.id,
        date: todayStr,
        mealType: 'Lunch',
        eventType: 'SERVED',
        studentRoll: null,
        adjustmentValue: -1,
        createdAt: eventTime,
      },
    });
  }

  for (let m = 0; m < 92; m++) {
    const eventTime = new Date(tenMinAgo + m * 6500 + Math.floor(Math.random() * 2000));
    const isWalkin = m % 2 === 0;
    await prisma.queueEvent.create({
      data: {
        messId: messA.id,
        date: todayStr,
        mealType: 'Lunch',
        eventType: isWalkin ? 'WALKIN' : 'CHECKIN',
        studentRoll: isWalkin ? null : students[m % students.length].rollNumber,
        adjustmentValue: 1,
        createdAt: eventTime,
      },
    });
  }

  // 8. Settings for drift offsets
  await prisma.setting.create({
    data: {
      key: 'drift_offset_mess-1',
      value: '0',
    },
  });

  console.log('--- PRISMA SEED COMPLETED SUCCESSFULLY ---');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
