'use client';

import useSWR from 'swr';
import { LiveQueueResult } from '@/lib/queue';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to load queue status');
  return res.json();
});

export function useQueueStatus(messCode = 'mess-1', refreshIntervalMs = 8000) {
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
