'use client';

import { useState, useEffect, useCallback } from 'react';
import { university, getMessById, MessConfig } from '@/config/university';

export function getMessShortAbbr(mess: MessConfig | { name: string; shortName?: string }): string {
  if (!mess) return 'MESS';
  const short = (mess.shortName || mess.name || '').trim();
  if (short.length <= 15) return short.toUpperCase();
  return short
    .replace(/Central Mess/gi, 'C')
    .replace(/Central/gi, 'C')
    .replace(/Boys Hostel Mess/gi, 'BH')
    .replace(/Boys Hostel/gi, 'BH')
    .replace(/Girls Hostel Mess/gi, 'GH')
    .replace(/Girls Hostel/gi, 'GH')
    .replace(/Boys Studio Mess/gi, 'BS')
    .replace(/Boys Studio/gi, 'BS')
    .replace(/Girls Studio Mess/gi, 'GS')
    .replace(/Girls Studio/gi, 'GS')
    .toUpperCase();
}

export function useActiveMess() {
  const [messCode, setMessCodeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlMess = new URLSearchParams(window.location.search).get('mess');
      if (urlMess) return urlMess;
      const saved = localStorage.getItem('uniq_selected_mess');
      if (saved) return saved;
    }
    return university.messes[0].id;
  });

  const setMessCode = useCallback((code: string) => {
    setMessCodeState(code);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('uniq_selected_mess', code);
        const found = getMessById(code);
        window.dispatchEvent(new CustomEvent('uniq_mess_changed', { detail: found }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL search params
    const urlMess = new URLSearchParams(window.location.search).get('mess');
    if (urlMess && urlMess !== messCode) {
      setMessCodeState(urlMess);
      try {
        localStorage.setItem('uniq_selected_mess', urlMess);
      } catch {}
    } else {
      // Sync from localStorage if present
      const saved = localStorage.getItem('uniq_selected_mess');
      if (saved && saved !== messCode) {
        setMessCodeState(saved);
      }
    }

    const handleMessChanged = (e: any) => {
      const detail = e.detail;
      const targetId = detail?.id || (typeof detail === 'string' ? detail : null);
      if (targetId) {
        setMessCodeState(targetId);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'uniq_selected_mess' && e.newValue && e.newValue !== messCode) {
        setMessCodeState(e.newValue);
      }
    };

    window.addEventListener('uniq_mess_changed', handleMessChanged);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('uniq_mess_changed', handleMessChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, [messCode]);

  const activeMess = getMessById(messCode);
  const shortName = activeMess.shortName || activeMess.name;
  const shortAbbr = getMessShortAbbr(activeMess);

  return {
    messCode,
    activeMess,
    shortName,
    shortAbbr,
    setMessCode,
  };
}
