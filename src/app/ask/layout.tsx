import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document Q&A & Semantic Inquiry',
  description: 'Ask document-grounded legal questions with strict citation grounding, factual provenance, and statutory cross-referencing.',
  openGraph: {
    title: 'Document Q&A & Semantic Inquiry | NyaySaathi',
    description: 'Ask document-grounded legal questions with strict citation grounding under Indian law.',
  },
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
