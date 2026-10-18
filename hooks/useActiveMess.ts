'use client';

// Single source of truth is useSelectedMess
export {
  useSelectedMess,
  useSelectedMess as useActiveMess,
  getMessShortAbbr,
  getUniversitySlug,
  getMessStorageKey,
  SelectedMessProvider,
} from './useSelectedMess';
export type { SelectedMessContextValue } from './useSelectedMess';
