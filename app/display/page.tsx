'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelectedMess } from '@/hooks/useSelectedMess';
import EntranceScreen from '@/components/display/EntranceScreen';

export default function DisplayPage() {
  const { messId } = useSelectedMess();
  const searchParamsHook = useSearchParams();

  // Convert searchParams to record
  const searchParamsRecord: Record<string, string | undefined> = {};
  searchParamsHook.forEach((val, key) => {
    searchParamsRecord[key] = val;
  });

  return (
    <EntranceScreen
      slug="lpu"
      messId={messId}
      searchParams={searchParamsRecord}
    />
  );
}
