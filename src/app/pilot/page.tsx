'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Scale, Users, Key } from 'lucide-react';

export default function PilotOnboardingPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [acquisitionSource, setAcquisitionSource] = useState('direct');
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  function handleStart(category: string) {
    if (honeypot) {
      console.warn('Spam submission dropped.');
      router.push('/');
      return;
    }

    if (!consentGiven) {
      setError('Please review and confirm pilot program participation consent.');
      return;
    }
    setError(null);

    // Persist acquisition source in sessionStorage for matter creation attribution
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nyaysaathi_acquisition_source', acquisitionSource);
      sessionStorage.setItem('nyaysaathi_invite_code', inviteCode);
    }

    router.push(`/matters/new?category=${category}&source=${encodeURIComponent(acquisitionSource)}`);
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header - Swiss Masthead */}
        <div className="border-b-2 border-[#0A0A0A] pb-6 space-y-2">
          <div className="flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-widest text-rose-600">
            <Scale className="w-4 h-4 text-rose-600" />
            <span>§ 00 // REAL-WORLD PILOT COHORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#0A0A0A]">
            Pilot Onboarding &amp; Intake
          </h1>
          <p className="font-mono text-xs text-stone-600 uppercase max-w-xl leading-relaxed">
            Evaluated Beta Program. Participation contributes empirical precision calibration to Indian tenancy and consumer dispute dossiers.
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white border-2 border-[#0A0A0A] p-6 sm:p-8 space-y-6">
          {/* Section 1 */}
          <div className="space-y-3 font-mono text-xs">
            <h2 className="font-bold text-[#0A0A0A] uppercase tracking-wider flex items-center space-x-2">
              <Key className="w-4 h-4 text-rose-600" />
              <span>01 // Pilot Cohort Access Code (Optional)</span>
            </h2>
            <div>
              <label className="block text-stone-600 mb-1 uppercase">
                COHORT INVITE KEY OR ADVOCATE REFERRAL:
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="E.G. BLR-TENANT-2026 OR DLSA-PILOT"
                className="w-full sm:w-80 p-2.5 border border-stone-300 bg-[#FBFBF9] font-mono text-xs uppercase focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-4 border-t border-stone-200 font-mono text-xs">
            <h2 className="font-bold text-[#0A0A0A] uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-rose-600" />
              <span>02 // Attribution Channel</span>
            </h2>
            <div>
              <label className="block text-stone-600 mb-1 uppercase">
                HOW DID YOU DISCOVER OR GET REFERRED TO THIS PILOT?
              </label>
              <select
                value={acquisitionSource}
                onChange={(e) => setAcquisitionSource(e.target.value)}
                className="w-full sm:w-80 p-2.5 border border-stone-300 bg-[#FBFBF9] font-mono text-xs uppercase focus:ring-2 focus:ring-black focus:outline-none"
              >
                <option value="direct">DIRECT SEARCH / WORD OF MOUTH</option>
                <option value="referral">FRIEND OR COLLEAGUE REFERRAL</option>
                <option value="housing_community">TENANT / APARTMENT RESIDENTS ASSOCIATION</option>
                <option value="college">UNIVERSITY / STUDENT UNION</option>
                <option value="legal_clinic">LEGAL AID CLINIC</option>
                <option value="ngo">CIVIL SOCIETY ORGANIZATION / NGO</option>
                <option value="employer">EMPLOYER / WORKPLACE ASSISTANCE</option>
                <option value="consumer_org">CONSUMER RIGHTS GROUP</option>
                <option value="partner">PARTNER ADVOCATE</option>
                <option value="other">OTHER CHANNEL</option>
              </select>
            </div>
          </div>

          {/* Section 3: Informed Consent */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <h2 className="font-mono text-xs font-bold text-[#0A0A0A] uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>03 // Informed Consent &amp; Privacy Safeguards</span>
            </h2>
            <div className="p-4 bg-[#FBFBF9] border border-stone-300 text-xs text-stone-700 space-y-1.5 font-sans leading-relaxed">
              <p>
                • <strong>Evidence-Grounded Navigator:</strong> NyaySaathi is a pre-litigation dossier builder, not an advocate practicing law under the Advocates Act 1961.
              </p>
              <p>
                • <strong>Tenant Data Security:</strong> Uploaded agreements and receipts are strictly isolated and never utilized for public AI model training.
              </p>
              <p>
                • <strong>Human Discretion:</strong> You retain complete personal control over all formal Speed Post legal notices dispatched.
              </p>
            </div>

            <div className="flex items-start space-x-2.5 pt-2">
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 accent-rose-600"
              />
              <label htmlFor="consent" className="text-xs text-stone-900 cursor-pointer select-none font-medium font-sans">
                I understand the pilot scope, confirm my entered dispute facts are truthful, and consent to contributing anonymized accuracy calibration telemetry.
              </label>
            </div>
          </div>

          {/* Hidden Anti-Spam Honeypot Field */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="pilot_referral_hp">Leave this empty</label>
            <input
              id="pilot_referral_hp"
              type="text"
              name="pilot_referral_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="p-3 bg-rose-50 border border-rose-300 text-rose-700 font-mono text-xs font-bold uppercase">
              [ALERT: {error}]
            </div>
          )}

          {/* Action Launch Buttons */}
          <div className="pt-4 border-t border-stone-200 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              SELECT DISPUTE CLASSIFICATION TO INITIALIZE:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleStart('tenancy_housing')}
                className="p-4 bg-white border-2 border-rose-600 text-left transition-all hover:bg-rose-50 flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">[PRIMARY WEDGE]</span>
                  <h4 className="font-bold text-sm text-[#0A0A0A] uppercase mt-1">Tenant Security Deposit Recovery</h4>
                  <p className="text-xs text-stone-600 font-sans mt-1">
                    Recover withheld rental deposit, contest illegal painting deductions.
                  </p>
                </div>
                <span className="font-bold text-xs text-rose-600 mt-3 flex items-center gap-1 uppercase">
                  <span>Start Recovery Matter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStart('consumer_dispute')}
                className="p-4 bg-white border border-[#0A0A0A] text-left transition-all hover:border-rose-600 hover:bg-stone-50 flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">[CONSUMER CODE]</span>
                  <h4 className="font-bold text-sm text-[#0A0A0A] uppercase mt-1">Consumer &amp; Warranty Dispute</h4>
                  <p className="text-xs text-stone-600 font-sans mt-1">
                    Defective merchandise, e-commerce dispute, e-Daakhil filing.
                  </p>
                </div>
                <span className="font-bold text-xs text-[#0A0A0A] group-hover:text-rose-600 mt-3 flex items-center gap-1 uppercase">
                  <span>Start Consumer Intake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
