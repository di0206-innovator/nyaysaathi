import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Pilot Cohort — NyaySaathi',
  description: 'Apply for the NyaySaathi pilot cohort. Free access to AI-powered legal document comparison and dispute action packs.',
  openGraph: {
    title: 'Join Pilot Cohort | NyaySaathi',
    description: 'Apply for early access to NyaySaathi pre-litigation document workflows.',
  },
};

export default function PilotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
