import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In & Access Dossier Registry',
  description: 'Sign in to access your secure legal dockets, active dispute matter files, and evidentiary records on NyaySaathi.',
  openGraph: {
    title: 'Sign In | NyaySaathi',
    description: 'Sign in to access your secure legal dockets and evidentiary records.',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
