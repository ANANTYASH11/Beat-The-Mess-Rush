import { prisma } from './prisma';

export interface UniversityFeatureFlags {
  timetable: boolean;
  voting: boolean;
  challenge: boolean;
  display_challenge_ticker: boolean;
}

export const DEFAULT_FEATURE_FLAGS: UniversityFeatureFlags = {
  timetable: false, // Class-timetable arrival prediction (default OFF)
  voting: false,    // Weekly menu voting (default OFF)
  challenge: false, // Zero Waste Week challenge (default OFF)
  display_challenge_ticker: false, // Display screen challenge line (default OFF)
};

/**
 * Retrieves per-university feature flags from Setting table.
 * Strictly tenant-isolated by universitySlug.
 */
export async function getFeatureFlags(universitySlug = 'lpu'): Promise<UniversityFeatureFlags> {
  try {
    const slug = (universitySlug || 'lpu').toLowerCase();
    const key = `feature_flags_${slug}`;
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting || !setting.value) {
      return { ...DEFAULT_FEATURE_FLAGS };
    }

    const parsed = JSON.parse(setting.value);
    return {
      timetable: typeof parsed.timetable === 'boolean' ? parsed.timetable : DEFAULT_FEATURE_FLAGS.timetable,
      voting: typeof parsed.voting === 'boolean' ? parsed.voting : DEFAULT_FEATURE_FLAGS.voting,
      challenge: typeof parsed.challenge === 'boolean' ? parsed.challenge : DEFAULT_FEATURE_FLAGS.challenge,
      display_challenge_ticker: typeof parsed.display_challenge_ticker === 'boolean'
        ? parsed.display_challenge_ticker
        : DEFAULT_FEATURE_FLAGS.display_challenge_ticker,
    };
  } catch (error) {
    console.error(`Error loading feature flags for ${universitySlug}:`, error);
    return { ...DEFAULT_FEATURE_FLAGS };
  }
}

/**
 * Updates per-university feature flags in Setting table.
 */
export async function setFeatureFlags(
  universitySlug = 'lpu',
  updates: Partial<UniversityFeatureFlags>
): Promise<UniversityFeatureFlags> {
  const slug = (universitySlug || 'lpu').toLowerCase();
  const current = await getFeatureFlags(slug);
  const updated: UniversityFeatureFlags = {
    ...current,
    ...updates,
  };

  const key = `feature_flags_${slug}`;
  await prisma.setting.upsert({
    where: { key },
    create: {
      key,
      value: JSON.stringify(updated),
    },
    update: {
      value: JSON.stringify(updated),
    },
  });

  return updated;
}

/**
 * Resets per-university feature flags back to default (all OFF).
 */
export async function resetFeatureFlags(universitySlug = 'lpu'): Promise<UniversityFeatureFlags> {
  const slug = (universitySlug || 'lpu').toLowerCase();
  const key = `feature_flags_${slug}`;
  await prisma.setting.upsert({
    where: { key },
    create: {
      key,
      value: JSON.stringify(DEFAULT_FEATURE_FLAGS),
    },
    update: {
      value: JSON.stringify(DEFAULT_FEATURE_FLAGS),
    },
  });

  return { ...DEFAULT_FEATURE_FLAGS };
}

/**
 * Sets an individual feature flag value.
 */
export async function setFeatureFlag(
  universitySlug = 'lpu',
  flagKey: keyof UniversityFeatureFlags,
  value: boolean
): Promise<UniversityFeatureFlags> {
  return setFeatureFlags(universitySlug, { [flagKey]: value });
}
