import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — NyaySaathi',
  description: 'Terms and Conditions governing the use of NyaySaathi Legal Action Navigator under Indian Law and the Advocates Act 1961.',
};

export default function TermsPage() {
  const lastUpdated = 'September 21, 2026';

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b-2 border-[#0A0A0A] pb-6">
          <Link
            href="/"
            className="inline-flex items-center font-mono text-xs font-bold uppercase text-rose-600 hover:text-rose-700 tracking-wider gap-1.5 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dossier Index</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-rose-600 text-white flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
                STATUTORY TERMS &amp; CONDITIONS
              </span>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
                Terms of Service
              </h1>
              <p className="font-mono text-xs text-stone-500 uppercase mt-0.5">
                EFFECTIVE DATE: {lastUpdated} {'//'} ADVOCATES ACT 1961 {'//'} REPUBLIC OF INDIA
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Statutory Notice under Advocates Act 1961 */}
        <div className="bg-[#0A0A0A] text-white p-6 border-2 border-black space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
              !
            </div>
            <div className="space-y-1">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
                [STATUTORY DIRECTIVE: ADVOCATES ACT, 1961]
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                NyaySaathi is an informational legal action navigation and self-help case organization platform.{' '}
                <strong className="text-white">NyaySaathi is not a law firm, does not practice law, does not solicit legal work, and does not provide formal legal representation</strong>. Use of NyaySaathi does not establish an advocate-client relationship. All generated draft notices, timeline summaries, and case packs are for informational preparation. Users must consult an enrolled Advocate or visit a DLSA center for formal court representation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-xs sm:text-sm leading-relaxed bg-white border-2 border-[#0A0A0A] p-6 sm:p-8">
          {/* Section 1 */}
          <section className="space-y-2 border-b border-stone-200 pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <span className="font-mono text-rose-600">01. //</span>
              Acceptance &amp; Scope of Service
            </h2>
            <p className="text-stone-700">
              By accessing NyaySaathi, registering for the pilot cohort, initiating a matter dossier, or utilizing our pre-litigation notice workflows, you explicitly agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2 border-b border-stone-200 pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <span className="font-mono text-rose-600">02. //</span>
              User Warranties Regarding Uploaded Evidence
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700 font-sans">
              <li>All dispute details, transaction dates, and claims entered by you represent genuine factual occurrences.</li>
              <li>You hold lawful title to upload any agreements, receipts, or WhatsApp communication transcripts.</li>
              <li>You will not upload forged, falsified, defamatory, or extortionate materials into the evidence locker.</li>
              <li>You will independently review all generated draft notices prior to formal dispatch via Speed Post.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2 border-b border-stone-200 pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <span className="font-mono text-rose-600">03. //</span>
              No Guarantee of Judicial Recovery
            </h2>
            <p className="text-stone-700">
              While NyaySaathi analyzes statutory timelines under the Limitation Act 1963 and state rent control acts, judicial and arbitral outcomes depend on discretionary judicial assessment, evidence quality, and adversary defense arguments. NyaySaathi does not guarantee recovery of any monetary sum.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2 border-b border-stone-200 pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <span className="font-mono text-rose-600">04. //</span>
              License to Generated Legal Output
            </h2>
            <p className="text-stone-700">
              You hold a perpetual, non-exclusive, worldwide license to download, edit, print, dispatch, and submit any legal notice, chronology, or Advocate Case Pack produced from your entered matters. The underlying multi-agent reasoning architecture remains the intellectual property of NyaySaathi.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-5 border border-[#0A0A0A] bg-[#FBFBF9] space-y-3 font-mono text-xs">
            <h2 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A]">
              05 // GOVERNING LAW &amp; EXCLUSIVE JURISDICTION
            </h2>
            <p className="text-stone-700 font-sans">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any dispute arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
            </p>
            <div className="pt-2 border-t border-stone-300 space-y-1 text-stone-700">
              <p className="font-bold text-[#0A0A0A]">REGISTERED OFFICE:</p>
              <p>NyaySaathi Legal Tech Initiatives</p>
              <p>#42, 4th Cross, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034, India</p>
              <p>EMAIL: <a href="mailto:legal@nyaysaathi.in" className="text-rose-600 underline font-bold">legal@nyaysaathi.in</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
