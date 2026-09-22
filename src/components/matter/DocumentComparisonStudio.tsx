'use client';

import React, { useState, useMemo } from 'react';
import { Matter, DocumentEvidence } from '@/types/matter';
import { DocumentComparator, DocumentComparisonSummary, ClauseComparisonResult } from '@/lib/legal/document-comparator';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Scale,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';

interface DocumentComparisonStudioProps {
  matter: Matter;
}

export function DocumentComparisonStudio({ matter }: DocumentComparisonStudioProps) {
  const documents: DocumentEvidence[] = useMemo(() => matter.documents || [], [matter.documents]);

  const [baseDocId, setBaseDocId] = useState<string>(documents[0]?.id || 'statutory_model');
  const [targetDocId, setTargetDocId] = useState<string>(documents[1]?.id || documents[0]?.id || 'statutory_model');
  const [copied, setCopied] = useState(false);

  // Fallback synthetic benchmark if user has only 1 document
  const benchmarkDoc: DocumentEvidence = useMemo(() => ({
    id: 'statutory_model',
    title: 'Model Legal Baseline & Statutory Rights (TPA 1882 / ICA 1872)',
    type: 'other',
    extractedText: 'Security Deposit refund covenant within 15-30 days of peaceful vacation. Normal wear and tear protected under Section 108(m) of the Transfer of Property Act 1882. No arbitrary repainting or deep cleaning deductions without mutual inspection and original GST contractor bills. Forfeiture clauses without actual proved damages prohibited under Section 74 of the Indian Contract Act 1872.',
    mimeType: 'text/plain',
    sizeBytes: 512,
    uploadedAt: new Date().toISOString(),
    status: 'verified'
  }), []);

  const allAvailableDocs = useMemo(() => {
    return [...documents, benchmarkDoc];
  }, [documents, benchmarkDoc]);

  const selectedBaseDoc = useMemo(() => {
    return allAvailableDocs.find(d => d.id === baseDocId) || allAvailableDocs[0] || benchmarkDoc;
  }, [allAvailableDocs, baseDocId, benchmarkDoc]);

  const selectedTargetDoc = useMemo(() => {
    return allAvailableDocs.find(d => d.id === targetDocId) || allAvailableDocs[1] || allAvailableDocs[0] || benchmarkDoc;
  }, [allAvailableDocs, targetDocId, benchmarkDoc]);

  const comparison: DocumentComparisonSummary = useMemo(() => {
    return DocumentComparator.compare(
      matter.id,
      selectedBaseDoc,
      selectedTargetDoc,
      'agreement_vs_notice'
    );
  }, [matter.id, selectedBaseDoc, selectedTargetDoc]);

  const handleCopyDossier = () => {
    const lines = [
      `NYAYSAATHI LEGAL DOCUMENT COMPARISON DOSSIER`,
      `Matter: ${matter.title} (${matter.id})`,
      `Base Document: ${comparison.baseDocumentTitle}`,
      `Target Document: ${comparison.targetDocumentTitle}`,
      `Overall Alignment Score: ${comparison.overallAlignmentScore}/100`,
      `Conflicting Clauses: ${comparison.conflictingClausesCount} | Unilateral Variations: ${comparison.unilateralVariationsCount}`,
      `\nEXECUTIVE SUMMARY:\n${comparison.executiveSummary}\n`,
      `CLAUSE-BY-CLAUSE BREAKDOWN:`
    ];

    comparison.clauseComparisons.forEach((c, idx) => {
      lines.push(`\n[Clause ${idx + 1}] ${c.clauseTitle} (${c.comparisonStatus.toUpperCase()})`);
      lines.push(`- Base: ${c.baseClauseText}`);
      lines.push(`- Notice/Target: ${c.targetClauseText || 'N/A'}`);
      lines.push(`- Plain Language Meaning: ${c.plainLanguageExplanation}`);
      if (c.statutoryAnchor) lines.push(`- Statutory Anchor: ${c.statutoryAnchor}`);
      lines.push(`- Recommended Action: ${c.actionableGuidance}`);
    });

    lines.push(`\nSTATUTORY PROTECTIONS APPLIED:\n- ${comparison.statutoryProtectionsApplied.join('\n- ')}`);
    lines.push(`\nRECOMMENDED STRATEGY:\n${comparison.recommendedStrategy}`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6" role="region" aria-label="Document and Clause Comparison Studio">
      {/* 1. Header Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
                <GitCompare className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                Document & Clause Comparison Studio
              </h2>
            </div>
            <p className="text-xs text-stone-600 max-w-2xl">
              Cross-examine signed agreements against counterparty notices, demand letters, or statutory baselines to pinpoint unilateral variations, arbitrary deductions, and conflicting legal covenants.
            </p>
          </div>

          <button
            onClick={handleCopyDossier}
            className="flex items-center justify-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            aria-label="Copy legal comparison dossier to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Dossier Copied!' : 'Copy Comparison Dossier'}</span>
          </button>
        </div>

        {/* Document Selectors */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
          <div>
            <label htmlFor="base-doc-select" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              1. Base Agreement / Reference Standard
            </label>
            <select
              id="base-doc-select"
              value={baseDocId}
              onChange={e => setBaseDocId(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-800 focus:ring-2 focus:ring-amber-600 focus:bg-white"
            >
              {allAvailableDocs.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.id === 'statutory_model' ? 'Statutory Baseline' : 'Uploaded File'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="target-doc-select" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              2. Counterparty Notice / Disputed Demand
            </label>
            <select
              id="target-doc-select"
              value={targetDocId}
              onChange={e => setTargetDocId(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-800 focus:ring-2 focus:ring-amber-600 focus:bg-white"
            >
              {allAvailableDocs.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.id === 'statutory_model' ? 'Statutory Baseline' : 'Uploaded File'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Score & Executive Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alignment Gauge */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Contractual Alignment Score</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-extrabold ${
                comparison.overallAlignmentScore >= 80
                  ? 'text-emerald-700'
                  : comparison.overallAlignmentScore >= 50
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}>
                {comparison.overallAlignmentScore}%
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {comparison.overallAlignmentScore >= 80
                  ? 'Substantially Aligned'
                  : comparison.overallAlignmentScore >= 50
                  ? 'Moderate Divergence'
                  : 'Critical Contradictions Detected'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl">
              <div className="font-bold text-rose-800 text-sm">{comparison.conflictingClausesCount}</div>
              <div className="text-[10px] text-rose-700 font-medium">Direct Contradictions</div>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="font-bold text-amber-800 text-sm">{comparison.unilateralVariationsCount}</div>
              <div className="text-[10px] text-amber-700 font-medium">Unilateral Variations</div>
            </div>
          </div>
        </div>

        {/* Executive Summary & Strategy */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-stone-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Legal Synthesis & Finding</h3>
          </div>
          <p className="text-xs leading-relaxed text-stone-800 font-medium">
            {comparison.executiveSummary}
          </p>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-stone-900 block">Recommended Action Strategy:</span>
            <span className="text-stone-700 leading-relaxed block">{comparison.recommendedStrategy}</span>
          </div>

          {comparison.statutoryProtectionsApplied.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase mr-1">Statutory Anchors:</span>
              {comparison.statutoryProtectionsApplied.map((statute, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-semibold"
                >
                  {statute}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Clause-by-Clause Comparison Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
            <Scale className="w-4 h-4 text-stone-700" />
            <span>Clause-by-Clause Analysis ({comparison.clauseComparisons.length} Evaluated)</span>
          </h3>
          <span className="text-xs text-stone-500">Based on Indian Contract Law & Jurisprudence</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {comparison.clauseComparisons.map((c: ClauseComparisonResult, idx: number) => {
            const isConflict = c.comparisonStatus === 'conflicting';
            const isVariation = c.comparisonStatus === 'unilateral_variation';

            return (
              <div
                key={idx}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
                  isConflict
                    ? 'border-rose-300 ring-1 ring-rose-100'
                    : isVariation
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : 'border-stone-200'
                }`}
              >
                {/* Header: Title & Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-stone-900">{c.clauseTitle}</span>
                    {c.statutoryAnchor && (
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-mono">
                        {c.statutoryAnchor}
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 ${
                      isConflict
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isVariation
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isConflict ? (
                      <>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        <span>Contradiction</span>
                      </>
                    ) : isVariation ? (
                      <>
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        <span>Unilateral Variation</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <span>Aligned</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Side-by-side text comparison */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                    <div className="flex items-center space-x-1 text-[10px] font-bold uppercase text-stone-500">
                      <FileText className="w-3 h-3" />
                      <span>Original Base Covenant</span>
                    </div>
                    <p className="text-stone-800 leading-relaxed font-mono text-[11px]">
                      {c.baseClauseText}
                    </p>
                  </div>

                  <div className={`p-3 border rounded-xl space-y-1 ${
                    isConflict ? 'bg-rose-50/50 border-rose-200' : isVariation ? 'bg-amber-50/50 border-amber-200' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center space-x-1 text-[10px] font-bold uppercase text-stone-500">
                      <ArrowRight className="w-3 h-3" />
                      <span>Counterparty Notice Claim</span>
                    </div>
                    <p className="text-stone-800 leading-relaxed font-mono text-[11px]">
                      {c.targetClauseText || 'Clause omitted or no formal response documented.'}
                    </p>
                  </div>
                </div>

                {/* Plain-Language Explanation & Actionable Guidance */}
                <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block">Plain-Language Meaning</span>
                    <p className="text-stone-700 leading-relaxed">
                      {c.plainLanguageExplanation}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-stone-500 block">What You Should Do</span>
                    <p className="text-stone-900 font-medium leading-relaxed">
                      {c.actionableGuidance}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
