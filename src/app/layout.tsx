import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { Analytics } from "@/components/ui/Analytics";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nyaysaathi.in";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "NyaySaathi — GenAI Legal Document Understanding & Comparison Platform",
    template: "%s | NyaySaathi",
  },
  description: "AI-powered legal document understanding, semantic clause comparison, redline diffing, and pre-litigation dispute navigation under Indian law.",
  keywords: [
    "GenAI legal document understanding",
    "legal document comparison",
    "contract clause diff",
    "semantic redline",
    "document Q&A AI",
    "legal notice generator India",
    "rental agreement comparison",
    "Limitation Act 1963",
    "Advocate Case Pack",
    "e-Daakhil consumer complaint"
  ],
  authors: [{ name: "NyaySaathi Legal Tech Initiatives" }],
  openGraph: {
    title: "NyaySaathi — GenAI Legal Document Understanding & Comparison",
    description: "Understand complex contracts, compare document revisions semantically with risk delta scoring, ask document-grounded questions, and navigate pre-litigation disputes.",
    url: appUrl,
    siteName: "NyaySaathi",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NyaySaathi — GenAI Legal Document Understanding & Comparison",
    description: "Semantic clause comparison, redlines, structured contract understanding, and verifiable legal action dossiers.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#09090b] text-stone-100 selection:bg-rose-600 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-900 focus:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:font-mono focus:text-xs border border-rose-500"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <StickyMobileCTA />
            <CookieBanner />
            <Analytics />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

