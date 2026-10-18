import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student | UniQ',
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
