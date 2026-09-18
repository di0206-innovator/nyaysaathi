'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Scale,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';
import { Matter, GroundingStatus } from '@/types/matter';

interface TrustDashboardProps {
  matter: Matter;
  onUploadClick?: () => void;
}

export function TrustDashboard({ matter, onUploadClick }: TrustDashboardProps) {
  const [showRewrites, setShowRewrites] = useState(false);

  // 1. Calculate Grounding Metrics across all elements
  let groundedCount = 0;
  let partiallyGroundedCount = 0;
  let unsupportedCount = 0;

  const checkStatus = (status?: GroundingStatus) => {
    if (status === 'grounded') groundedCount++;
    else if (status === 'partially_grounded') partiallyGroundedCount++;
    else unsupportedCount++;
  };

  matter.timelineEvents.forEach(t => checkStatus(t.groundingStatus));
  matter.risks.forEach(r => checkStatus(r.groundingStatus));
  matter.actionPlan.forEach(a => checkStatus(a.groundingStatus));
  matter.drafts.forEach(d => checkStatus(d.groundingStatus));
  if (matter.lawyerBrief) checkStatus(matter.lawyerBrief.groundingStatus);

  const totalEvaluated = groundedCount + partiallyGroundedCount + unsupportedCount;
  const groundedPercentage = totalEvaluated > 0 ? Math.round((groundedCount / totalEvaluated) * 100) : 100;

  // 2. Audit Rewrites Count
  const draftAudits = matter.drafts.flatMap(d => d.auditLog || []);
  const safetyAudits = matter.auditLog || [];
  const totalRewrites = draftAudits.length + safetyAudits.filter(a => a.rewritten !== a.original).length;

  // 3. Active Sources Used
  const docSources = matter.documents.map(d => ({
    type: 'Document Evidence',
    name: d.title,
    detail: `${d.type.replace(/_/g, ' ')} (${d.status})`
  }));

  const statutorySources = matter.lawyerBrief?.statutoryReferences.map(s => ({
    type: 'Indian Statute',
    name: `${s.statute} ${s.section ? `(${s.section})` : ''}`,
    detail: s.applicability
  })) || [];

  // 4. Missing Evidence Checklist
  const missingInfo = matter.missingInformation.filter(m => !m.isAnswered);

  // 5. Advocate Consultation Flags
  const requiresAdvocate = matter.drafts.some(d => d.requiresAdvocateReview) ||
    matter.category === 'police_criminal_grievance' ||
    (matter.claimAmount && matter.claimAmount > 5000000);

  return (
    <div className="space-y-6">
      {/* 1. Top Executive Trust Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Grounding Score */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Grounding Score</span>
            <div className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-stone-900">{groundedPercentage}%</span>
            <span className="text-xs text-stone-500 font-medium">grounded</span>
          </div>
          <p className="text-[11px] text-stone-600">
            {groundedCount} grounded, {partiallyGroundedCount} partial, {unsupportedCount} gaps
          </p>
        </div>

        {/* Metric 2: Neutralized Claims */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Safety Rewrites</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-stone-900">{totalRewrites}</span>
            <span className="text-xs text-stone-500 font-medium">neutralized</span>
          </div>
          <p className="text-[11px] text-stone-600">
            Aggressive claims rewritten to factual legal phrasing
          </p>
        </div>

        {/* Metric 3: Active Sources */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Grounded Sources</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-stone-900">
              {docSources.length + statutorySources.length}
            </span>
            <span className="text-xs text-stone-500 font-medium">citations</span>
          </div>
          <p className="text-[11px] text-stone-600">
            {docSources.length} documents + {statutorySources.length} statutes
          </p>
        </div>

        {/* Metric 4: Advocate Required Flag */}
        <div
          className={`p-5 rounded-2xl border shadow-sm space-y-2 ${
            requiresAdvocate
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Legal Representation</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                requiresAdvocate ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 text-stone-600'
              }`}
            >
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-bold">
              {requiresAdvocate ? 'Advocate Advised' : 'Self-Representation OK'}
            </span>
          </div>
          <p className="text-[11px] text-stone-600">
            {requiresAdvocate
              ? 'Formal notice or pecuniary jurisdiction requires advocate review'
              : 'Pre-litigation notice / e-Daakhil allows party-in-person'}
          </p>
        </div>
      </div>

      {/* 2. Statutory & Documentary Sources Used */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-stone-900">Active Sources & Grounding References</h3>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">Verified by NyaySaathi Retrieval RAG</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {statutorySources.map((s, idx) => (
            <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">{s.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">
                  Statute
                </span>
              </div>
              <p className="text-stone-600 text-[11px] line-clamp-2">{s.detail}</p>
            </div>
          ))}

          {docSources.map((d, idx) => (
            <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">{d.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-900">
                  Document
                </span>
              </div>
              <p className="text-stone-600 text-[11px]">{d.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Missing Proof & Gaps Checklist */}
      {missingInfo.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-stone-900">Evidentiary Gaps Needed to Convert Possibilities to Proof</h3>
            </div>
            <span className="text-[11px] text-amber-700 font-bold">{missingInfo.length} Pending Questions</span>
          </div>

          <div className="space-y-2.5">
            {missingInfo.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900">{m.question}</h4>
                  <p className="text-[11px] text-stone-600">
                    <strong className="font-semibold text-stone-800">Why it matters:</strong> {m.whyItMatters}
                  </p>
                  <span className="text-[10px] text-amber-900 font-medium block">
                    Suggested source: {m.suggestedSource}
                  </span>
                </div>

                {onUploadClick && (
                  <button
                    onClick={onUploadClick}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] shrink-0 shadow-2xs"
                  >
                    Upload Evidence
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Safety Audit Log Accordion */}
      {totalRewrites > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-3">
          <button
            onClick={() => setShowRewrites(!showRewrites)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-stone-900">
                Safety Audit Trail ({totalRewrites} Neutralized Expressions)
              </h3>
            </div>
            <div className="flex items-center space-x-1 text-xs text-stone-500 font-medium">
              <span>{showRewrites ? 'Hide Details' : 'View Neutralized Phrasing'}</span>
              {showRewrites ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showRewrites && (
            <div className="space-y-3 pt-3 border-t border-stone-100">
              {draftAudits.map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                    <span>DRAFT SAFETY REWRITE</span>
                    <span>{a.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-red-50 rounded border border-red-200 text-red-950 line-through">
                      <strong>Original:</strong> &quot;{a.original}&quot;
                    </div>
                    <div className="p-2 bg-green-50 rounded border border-green-200 text-green-950 font-medium">
                      <strong>Rewritten:</strong> &quot;{a.rewritten}&quot;
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 italic">
                    Reason: {a.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
