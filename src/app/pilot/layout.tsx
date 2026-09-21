import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pilot Program Onboarding',
  description: 'Join the NyaySaathi real-world pilot cohort for pre-litigation legal dispute navigation and tenancy deposit recovery.',
};

export default function PilotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
