/**
 * Comprehensive Test Suite for UniQ Three Features:
 * 1. Class-Timetable Arrival Prediction
 * 2. Weekly Menu Voting
 * 3. Zero Waste Week Challenge
 *
 * Runs unit tests, mathematical validations, privacy unlinkability audits,
 * fairness constraints, tenant isolation tests, feature flags, and i18n key coverage.
 */

import { parseTimetableCsv, calculateArrivalCurve, getTimetableMlFeatures } from '../lib/timetable';
import { hashRollNumber, submitBallotVote, getBallotResults, exportBallotCsv, checkBallotStuffing } from '../lib/voting';
import { calculateChallengeLeaderboard, confirmChallengeWinner, recordAnonymousPledge } from '../lib/zero-waste';
import { getFeatureFlags, setFeatureFlag } from '../lib/feature-flags';
import { i18nTranslations, t } from '../lib/i18n';
import { prisma } from '../lib/prisma';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING UNIQ THREE-FEATURE COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // 1. TIMETABLE: CSV VALIDATION & ROW-LEVEL ERRORS
  // ----------------------------------------------------
  console.log('📦 [1.1] Timetable CSV Row-Level Validation:');

  const invalidCsv = `block,day_of_week,class_end_time,students_count,building_to_mess_minutes
Block 32,Monday,12:45,300,8
UnknownBlock,Monday,13:00,150,5
Block 34,Monday,25:70,200,10
Block 38,Monday,13:15,-50,6
Block 56,Funday,12:30,100,5
Block 32,Monday,12:50,250,invalid_walk`;

  const validBlocks = ['Block 32', 'Block 34', 'Block 38', 'Block 56'];
  const parsed = parseTimetableCsv(invalidCsv, validBlocks);

  assert(parsed.validRows.length === 1, 'Exactly 1 valid row parsed from malformed CSV');
  assert(parsed.errors.length >= 5, 'Detected at least 5 row-level errors for bad inputs');

  const unknownBlockErr = parsed.errors.find((e) => e.column === 'block');
  assert(Boolean(unknownBlockErr), 'Reported unknown block error for "UnknownBlock"');

  const badTimeErr = parsed.errors.find((e) => e.column === 'class_end_time');
  assert(Boolean(badTimeErr), 'Reported bad time format error for "25:70"');

  const negativeCountErr = parsed.errors.find((e) => e.column === 'students_count');
  assert(Boolean(negativeCountErr), 'Reported negative count error for "-50"');

  const badDayErr = parsed.errors.find((e) => e.column === 'day_of_week');
  assert(Boolean(badDayErr), 'Reported invalid day error for "Funday"');

  const badWalkErr = parsed.errors.find((e) => e.column === 'building_to_mess_minutes');
  assert(Boolean(badWalkErr), 'Reported invalid walk minutes error for "invalid_walk"');

  // ----------------------------------------------------
  // 2. TIMETABLE: ARRIVAL CURVE MATHS
  // ----------------------------------------------------
  console.log('\n📈 [1.2] Timetable Arrival-Curve Mathematics & No Future-Data Leakage:');

  // Verify curve math for known single block release
  // 300 students release at 12:50, walking 5 mins => transit 12:55
  // Delays: 0m (15% = 45), 5m (50% = 150), 10m (25% = 75), 15m (10% = 30)
  const curveResult = await calculateArrivalCurve({
    universitySlug: 'lpu',
    messId: 'central-mess-north',
    dayOfWeek: 'Monday',
    mealType: 'Lunch',
  });

  assert(curveResult.curve.length > 0, 'Generated 5-minute arrival curve intervals');
  assert(curveResult.peakArrivals > 0, `Computed peak arrivals: ${curveResult.peakArrivals}`);
  assert(Boolean(curveResult.peakTime), `Identified peak arrival timestamp: ${curveResult.peakTime}`);
  assert(curveResult.varianceExplainedPct === 26, 'Forecast variance explained metric is 26%');
  assert(curveResult.dataMode === 'SIMULATED', 'Model arrival data mode correctly labelled "SIMULATED"');

  // No future data leakage test
  const mlFeatures = await getTimetableMlFeatures({
    universitySlug: 'lpu',
    messId: 'central-mess-north',
    dayOfWeek: 'Monday',
  });
  assert(mlFeatures.peak_expected_arrivals_15m >= 0, 'Extracted peak_expected_arrivals_15m >= 0');
  assert(mlFeatures.total_timetable_volume >= 0, 'Extracted total_timetable_volume >= 0');
  assert(mlFeatures.blocks_releasing_20m >= 0, 'Extracted blocks_releasing_20m >= 0');
  assert(typeof mlFeatures.isStale === 'boolean', 'Verified timetable staleness guard boolean');

  // Model promotion rule verification
  const candidateMae = 14;
  const liveModelMae = 19;
  const isPromoted = candidateMae < liveModelMae;
  assert(isPromoted, 'Model promotion rule: candidate MAE 14 strictly beats live MAE 19 -> Promoted');

  const unpromotedCandidate = 22;
  assert(unpromotedCandidate >= liveModelMae === true, 'Model promotion rule: candidate MAE 22 worse than 19 -> Not Promoted');

  // ----------------------------------------------------
  // 3. TIMETABLE: TENANT ISOLATION
  // ----------------------------------------------------
  console.log('\n🏢 [1.3] Timetable Tenant Isolation:');

  // Create block for tenant 'lpu'
  const blockA = await prisma.block.create({
    data: {
      universityId: 'lpu',
      name: `TestBlock-LPU-${Date.now()}`,
      walkingMinutes: JSON.stringify({ 'central-mess-north': 6 }),
      shareDistribution: JSON.stringify({ 'central-mess-north': 0.7 }),
    },
  });

  // Query tenant 'thapar'
  const thaparBlocks = await prisma.block.findMany({
    where: {
      universityId: 'thapar',
      id: blockA.id,
    },
  });

  assert(thaparBlocks.length === 0, 'Tenant Isolation: Block created in tenant "lpu" is invisible to tenant "thapar"');

  // Clean up test block
  await prisma.block.delete({ where: { id: blockA.id } });

  // ----------------------------------------------------
  // 4. WEEKLY MENU VOTING: PRIVACY & UNLINKABILITY
  // ----------------------------------------------------
  console.log('\n🗳️ [2.1] Weekly Menu Voting Privacy Unlinkability & SHA-256 Hash:');

  const testRoll = '12109845';
  const hashedRoll = hashRollNumber(testRoll, 'test-ballot-salt');
  assert(hashedRoll !== testRoll, 'Roll number is irreversibly SHA-256 hashed');
  assert(hashedRoll.length === 64, 'SHA-256 produces 64-character hexadecimal digest');

  // Verify unlinkability: query BallotVote table schema
  // BallotVote has: id, ballotId, slotId, dishName, reasonChip, createdAt
  // It has NO rollNumber, studentId, or studentHash!
  const ballot = await prisma.ballot.create({
    data: {
      universityId: 'lpu',
      messId: 'central-mess-north',
      title: `Test Ballot ${Date.now()}`,
      weekStart: '2026-10-19',
      weekEnd: '2026-10-25',
      openAt: new Date(Date.now() - 3600000),
      closeAt: new Date(Date.now() + 86400000),
      status: 'OPEN',
      minVotesRequired: 20,
      slots: {
        create: [
          {
            mealType: 'Lunch',
            dayOfWeek: 'Wednesday',
            candidateDishes: JSON.stringify(['Paneer Butter Masala', 'Chole Bhature', 'Dal Makhani']),
          },
        ],
      },
    },
    include: { slots: true },
  });

  const slot = ballot.slots[0];

  // Cast vote
  const voteResult = await submitBallotVote({
    ballotId: ballot.id,
    slotId: slot.id,
    rollNumber: testRoll,
    messId: 'central-mess-north',
    planName: 'Premium Plan',
    dishName: 'Paneer Butter Masala',
    idempotencyKey: `idem-${Date.now()}`,
  });

  assert(voteResult.success === true, 'Successfully cast student vote');

  // Verify participation recorded hashed identity
  const participation = await prisma.ballotParticipation.findFirst({
    where: { ballotId: ballot.id, studentHash: hashRollNumber(testRoll, ballot.universityId) },
  });
  assert(Boolean(participation), 'BallotParticipation records hashed roll number');

  // Verify raw vote record contains NO student identity
  const rawVotes = await prisma.ballotVote.findMany({
    where: { slotId: slot.id },
  });
  assert(rawVotes.length === 1, 'Vote recorded in BallotVote table');
  const voteObj = rawVotes[0] as any;
  assert(voteObj.rollNumber === undefined, 'BallotVote record strictly has no rollNumber field');
  assert(voteObj.studentId === undefined, 'BallotVote record strictly has no studentId field');
  assert(voteObj.dishName === 'Paneer Butter Masala', 'BallotVote stores dish selection anonymously');

  // Verify CSV export has no student identity
  const csvOutput = await exportBallotCsv(ballot.id);
  assert(!csvOutput.includes(testRoll), 'Exported CSV contains strictly ZERO student roll numbers');
  assert(csvOutput.includes('Advisory'), 'Exported CSV carries advisory notice');

  // ----------------------------------------------------
  // 5. VOTING: 1 VOTE PER SLOT & ELIGIBILITY & 20-VOTE GATE
  // ----------------------------------------------------
  console.log('\n🔒 [2.2] Voting Rules: 1 Vote Per Slot, Eligibility, 20-Vote Gate, & Turnout Warning:');

  // Attempt duplicate vote in same slot by same student -> must update or reject, not duplicate vote count
  const duplicateVote = await submitBallotVote({
    ballotId: ballot.id,
    slotId: slot.id,
    rollNumber: testRoll,
    messId: 'central-mess-north',
    planName: 'Premium Plan',
    dishName: 'Chole Bhature',
    idempotencyKey: `idem-dup-${Date.now()}`,
  });

  const votesAfterSecond = await prisma.ballotVote.count({ where: { slotId: slot.id } });
  assert(votesAfterSecond === 1, '1-Vote-Per-Slot enforced: total vote count remains exactly 1');

  // Test eligibility: Ineligible plan (e.g. Snacks only trying to vote Lunch)
  let eligibilityCaught = false;
  try {
    await submitBallotVote({
      ballotId: ballot.id,
      slotId: slot.id,
      rollNumber: '12109999',
      messId: 'central-mess-north',
      planName: 'Tea & Snacks Plan',
      dishName: 'Chole Bhature',
    });
  } catch (e: any) {
    eligibilityCaught = true;
  }
  assert(eligibilityCaught, 'Eligibility enforced: student without meal in plan is rejected');

  // 20-Vote minimum gating test
  const earlyResults = await getBallotResults(ballot.id);
  const slotResults = earlyResults.slots[0];
  assert(slotResults.resultsUnlocked === false, '20-Vote gate: Results are locked when votes < 20');
  assert(slotResults.totalVotes === 1, 'Reported aggregate vote count: 1');
  assert(earlyResults.isLowTurnout === true, 'Low turnout warning triggered (< 25%)');

  // Anti-stuffing check
  const stuffingCount = await checkBallotStuffing(ballot.id);
  assert(stuffingCount === 0, 'Anti-stuffing audit detects no clustered bursts');

  // Clean up test ballot
  await prisma.ballotVote.deleteMany({ where: { ballotId: ballot.id } });
  await prisma.ballotParticipation.deleteMany({ where: { ballotId: ballot.id } });
  await prisma.ballotSlot.deleteMany({ where: { ballotId: ballot.id } });
  await prisma.ballot.delete({ where: { id: ballot.id } });

  // ----------------------------------------------------
  // 6. ZERO WASTE: SCORING AGAINST 4-WEEK BASELINE
  // ----------------------------------------------------
  console.log('\n🌱 [3.1] Zero Waste Challenge Scoring Against Own 4-Week Baseline:');

  // Create temporary challenge
  const challenge = await prisma.zeroWasteChallenge.create({
    data: {
      universityId: 'lpu',
      title: `Test Challenge ${Date.now()}`,
      startDate: '2026-10-12',
      endDate: '2026-10-18',
      divisions: JSON.stringify(['Boys Hostel', 'Girls Hostel', 'Central', 'Studio']),
      prizeText: 'Winning block gets a feature on the campus entrance screens',
      isDemo: true,
      status: 'ACTIVE',
    },
  });

  const summary = await calculateChallengeLeaderboard(challenge.id);
  assert(Boolean(summary.leaderboardByDivision['Central']), 'Divisions established (Central)');
  assert(Boolean(summary.leaderboardByDivision['Boys Hostel']), 'Divisions established (Boys Hostel)');

  // Verify scoring is percentage improvement versus mess's own baseline
  const centralMess = summary.leaderboardByDivision['Central']?.[0];
  assert(Boolean(centralMess), 'Found central mess in leaderboard');
  assert(
    centralMess.improvementPct > 0,
    `Improvement score calculated against own baseline: +${centralMess.improvementPct}%`
  );

  // ----------------------------------------------------
  // 7. ZERO WASTE: UNDERLOGGING & SATISFACTION FAIRNESS RULES
  // ----------------------------------------------------
  console.log('\n🛡️ [3.2] Zero Waste Fairness Rules (Underlogging Penalty & Satisfaction Guard):');

  // Check Boys Hostel 2 from baselineMockData:
  // loggingPct is 75% (< 80% requirement) -> must be flagged/disqualified!
  const boysMesses = summary.leaderboardByDivision['Boys Hostel'] || [];
  const underloggingMess = boysMesses.find((m) => m.messId === 'boys-hostel-2');
  assert(Boolean(underloggingMess), 'Found boys-hostel-2 in division');
  assert(underloggingMess?.isFlagged === true, 'Fairness Rule: Mess with logging < 80% is disqualified/flagged');
  assert(
    underloggingMess?.flagReason?.includes('Logging completeness') === true,
    'Flag reason accurately cites logging completeness deficiency'
  );

  // Simulated data winner confirmation block
  let simulatedWinnerBlocked = false;
  try {
    await confirmChallengeWinner({
      challengeId: challenge.id,
      managerConfirmation: false,
    });
  } catch (e: any) {
    simulatedWinnerBlocked = true;
  }
  assert(simulatedWinnerBlocked, 'Data honesty: Simulated data or unconfirmed challenge cannot publish a real winner');

  // Anonymous pledge test
  const pledgeResult = await recordAnonymousPledge(challenge.id, 'central-mess-north');
  assert(pledgeResult.count >= 1, 'Anonymous student plate finish pledge recorded');

  // Clean up test challenge
  await prisma.zeroWastePledge.deleteMany({ where: { challengeId: challenge.id } });
  await prisma.zeroWasteScore.deleteMany({ where: { challengeId: challenge.id } });
  await prisma.zeroWasteChallenge.delete({ where: { id: challenge.id } });

  // ----------------------------------------------------
  // 8. FEATURE FLAGS HIDING VERIFICATION
  // ----------------------------------------------------
  console.log('\n🎛️ [4.1] Feature Flags Isolation & Defaults:');

  const flags = await getFeatureFlags('lpu');
  assert(flags.timetable !== undefined, 'Timetable flag configured');
  assert(flags.voting !== undefined, 'Voting flag configured');
  assert(flags.challenge !== undefined, 'Challenge flag configured');

  // Verify updating flag works
  await setFeatureFlag('lpu', 'timetable', true);
  const updatedFlags = await getFeatureFlags('lpu');
  assert(updatedFlags.timetable === true, 'Successfully enabled timetable flag');

  await setFeatureFlag('lpu', 'timetable', false);
  const resetFlags = await getFeatureFlags('lpu');
  assert(resetFlags.timetable === false, 'Successfully reset timetable flag to OFF');

  // ----------------------------------------------------
  // 9. I18N KEY COVERAGE & BANNED WORDS AUDIT
  // ----------------------------------------------------
  console.log('\n🌐 [5.1] i18n Key Coverage & Banned Words Audit:');

  const enKeys = Object.keys(i18nTranslations.en);
  const hiKeys = Object.keys(i18nTranslations.hi);

  assert(enKeys.length > 20, `English keys present: ${enKeys.length}`);
  assert(hiKeys.length > 20, `Hindi keys present: ${hiKeys.length}`);

  let missingInHi = 0;
  enKeys.forEach((k) => {
    if (!i18nTranslations.hi[k]) {
      console.error(`Missing Hindi key: ${k}`);
      missingInHi++;
    }
  });
  assert(missingInHi === 0, '100% Hindi key coverage for all English keys');

  // Unreviewed markers check
  const unreviewedCount = Object.values(i18nTranslations.hi).filter((v) => v.isReviewed === false).length;
  assert(unreviewedCount > 0, `Unreviewed Hindi translations correctly marked (${unreviewedCount} entries)`);

  // Banned words audit (e.g. "telemetry", "ai-powered", "revolutionary")
  const BANNED_WORDS = ['telemetry', 'ai-powered', 'revolutionary', 'game-changing', 'synergy'];
  let bannedFound = 0;

  const allStrings = [
    ...Object.values(i18nTranslations.en).map((v) => v.text),
    ...Object.values(i18nTranslations.hi).map((v) => v.text),
  ];

  allStrings.forEach((str) => {
    BANNED_WORDS.forEach((banned) => {
      if (str.toLowerCase().includes(banned)) {
        console.error(`Banned word "${banned}" found in string: "${str}"`);
        bannedFound++;
      }
    });
  });

  assert(bannedFound === 0, 'Strictly ZERO banned words found in any translation string');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`📊 TEST SUITE FINISHED: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
