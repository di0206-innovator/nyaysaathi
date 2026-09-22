import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieBanner } from "@/components/ui/CookieBanner";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nyaysaathi.in";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "NyaySaathi — Matter-Based Legal Action Navigator for India",
    template: "%s | NyaySaathi",
  },
  description: "Organize legal disputes into actionable matters. Extract verified facts, calculate limitation time-bars, generate formal legal notices, and navigate to e-Daakhil and NALSA free legal aid.",
  keywords: [
    "legal action navigator",
    "India legal notice generator",
    "tenant security deposit recovery",
    "Karnataka Rent Act",
    "Limitation Act 1963",
    "Advocate Case Pack",
    "e-Daakhil consumer complaint",
    "NALSA legal aid"
  ],
  authors: [{ name: "NyaySaathi Legal Tech Initiatives" }],
  openGraph: {
    title: "NyaySaathi — Matter-Based Legal Action Navigator for India",
    description: "Transform unstructured legal disputes into disciplined matters. Calculate statutory limitation deadlines and generate verifiable legal notices under Indian law.",
    url: appUrl,
    siteName: "NyaySaathi",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NyaySaathi — Matter-Based Legal Action Navigator for India",
    description: "Organize legal disputes into actionable matters. Verifiable evidence, statutory timelines, and advocate handoff packs.",
  },
  icons: {
    icon: "/favicon.ico",
  },
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAF9F5] text-stone-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-900 focus:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:font-mono focus:text-xs"
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
            <CookieBanner />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
