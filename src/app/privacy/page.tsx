import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, UserCheck, ArrowLeft, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — DPDPA 2023 Statutory Compliance',
  description: 'NyaySaathi Privacy Policy compliant with the Digital Personal Data Protection Act (DPDPA 2023) and Indian IT Rules 2011.',
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400">
                STATUTORY COMPLIANCE DIRECTIVE
              </span>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
                Privacy Policy
              </h1>
              <p className="font-mono text-xs text-stone-400 uppercase mt-1">
                EFFECTIVE DATE: {lastUpdated} {'//'} DPDPA 2023 {'//'} REPUBLIC OF INDIA
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-black/90 text-white p-6 sm:p-8 border-2 border-stone-700 shadow-[0_0_30px_rgba(0,0,0,0.7)] space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Summary: Legal Dispute Records are Confidential Privileged Data</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            NyaySaathi treats dispute narratives, lease agreements, banking transaction receipts, and party communications as confidential evidentiary materials. We{' '}
            <strong className="text-white font-bold">never sell, commercialize, or monetize citizen dispute records</strong>. All processing is governed by the{' '}
            <strong className="text-rose-400 font-bold">Digital Personal Data Protection Act, 2023 (DPDPA 2023)</strong>.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm leading-relaxed bg-black/60 border-2 border-stone-800 p-6 sm:p-10 backdrop-blur-sm">
          {/* Section 1 */}
          <section className="space-y-3 border-b border-stone-800 pb-8">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="font-mono text-rose-500">01. //</span>
              Personal &amp; Evidentiary Data Collected
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-stone-300 font-sans">
              <li>
                <strong className="text-white">Identity &amp; Party Records:</strong> Full legal names, contact numbers, email addresses, and jurisdictional location.
              </li>
              <li>
                <strong className="text-white">Factual Narratives:</strong> Incident timelines, financial quantum claims (e.g. security deposit sum, unpaid wages), and respondent identification.
              </li>
              <li>
                <strong className="text-white">Evidentiary Exhibits:</strong> Lease agreements, UPI transaction proofs, invoices, and communication transcripts uploaded to establish provenance.
              </li>
              <li>
                <strong className="text-white">Security Audit Telemetry:</strong> Anonymized request timestamps, IP headers for rate-limiting, and error logs with automated PII scrubbing.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-b border-stone-800 pb-8">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="font-mono text-rose-500">02. //</span>
              Purpose of Data Processing
            </h2>
            <p className="text-stone-300">We process data under Section 4 of the DPDPA 2023 exclusively for:</p>
            <ul className="list-disc pl-5 space-y-2 text-stone-300 font-sans">
              <li>Extracting verified facts and computing limitation time-bars under the Limitation Act 1963.</li>
              <li>Drafting formal pre-litigation notices and demand letters under governing state rent and contract acts.</li>
              <li>Generating structured 10-section Advocate Case Packs for professional legal consultation.</li>
              <li>Guarding against automated abuse, denial of service, and pilot spoofing through security rate limits.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-b border-stone-800 pb-8">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="font-mono text-rose-500">03. //</span>
              Security &amp; Redaction Architecture
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-stone-300 font-sans">
              <li>Encrypted in transit using TLS 1.3 with enforced HTTP Strict Transport Security (HSTS).</li>
              <li>Authentication tokens are strictly issued via <code className="font-mono bg-stone-900 text-rose-300 px-1.5 py-0.5 border border-stone-700 text-xs">HttpOnly, Secure, SameSite=Lax</code> session cookies.</li>
              <li>Audit logging automatically masks government IDs (Aadhaar, PAN), credentials, and raw dispute texts.</li>
              <li>Tenant boundary isolation guarantees that no user can access another party’s legal matter.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 border-b border-stone-800 pb-8">
            <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span className="font-mono text-rose-500">04. //</span>
              Rights as a Data Principal (DPDPA 2023)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 border border-stone-700 bg-stone-950/80">
                <div className="font-bold uppercase text-white mb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-rose-500" />
                  Right to Access &amp; Summary
                </div>
                <p className="text-stone-400 font-sans text-xs leading-relaxed">
                  Request a complete export of all personal data, matter timelines, and evidence exhibits.
                </p>
              </div>
              <div className="p-4 border border-stone-700 bg-stone-950/80">
                <div className="font-bold uppercase text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-500" />
                  Right to Erasure &amp; Rectification
                </div>
                <p className="text-stone-400 font-sans text-xs leading-relaxed">
                  Request the immediate deletion or correction of any active or resolved case file.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Grievance Officer */}
          <section className="p-6 border-2 border-stone-700 bg-stone-950 space-y-4 font-mono text-xs">
            <h2 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-500" />
              <span>Grievance Redressal &amp; Data Protection Officer</span>
            </h2>
            <div className="space-y-1.5 text-stone-300">
              <p><strong className="text-white">DESIGNATION:</strong> Data Protection &amp; Grievance Redressal Officer</p>
              <p><strong className="text-white">ORGANIZATION:</strong> NyaySaathi Legal Tech Initiatives</p>
              <p className="text-stone-400">Digital Legal Aid &amp; Action Platform • Republic of India</p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span>EMAIL: <a href="mailto:grievance@nyaysaathi.in" className="text-rose-400 hover:text-rose-300 underline font-bold">grievance@nyaysaathi.in</a></span>
              </p>
            </div>
            <p className="text-[11px] text-stone-400 font-sans">
              Statutory acknowledgement within 24 hours under Rule 3(2) of the Information Technology Rules, 2021.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
