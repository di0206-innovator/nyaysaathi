import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Suite & Legal AI Features',
  description: 'Explore NyaySaathi GenAI features: Document Understanding, Semantic Clause Comparison, Redline Diffing, Document Q&A, and Notice Drafting.',
  openGraph: {
    title: 'Product Suite & Legal AI Features | NyaySaathi',
    description: 'Explore contract understanding, semantic clause comparison, redlines, and pre-litigation dispute navigation.',
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
