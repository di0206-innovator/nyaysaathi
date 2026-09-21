import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, AlertCircle, ArrowLeft, MapPin, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — NyaySaathi',
  description: 'Terms and Conditions governing the use of NyaySaathi Legal Action Navigator under Indian Law and the Advocates Act 1961.',
};

export default function TermsPage() {
  const lastUpdated = 'September 21, 2026';

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to NyaySaathi Home
          </Link>
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">Terms of Service</h1>
              <p className="text-xs text-stone-700 mt-0.5">
                Effective Date: {lastUpdated} | Applicable to all Users and Pilot Participants
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Statutory Notice */}
        <div className="bg-red-50/90 border-2 border-red-200 rounded-xl p-5 mb-8 text-red-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-red-900 mb-1">
                Mandatory Legal Disclaimer: Advocates Act, 1961
              </h2>
              <p className="text-xs text-red-900/90 leading-relaxed">
                NyaySaathi is an informational legal action navigation and self-help case organization platform. NyaySaathi{' '}
                <strong>is not a law firm, does not practice law, does not solicit legal work, and does not provide formal legal representation or advocate advice</strong>. Use of NyaySaathi does not establish an advocate-client relationship. All generated draft notices, timeline summaries, and case packs are for informational and preparatory purposes. Users must consult an enrolled Advocate or approach District Legal Services Authorities (DLSA) for formal legal representation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-stone-800 text-xs sm:text-sm leading-relaxed bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-stone-700">
              By accessing NyaySaathi, registering for the pilot, initiating a matter, or utilizing our legal notice workflows, you explicitly agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must discontinue using the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">2</span>
              Permitted Use &amp; User Responsibilities
            </h2>
            <p className="mb-2 text-stone-700">You agree to use NyaySaathi strictly for lawful dispute resolution and case organization. You represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
              <li>All dispute details, dates, financial amounts, and communications provided by you represent genuine factual occurrences to the best of your knowledge.</li>
              <li>You hold the legal right to upload any agreements, receipts, or attachments you submit to the system.</li>
              <li>You will not upload forged, falsified, defamatory, extortionate, or malicious documents.</li>
              <li>You will independently review all generated draft notices and factual chronologies before issuing them to an adverse party or filing them with an authority.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">3</span>
              Statutory Limitations &amp; No Outcome Guarantees
            </h2>
            <p className="text-stone-700 leading-relaxed mb-2">
              While NyaySaathi analyzes statutory timelines under the Limitation Act 1963, state rent control statutes, and consumer protection laws:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
              <li>Judicial and arbitral outcomes in India depend on discretionary judicial assessment, evidence quality, and adversary defense arguments.</li>
              <li>NyaySaathi does not guarantee recovery of any monetary sum, security deposit, compensation, or favorable order.</li>
              <li>Statutory limitation periods may vary based on local court holidays, state amendments, or unique cause-of-action triggers.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">4</span>
              Intellectual Property &amp; License to User Output
            </h2>
            <p className="text-stone-700 leading-relaxed">
              NyaySaathi grants you a perpetual, non-exclusive, worldwide license to download, edit, print, dispatch, and submit any legal notice, chronology, or Advocate Case Pack produced from your entered matters. The underlying software, multi-agent frameworks, statutory parsing logic, and user interface remain the intellectual property of NyaySaathi.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">5</span>
              Limitation of Liability
            </h2>
            <p className="text-stone-700 leading-relaxed">
              To the maximum extent permitted by applicable Indian law, NyaySaathi and its contributors shall not be liable for any indirect, incidental, consequential, or punitive damages arising from the use of, or inability to use, the platform or any document generated through it. Your sole remedy for dissatisfaction is to terminate use of the service.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">6</span>
              Governing Law &amp; Dispute Jurisdiction
            </h2>
            <p className="text-stone-700 leading-relaxed mb-3">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, proceeding, or claim arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts situated in Bengaluru, Karnataka, India.
            </p>
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-700 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-stone-900">Registered Corporate Office:</p>
                <p>NyaySaathi Legal Tech Initiatives</p>
                <p>#42, 4th Cross, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034, India</p>
                <p className="mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <a href="mailto:legal@nyaysaathi.in" className="text-amber-800 hover:underline">legal@nyaysaathi.in</a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
