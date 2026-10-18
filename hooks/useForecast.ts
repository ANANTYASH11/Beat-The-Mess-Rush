'use client';

import { useMemo, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { MealForecastResult } from '@/lib/forecast';
import { university } from '@/config/university';
import { getUniversitySlug } from '@/hooks/useSelectedMess';

const forecastFetcher = async ([_key, slug, messId, queryDate, mealType]: [
  string,
  string,
  string,
  string,
  string
]): Promise<MealForecastResult> => {
  const res = await fetch(
    `/api/forecast?messCode=${encodeURIComponent(messId)}&slug=${encodeURIComponent(
      slug
    )}&date=${encodeURIComponent(queryDate)}&mealType=${encodeURIComponent(mealType)}`
  );
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to load forecast data');
  }
  return res.json();
};

export function useForecast(messCode?: string, date?: string, mealType = 'Lunch') {
  const activeMessCode = messCode || university.messes[0]?.id;
  const queryDate = date || new Date().toISOString().split('T')[0];
  const slug = getUniversitySlug();

  // SWR key explicitly contains messId, slug, date, and mealType
  const swrKey: [string, string, string, string, string] | null = activeMessCode
    ? ['forecast', slug, activeMessCode, queryDate, mealType]
    : null;

  const currentMessRef = useRef(activeMessCode);
  useEffect(() => {
    currentMessRef.current = activeMessCode;
  }, [activeMessCode]);

  const { data, error, isLoading, mutate } = useSWR<MealForecastResult>(
    swrKey,
    forecastFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
      keepPreviousData: false, // Ensure skeletons render instead of old mess data
    }
  );

  const validatedData = useMemo(() => {
    if (!data) return undefined;
    if (data.messCode && data.messCode !== activeMessCode) {
      return undefined; // Discard stale response from prior mess
    }
    return data;
  }, [data, activeMessCode]);

  return {
    forecast: validatedData,
    isLoading: isLoading || (!validatedData && !error),
    isError: Boolean(error),
    error,
    refreshForecast: mutate,
  };
}
