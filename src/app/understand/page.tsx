'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Users,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowLeftRight,
  Sparkles,
  Upload,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { DEMO_DOCUMENT_SETS } from '@/lib/demo/demo-documents';
import type { DocumentUnderstanding, ExtractedClause, DocumentProcessingMode } from '@/types/document-comparison';

export default function UnderstandPage() {
  const [understanding, setUnderstanding] = useState<DocumentUnderstanding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [uploading, setUploading] = useState(false);
  const [fileMeta, setFileMeta] = useState<{
    filename: string;
    sizeBytes: number;
    hash?: string;
    status?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeDocument = useCallback(async (
    text: string,
    title: string,
    isDemo = false,
    extra?: {
      processingMode?: DocumentProcessingMode;
      contentHash?: string;
      extractionStatus?: 'complete' | 'partial' | 'needs_review' | 'needs_ocr';
      documentId?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    setUnderstanding(null);

    try {
      const res = await fetch('/api/documents/understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: extra?.documentId || (isDemo ? `demo-${Date.now()}` : `upload-${Date.now()}`),
          documentText: text,
          documentTitle: title,
          isDemo,
          processingMode: extra?.processingMode || (isDemo ? 'SYNTHETIC_DEMO_MODE' : 'PASTED_TEXT_MODE'),
          contentHash: extra?.contentHash,
          extractionStatus: extra?.extractionStatus
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

  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setUnderstanding(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        const data = json.data;
        setFileMeta({
          filename: data.filename,
          sizeBytes: data.fileSizeBytes,
          hash: data.contentHash,
          status: data.extractionStatus
        });
        setDocumentTitle(data.documentTitle);
        setDocumentText(data.extractedText);

        await analyzeDocument(data.extractedText, data.documentTitle, false, {
          processingMode: 'VERIFIED_DOCUMENT_MODE',
          contentHash: data.contentHash,
          extractionStatus: data.extractionStatus,
          documentId: data.documentId
        });
      } else {
        setError(json.error?.message || 'File upload failed.');
      }
    } catch {
      setError('File processing error. Ensure the file is a valid PDF or image (PNG/JPEG/WebP).');
    } finally {
      setUploading(false);
    }
  }, [analyzeDocument]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = useCallback(() => {
    if (!documentText.trim()) {
      setError('Please provide document text or upload a document to analyze.');
      return;
    }
    analyzeDocument(documentText, documentTitle || 'Uploaded Document', false, {
      processingMode: fileMeta ? 'VERIFIED_DOCUMENT_MODE' : 'PASTED_TEXT_MODE',
      contentHash: fileMeta?.hash,
      extractionStatus: fileMeta?.status as DocumentUnderstanding['extractionStatus']
    });
  }, [documentText, documentTitle, fileMeta, analyzeDocument]);

  const loadDemo = useCallback((setIndex: number, docIndex: 0 | 1) => {
    const set = DEMO_DOCUMENT_SETS[setIndex];
    if (!set) return;
    const doc = docIndex === 0 ? set.documentA : set.documentB;
    setDocumentText(doc.text);
    setDocumentTitle(doc.title);
    setFileMeta(null);
    analyzeDocument(doc.text, doc.title, true, {
      processingMode: 'SYNTHETIC_DEMO_MODE'
    });
  }, [analyzeDocument]);

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A] overflow-x-hidden w-full">
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
            Upload an authentic PDF or image, or inspect a sample contract. NyaySaathi extracts parties, dates, obligations, clauses, and their legal significance — with exact source references.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Input area — when no result */}
        {!understanding && !loading && !uploading && (
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

            {/* Ingestion Mode Selector */}
            <section aria-label="Document intake" className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-colors ${
                    inputMode === 'upload'
                      ? 'bg-[#0A0A0A] text-white'
                      : 'bg-white border border-stone-300 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                  Upload Document (PDF / Image)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-colors ${
                    inputMode === 'paste'
                      ? 'bg-[#0A0A0A] text-white'
                      : 'bg-white border border-stone-300 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                  Paste Text Instead
                </button>
              </div>

              {/* Upload Zone */}
              {inputMode === 'upload' && (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-stone-400 hover:border-rose-600 bg-white p-8 text-center transition-colors cursor-pointer space-y-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    aria-label="Upload legal document file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={onFileInputChange}
                  />
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-sm font-bold uppercase tracking-tight">
                      Drop your legal document here or click to browse
                    </p>
                    <p className="font-mono text-xs text-stone-500">
                      Supports PDF, PNG, JPEG, WebP (up to 10MB) — verified with magic bytes & SHA-256 hash.
                    </p>
                  </div>
                </div>
              )}

              {/* Paste Zone */}
              {inputMode === 'paste' && (
                <div className="space-y-3">
                  <div className="space-y-1">
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
                  <div className="space-y-1">
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
                </div>
              )}
            </section>
          </>
        )}

        {/* Loading or Uploading */}
        {(loading || uploading) && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
              <p className="font-mono text-xs text-stone-500 uppercase">
                {uploading ? 'Validating file signatures & extracting text...' : 'Extracting clauses and obligations...'}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 border border-rose-300 bg-rose-50 text-rose-800 text-sm font-mono">
            <AlertTriangle className="w-4 h-4 inline mr-2 text-rose-600" />{error}
          </div>
        )}

        {/* Understanding Results */}
        {understanding && !loading && (
          <div className="space-y-8">
            {/* Mode & Trust Banners */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider border ${
                understanding.processingMode === 'VERIFIED_DOCUMENT_MODE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : understanding.processingMode === 'SYNTHETIC_DEMO_MODE'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-stone-100 text-stone-700 border-stone-300'
              }`}>
                <ShieldCheck className="w-3 h-3 inline mr-1" />
                {understanding.processingMode.replace(/_/g, ' ')}
              </span>

              {understanding.contentHash && (
                <span className="px-2.5 py-1 font-mono text-[10px] text-stone-500 bg-white border border-stone-200">
                  SHA-256: {understanding.contentHash.slice(0, 16)}...
                </span>
              )}

              <span className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider border ${
                understanding.extractionStatus === 'complete'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                Extraction: {understanding.extractionStatus.toUpperCase()}
              </span>
            </div>

            {/* Incomplete extraction notice */}
            {understanding.extractionStatus !== 'complete' && (
              <div className="p-4 border border-amber-300 bg-amber-50 text-amber-900 text-xs font-mono space-y-1">
                <p className="font-bold uppercase flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
                  Extraction Status: {understanding.extractionStatus.replace(/_/g, ' ').toUpperCase()}
                </p>
                <p>
                  Some clauses or obligations could not be extracted with full certainty. Unverified facts have not been synthesized into facts.
                </p>
              </div>
            )}

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
                  onClick={() => { setUnderstanding(null); setDocumentText(''); setDocumentTitle(''); setFileMeta(null); }}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {understanding.overview.parties.map((p, pi) => (
                      <div key={pi} className="p-2.5 bg-stone-50 border border-stone-200">
                        <span className="font-mono text-[10px] text-rose-600 font-bold uppercase mr-2">{p.role}:</span>
                        <span className="text-xs font-bold">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Dates */}
              {understanding.overview.dates.length > 0 && (
                <div className="border-t border-stone-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Key Dates</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {understanding.overview.dates.map((d, di) => (
                      <div key={di} className="px-3 py-1.5 bg-stone-50 border border-stone-200 text-xs">
                        <span className="font-mono text-[10px] text-stone-500 mr-2">{d.label}:</span>
                        <span className="font-bold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monetary Obligations */}
              {understanding.overview.monetaryObligations.length > 0 && (
                <div className="border-t border-stone-200 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileCheck className="w-4 h-4 text-rose-600" />
                    <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Monetary Obligations</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {understanding.overview.monetaryObligations.map((m, mi) => (
                      <div key={mi} className="p-3 bg-stone-50 border border-stone-200">
                        <div className="font-mono text-[10px] text-stone-500 uppercase">{m.label}</div>
                        <div className="text-base font-black text-stone-900 mt-0.5">{m.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Key Clauses */}
            <section aria-label="Key clauses" className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-2">
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Key Clauses ({understanding.keyClauses.length})
                </h2>
                <span className="font-mono text-xs text-stone-500">Classified by clause category</span>
              </div>

              <div className="space-y-3">
                {understanding.keyClauses.map((clause: ExtractedClause) => (
                  <div key={clause.id} className="border border-stone-300 bg-white p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold uppercase">{clause.heading}</span>
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-600">
                          {clause.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {clause.clauseNumber && (
                        <span className="font-mono text-[10px] text-stone-400">§ {clause.clauseNumber}</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed font-mono bg-stone-50 p-2.5 border border-stone-100">
                      {clause.text}
                    </p>
                    {clause.sourceRef && (
                      <div className="flex items-center space-x-2 font-mono text-[10px] text-stone-400">
                        <span>Source: {clause.sourceRef.documentTitle}</span>
                        {clause.sourceRef.pageNumber && <span>• Page {clause.sourceRef.pageNumber}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Action Cards */}
            <section aria-label="Next steps" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <Link
                href="/compare"
                className="p-5 border border-[#0A0A0A] bg-white hover:border-rose-600 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1.5 font-mono text-xs text-rose-600 font-bold uppercase mb-1">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Compare Versions</span>
                  </div>
                  <p className="text-xs text-stone-600">Upload a second version to detect changes and unilateral shifts.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-colors shrink-0 ml-3" />
              </Link>

              <Link
                href="/ask"
                className="p-5 border border-[#0A0A0A] bg-white hover:border-rose-600 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1.5 font-mono text-xs text-rose-600 font-bold uppercase mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ask Questions</span>
                  </div>
                  <p className="text-xs text-stone-600">Ask questions about this document with strict evidence grounding.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-colors shrink-0 ml-3" />
              </Link>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
