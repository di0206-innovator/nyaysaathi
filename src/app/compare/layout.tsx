import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document Comparison & Semantic Clause Diff',
  description: 'Compare contract revisions semantically side-by-side with risk delta analysis, clause shift scoring, and visual redlines.',
  openGraph: {
    title: 'Document Comparison & Semantic Clause Diff | NyaySaathi',
    description: 'Compare legal contracts side-by-side with automated risk delta scoring.',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
