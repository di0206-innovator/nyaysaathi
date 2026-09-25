import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document Understanding & Clause Risk Extraction',
  description: 'Instant structural breakdown of complex contracts, legal notices, and tenancy agreements into plain language with risk ratings.',
  openGraph: {
    title: 'Document Understanding & Clause Risk Extraction | NyaySaathi',
    description: 'Instant plain-language breakdown of legal agreements and statutory clauses.',
  },
};

export default function UnderstandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
