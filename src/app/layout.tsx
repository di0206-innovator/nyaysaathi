import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { Analytics } from "@/components/ui/Analytics";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { JsonLd } from "@/components/seo/JsonLd";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nyaysaathi.in";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "NyaySaathi — Sovereign GenAI Legal Intelligence & Pre-Litigation Platform",
    template: "%s | NyaySaathi",
  },
  description: "Sovereign GenAI legal document intelligence for India. Line-level clause extraction, semantic redline diffing, hallucination-free document Q&A, and pre-litigation action grounded in BNS 2023, CPA 2019, and the Limitation Act 1963.",
  keywords: [
    "GenAI legal document understanding India",
    "legal document comparison tool",
    "contract clause diff",
    "semantic redline software",
    "document Q&A AI without hallucinations",
    "Bharatiya Nyaya Sanhita 2023 contract intelligence",
    "Consumer Protection Act 2019 complaint generator",
    "rental agreement security deposit refund India",
    "Limitation Act 1963 countdown calculator",
    "Advocate Case Pack DLSA legal aid",
    "e-Daakhil consumer notice template",
    "DPDPA 2023 compliant legal AI"
  ],
  authors: [{ name: "NyaySaathi Legal Tech Initiatives", url: appUrl }],
  creator: "NyaySaathi Legal Tech Initiatives",
  publisher: "NyaySaathi Legal Tech Initiatives",
  category: "Legal Technology",
  classification: "Legal Technology & Sovereign Procedural Intelligence",
  alternates: {
    canonical: appUrl,
    languages: {
      "en-IN": appUrl,
      "hi-IN": `${appUrl}?lang=hi`,
      "x-default": appUrl,
    },
  },
  openGraph: {
    title: "NyaySaathi — Sovereign GenAI Legal Intelligence & Pre-Litigation Platform",
    description: "Understand contracts with line provenance, redline revisions semantically with risk delta scoring, query agreements with zero hallucinations, and resolve disputes under Indian law.",
    url: appUrl,
    siteName: "NyaySaathi",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${appUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "NyaySaathi — Sovereign GenAI Legal Intelligence & Action Navigator for India",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NyaySaathi — Sovereign GenAI Legal Intelligence & Pre-Litigation Platform",
    description: "Semantic clause comparison, redlines, structured contract understanding, and verifiable legal action dossiers.",
    images: [`${appUrl}/opengraph-image`],
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
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "20.5937;78.9629",
    "ICBM": "20.5937, 78.9629",
    "DC.coverage": "Republic of India",
    "DC.jurisdiction": "Supreme Court of India, High Courts & DCDRCs",
    "DC.language": "eng, hin",
    "format-detection": "telephone=no, address=no, email=no",
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
            <JsonLd />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

