import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ArrowRight, FileText, PhoneCall } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Action Submitted & Confirmed',
  description: 'Your pre-litigation legal step has been recorded and scheduled for statutory notice dispatch.',
};

export default function MatterConfirmedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF9F5] px-4 py-16">
      <div className="max-w-xl w-full bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Procedural Step Recorded
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Matter Notice &amp; Dossier Prepared
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Your legal situation has been structured with verified evidentiary provenance, limitation time-bars, and statutory demand grounds.
          </p>
        </div>

        {/* Immediate 3-Step Action Checklist */}
        <div className="text-left bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Recommended Next Procedural Steps
          </h2>
          <div className="space-y-2.5 text-xs text-stone-700">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-stone-900">Serve the Legal Notice:</strong> Send via Registered Post A.D. (Speed Post) with postal tracking receipt preserved as evidence.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-stone-900">Track 15-Day Statutory Window:</strong> Under Indian contract and rent laws, the adverse party has 15 business days to comply or reply.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-stone-900">Download Advocate Case Pack:</strong> If no refund or reply is received, download your 10-section Case Pack to consult an enrolled advocate or approach DLSA.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/matters"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
          >
            <FileText className="w-4 h-4" />
            Go to My Matters
          </Link>
          <Link
            href="/pilot"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold transition-colors shadow-sm"
          >
            <span>Submit Pilot Feedback</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="border-t border-stone-200 pt-4 text-[11px] text-stone-500 flex items-center justify-center gap-2">
          <PhoneCall className="w-3.5 h-3.5 text-stone-400" />
          <span>Need government legal aid? Call NALSA: <strong>15100</strong> (Toll-Free, 24x7)</span>
        </div>
      </div>
    </div>
  );
}
