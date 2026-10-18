import { calculateForecast } from '../lib/forecast';
import { getMlModelsStatus, predictAttendanceMl } from '../lib/ml-client';

async function runTestSuite() {
  console.log('🧪 Starting UniQ ML API and Fallback Test Suite...\n');

  // Test 1: Tenant Isolation
  console.log('Test 1: Tenant Isolation on Model Status...');
  const lpuStatus = await getMlModelsStatus('lpu');
  const otherStatus = await getMlModelsStatus('unauthorized_other_tenant');

  if (!lpuStatus || !lpuStatus.models.attendance_forecast.version) {
    throw new Error('FAILED: LPU should have active attendance_forecast model version.');
  }
  if (otherStatus && otherStatus.models.attendance_forecast.version) {
    throw new Error('FAILED: Tenant isolation breach! Unauthorized tenant accessed LPU model.');
  }
  console.log('✅ PASS: Tenant isolation confirmed (LPU version:', lpuStatus.models.attendance_forecast.version, 'vs other tenant null).');

  // Test 2: Active Quantile Forecast
  console.log('\nTest 2: ML Quantile Forecast Endpoint...');
  const activeForecast = await calculateForecast('central-mess-north', '2026-10-12', 'Lunch');
  if (!activeForecast.isMlActive || !activeForecast.mlRange) {
    throw new Error('FAILED: Expected ML quantile model to be active.');
  }
  if (activeForecast.mlRange.p10 > activeForecast.expectedPlates || activeForecast.expectedPlates > activeForecast.mlRange.p90) {
    throw new Error(`FAILED: Quantile bound violation: p10=${activeForecast.mlRange.p10}, point=${activeForecast.expectedPlates}, p90=${activeForecast.mlRange.p90}`);
  }
  console.log(`✅ PASS: Quantile range valid: [${activeForecast.mlRange.p10}, ${activeForecast.expectedPlates}, ${activeForecast.mlRange.p90}] plates.`);

  // Test 3: Fallback to TypeScript Baseline
  console.log('\nTest 3: Silent Fallback to Baseline when ML service unreachable...');
  // Force invalid URL temporarily
  const originalUrl = process.env.ML_SERVICE_URL;
  process.env.ML_SERVICE_URL = 'http://127.0.0.1:9999'; // unreachable port

  const fallbackForecast = await calculateForecast('central-mess-north', '2026-10-12', 'Lunch');
  process.env.ML_SERVICE_URL = originalUrl; // restore

  if (fallbackForecast.isMlActive) {
    throw new Error('FAILED: Should have fallen back when ML service is offline.');
  }
  if (!fallbackForecast.confidenceNote.includes('Using baseline forecast')) {
    throw new Error('FAILED: Fallback note missing from confidenceNote.');
  }
  if (typeof fallbackForecast.expectedPlates !== 'number' || fallbackForecast.expectedPlates <= 0) {
    throw new Error('FAILED: Fallback expectedPlates should be valid positive number.');
  }
  console.log(`✅ PASS: Silent fallback operational! Generated baseline estimate of ${fallbackForecast.expectedPlates} plates.`);

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTestSuite().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
