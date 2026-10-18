/**
 * UniQ Next.js ML Microservice Client.
 * Server-only typed interface to /ml-service (Python FastAPI on port 8001).
 * Features:
 * - Shared secret header authentication (X-ML-Secret)
 * - Strict tenant isolation (universityId passed on every call)
 * - Silent fallback to TypeScript baseline if ML service is unreachable
 */

function getMlServiceUrl(): string {
  return process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';
}

function getMlServiceSecret(): string {
  return process.env.ML_SERVICE_SECRET || 'uniq_ml_secret_shared_2026_campus';
}

const REQUEST_TIMEOUT_MS = 3500;

export interface AttendancePredictionResult {
  expected_plates: number;
  p10: number;
  p90: number;
  range_label: string;
  interval_width: number;
  confidence_level: 'High' | 'Moderate' | 'Low';
  model_version: number;
  data_mode: 'SIMULATED' | 'REAL' | 'MIXED';
  top_drivers: Array<{
    feature: string;
    label: string;
    weight: number;
  }>;
  engine: string;
  use_baseline: boolean;
  baseline_note?: string;
}

export interface ModelStatusResult {
  university_slug: string;
  models: {
    attendance_forecast: {
      version: number | null;
      trained_at?: string;
      data_mode?: string;
      metrics?: {
        mae: number;
        mape: number;
        coverage_80: number;
        baseline_mae: number;
        baseline_mape: number;
        mae_improvement_pct: number;
        mape_improvement_pct: number;
        test_days: number;
        test_samples: number;
        train_samples: number;
      };
      feature_importance?: Record<string, number>;
      is_promoted?: boolean;
      status?: string;
      use_baseline?: boolean;
      message?: string;
    };
  };
}

export async function checkMlServiceHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${getMlServiceUrl()}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getMlModelsStatus(universitySlug = 'lpu'): Promise<ModelStatusResult | null> {
  try {
    const res = await fetch(`${getMlServiceUrl()}/models/status?university_slug=${encodeURIComponent(universitySlug)}`, {
      method: 'GET',
      headers: {
        'X-ML-Secret': getMlServiceSecret(),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function triggerMlTraining(params: {
  universitySlug?: string;
  modelType?: string;
  dataMode?: 'SIMULATED' | 'REAL' | 'MIXED';
  testDays?: number;
  daysToGenerate?: number;
}) {
  const universitySlug = params.universitySlug || 'lpu';
  const modelType = params.modelType || 'attendance_forecast';
  const dataMode = params.dataMode || 'SIMULATED';
  const testDays = params.testDays || 14;
  const daysToGenerate = params.daysToGenerate || 84;

  try {
    const res = await fetch(`${getMlServiceUrl()}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ML-Secret': getMlServiceSecret(),
      },
      body: JSON.stringify({
        university_slug: universitySlug,
        model_type: modelType,
        data_mode: dataMode,
        test_days: testDays,
        days_to_generate: daysToGenerate,
      }),
      signal: AbortSignal.timeout(30000), // Training can take up to 30s
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `ML Service training returned HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to trigger training on ML microservice');
  }
}

export async function predictAttendanceMl(params: {
  universitySlug?: string;
  messCode: string;
  mealType: string;
  features: Record<string, any>;
}): Promise<AttendancePredictionResult | null> {
  const universitySlug = params.universitySlug || 'lpu';

  try {
    const res = await fetch(`${getMlServiceUrl()}/predict/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ML-Secret': getMlServiceSecret(),
      },
      body: JSON.stringify({
        university_slug: universitySlug,
        mess_code: params.messCode,
        meal_type: params.mealType,
        features: params.features,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.use_baseline) return null;
    return data;
  } catch {
    // Silent fallback to TypeScript baseline if ML microservice is down or times out
    return null;
  }
}

export interface DishWastePredictionResult {
  dish_name: string;
  predicted_waste_pct: number;
  baseline_waste_pct: number;
  suggested_reduction_pct: number;
  confidence: 'High' | 'Medium' | 'Low';
  model_version: number;
  data_mode: 'SIMULATED' | 'REAL' | 'MIXED';
  guardrails: {
    capped_at_max_pct: number;
    is_capped: boolean;
    minimum_serving_floor_kg: number;
    food_safety_note: string;
  };
  engine: string;
  use_baseline: boolean;
}

export async function predictWasteMl(params: {
  universitySlug?: string;
  features: Record<string, any>;
}): Promise<DishWastePredictionResult | null> {
  const universitySlug = params.universitySlug || 'lpu';

  try {
    const res = await fetch(`${getMlServiceUrl()}/predict/waste`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ML-Secret': getMlServiceSecret(),
      },
      body: JSON.stringify({
        university_slug: universitySlug,
        features: params.features,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.use_baseline) return null;
    return data;
  } catch {
    return null;
  }
}

export async function rollbackMlModel(params: {
  universitySlug?: string;
  modelName?: string;
}) {
  const universitySlug = params.universitySlug || 'lpu';
  const modelName = params.modelName || 'attendance_forecast';

  const res = await fetch(`${getMlServiceUrl()}/models/rollback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ML-Secret': getMlServiceSecret(),
    },
    body: JSON.stringify({
      university_slug: universitySlug,
      model_name: modelName,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Rollback returned HTTP ${res.status}`);
  }

  return await res.json();
}
