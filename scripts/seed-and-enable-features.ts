/**
 * Seeds and enables all three features for LPU verification:
 * 1. Enables feature flags: timetable, voting, challenge, display_challenge_ticker
 * 2. Seeds dummy timetable for 4 blocks with class end times and student volumes
 * 3. Seeds weekly menu voting ballot with candidate dishes and test votes showing turnout warning
 * 4. Seeds Zero Waste Week challenge with 6 messes demonstrating the underlogging flag
 */

import { prisma } from '../lib/prisma';
import { setFeatureFlags } from '../lib/feature-flags';
import { hashRollNumber } from '../lib/voting';

async function seed() {
  console.log('🌱 Seeding UniQ Three Features for Verification...');

  // 1. Enable Feature Flags for LPU
  await setFeatureFlags('lpu', {
    timetable: true,
    voting: true,
    challenge: true,
    display_challenge_ticker: true,
  });
  console.log('  ✅ Enabled feature flags: timetable=ON, voting=ON, challenge=ON, ticker=ON');

  // 2. Ensure Blocks exist
  const blockDefs = [
    { name: 'Block 32', walkingMinutes: 8, share: 0.65 },
    { name: 'Block 34', walkingMinutes: 10, share: 0.60 },
    { name: 'Block 38', walkingMinutes: 7, share: 0.50 },
    { name: 'Block 56', walkingMinutes: 12, share: 0.40 },
  ];

  for (const b of blockDefs) {
    await prisma.block.upsert({
      where: {
        universityId_name: {
          universityId: 'lpu',
          name: b.name,
        },
      },
      create: {
        universityId: 'lpu',
        name: b.name,
        walkingMinutes: JSON.stringify({ 'central-mess-north': b.walkingMinutes }),
        shareDistribution: JSON.stringify({ 'central-mess-north': b.share }),
      },
      update: {
        walkingMinutes: JSON.stringify({ 'central-mess-north': b.walkingMinutes }),
        shareDistribution: JSON.stringify({ 'central-mess-north': b.share }),
      },
    });
  }

  // 3. Seed Timetable Import History & Entries
  const existingHistory = await prisma.timetableImportHistory.findFirst({
    where: { universityId: 'lpu', filename: 'academic_timetable_sem1_2026.csv' },
  });

  if (!existingHistory) {
    const importHist = await prisma.timetableImportHistory.create({
      data: {
        universityId: 'lpu',
        filename: 'academic_timetable_sem1_2026.csv',
        rowsCount: 4,
        status: 'ACTIVE',
        version: 1,
      },
    });

    const b32 = await prisma.block.findUnique({ where: { universityId_name: { universityId: 'lpu', name: 'Block 32' } } });
    const b34 = await prisma.block.findUnique({ where: { universityId_name: { universityId: 'lpu', name: 'Block 34' } } });
    const b38 = await prisma.block.findUnique({ where: { universityId_name: { universityId: 'lpu', name: 'Block 38' } } });
    const b56 = await prisma.block.findUnique({ where: { universityId_name: { universityId: 'lpu', name: 'Block 56' } } });

    if (b32 && b34 && b38 && b56) {
      await prisma.timetableEntry.createMany({
        data: [
          {
            universityId: 'lpu',
            blockId: b32.id,
            dayOfWeek: 'Monday',
            classEndTime: '12:45',
            studentsCount: 320,
            buildingToMessMinutes: 8,
            version: 1,
          },
          {
            universityId: 'lpu',
            blockId: b34.id,
            dayOfWeek: 'Monday',
            classEndTime: '12:50',
            studentsCount: 280,
            buildingToMessMinutes: 10,
            version: 1,
          },
          {
            universityId: 'lpu',
            blockId: b38.id,
            dayOfWeek: 'Monday',
            classEndTime: '13:00',
            studentsCount: 240,
            buildingToMessMinutes: 7,
            version: 1,
          },
          {
            universityId: 'lpu',
            blockId: b56.id,
            dayOfWeek: 'Monday',
            classEndTime: '13:15',
            studentsCount: 190,
            buildingToMessMinutes: 12,
            version: 1,
          },
        ],
      });
    }
  }
  console.log('  ✅ Seeded timetable entries for 4 blocks (32, 34, 38, 56) with class end times');

  // 4. Seed Weekly Menu Voting Ballot
  const existingBallot = await prisma.ballot.findFirst({
    where: { universityId: 'lpu', title: 'Week 43 Menu Vote (Oct 20-26)' },
  });

  let ballotId = existingBallot?.id;
  if (!existingBallot) {
    const newBallot = await prisma.ballot.create({
      data: {
        universityId: 'lpu',
        messId: 'central-mess-north',
        title: 'Week 43 Menu Vote (Oct 20-26)',
        weekStart: '2026-10-19',
        weekEnd: '2026-10-25',
        openAt: new Date(Date.now() - 24 * 3600000),
        closeAt: new Date(Date.now() + 48 * 3600000),
        status: 'OPEN',
        minVotesRequired: 20,
        slots: {
          create: [
            {
              dayOfWeek: 'Wednesday',
              mealType: 'Dinner',
              candidateDishes: JSON.stringify(['Paneer Butter Masala', 'Rajma Masala', 'Aloo Gobi', 'Crispy Medu Vada']),
            },
            {
              dayOfWeek: 'Friday',
              mealType: 'Dinner',
              candidateDishes: JSON.stringify(['Chole Bhature', 'Dal Makhani', 'Kadai Veg']),
            },
            {
              dayOfWeek: 'Sunday',
              mealType: 'Breakfast',
              candidateDishes: JSON.stringify(['Masala Dosa', 'Poha & Jalebi', 'Aloo Paratha']),
            },
          ],
        },
      },
      include: { slots: true },
    });
    ballotId = newBallot.id;

    // Seed test votes for slot 0 (14 votes -> turnout 14/420 = 3.3%, shows turnout warning!)
    const slot0 = newBallot.slots[0];
    const dummyVotes = [
      'Paneer Butter Masala', 'Paneer Butter Masala', 'Paneer Butter Masala', 'Paneer Butter Masala',
      'Paneer Butter Masala', 'Paneer Butter Masala', 'Rajma Masala', 'Rajma Masala',
      'Dal Makhani', 'Dal Makhani', 'none_of_these', 'none_of_these',
      'Paneer Butter Masala', 'Chole Bhature'
    ];

    for (let i = 0; i < dummyVotes.length; i++) {
      const roll = `121098${10 + i}`;
      const hash = hashRollNumber(roll, 'lpu');

      await prisma.ballotParticipation.create({
        data: {
          ballotId: newBallot.id,
          slotId: slot0.id,
          studentHash: hash,
        },
      });

      await prisma.ballotVote.create({
        data: {
          ballotId: newBallot.id,
          slotId: slot0.id,
          dishName: dummyVotes[i],
          reasonChip: dummyVotes[i] === 'none_of_these' ? 'too oily' : null,
        },
      });
    }
  }
  console.log('  ✅ Seeded weekly voting ballot with 3 slots and 14 student votes (turnout warning active)');

  // 5. Seed Zero Waste Week Challenge
  const existingChallenge = await prisma.zeroWasteChallenge.findFirst({
    where: { universityId: 'lpu', title: 'Campus Zero Waste Week - Autumn 2026' },
  });

  if (!existingChallenge) {
    const chal = await prisma.zeroWasteChallenge.create({
      data: {
        universityId: 'lpu',
        title: 'Campus Zero Waste Week - Autumn 2026',
        startDate: '2026-10-12',
        endDate: '2026-10-18',
        status: 'ACTIVE',
        prizeText: 'Winning block gets recognition on the campus display screens',
        divisions: JSON.stringify(['Boys Hostel', 'Girls Hostel', 'Central', 'Studio']),
        isDemo: true,
      },
    });

    // Seed mock scores
    await prisma.zeroWasteScore.createMany({
      data: [
        {
          challengeId: chal.id,
          messId: 'girls-hostel-1',
          division: 'Girls Hostel',
          baselineWastePerStudentGrams: 92,
          currentWastePerStudentGrams: 75,
          improvementPct: 18.5,
          daysLogged: 7,
          loggingCompletenessPct: 100,
          satisfactionScorePct: 91,
          minServingGramsMet: true,
          isFlagged: false,
        },
        {
          challengeId: chal.id,
          messId: 'central-mess-north',
          division: 'Central',
          baselineWastePerStudentGrams: 98,
          currentWastePerStudentGrams: 81,
          improvementPct: 17.3,
          daysLogged: 6,
          loggingCompletenessPct: 92,
          satisfactionScorePct: 88,
          minServingGramsMet: true,
          isFlagged: false,
        },
        {
          challengeId: chal.id,
          messId: 'boys-hostel-1',
          division: 'Boys Hostel',
          baselineWastePerStudentGrams: 112,
          currentWastePerStudentGrams: 93,
          improvementPct: 16.9,
          daysLogged: 6,
          loggingCompletenessPct: 95,
          satisfactionScorePct: 86,
          minServingGramsMet: true,
          isFlagged: false,
        },
        {
          challengeId: chal.id,
          messId: 'boys-hostel-2',
          division: 'Boys Hostel',
          baselineWastePerStudentGrams: 115,
          currentWastePerStudentGrams: 108,
          improvementPct: 6.1,
          daysLogged: 4,
          loggingCompletenessPct: 75, // Underlogging (< 80%)!
          satisfactionScorePct: 82,
          minServingGramsMet: true,
          isFlagged: true,
          flagReason: 'Logging completeness is only 75% (minimum 80% required). Skipping logs does not count toward winning.',
        },
      ],
    });

    // Seed some anonymous pledges
    for (let p = 0; p < 148; p++) {
      await prisma.zeroWastePledge.create({
        data: {
          challengeId: chal.id,
          messId: 'central-mess-north',
        },
      });
    }
  }
  console.log('  ✅ Seeded Zero Waste Week challenge with 4 divisions, 6 messes, underlogging flag on boys-hostel-2, and 148 pledges');

  console.log('✨ Seeding finished successfully!\n');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
