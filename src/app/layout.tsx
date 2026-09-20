import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "NyaySaathi — Matter-Based Legal Action Navigator for India",
  description: "Organize legal disputes into actionable matters. Extract verified facts, calculate limitation time-bars, generate formal legal notices, and navigate to e-Daakhil and NALSA free legal aid.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAF9F5] text-stone-900">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
