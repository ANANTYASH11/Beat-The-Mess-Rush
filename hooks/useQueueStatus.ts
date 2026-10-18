'use client';

import { useMemo, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { LiveQueueResult } from '@/lib/queue';
import { university } from '@/config/university';
import { getUniversitySlug } from '@/hooks/useSelectedMess';

interface QueueKey {
  key: string;
  slug: string;
  messId: string;
}

const queueFetcher = async ([key, slug, messId]: [string, string, string]): Promise<LiveQueueResult> => {
  const controller = new AbortController();
  const res = await fetch(
    `/api/queue?messCode=${encodeURIComponent(messId)}&slug=${encodeURIComponent(slug)}`,
    { signal: controller.signal }
  );
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to load queue status');
  }
  return res.json();
};

export function useQueueStatus(messCode?: string, refreshIntervalMs = 8000) {
  const activeMessCode = messCode || university.messes[0]?.id;
  const slug = getUniversitySlug();

  // Explicit SWR cache key containing both slug and messId
  const swrKey: [string, string, string] | null = activeMessCode
    ? ['queue', slug, activeMessCode]
    : null;

  const currentMessRef = useRef(activeMessCode);
  useEffect(() => {
    currentMessRef.current = activeMessCode;
  }, [activeMessCode]);

  const { data, error, isLoading, mutate } = useSWR<LiveQueueResult>(
    swrKey,
    queueFetcher,
    {
      refreshInterval: refreshIntervalMs,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      keepPreviousData: false, // Ensure previous mess data is not shown while new mess loads
    }
  );

  // Discard stale responses if response belongs to another mess
  const validatedData = useMemo(() => {
    if (!data) return undefined;
    if (data.messCode && data.messCode !== activeMessCode) {
      return undefined; // Discard stale response
    }
    return data;
  }, [data, activeMessCode]);

  return {
    queue: validatedData,
    isLoading: isLoading || (!validatedData && !error),
    isError: Boolean(error),
    error,
    refreshQueue: mutate,
  };
}
