import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impact | UniQ',
};

export default function ImpactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
