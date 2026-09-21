import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, UserCheck, ArrowLeft, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — NyaySaathi',
  description: 'NyaySaathi Privacy Policy compliant with the Digital Personal Data Protection Act (DPDPA 2023) and Indian IT Rules 2011.',
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
                STATUTORY COMPLIANCE DIRECTIVE
              </span>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
                Privacy Policy
              </h1>
              <p className="font-mono text-xs text-stone-500 uppercase mt-0.5">
                EFFECTIVE DATE: {lastUpdated} {'//'} DPDPA 2023 {'//'} REPUBLIC OF INDIA
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-[#0A0A0A] text-white p-6 border-2 border-black space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Summary: Legal Dispute Records are Confidential Privileged Data</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            NyaySaathi treats dispute narratives, lease agreements, banking transaction receipts, and party communications as confidential evidentiary materials. We{' '}
            <strong className="text-white">never sell, commercialize, or monetize citizen dispute records</strong>. All processing is governed by the{' '}
            <strong className="text-white">Digital Personal Data Protection Act, 2023 (DPDPA 2023)</strong>.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm leading-relaxed bg-white border-2 border-[#0A0A0A] p-6 sm:p-8">
          {/* Section 1 */}
          <section className="space-y-2 border-b border-stone-200 pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <span className="font-mono text-rose-600">01. //</span>
              Personal &amp; Evidentiary Data Collected
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700 font-sans">
              <li>
                <strong>Identity &amp; Party Records:</strong> Full legal names, contact numbers, email addresses, and jurisdictional location.
              </li>
              <li>
                <strong>Factual Narratives:</strong> Incident timelines, financial quantum claims (e.g. security deposit sum, unpaid wages), and respondent identification.
              </li>
              <li>
                <strong>Evidentiary Exhibits:</strong> Lease agreements, UPI transaction proofs, invoices, and communication transcripts uploaded to establish provenance.
              </li>
              <li>
                <strong>Security Audit Telemetry:</strong> Anonymized request timestamps, IP headers for rate-limiting, and error logs with automated PII scrubbing.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2 border-b border-stone-200 pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <span className="font-mono text-rose-600">02. //</span>
              Purpose of Data Processing
            </h2>
            <p className="text-stone-700">We process data under Section 4 of the DPDPA 2023 exclusively for:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700 font-sans">
              <li>Extracting verified facts and computing limitation time-bars under the Limitation Act 1963.</li>
              <li>Drafting formal pre-litigation notices and demand letters under governing state rent and contract acts.</li>
              <li>Generating structured 10-section Advocate Case Packs for professional legal consultation.</li>
              <li>Guarding against automated abuse, denial of service, and pilot spoofing through security rate limits.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2 border-b border-stone-200 pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <span className="font-mono text-rose-600">03. //</span>
              Security &amp; Redaction Architecture
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700 font-sans">
              <li>Encrypted in transit using TLS 1.3 with enforced HTTP Strict Transport Security (HSTS).</li>
              <li>Authentication tokens are strictly issued via <code className="font-mono bg-stone-100 px-1 py-0.5 border border-stone-300 text-xs">HttpOnly, Secure, SameSite=Lax</code> session cookies.</li>
              <li>Audit logging automatically masks government IDs (Aadhaar, PAN), credentials, and raw dispute texts.</li>
              <li>Tenant boundary isolation guarantees that no user can access another party’s legal matter.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-b border-stone-200 pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-2">
              <span className="font-mono text-rose-600">04. //</span>
              Rights as a Data Principal (DPDPA 2023)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 border border-stone-300 bg-[#FBFBF9]">
                <div className="font-bold uppercase text-[#0A0A0A] mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                  Right to Access &amp; Summary
                </div>
                <p className="text-stone-600 font-sans text-xs">
                  Request a complete export of all personal data, matter timelines, and evidence exhibits.
                </p>
              </div>
              <div className="p-3 border border-stone-300 bg-[#FBFBF9]">
                <div className="font-bold uppercase text-[#0A0A0A] mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  Right to Erasure &amp; Rectification
                </div>
                <p className="text-stone-600 font-sans text-xs">
                  Request the immediate deletion or correction of any active or resolved case file.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Grievance Officer */}
          <section className="p-5 border border-[#0A0A0A] bg-[#FBFBF9] space-y-3 font-mono text-xs">
            <h2 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A] flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-600" />
              <span>Grievance Redressal &amp; Data Protection Officer</span>
            </h2>
            <div className="space-y-1 text-stone-700">
              <p><strong className="text-[#0A0A0A]">DESIGNATION:</strong> Data Protection &amp; Grievance Redressal Officer</p>
              <p><strong className="text-[#0A0A0A]">ORGANIZATION:</strong> NyaySaathi Legal Tech Initiatives</p>
              <p className="flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
                <span>#42, 4th Cross, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034, India</span>
              </p>
              <p className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>EMAIL: <a href="mailto:grievance@nyaysaathi.in" className="text-rose-600 underline font-bold">grievance@nyaysaathi.in</a></span>
              </p>
            </div>
            <p className="text-[11px] text-stone-500 font-sans">
              Statutory acknowledgement within 24 hours under Rule 3(2) of the Information Technology Rules, 2021.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
