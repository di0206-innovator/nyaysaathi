'use client';

import React from 'react';
import { LawyerBrief } from '@/types/matter';
import {
  Printer,
  CheckCircle2,
  AlertCircle,
  Scale,
  Calendar,
  IndianRupee,
  FileCheck
} from 'lucide-react';

interface LawyerBriefCardProps {
  brief?: LawyerBrief;
}

export function LawyerBriefCard({ brief }: LawyerBriefCardProps) {
  if (!brief) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500 text-sm">
        No Lawyer Brief generated for this matter yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  Advocate Briefing Document
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
                One-Page Case Summary & Legal Brief
              </h2>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print for Advocate / DLSA</span>
          </button>
        </div>

        {/* Executive Summary */}
        <div className="py-5 border-b border-stone-100 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            1. Executive Case Summary
          </h4>
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-lg border border-stone-200">
            {brief.executiveSummary}
          </p>
        </div>

        {/* 2-Column Grid: Issues & Relief */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5 border-b border-stone-100">
          {/* Legal Issues */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-amber-700" />
              <span>2. Core Legal Issues & Statutory Grounds</span>
            </h4>
            <ul className="text-xs text-stone-800 space-y-1.5 list-disc list-inside bg-stone-50/60 p-3.5 rounded-lg border border-stone-200">
              {brief.legalIssuesIdentified.map((issue, idx) => (
                <li key={idx} className="leading-relaxed">{issue}</li>
              ))}
            </ul>

            {brief.statutoryReferences && brief.statutoryReferences.length > 0 && (
              <div className="pt-2 space-y-1">
                <span className="text-[11px] font-bold text-stone-600 uppercase">Applicable Statutes:</span>
                {brief.statutoryReferences.map((stat, idx) => (
                  <div key={idx} className="text-xs bg-amber-50 p-2 rounded border border-amber-200 text-amber-950 font-medium">
                    {stat.statute} {stat.section ? `(${stat.section})` : ''} — {stat.applicability}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Relief Sought */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>3. Prayers / Relief Sought</span>
            </h4>
            <ul className="text-xs text-stone-800 space-y-1.5 list-disc list-inside bg-stone-50/60 p-3.5 rounded-lg border border-stone-200">
              {brief.reliefSought.map((relief, idx) => (
                <li key={idx} className="leading-relaxed">{relief}</li>
              ))}
            </ul>

            {brief.estimatedClaimAmount && (
              <div className="text-xs bg-emerald-50 p-2.5 rounded border border-emerald-200 text-emerald-950 font-semibold mt-2">
                Estimated Claim Quantum: {brief.estimatedClaimAmount}
              </div>
            )}
          </div>
        </div>

        {/* Chronology & Evidentiary Readiness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5 border-b border-stone-100">
          {/* Chronology */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-stone-500" />
              <span>4. Condensed Chronology</span>
            </h4>
            <div className="space-y-1.5 text-xs text-stone-800">
              {brief.keyChronology.map((c, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-stone-50 p-2 rounded border border-stone-200">
                  <span className="font-bold text-stone-900 shrink-0 text-[11px]">{c.date}:</span>
                  <span className="text-stone-700 text-[11px] leading-snug">{c.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Readiness */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-blue-700" />
              <span>5. Evidentiary Readiness</span>
            </h4>
            <div className="space-y-2">
              <div className="bg-emerald-50/60 p-3 rounded border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Strong Documentary Proof:</span>
                </span>
                <ul className="text-xs text-emerald-950 space-y-0.5 list-disc list-inside">
                  {brief.evidentiaryReadiness.strongProof.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              {brief.evidentiaryReadiness.gapsOrMissingProof.length > 0 && (
                <div className="bg-rose-50/60 p-3 rounded border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold text-rose-900 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                    <span>Evidence Gaps to Discuss with Counsel:</span>
                  </span>
                  <ul className="text-xs text-rose-950 space-y-0.5 list-disc list-inside">
                    {brief.evidentiaryReadiness.gapsOrMissingProof.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info for advocate */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500">
          <span>Jurisdiction: {brief.jurisdictionState || 'India'}</span>
          <span>Prepared via NyaySaathi on {brief.generatedAt}</span>
        </div>
      </div>
    </div>
  );
}
