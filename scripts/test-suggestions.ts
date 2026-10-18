import { getSuggestions, recordFeedback } from '../lib/suggestions';
import { prisma } from '../lib/prisma';

async function testSuggestions() {
  console.log('🧪 Testing UniQ Suggestions Engine & Guardrails...\n');

  // 1. Kitchen suggestions
  console.log('1. Testing Kitchen suggestions...');
  const kitchenSuggestions = await getSuggestions({ target: 'KITCHEN' });
  if (kitchenSuggestions.length === 0) {
    throw new Error('FAILED: Expected kitchen suggestions to be generated.');
  }

  const riceSuggestion = kitchenSuggestions.find(s => s.key === 'kitchen_rice_batch');
  if (!riceSuggestion) {
    throw new Error('FAILED: Missing kitchen rice batch right-sizing suggestion.');
  }

  // Guardrail check: capped at +/-20%
  if (Math.abs(riceSuggestion.suggestedAdjustmentPct || 0) > 20) {
    throw new Error(`GUARDRAIL VIOLATION: Suggested adjustment exceeds 20% limit: ${riceSuggestion.suggestedAdjustmentPct}%`);
  }

  // Food safety check
  if (!riceSuggestion.foodSafetyNotice || !riceSuggestion.foodSafetyNotice.includes('Food safety')) {
    throw new Error('FAILED: Missing food safety notice on kitchen food suggestion.');
  }
  console.log('✅ PASS: Kitchen suggestion generated with ±20% guardrail and food safety notice:');
  console.log('   •', riceSuggestion.recommendation);
  console.log('   • Impact:', riceSuggestion.impactRange);

  // 2. Staff suggestions
  console.log('\n2. Testing Staff suggestions...');
  const staffSuggestions = await getSuggestions({ target: 'STAFF' });
  if (staffSuggestions.length === 0) {
    throw new Error('FAILED: Expected staff suggestions.');
  }
  const counterSuggestion = staffSuggestions.find(s => s.key === 'staff_counter_open');
  if (!counterSuggestion) {
    throw new Error('FAILED: Missing staff counter opening suggestion.');
  }
  console.log('✅ PASS: Staff suggestion generated:');
  console.log('   •', counterSuggestion.recommendation);

  // 3. Admin suggestions
  console.log('\n3. Testing Admin suggestions...');
  const adminSuggestions = await getSuggestions({ target: 'ADMIN' });
  if (adminSuggestions.length === 0) {
    throw new Error('FAILED: Expected admin suggestions.');
  }
  console.log('✅ PASS: Admin suggestions generated:');
  adminSuggestions.forEach(s => console.log('   •', s.recommendation));

  // 4. Feedback Persistence
  console.log('\n4. Testing SuggestionFeedback table persistence...');
  const feedback = await recordFeedback({
    universitySlug: 'lpu',
    target: 'KITCHEN',
    suggestionKey: 'test_feedback_key',
    recommendation: 'Test recommendation',
    impactExpected: 'Save 5 kg food',
    confidence: 'High',
    action: 'ACCEPTED',
    reason: 'Chef verified recipe adjustment',
  });

  const verified = await prisma.suggestionFeedback.findUnique({
    where: { id: feedback.id },
  });

  if (!verified || verified.action !== 'ACCEPTED') {
    throw new Error('FAILED: Suggestion feedback was not properly persisted in SQLite DB.');
  }
  console.log(`✅ PASS: SuggestionFeedback record verified in DB (ID: ${verified.id}, Action: ${verified.action}).`);

  // Clean up test feedback record
  await prisma.suggestionFeedback.delete({ where: { id: feedback.id } });

  console.log('\n🎉 ALL SUGGESTIONS & GUARDRAIL TESTS PASSED!');
}

testSuggestions()
  .catch(e => {
    console.error('❌ Suggestions test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
