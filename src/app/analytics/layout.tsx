import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pilot Telemetry & Recovery Statistics',
  description: 'Live performance metrics, dispute resolution time-savings, and settlement statistics across NyaySaathi cohorts.',
  openGraph: {
    title: 'Pilot Telemetry & Analytics | NyaySaathi',
    description: 'Explore live case preparation and dispute recovery metrics.',
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
