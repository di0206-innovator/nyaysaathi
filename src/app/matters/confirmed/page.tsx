import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, FileText, PhoneCall } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Action Submitted & Confirmed',
  description: 'Your pre-litigation legal step has been recorded and scheduled for statutory notice dispatch.',
};

export default function MatterConfirmedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FBFBF9] px-4 py-16 font-sans text-[#0A0A0A]">
      <div className="max-w-xl w-full bg-white border-2 border-[#0A0A0A] p-6 sm:p-8 space-y-6 text-center">
        <div className="w-14 h-14 bg-emerald-600 text-white flex items-center justify-center mx-auto border border-black font-black">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-300">
            PROCEDURAL STEP RECORDED // STATUTORY NOTICE READY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0A0A0A] mt-2">
            Notice &amp; Dossier Compiled
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-mono leading-relaxed uppercase">
            Your dispute has been anchored with evidentiary provenance, limitation time-bars, and statutory demand clauses.
          </p>
        </div>

        {/* Immediate 3-Step Action Checklist */}
        <div className="text-left bg-[#FBFBF9] border border-stone-300 p-4 sm:p-5 space-y-3 font-mono text-xs">
          <h2 className="font-bold uppercase tracking-wider text-[#0A0A0A] border-b border-stone-200 pb-1.5">
            MANDATORY PROCEDURAL PROTOCOL:
          </h2>
          <div className="space-y-3 text-stone-700 font-sans text-xs">
            <div className="flex items-start gap-3">
              <span className="font-mono font-black text-rose-600 shrink-0">01.</span>
              <div>
                <strong className="text-black">Serve Legal Notice via Speed Post:</strong> Dispatch through India Post Registered Post A.D. Preserve the postal receipt and tracking number as court-admissible proof.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono font-black text-stone-900 shrink-0">02.</span>
              <div>
                <strong className="text-black">Track Response & Cure Window:</strong> Monitor the cure deadline specified in your notice (typically 15 days under notice practice and agreement terms) for the opposing party to reply or refund.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-mono font-black text-rose-600 shrink-0">03.</span>
              <div>
                <strong className="text-black">Download Advocate Case Pack:</strong> If no refund or reply is received upon expiry of the notice deadline, download your 10-section Case Pack to consult an enrolled advocate or approach DLSA for pre-litigation mediation.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
          <Link
            href="/matters"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0A0A0A] hover:bg-stone-800 text-white font-bold uppercase tracking-wider border border-black transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Go to My Matters</span>
          </Link>
          <Link
            href="/pilot"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider border border-black transition-colors"
          >
            <span>Submit Feedback</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="border-t border-stone-200 pt-4 font-mono text-[11px] text-stone-500 uppercase">
          <PhoneCall className="w-3.5 h-3.5 inline mr-1 text-stone-400" />
          <span>FREE GOVERNMENT LEGAL AID: NALSA <strong>15100</strong> (TOLL-FREE 24X7)</span>
        </div>
      </div>
    </div>
  );
}
