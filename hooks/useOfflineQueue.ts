'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OfflineAction {
  id: string;
  endpoint: string;
  payload: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

const OFFLINE_STORAGE_KEY = 'mess_rush_offline_queue_v2';

export function useOfflineQueue(onActionSynced?: () => void) {
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        setOfflineQueue(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveQueue = (queue: OfflineAction[]) => {
    setOfflineQueue(queue);
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  };

  const enqueueAction = useCallback((endpoint: string, payload: Record<string, unknown>) => {
    const item: OfflineAction = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      endpoint,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    const updated = [...offlineQueue, item];
    saveQueue(updated);
    return item;
  }, [offlineQueue]);

  const flushQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return 0;

    const remaining: OfflineAction[] = [];
    let synced = 0;

    for (const item of offlineQueue) {
      try {
        const res = await fetch(item.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (res.ok) {
          synced++;
        } else {
          item.retryCount++;
          remaining.push(item);
        }
      } catch {
        item.retryCount++;
        remaining.push(item);
      }
    }

    saveQueue(remaining);
    if (synced > 0 && onActionSynced) {
      onActionSynced();
    }
    return synced;
  }, [offlineQueue, onActionSynced]);

  // Periodic flush attempt every 5 seconds
  useEffect(() => {
    if (offlineQueue.length === 0) return;
    const interval = setInterval(() => {
      if (navigator.onLine) {
        flushQueue();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [offlineQueue, flushQueue]);

  return {
    isOnline,
    offlineCount: offlineQueue.length,
    enqueueAction,
    flushQueue,
  };
}
