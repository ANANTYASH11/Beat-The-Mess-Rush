import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case study | UniQ',
};

export default function CaseStudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
