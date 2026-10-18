'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { university, getMessById, MessConfig } from '@/config/university';

export interface SelectedMessContextValue {
  messId: string;
  mess: MessConfig;
  setMess: (id: string) => void;
  isLocked: boolean;
  isChanging: boolean;
  shortName: string;
  shortAbbr: string;
  // Aliases for backwards compatibility with legacy useActiveMess
  messCode: string;
  activeMess: MessConfig;
  setMessCode: (id: string) => void;
}

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

export function getUniversitySlug(): string {
  return (university.shortName || 'lpu').toLowerCase();
}

export function getMessStorageKey(): string {
  return `uniq_selected_mess_${getUniversitySlug()}`;
}

const SelectedMessContext = createContext<SelectedMessContextValue | null>(null);

function getInitialMessId(): string {
  if (typeof window !== 'undefined') {
    const urlMess = new URLSearchParams(window.location.search).get('mess');
    if (urlMess && university.messes.some((m) => m.id === urlMess)) {
      try {
        const key = getMessStorageKey();
        localStorage.setItem(key, urlMess);
        localStorage.setItem('uniq_selected_mess', urlMess);
      } catch {}
      return urlMess;
    }
    const key = getMessStorageKey();
    const saved = localStorage.getItem(key) || localStorage.getItem('uniq_selected_mess');
    if (saved && university.messes.some((m) => m.id === saved)) {
      return saved;
    }
  }
  return university.messes[0].id;
}

export function SelectedMessProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [messId, setMessIdState] = useState<string>(getInitialMessId);
  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const lockedMessIdRef = useRef<string | null>(null);
  const isChangingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current user session is locked to a specific mess (staff/kitchen)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    try {
      const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('mess_rush_session='))
        ?.split('=')[1];
      if (raw) {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (
          (parsed.role === 'staff' || parsed.role === 'kitchen') &&
          (parsed.messCode || parsed.messId)
        ) {
          const lockedId = parsed.messCode || parsed.messId;
          const found = university.messes.find((m) => m.id === lockedId);
          if (found) {
            setIsLocked(true);
            lockedMessIdRef.current = found.id;
            setMessIdState(found.id);
            return;
          }
        }
      }
    } catch {}
    setIsLocked(false);
    lockedMessIdRef.current = null;
  }, [pathname]);

  // Sync state from URL changes (including browser back/forward)
  useEffect(() => {
    const urlMess = searchParams?.get('mess');
    if (urlMess && university.messes.some((m) => m.id === urlMess)) {
      if (lockedMessIdRef.current && urlMess !== lockedMessIdRef.current) {
        // Enforce lock if role locked
        return;
      }
      if (urlMess !== messId) {
        setMessIdState(urlMess);
      }
      try {
        const key = getMessStorageKey();
        localStorage.setItem(key, urlMess);
        localStorage.setItem('uniq_selected_mess', urlMess);
      } catch {}
    }
  }, [searchParams, messId]);

  // Always ensure current messId is persisted in localStorage
  useEffect(() => {
    if (!messId) return;
    try {
      const key = getMessStorageKey();
      localStorage.setItem(key, messId);
      localStorage.setItem('uniq_selected_mess', messId);
    } catch {}
  }, [messId]);

  // Listen to popstate event (browser back and forward)
  useEffect(() => {
    const handlePopState = () => {
      const urlMess = new URLSearchParams(window.location.search).get('mess');
      if (urlMess && university.messes.some((m) => m.id === urlMess)) {
        if (!lockedMessIdRef.current || urlMess === lockedMessIdRef.current) {
          setMessIdState(urlMess);
          try {
            const key = getMessStorageKey();
            localStorage.setItem(key, urlMess);
            localStorage.setItem('uniq_selected_mess', urlMess);
          } catch {}
        }
      }
    };

    const handleExternalMessChange = (e: any) => {
      const detail = e.detail;
      const targetId = detail?.id || (typeof detail === 'string' ? detail : null);
      if (targetId && university.messes.some((m) => m.id === targetId)) {
        if (!lockedMessIdRef.current || targetId === lockedMessIdRef.current) {
          setMessIdState(targetId);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('uniq_mess_changed', handleExternalMessChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('uniq_mess_changed', handleExternalMessChange);
    };
  }, []);

  // Main setMess function
  const setMess = useCallback(
    (newId: string) => {
      const found = university.messes.find(
        (m) => m.id === newId || m.name.toLowerCase() === newId.toLowerCase()
      );
      if (!found) return;
      const targetId = found.id;

      if (isLocked) {
        return; // Locked roles cannot change mess
      }

      // If already selected, do nothing
      if (targetId === messId) return;

      // Enter changing/loading state (disables selector for 300ms)
      setIsChanging(true);
      if (isChangingTimerRef.current) clearTimeout(isChangingTimerRef.current);
      isChangingTimerRef.current = setTimeout(() => {
        setIsChanging(false);
      }, 300);

      // 1. Update React state
      setMessIdState(targetId);

      // 2. Persist choice per university slug in localStorage
      if (typeof window !== 'undefined') {
        try {
          const key = getMessStorageKey();
          localStorage.setItem(key, targetId);
          localStorage.setItem('uniq_selected_mess', targetId);
        } catch {}
      }

      // 3. Update URL with router.replace keeping all other parameters
      if (typeof window !== 'undefined') {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('mess', targetId);
        const nextUrl = `${currentUrl.pathname}?${currentUrl.searchParams.toString()}${currentUrl.hash}`;
        
        startTransition(() => {
          router.replace(nextUrl, { scroll: false });
          // 4. router.refresh() so Server Components re-fetch with new mess
          router.refresh();
        });

        // 5. Dispatch custom event for any listeners
        window.dispatchEvent(new CustomEvent('uniq_mess_changed', { detail: found }));
      }
    },
    [isLocked, messId, router]
  );

  const mess = getMessById(messId);
  const shortName = mess.shortName || mess.name;
  const shortAbbr = getMessShortAbbr(mess);

  const contextValue: SelectedMessContextValue = {
    messId,
    mess,
    setMess,
    isLocked,
    isChanging: isChanging || isPending,
    shortName,
    shortAbbr,
    messCode: messId,
    activeMess: mess,
    setMessCode: setMess,
  };

  return (
    <SelectedMessContext.Provider value={contextValue}>
      {children}
    </SelectedMessContext.Provider>
  );
}

export function useSelectedMess(): SelectedMessContextValue {
  const context = useContext(SelectedMessContext);
  if (context) return context;

  // Fallback if called outside SelectedMessProvider
  const fallbackMess = university.messes[0];
  return {
    messId: fallbackMess.id,
    mess: fallbackMess,
    setMess: () => {},
    isLocked: false,
    isChanging: false,
    shortName: fallbackMess.shortName || fallbackMess.name,
    shortAbbr: getMessShortAbbr(fallbackMess),
    messCode: fallbackMess.id,
    activeMess: fallbackMess,
    setMessCode: () => {},
  };
}

// Re-export useActiveMess aliased to useSelectedMess for backwards compatibility
export { useSelectedMess as useActiveMess };
