'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeftRight,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  PenLine,
  Filter,
  MessageSquare,
  Scale,
  BookOpen,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { DEMO_DOCUMENT_SETS } from '@/lib/demo/demo-documents';
import type {
  DocumentComparison,
  ClauseComparison,
  ClauseCategory,
  ClauseChangeStatus,
  DocumentQAAnswer,
} from '@/types/document-comparison';

// ---------------------------------------------------------------------------
// Status badge colors
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<ClauseChangeStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  modified: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', icon: <PenLine className="w-3.5 h-3.5" /> },
  added: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', icon: <Plus className="w-3.5 h-3.5" /> },
  removed: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300', icon: <Minus className="w-3.5 h-3.5" /> },
  unchanged: { bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

function CategoryLabel({ category }: { category: ClauseCategory }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-700">
      {category.replace(/_/g, ' ')}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Compare Page
// ---------------------------------------------------------------------------

export default function ComparePage() {
  const [comparison, setComparison] = useState<DocumentComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClauseChangeStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ClauseCategory | 'all'>('all');
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [titleA, setTitleA] = useState('');
  const [titleB, setTitleB] = useState('');

  // Q&A state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState<DocumentQAAnswer | null>(null);
  const [qaLoading, setQaLoading] = useState(false);

  const runDemoComparison = useCallback(async (demoId: string) => {
    setLoading(true);
    setError(null);
    setSelectedDemoId(demoId);
    setComparison(null);
    setExpandedClauseId(null);
    setQaAnswer(null);

    try {
      const res = await fetch('/api/documents/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentAId: `${demoId}-v1`,
          documentBId: `${demoId}-v2`,
          demoSetId: demoId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setComparison(json.data);
      } else {
        setError(json.error?.message || 'Comparison failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const runCustomComparison = useCallback(async () => {
    if (!textA.trim() || !textB.trim()) {
      setError('Please paste text for both documents.');
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedDemoId(null);
    setComparison(null);
    setExpandedClauseId(null);
    setQaAnswer(null);

    try {
      const res = await fetch('/api/documents/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentAId: 'custom-a',
          documentBId: 'custom-b',
          documentAText: textA,
          documentBText: textB,
          documentATitle: titleA || 'Document A',
          documentBTitle: titleB || 'Document B',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setComparison(json.data);
      } else {
        setError(json.error?.message || 'Comparison failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [textA, textB, titleA, titleB]);

  const askQuestion = useCallback(async () => {
    if (!qaQuestion.trim() || !comparison) return;
    setQaLoading(true);
    setQaAnswer(null);

    const demoSet = selectedDemoId ? DEMO_DOCUMENT_SETS.find(s => s.id === selectedDemoId) : null;

    try {
      const res = await fetch('/api/documents/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qaQuestion,
          documentAId: comparison.documentAId,
          documentAText: demoSet ? demoSet.documentA.text : textA,
          documentATitle: comparison.documentATitle,
          documentBId: comparison.documentBId,
          documentBText: demoSet ? demoSet.documentB.text : textB,
          documentBTitle: comparison.documentBTitle,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setQaAnswer(json.data);
      }
    } catch {
      // Silent fail
    } finally {
      setQaLoading(false);
    }
  }, [qaQuestion, comparison, selectedDemoId, textA, textB]);

  // Filtered clauses
  const filteredClauses = comparison?.clauses.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    return true;
  }) ?? [];

  // Unique categories from comparison
  const availableCategories = comparison
    ? Array.from(new Set(comparison.clauses.map(c => c.category)))
    : [];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A]">
      {/* Hero */}
      <section className="bg-[#0A0A0A] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 font-mono text-xs text-stone-400">
            <span className="w-2 h-2 bg-rose-600 inline-block" />
            <span className="uppercase tracking-widest">Document Comparison Studio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
            Compare Two Legal<br />
            <span className="text-rose-500">Documents Side by Side</span>
          </h1>
          <p className="text-sm text-stone-300 max-w-2xl font-mono uppercase leading-relaxed">
            Upload two versions of a legal document or try a sample comparison. NyaySaathi identifies every clause change, explains what it means in plain language, and flags what you should verify.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Demo Document Sets */}
        {!comparison && (
          <>
            <section aria-label="Sample comparisons" className="space-y-4">
              <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#0A0A0A] pb-2">
                Try a Sample Comparison
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DEMO_DOCUMENT_SETS.map(set => (
                  <button
                    key={set.id}
                    onClick={() => runDemoComparison(set.id)}
                    disabled={loading}
                    className="text-left p-5 border border-[#0A0A0A] bg-white hover:border-rose-600 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        <span className="font-mono text-xs font-bold text-rose-600 uppercase tracking-wider">
                          {set.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-colors" />
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{set.description}</p>
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center space-x-3 font-mono text-[10px] text-stone-500 uppercase">
                      <span><FileText className="w-3 h-3 inline mr-1" />{set.documentA.title}</span>
                      <ArrowLeftRight className="w-3 h-3 text-stone-300" />
                      <span><FileText className="w-3 h-3 inline mr-1" />{set.documentB.title}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-stone-400 uppercase">
                Synthetic demo documents. No real person or legal matter.
              </p>
            </section>

            {/* Custom Document Input */}
            <section aria-label="Custom document comparison" className="space-y-4">
              <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#0A0A0A] pb-2">
                Or Compare Your Own Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title-a" className="font-mono text-xs font-bold uppercase text-stone-700">Document A (Old Version)</label>
                  <input
                    id="title-a"
                    type="text"
                    placeholder="Document title..."
                    value={titleA}
                    onChange={e => setTitleA(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm font-mono bg-white focus:outline-none focus:border-rose-600"
                  />
                  <textarea
                    id="text-a"
                    aria-label="Document A text"
                    placeholder="Paste the text of the old/original document..."
                    value={textA}
                    onChange={e => setTextA(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-stone-300 text-xs font-mono bg-white focus:outline-none focus:border-rose-600 resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="title-b" className="font-mono text-xs font-bold uppercase text-stone-700">Document B (New Version)</label>
                  <input
                    id="title-b"
                    type="text"
                    placeholder="Document title..."
                    value={titleB}
                    onChange={e => setTitleB(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm font-mono bg-white focus:outline-none focus:border-rose-600"
                  />
                  <textarea
                    id="text-b"
                    aria-label="Document B text"
                    placeholder="Paste the text of the new/revised document..."
                    value={textB}
                    onChange={e => setTextB(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-stone-300 text-xs font-mono bg-white focus:outline-none focus:border-rose-600 resize-y"
                  />
                </div>
              </div>
              <button
                onClick={runCustomComparison}
                disabled={loading || !textA.trim() || !textB.trim()}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                <span>Compare Documents</span>
              </button>
            </section>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
              <p className="font-mono text-xs text-stone-500 uppercase">Analyzing clauses...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 border border-rose-300 bg-rose-50 text-rose-800 text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            {error}
          </div>
        )}

        {/* Comparison Results */}
        {comparison && !loading && (
          <div className="space-y-8">
            {/* Demo disclaimer */}
            {comparison.isDemo && comparison.demoDisclaimer && (
              <div className="p-3 border border-amber-300 bg-amber-50 font-mono text-xs text-amber-800 uppercase tracking-wider">
                ⚠ {comparison.demoDisclaimer}
              </div>
            )}

            {/* Summary Header */}
            <section aria-label="Comparison summary" className="border border-[#0A0A0A] bg-white">
              <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-black text-lg uppercase tracking-tight">Comparison Summary</h2>
                  <div className="flex items-center space-x-2 mt-1 font-mono text-xs text-stone-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{comparison.documentATitle}</span>
                    <ArrowLeftRight className="w-3 h-3 text-stone-300" />
                    <span>{comparison.documentBTitle}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setComparison(null); setQaAnswer(null); setStatusFilter('all'); setCategoryFilter('all'); }}
                  className="px-4 py-2 border border-stone-300 font-mono text-xs uppercase hover:bg-stone-50 transition-colors"
                >
                  New Comparison
                </button>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-stone-200">
                <div className="p-4 text-center">
                  <div className="text-2xl font-black">{comparison.summary.totalClauses}</div>
                  <div className="font-mono text-[10px] text-stone-500 uppercase">Total Clauses</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-2xl font-black text-amber-600">{comparison.summary.modified}</div>
                  <div className="font-mono text-[10px] text-amber-700 uppercase">Modified</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-2xl font-black text-emerald-600">{comparison.summary.added}</div>
                  <div className="font-mono text-[10px] text-emerald-700 uppercase">Added</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-2xl font-black text-rose-600">{comparison.summary.removed}</div>
                  <div className="font-mono text-[10px] text-rose-700 uppercase">Removed</div>
                </div>
                <div className="p-4 text-center col-span-2 sm:col-span-1">
                  <div className="text-2xl font-black text-stone-400">{comparison.summary.unchanged}</div>
                  <div className="font-mono text-[10px] text-stone-500 uppercase">Unchanged</div>
                </div>
              </div>
            </section>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Clause filters">
              <Filter className="w-4 h-4 text-stone-400" />

              {/* Status filter */}
              {(['all', 'modified', 'added', 'removed', 'unchanged'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  aria-pressed={statusFilter === s}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors min-tap-target ${
                    statusFilter === s
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-stone-900'
                  }`}
                >
                  {s === 'all' ? `All (${comparison.clauses.length})` : `${s} (${comparison.summary[s === 'modified' ? 'modified' : s === 'added' ? 'added' : s === 'removed' ? 'removed' : 'unchanged']})`}
                </button>
              ))}

              {/* Category filter */}
              {availableCategories.length > 1 && (
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as ClauseCategory | 'all')}
                  aria-label="Filter by clause category"
                  className="px-2 py-1.5 font-mono text-[10px] uppercase border border-stone-300 bg-white text-stone-600 min-tap-target"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Clause List */}
            <section aria-label="Clause comparisons" className="space-y-3">
              {filteredClauses.map(clause => (
                <ClauseCard
                  key={clause.id}
                  clause={clause}
                  documentATitle={comparison.documentATitle}
                  documentBTitle={comparison.documentBTitle}
                  isExpanded={expandedClauseId === clause.id}
                  onToggle={() => setExpandedClauseId(expandedClauseId === clause.id ? null : clause.id)}
                />
              ))}
              {filteredClauses.length === 0 && (
                <p className="text-center py-8 font-mono text-xs text-stone-400 uppercase">No clauses match the selected filters.</p>
              )}
            </section>

            {/* Unresolved Questions */}
            {comparison.unresolvedQuestions.length > 0 && (
              <section aria-label="Unresolved questions" className="border border-amber-300 bg-amber-50 p-5 space-y-2">
                <h3 className="font-black text-sm uppercase text-amber-800 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>What to Verify</span>
                </h3>
                <ul className="space-y-1">
                  {comparison.unresolvedQuestions.map((q, i) => (
                    <li key={i} className="text-xs text-amber-800 flex items-start space-x-2">
                      <span className="font-mono text-amber-500 mt-0.5">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Document-Grounded Q&A */}
            <section aria-label="Ask about documents" className="border border-[#0A0A0A] bg-white p-5 space-y-4">
              <h3 className="font-black text-sm uppercase tracking-tight flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <span>Ask About These Documents</span>
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  id="qa-question"
                  value={qaQuestion}
                  onChange={e => setQaQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') askQuestion(); }}
                  placeholder="e.g., Did the notice period change? Can the landlord increase the deposit?"
                  className="flex-1 px-3 py-2.5 border border-stone-300 text-sm bg-white focus:outline-none focus:border-rose-600"
                  aria-label="Ask a question about the compared documents"
                />
                <button
                  onClick={askQuestion}
                  disabled={qaLoading || !qaQuestion.trim()}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase disabled:opacity-50 transition-colors min-tap-target"
                  aria-label="Submit question"
                >
                  {qaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              {qaAnswer && (
                <div className="p-4 bg-stone-50 border border-stone-200 space-y-3">
                  <div className="text-sm whitespace-pre-line leading-relaxed">{qaAnswer.answer}</div>
                  {qaAnswer.sourceRefs.length > 0 && (
                    <div className="border-t border-stone-200 pt-2 space-y-1">
                      <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Sources</div>
                      {qaAnswer.sourceRefs.map((ref, i) => (
                        <div key={i} className="font-mono text-[10px] text-stone-600">
                          {ref.documentTitle}{ref.pageNumber ? ` → Page ${ref.pageNumber}` : ''}
                          {ref.snippet ? ` — "${ref.snippet.slice(0, 60)}..."` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                  {qaAnswer.whyThisMatters && (
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2">
                      <strong>Why this matters:</strong> {qaAnswer.whyThisMatters}
                    </div>
                  )}
                  {qaAnswer.cannotVerifyDisclaimer && (
                    <div className="text-xs text-stone-500 italic">{qaAnswer.cannotVerifyDisclaimer}</div>
                  )}
                </div>
              )}
            </section>

            {/* Navigate Next Steps CTA */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/matters/new"
                className="px-6 py-3 bg-[#0A0A0A] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <Scale className="w-4 h-4" />
                <span>Save to Matter & Navigate Next Steps</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/understand"
                className="px-6 py-3 border border-stone-300 hover:border-stone-900 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Understand a Single Document</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Clause Card Component
// ---------------------------------------------------------------------------

function ClauseCard({
  clause,
  documentATitle,
  documentBTitle,
  isExpanded,
  onToggle,
}: {
  clause: ClauseComparison;
  documentATitle: string;
  documentBTitle: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const style = STATUS_STYLES[clause.status];

  return (
    <div className={`border ${style.border} ${style.bg} transition-all`} role="region" aria-label={`${clause.oldClause?.heading || clause.newClause?.heading || clause.category} clause comparison`}>
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center justify-between gap-3 min-tap-target"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <span className={`flex items-center space-x-1 px-2 py-1 font-mono text-[10px] font-bold uppercase border ${style.border} ${style.bg} ${style.text}`}>
            {style.icon}
            <span>{clause.status}</span>
          </span>
          <CategoryLabel category={clause.category} />
          <span className="text-sm font-bold truncate">
            {clause.oldClause?.heading || clause.newClause?.heading || clause.category.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          {clause.requiresCounselReview && (
            <span className="px-1.5 py-0.5 bg-rose-100 border border-rose-300 text-rose-700 font-mono text-[9px] uppercase">
              Counsel Review
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Summary row — always visible for non-unchanged */}
      {clause.status !== 'unchanged' && (
        <div className="px-4 pb-3 text-xs text-stone-700 leading-relaxed">
          {clause.changeSummary}
        </div>
      )}

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-stone-200 p-4 space-y-4 bg-white">
          {/* Side-by-side */}
          {(clause.oldClause || clause.newClause) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clause.oldClause && (
                <div className="p-3 border border-stone-200 bg-stone-50 space-y-1">
                  <div className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider">{documentATitle}</div>
                  <p className="text-xs text-stone-800 leading-relaxed">{clause.oldClause.text}</p>
                  {clause.oldClause.pageNumber && (
                    <div className="font-mono text-[9px] text-stone-400">Page {clause.oldClause.pageNumber}{clause.oldClause.clauseNumber ? `, Clause ${clause.oldClause.clauseNumber}` : ''}</div>
                  )}
                </div>
              )}
              {clause.newClause && (
                <div className="p-3 border border-stone-200 bg-stone-50 space-y-1">
                  <div className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider">{documentBTitle}</div>
                  <p className="text-xs text-stone-800 leading-relaxed">{clause.newClause.text}</p>
                  {clause.newClause.pageNumber && (
                    <div className="font-mono text-[9px] text-stone-400">Page {clause.newClause.pageNumber}{clause.newClause.clauseNumber ? `, Clause ${clause.newClause.clauseNumber}` : ''}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Structured Explanation */}
          <div className="space-y-3 text-xs">
            <div className="p-3 border-l-2 border-stone-900 bg-stone-50">
              <div className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Fact — What the Documents Say</div>
              <p className="text-stone-800">{clause.changeSummary}</p>
            </div>

            <div className="p-3 border-l-2 border-sky-600 bg-sky-50">
              <div className="font-mono text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">Plain Language</div>
              <p className="text-stone-800">{clause.plainLanguageExplanation}</p>
            </div>

            {clause.whyItMayMatter && (
              <div className="p-3 border-l-2 border-amber-500 bg-amber-50">
                <div className="font-mono text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Why It May Matter</div>
                <p className="text-stone-800">{clause.whyItMayMatter}</p>
              </div>
            )}

            {clause.legalContext && (
              <div className="p-3 border-l-2 border-emerald-600 bg-emerald-50">
                <div className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Legal Context</div>
                <p className="text-stone-800">
                  {clause.legalContext.actName}
                  {clause.legalContext.section ? ` ${clause.legalContext.section}` : ''}
                </p>
                <span className={`inline-block mt-1 px-1.5 py-0.5 font-mono text-[9px] uppercase border ${
                  clause.legalContext.bindingNature === 'statutory' ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                    : 'border-stone-300 bg-stone-100 text-stone-600'
                }`}>
                  {clause.legalContext.bindingNature}
                </span>
              </div>
            )}

            {clause.requiresCounselReview && (
              <div className="p-3 border-l-2 border-rose-600 bg-rose-50">
                <div className="font-mono text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">Counsel Required</div>
                <p className="text-rose-800">This clause involves significant legal implications. Professional legal review is recommended before accepting or signing.</p>
              </div>
            )}

            {/* Source References */}
            {clause.sourceRefs.length > 0 && (
              <div className="pt-2 border-t border-stone-200">
                <div className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Source</div>
                {clause.sourceRefs.map((ref, i) => (
                  <div key={i} className="font-mono text-[9px] text-stone-500">
                    {ref.documentTitle}
                    {ref.pageNumber ? ` → Page ${ref.pageNumber}` : ''}
                    {ref.clauseNumber ? ` → Clause ${ref.clauseNumber}` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
