import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real-World Pilot Analytics & Metrics',
  description: 'Verifiable legal metrics, time-to-first-useful-action benchmarks, and pilot cohort feedback under real Indian statutory workflows.',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
