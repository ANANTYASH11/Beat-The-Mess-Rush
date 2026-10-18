import React from 'react';
import EntranceScreen from '@/components/display/EntranceScreen';

interface Props {
  params: {
    slug: string;
    messId: string;
  };
  searchParams: Record<string, string | undefined>;
}

export default function DisplayPage({ params, searchParams }: Props) {
  return (
    <EntranceScreen
      slug={params.slug}
      messId={params.messId}
      searchParams={searchParams}
    />
  );
}
