'use client';

import useSWR from 'swr';
import { MealForecastResult } from '@/lib/forecast';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to load forecast data');
  return res.json();
});

export function useForecast(messCode = 'mess-1', date?: string, mealType = 'Lunch') {
  const queryDate = date || new Date().toISOString().split('T')[0];
  const { data, error, isLoading, mutate } = useSWR<MealForecastResult>(
    `/api/forecast?messCode=${messCode}&date=${queryDate}&mealType=${mealType}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  return {
    forecast: data,
    isLoading,
    isError: Boolean(error),
    error,
    refreshForecast: mutate,
  };
}
