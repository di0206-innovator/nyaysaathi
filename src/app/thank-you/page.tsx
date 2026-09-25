import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, FileText, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Submission Received — NyaySaathi',
  description: 'Your procedural submission has been recorded in the NyaySaathi digital legal registry.',
};

export default function ThankYouPage() {
  const submissionRef = 'NYAY-ACK-849201';

  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-[#09090b] px-4 py-20 font-sans text-stone-100 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-8 bg-black/80 backdrop-blur-md p-8 sm:p-12 border-2 border-stone-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
        <div className="w-16 h-16 bg-emerald-600 text-white flex items-center justify-center mx-auto border-2 border-emerald-400 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          <CheckCircle2 className="w-9 h-9 text-white" />
        </div>

        <div className="space-y-3">
          <div className="inline-block font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 border border-emerald-800">
            TRANSACTION DISPATCHED // SUCCESS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-2">
            Submission Confirmed
          </h1>
          <p className="text-xs text-stone-300 font-mono leading-relaxed uppercase">
            Your legal request, pilot registration, or docket query has been successfully transmitted and indexed into the confidential registry.
          </p>
        </div>

        {/* Verification Dossier Box */}
        <div className="p-4 bg-stone-950 border border-stone-800 text-left font-mono text-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400 border-b border-stone-800 pb-2">
            <span>REGISTRY REFERENCE:</span>
            <span className="text-emerald-400 font-bold">{submissionRef}</span>
          </div>
          <div className="flex justify-between items-center text-stone-400 border-b border-stone-800 pb-2">
            <span>DATA ENCRYPTION:</span>
            <span className="text-white font-bold">AES-256-GCM / TLS 1.3</span>
          </div>
          <div className="flex justify-between items-center text-stone-400">
            <span>STATUTORY NOTICE:</span>
            <span className="text-rose-400">DPDPA 2023 COMPLIANT</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-center font-mono text-xs">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-100 hover:bg-white text-black font-bold uppercase tracking-wider border-2 border-stone-200 transition-all hover:scale-[1.02] shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]"
          >
            <Home className="w-4 h-4 text-black" />
            <span>Return to Index</span>
          </Link>
          <Link
            href="/matters"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider border-2 border-rose-500 transition-all hover:scale-[1.02] shadow-[3px_3px_0px_0px_rgba(244,63,94,0.3)]"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>View Matters Dossier</span>
          </Link>
        </div>

        <div className="border-t border-stone-800 pt-5 font-mono text-xs text-stone-400 uppercase flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privileged legal communication protected by law</span>
        </div>
      </div>
    </main>
  );
}
