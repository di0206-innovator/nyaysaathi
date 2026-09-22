'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';
import { DEMO_DOCUMENT_SETS } from '@/lib/demo/demo-documents';
import type { DocumentUnderstanding, ExtractedClause } from '@/types/document-comparison';

export default function UnderstandPage() {
  const [understanding, setUnderstanding] = useState<DocumentUnderstanding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');

  const analyzeDocument = useCallback(async (text: string, title: string, isDemo = false) => {
    setLoading(true);
    setError(null);
    setUnderstanding(null);

    try {
      const res = await fetch('/api/documents/understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: isDemo ? `demo-${Date.now()}` : `upload-${Date.now()}`,
          documentText: text,
          documentTitle: title,
          isDemo,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setUnderstanding(json.data);
      } else {
        setError(json.error?.message || 'Analysis failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!documentText.trim()) {
      setError('Please paste document text to analyze.');
      return;
    }
    analyzeDocument(documentText, documentTitle || 'Uploaded Document');
  }, [documentText, documentTitle, analyzeDocument]);

  const loadDemo = useCallback((setIndex: number, docIndex: 0 | 1) => {
    const set = DEMO_DOCUMENT_SETS[setIndex];
    if (!set) return;
    const doc = docIndex === 0 ? set.documentA : set.documentB;
    setDocumentText(doc.text);
    setDocumentTitle(doc.title);
    analyzeDocument(doc.text, doc.title, true);
  }, [analyzeDocument]);

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A]">
      {/* Hero */}
      <section className="bg-[#0A0A0A] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 font-mono text-xs text-stone-400">
            <span className="w-2 h-2 bg-rose-600 inline-block" />
            <span className="uppercase tracking-widest">Document Understanding</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
            Understand Your<br />
            <span className="text-rose-500">Legal Document</span>
          </h1>
          <p className="text-sm text-stone-300 max-w-2xl font-mono uppercase leading-relaxed">
            Upload or paste a legal document. NyaySaathi extracts the key parties, dates, obligations, clauses, and their legal significance — with source references.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Input area — when no result */}
        {!understanding && !loading && (
          <>
            {/* Demo shortcuts */}
            <section aria-label="Sample documents" className="space-y-3">
              <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#0A0A0A] pb-2">
                Try a Sample Document
              </h2>
              <div className="flex flex-wrap gap-2">
                {DEMO_DOCUMENT_SETS.map((set, si) => (
                  <React.Fragment key={set.id}>
                    <button
                      onClick={() => loadDemo(si, 0)}
                      className="px-4 py-2 border border-stone-300 bg-white hover:border-rose-600 font-mono text-xs uppercase transition-colors flex items-center space-x-1.5 min-tap-target"
                    >
                      <Sparkles className="w-3 h-3 text-rose-600" />
                      <span>{set.documentA.title}</span>
                    </button>
                    <button
                      onClick={() => loadDemo(si, 1)}
                      className="px-4 py-2 border border-stone-300 bg-white hover:border-rose-600 font-mono text-xs uppercase transition-colors flex items-center space-x-1.5 min-tap-target"
                    >
                      <Sparkles className="w-3 h-3 text-rose-600" />
                      <span>{set.documentB.title}</span>
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <p className="font-mono text-[10px] text-stone-400 uppercase">
                Synthetic demo documents. No real person or legal matter.
              </p>
            </section>

            {/* Custom input */}
            <section aria-label="Upload document text" className="space-y-3">
              <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#0A0A0A] pb-2">
                Or Paste Your Document
              </h2>
              <div className="space-y-2">
                <label htmlFor="doc-title" className="font-mono text-xs font-bold uppercase text-stone-700">Document Title</label>
                <input
                  id="doc-title"
                  type="text"
                  placeholder="e.g., Rental Agreement, Employment Contract..."
                  value={documentTitle}
                  onChange={e => setDocumentTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 text-sm font-mono bg-white focus:outline-none focus:border-rose-600"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="doc-text" className="font-mono text-xs font-bold uppercase text-stone-700">Document Text</label>
                <textarea
                  id="doc-text"
                  placeholder="Paste the full text of your legal document here..."
                  value={documentText}
                  onChange={e => setDocumentText(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-stone-300 text-xs font-mono bg-white focus:outline-none focus:border-rose-600 resize-y"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!documentText.trim()}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Understand This Document</span>
              </button>
            </section>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
              <p className="font-mono text-xs text-stone-500 uppercase">Extracting clauses and obligations...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 border border-rose-300 bg-rose-50 text-rose-800 text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-2" />{error}
          </div>
        )}

        {/* Understanding Results */}
        {understanding && !loading && (
          <div className="space-y-8">
            {/* Demo disclaimer */}
            {understanding.isDemo && understanding.demoDisclaimer && (
              <div className="p-3 border border-amber-300 bg-amber-50 font-mono text-xs text-amber-800 uppercase tracking-wider">
                ⚠ {understanding.demoDisclaimer}
              </div>
            )}

            {/* Document Overview */}
            <section aria-label="Document overview" className="border border-[#0A0A0A] bg-white">
              <div className="p-5 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-lg uppercase tracking-tight">Document Overview</h2>
                  <span className="font-mono text-xs text-stone-500">{understanding.documentTitle}</span>
                </div>
                <button
                  onClick={() => { setUnderstanding(null); setDocumentText(''); setDocumentTitle(''); }}
                  className="px-4 py-2 border border-stone-300 font-mono text-xs uppercase hover:bg-stone-50 transition-colors"
                >
                  New Document
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
                {/* Document Type */}
                {understanding.overview.documentType && (
                  <div className="p-4 flex items-start space-x-3">
                    <FileText className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Document Type</div>
                      <div className="text-sm font-bold">{understanding.overview.documentType}</div>
                    </div>
                  </div>
                )}

                {/* Jurisdiction */}
                {understanding.overview.jurisdiction && (
                  <div className="p-4 flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Jurisdiction</div>
                      <div className="text-sm font-bold">{understanding.overview.jurisdiction}</div>
                    </div>
                  </div>
                )}

                {/* Term */}
                {understanding.overview.term && (
                  <div className="p-4 flex items-start space-x-3">
                    <Calendar className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Term</div>
                      <div className="text-sm font-bold">{understanding.overview.term}</div>
                    </div>
                  </div>
                )}

                {/* Notice Period */}
                {understanding.overview.noticePeriod && (
                  <div className="p-4 flex items-start space-x-3">
                    <Clock className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Notice Period</div>
                      <div className="text-sm font-bold">{understanding.overview.noticePeriod}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Parties */}
              {understanding.overview.parties.length > 0 && (
                <div className="border-t border-stone-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-rose-600" />
                    <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Parties</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {understanding.overview.parties.map((p, i) => (
                      <span key={i} className="px-2 py-1 border border-stone-200 bg-stone-50 text-xs">
                        <strong>{p.role}:</strong> {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Monetary Obligations */}
              {understanding.overview.monetaryObligations.length > 0 && (
                <div className="border-t border-stone-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-rose-600" />
                    <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Monetary Obligations</span>
                  </div>
                  <div className="space-y-1">
                    {understanding.overview.monetaryObligations.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b border-stone-100 pb-1">
                        <span className="text-stone-600">{m.label}</span>
                        <span className="font-bold">{m.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              {understanding.overview.dates.length > 0 && (
                <div className="border-t border-stone-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Dates</span>
                  </div>
                  <div className="space-y-1">
                    {understanding.overview.dates.map((d, i) => (
                      <div key={i} className="text-sm">
                        <strong>{d.label}:</strong> {d.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extraction confidence */}
              <div className="border-t border-stone-200 p-3 bg-stone-50 flex items-center justify-between font-mono text-[10px] text-stone-500 uppercase">
                <span>Extraction: {understanding.extractionStatus}</span>
                <span>Confidence: {Math.round(understanding.extractionConfidence * 100)}%</span>
              </div>
            </section>

            {/* Key Clauses */}
            {understanding.keyClauses.length > 0 && (
              <section aria-label="Key clauses" className="space-y-3">
                <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#0A0A0A] pb-2">
                  Key Clauses ({understanding.keyClauses.length})
                </h2>
                {understanding.keyClauses.map((clause: ExtractedClause) => (
                  <div key={clause.id} className="border border-stone-200 bg-white p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-600">
                        {clause.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-bold">{clause.heading}</span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">{clause.text}</p>
                    <div className="font-mono text-[9px] text-stone-400">
                      Source: {clause.sourceRef.documentTitle}
                      {clause.pageNumber ? ` → Page ${clause.pageNumber}` : ''}
                      {clause.clauseNumber ? ` → Clause ${clause.clauseNumber}` : ''}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Warnings */}
            {understanding.warnings.length > 0 && (
              <section aria-label="Extraction warnings" className="border border-amber-300 bg-amber-50 p-4 space-y-1">
                <h3 className="font-mono text-xs font-bold text-amber-800 uppercase flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Extraction Notes</span>
                </h3>
                {understanding.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700">• {w}</p>
                ))}
              </section>
            )}

            {/* Navigation CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/compare"
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Compare With Another Document</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/matters/new"
                className="px-6 py-3 border border-stone-300 hover:border-stone-900 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <span>Save to Matter</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
