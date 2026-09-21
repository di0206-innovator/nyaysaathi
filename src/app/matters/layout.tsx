import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Matters Workspace',
    template: '%s | NyaySaathi',
  },
  description: 'Manage and track your active legal matters, procedural stages, evidence dossiers, and pre-litigation notices.',
};

export default function MattersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
