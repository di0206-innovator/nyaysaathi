import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — Advocates Act 1961 Compliance',
  description: 'Terms and Conditions governing the use of NyaySaathi Legal Action Navigator under Indian Law and the Advocates Act 1961.',
};

export default function TermsPage() {
  const lastUpdated = 'September 25, 2026';

  return (
    <div className="min-h-screen bg-[#09090b] text-stone-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="border-b-2 border-stone-800 pb-8">
          <Link
            href="/"
            className="inline-flex items-center font-mono text-xs font-bold uppercase text-rose-500 hover:text-rose-400 tracking-wider gap-2 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dossier Index</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-rose-600 text-white flex items-center justify-center font-bold border-2 border-rose-500 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400">
                STATUTORY TERMS &amp; CONDITIONS
              </span>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
                Terms of Service
              </h1>
              <p className="font-mono text-xs text-stone-400 uppercase mt-1">
                EFFECTIVE DATE: {lastUpdated} {'//'} ADVOCATES ACT 1961 {'//'} REPUBLIC OF INDIA
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Statutory Notice under Advocates Act 1961 */}
        <div className="bg-black/90 text-white p-6 sm:p-8 border-2 border-stone-700 shadow-[0_0_30px_rgba(0,0,0,0.7)] space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border border-rose-400">
              !
            </div>
            <div className="space-y-2">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
                [STATUTORY DIRECTIVE: ADVOCATES ACT, 1961]
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                NyaySaathi is an informational legal action navigation and self-help case organization platform.{' '}
                <strong className="text-white font-bold">NyaySaathi is not a law firm, does not practice law, does not solicit legal work, and does not provide formal legal representation</strong>. Use of NyaySaathi does not establish an advocate-client relationship. All generated draft notices, timeline summaries, and case packs are for informational preparation. Users must consult an enrolled Advocate or visit a DLSA center for formal court representation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-xs sm:text-sm leading-relaxed bg-black/60 border-2 border-stone-800 p-6 sm:p-10 backdrop-blur-sm">
          {/* Section 1 */}
          <section className="space-y-3 border-b border-stone-800 pb-8">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="font-mono text-rose-500">01. //</span>
              Acceptance &amp; Scope of Service
            </h2>
            <p className="text-stone-300">
              By accessing NyaySaathi, registering for the pilot cohort, initiating a matter dossier, or utilizing our pre-litigation notice workflows, you explicitly agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-b border-stone-800 pb-8">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="font-mono text-rose-500">02. //</span>
              User Warranties Regarding Uploaded Evidence
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-stone-300 font-sans">
              <li>All dispute details, transaction dates, and claims entered by you represent genuine factual occurrences.</li>
              <li>You hold lawful title to upload any agreements, receipts, or WhatsApp communication transcripts.</li>
              <li>You will not upload forged, falsified, defamatory, or extortionate materials into the evidence locker.</li>
              <li>You will independently review all generated draft notices prior to formal dispatch via Speed Post.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-b border-stone-800 pb-8">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="font-mono text-rose-500">03. //</span>
              No Guarantee of Judicial Recovery
            </h2>
            <p className="text-stone-300">
              While NyaySaathi analyzes statutory timelines under the Limitation Act 1963 and state rent control acts, judicial and arbitral outcomes depend on discretionary judicial assessment, evidence quality, and adversary defense arguments. NyaySaathi does not guarantee recovery of any monetary sum.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-b border-stone-800 pb-8">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="font-mono text-rose-500">04. //</span>
              License to Generated Legal Output
            </h2>
            <p className="text-stone-300">
              You hold a perpetual, non-exclusive, worldwide license to download, edit, print, dispatch, and submit any legal notice, chronology, or Advocate Case Pack produced from your entered matters. The underlying multi-agent reasoning architecture remains the intellectual property of NyaySaathi.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 border-2 border-stone-700 bg-stone-950 space-y-4 font-mono text-xs">
            <h2 className="font-black text-sm uppercase tracking-wider text-white">
              05 // GOVERNING LAW &amp; EXCLUSIVE JURISDICTION
            </h2>
            <p className="text-stone-300 font-sans">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any dispute arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
            </p>
            <div className="pt-3 border-t border-stone-800 space-y-1.5 text-stone-300">
              <p className="font-bold text-white">REGISTERED OFFICE:</p>
              <p>NyaySaathi Legal Tech Initiatives</p>
              <p>#42, 4th Cross, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034, India</p>
              <p>EMAIL: <a href="mailto:legal@nyaysaathi.in" className="text-rose-400 hover:text-rose-300 underline font-bold">legal@nyaysaathi.in</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
