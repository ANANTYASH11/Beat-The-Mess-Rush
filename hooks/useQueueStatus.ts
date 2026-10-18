'use client';

import useSWR from 'swr';
import { LiveQueueResult } from '@/lib/queue';

import { university } from '@/config/university';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to load queue status');
  return res.json();
});

export function useQueueStatus(messCode = university.messes[0]?.id || 'central-mess-north', refreshIntervalMs = 8000) {
  const { data, error, isLoading, mutate } = useSWR<LiveQueueResult>(
    `/api/queue?messCode=${messCode}`,
    fetcher,
    {
      refreshInterval: refreshIntervalMs,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    queue: data,
    isLoading,
    isError: Boolean(error),
    error,
    refreshQueue: mutate,
  };
}
