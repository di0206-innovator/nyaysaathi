'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Home, ArrowRight, Scale, Users, Key } from 'lucide-react';

export default function PilotOnboardingPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [acquisitionSource, setAcquisitionSource] = useState('direct');
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStart(category: string) {
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
    <div className="min-h-screen bg-stone-50/70 text-stone-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-200">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-amber-700" />
            <span>NyaySaathi Real-World Pilot Cohort</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Pilot Onboarding &amp; Dispute Intake
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Welcome to the evaluated beta of NyaySaathi. Your participation helps establish empirical legal precision across Indian consumer and tenancy disputes.
          </p>
        </div>

        {/* Pilot Verification Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-600" />
              <span>1. Pilot Access &amp; Referral Code (Optional)</span>
            </h2>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Enter your cohort invite code or advocate referral key:
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="E.g., BLR-TENANT-2026 or DLSA-PILOT"
                className="w-full sm:w-80 p-2.5 border border-stone-300 rounded-xl text-sm font-mono uppercase bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>2. Acquisition Source Attribution</span>
            </h2>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                How did you discover or get referred to this pilot?
              </label>
              <select
                value={acquisitionSource}
                onChange={(e) => setAcquisitionSource(e.target.value)}
                className="w-full sm:w-80 p-2.5 border border-stone-300 rounded-xl text-sm bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="direct">Direct search / word of mouth</option>
                <option value="referral">Friend or colleague referral</option>
                <option value="housing_community">Tenant / Apartment Residents Association</option>
                <option value="college">University / Student Union</option>
                <option value="legal_clinic">University Legal Aid Clinic</option>
                <option value="ngo">Civil Society Organization / NGO</option>
                <option value="employer">Employer / Workplace Assistance</option>
                <option value="consumer_org">Consumer Rights Group</option>
                <option value="partner">Partner Advocate</option>
                <option value="other">Other channel</option>
              </select>
            </div>
          </div>

          {/* Informed Consent */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>3. Informed Pilot Consent &amp; Privacy Safeguards</span>
            </h2>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2 leading-relaxed">
              <p>
                • <strong>Evidence-Grounded Navigator:</strong> NyaySaathi is a legal action navigator and document dossier builder, not an advocate offering legal representation.
              </p>
              <p>
                • <strong>Data Security &amp; Isolation:</strong> Uploaded agreements and chats are stored with tenant-isolated database policies and never used for public model training.
              </p>
              <p>
                • <strong>Human-in-the-Loop:</strong> You retain complete discretion over all communications and formal speed-post notices dispatched.
              </p>
            </div>

            <div className="flex items-start space-x-2.5 pt-2">
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="consent" className="text-xs text-stone-700 cursor-pointer select-none">
                I understand the pilot scope, confirm my facts are truthful, and consent to contributing anonymized precision calibration telemetry.
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Action Launch Buttons */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Select Your Dispute Category to Begin:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleStart('tenancy_housing')}
                className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 hover:border-amber-600 text-left transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                      <Home className="w-4 h-4 text-amber-700" />
                      <span>Tenant Security Deposit Recovery</span>
                    </span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-600 text-white">
                      Primary Wedge
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Withheld deposits, arbitrary painting deductions, and move-out disputes in Bengaluru, NCR, Mumbai, etc.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-amber-800">
                  <span>Start Tenancy Matter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleStart('consumer_dispute')}
                className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 hover:border-stone-400 text-left transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-900">Consumer &amp; Warranty Dispute</span>
                  <p className="text-[11px] text-stone-600">
                    Defective products, service deficiency, denied warranty repair, and e-Daakhil filing.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-stone-700">
                  <span>Start Consumer Matter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
