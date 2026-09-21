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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">Privacy Policy</h1>
              <p className="text-xs text-stone-700 mt-0.5">
                Effective Date: {lastUpdated} | Governing Law: Republic of India
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 mb-8 text-stone-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700" />
            Summary: Legal Dispute Data is Strictly Confidential
          </h2>
          <p className="text-xs text-stone-800 leading-relaxed">
            NyaySaathi is built specifically for legal action navigation in India. We treat all dispute narratives, rental agreements, payment receipts, and communications as confidential evidentiary materials. We{' '}
            <strong className="text-stone-950">never sell, rent, or monetize your legal dispute records</strong>. We process your data under the provisions of the{' '}
            <strong className="text-stone-950">Digital Personal Data Protection Act, 2023 (DPDPA 2023)</strong> and the{' '}
            <strong className="text-stone-950">Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
          </p>
        </div>

        <div className="space-y-8 text-stone-800 text-xs sm:text-sm leading-relaxed bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm">
          {/* Section 1 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">1</span>
              Personal Data We Collect
            </h2>
            <p className="mb-2">
              To organize matters and prepare structured pre-litigation documents, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
              <li>
                <strong className="text-stone-900">Identity &amp; Contact Information:</strong> Name, phone number, email address, city, and state of jurisdiction.
              </li>
              <li>
                <strong className="text-stone-900">Dispute Narratives &amp; Facts:</strong> Chronological timelines, dispute descriptions, financial claims (e.g., rental security deposit amount, notice periods), and adverse party details.
              </li>
              <li>
                <strong className="text-stone-900">Evidentiary Attachments:</strong> Rental/lease agreements, bank transfer transaction receipts, chat transcripts, and formal written notices uploaded to establish provenance.
              </li>
              <li>
                <strong className="text-stone-900">Technical &amp; Telemetry Data:</strong> IP addresses, browser types, and operational error logs strictly used for security audit logging and rate limiting.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">2</span>
              Purpose of Data Processing
            </h2>
            <p className="mb-2">We process personal data solely for explicit, lawful purposes under Section 4 of the DPDPA 2023:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
              <li>Extracting verified chronological facts and calculating limitation periods under the Limitation Act 1963.</li>
              <li>Generating pre-litigation demand notices and formal correspondence compliant with Indian statutory frameworks.</li>
              <li>Synthesizing structured Advocate Case Packs to assist you during professional legal consultations.</li>
              <li>Preventing automated denial-of-service, abuse, and fraudulent pilot activity via security rate limiters.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">3</span>
              Security &amp; Redaction Architecture
            </h2>
            <p className="text-stone-700 leading-relaxed mb-2">
              We implement industry-grade technical and organizational safeguards in accordance with Section 8(5) of the DPDPA:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
              <li>All communications are encrypted in transit via TLS 1.3 and enforced with HTTP Strict Transport Security (HSTS).</li>
              <li>Authentication tokens are strictly issued via <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">HttpOnly, Secure, SameSite=Lax</code> cookies, isolated from browser JavaScript.</li>
              <li>Telemetry and audit logs automatically sanitize sensitive government IDs (Aadhaar, PAN), credentials, and raw dispute texts.</li>
              <li>Strict tenant boundary isolation guarantees that no user can access or view another party&apos;s matter.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">4</span>
              Your Rights as a Data Principal
            </h2>
            <p className="mb-2 text-stone-700">
              Under Chapter III of the DPDPA 2023, you hold enforceable statutory rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 border border-stone-200 rounded-lg bg-stone-50">
                <h3 className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                  Right to Access &amp; Summary
                </h3>
                <p className="text-xs text-stone-700">
                  Request a complete export of all personal data, matter timelines, and uploaded documents associated with your identity.
                </p>
              </div>
              <div className="p-3 border border-stone-200 rounded-lg bg-stone-50">
                <h3 className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  Right to Correction &amp; Erasure
                </h3>
                <p className="text-xs text-stone-700">
                  Request the immediate rectification of inaccurate data or complete deletion of an active or resolved dispute file.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="cookies">
            <h2 className="text-base font-bold text-stone-900 mb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-700 text-xs flex items-center justify-center font-bold">5</span>
              Cookies and Local Storage
            </h2>
            <p className="text-stone-700 leading-relaxed mb-2">
              NyaySaathi uses only two categories of cookies:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
              <li>
                <strong className="text-stone-900">Essential Security Cookies:</strong> Secure session cookies (`sb-access-token`) necessary to authenticate your legal workspace and prevent cross-site request forgery.
              </li>
              <li>
                <strong className="text-stone-900">Preference Storage:</strong> Local storage flags to remember whether you have dismissed informational banners or accepted cookie terms.
              </li>
            </ul>
            <p className="text-stone-700 mt-2">
              We do not use third-party behavioral advertising trackers, cross-site trackers, or commercial data brokers.
            </p>
          </section>

          {/* Section 6: Grievance Officer */}
          <section className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <h2 className="text-base font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700" />
              Grievance Redressal &amp; Data Protection Officer
            </h2>
            <p className="text-stone-700 mb-3 text-xs leading-relaxed">
              In accordance with Section 12 of the Digital Personal Data Protection Act, 2023 and Rule 3(2) of the Information Technology Rules, 2021, the designated Grievance Officer details are:
            </p>
            <div className="bg-white border border-stone-200 rounded-lg p-3 space-y-1 text-xs text-stone-800">
              <p><strong className="text-stone-950">Designation:</strong> Data Protection &amp; Grievance Redressal Officer</p>
              <p><strong className="text-stone-950">Organization:</strong> NyaySaathi Legal Tech Initiatives</p>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500 mt-0.5 flex-shrink-0" />
                <span>#42, 4th Cross, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034, India</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                <span>Email: <a href="mailto:grievance@nyaysaathi.in" className="text-amber-700 hover:underline font-medium">grievance@nyaysaathi.in</a> / <a href="mailto:privacy@nyaysaathi.in" className="text-amber-700 hover:underline font-medium">privacy@nyaysaathi.in</a></span>
              </p>
            </div>
            <p className="text-[11px] text-stone-700 mt-2">
              The Grievance Officer shall acknowledge all complaints within 24 hours and resolve them within statutory timelines.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
