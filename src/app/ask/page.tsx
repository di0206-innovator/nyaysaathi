'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Loader2,
  FileText,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ArrowLeftRight,
  Sparkles,
  Upload,
  CheckCircle2,
  Hash,
  HelpCircle,
} from 'lucide-react';
import { DEMO_DOCUMENT_SETS } from '@/lib/demo/demo-documents';
import type { DocumentQAAnswer, DocumentProcessingMode } from '@/types/document-comparison';

interface QAHistoryEntry {
  question: string;
  answer: DocumentQAAnswer;
}

interface UploadedDoc {
  fileId: string;
  filename: string;
  mimeType: string;
  fileSize: string;
  contentHash: string;
  extractedText: string;
  extractionStatus: string;
}

export default function AskPage() {
  const [documentText, setDocumentText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentBText, setDocumentBText] = useState('');
  const [documentBTitle, setDocumentBTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QAHistoryEntry[]>([]);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const [processingMode, setProcessingMode] = useState<DocumentProcessingMode>('VERIFIED_DOCUMENT_MODE');
  const [contentHash, setContentHash] = useState<string | null>(null);

  // Upload state
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode: upload vs paste
  const [inputTab, setInputTab] = useState<'upload' | 'paste'>('upload');

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentTitle', file.name.replace(/\.[^/.]+$/, ''));

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'File upload failed.');
      }

      const doc: UploadedDoc = {
        fileId: json.data.fileId,
        filename: json.data.filename,
        mimeType: json.data.mimeType,
        fileSize: json.data.fileSize,
        contentHash: json.data.contentHash,
        extractedText: json.data.extractedText,
        extractionStatus: json.data.extractionStatus,
      };

      setUploadedDoc(doc);
      setDocumentText(doc.extractedText);
      setDocumentTitle(doc.filename);
      setContentHash(doc.contentHash);
      setProcessingMode('VERIFIED_DOCUMENT_MODE');
      setIsDocumentLoaded(true);
      setHistory([]);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const loadDemo = useCallback((setIndex: number) => {
    const set = DEMO_DOCUMENT_SETS[setIndex];
    if (!set) return;
    setDocumentText(set.documentA.text);
    setDocumentTitle(set.documentA.title);
    setDocumentBText(set.documentB.text);
    setDocumentBTitle(set.documentB.title);
    setProcessingMode('SYNTHETIC_DEMO_MODE');
    setContentHash(null);
    setUploadedDoc(null);
    setIsDocumentLoaded(true);
    setHistory([]);
  }, []);

  const loadCustom = useCallback(() => {
    if (!documentText.trim()) return;
    setProcessingMode('PASTED_TEXT_MODE');
    setContentHash(null);
    setUploadedDoc(null);
    setIsDocumentLoaded(true);
    setHistory([]);
  }, [documentText]);

  const askQuestion = useCallback(async () => {
    if (!question.trim() || !documentText.trim()) return;
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        question,
        documentAId: uploadedDoc?.fileId || 'doc-a',
        documentAText: documentText,
        documentATitle: documentTitle || 'Document A',
        processingMode,
      };
      if (contentHash) {
        body.contentHashA = contentHash;
      }
      if (documentBText.trim()) {
        body.documentBId = 'doc-b';
        body.documentBText = documentBText;
        body.documentBTitle = documentBTitle || 'Document B';
      }

      const res = await fetch('/api/documents/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setHistory(prev => [...prev, { question, answer: json.data }]);
        setQuestion('');
      }
    } catch {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  }, [question, documentText, documentTitle, documentBText, documentBTitle, uploadedDoc, processingMode, contentHash]);

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0A0A0A]">
      {/* Hero */}
      <section className="bg-[#0A0A0A] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 font-mono text-xs text-stone-400">
            <span className="w-2 h-2 bg-rose-600 inline-block" />
            <span className="uppercase tracking-widest">Document Q&A</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
            Ask About Your<br />
            <span className="text-rose-500">Legal Documents</span>
          </h1>
          <p className="text-sm text-stone-300 max-w-2xl font-mono uppercase leading-relaxed">
            Clause-grounded GenAI answers sourced exclusively from your verified documents. Every claim is validated against citations — never fabricated.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Document loading area */}
        {!isDocumentLoaded && (
          <>
            {/* Primary: Real Document Upload */}
            <section aria-label="Upload document" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#0A0A0A] pb-3 gap-2">
                <h2 className="text-lg font-black uppercase tracking-tight">
                  {inputTab === 'upload' ? 'Upload Document (PDF, PNG, JPG)' : 'Paste Document Text'}
                </h2>
                <button
                  onClick={() => setInputTab(inputTab === 'upload' ? 'paste' : 'upload')}
                  className="font-mono text-xs text-stone-600 hover:text-rose-600 underline uppercase tracking-wider text-left sm:text-right"
                >
                  {inputTab === 'upload' ? 'Paste text instead' : 'Upload file instead'}
                </button>
              </div>

              {inputTab === 'upload' ? (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f) handleFileUpload(f);
                    }}
                    className="border-2 border-dashed border-stone-300 hover:border-stone-900 bg-white p-8 text-center cursor-pointer transition-colors space-y-3 min-h-[180px] flex flex-col items-center justify-center"
                  >
                    <input
                      id="file-upload-ask"
                      aria-label="Upload Document for Q&A"
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f);
                      }}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                        <span className="font-mono text-xs text-stone-600 uppercase">Extracting Document & Verifying Hash...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-stone-400" />
                        <div className="font-mono text-sm font-bold uppercase text-stone-800">
                          Drop your PDF or image here, or browse
                        </div>
                        <p className="font-mono text-xs text-stone-500 uppercase">
                          Supports PDF, PNG, JPG, WebP (Max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-mono flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label htmlFor="ask-doc-title" className="font-mono text-xs font-bold uppercase text-stone-700">Document Title</label>
                    <input
                      id="ask-doc-title"
                      type="text"
                      placeholder="e.g., Rental Agreement..."
                      value={documentTitle}
                      onChange={e => setDocumentTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 text-sm font-mono bg-white focus:outline-none focus:border-rose-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="ask-doc-text" className="font-mono text-xs font-bold uppercase text-stone-700">Document Text</label>
                    <textarea
                      id="ask-doc-text"
                      placeholder="Paste your document text here..."
                      value={documentText}
                      onChange={e => setDocumentText(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-stone-300 text-xs font-mono bg-white focus:outline-none focus:border-rose-600 resize-y"
                    />
                  </div>
                  <button
                    onClick={loadCustom}
                    disabled={!documentText.trim()}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Start Asking Questions</span>
                  </button>
                </div>
              )}
            </section>

            {/* Sample Documents */}
            <section aria-label="Load demo documents" className="space-y-3 pt-4 border-t border-stone-200">
              <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#0A0A0A] pb-2">
                Or Try Sample Documents
              </h2>
              <div className="flex flex-wrap gap-2">
                {DEMO_DOCUMENT_SETS.map((set, si) => (
                  <button
                    key={set.id}
                    onClick={() => loadDemo(si)}
                    className="px-4 py-2 border border-stone-300 bg-white hover:border-rose-600 font-mono text-xs uppercase transition-colors flex items-center space-x-1.5 min-tap-target"
                  >
                    <Sparkles className="w-3 h-3 text-rose-600" />
                    <span>{set.label} (Both Versions)</span>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] text-stone-400 uppercase">
                Synthetic demo documents. No real person or legal matter.
              </p>
            </section>
          </>
        )}

        {/* Document loaded — Q&A interface */}
        {isDocumentLoaded && (
          <div className="space-y-6">
            {/* Loaded document indicator & trust badge */}
            <div className="p-4 border border-stone-200 bg-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3 font-mono text-xs">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span className="font-bold uppercase">{documentTitle || 'Document A'}</span>
                  {documentBText && (
                    <>
                      <span className="text-stone-300">+</span>
                      <span className="font-bold uppercase">{documentBTitle || 'Document B'}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 border text-[10px] uppercase font-mono font-bold ${
                    processingMode === 'VERIFIED_DOCUMENT_MODE'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : processingMode === 'SYNTHETIC_DEMO_MODE'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-stone-50 border-stone-300 text-stone-700'
                  }`}>
                    {processingMode}
                  </span>
                  <button
                    onClick={() => { setIsDocumentLoaded(false); setHistory([]); setUploadedDoc(null); }}
                    className="px-3 py-1 border border-stone-300 font-mono text-[10px] uppercase hover:bg-stone-50 transition-colors"
                  >
                    Change Document
                  </button>
                </div>
              </div>
              {contentHash && (
                <div className="font-mono text-[10px] text-stone-500 flex items-center space-x-1">
                  <Hash className="w-3 h-3 text-stone-400" />
                  <span>SHA-256 Digest: {contentHash}</span>
                </div>
              )}
            </div>

            {/* Q&A History */}
            {history.length > 0 && (
              <div className="space-y-6" role="log" aria-label="Question and answer history">
                {history.map((entry, i) => (
                  <div key={i} className="space-y-3 border border-stone-200 bg-white p-5">
                    {/* Question */}
                    <div className="flex items-start space-x-3 border-b border-stone-100 pb-3">
                      <div className="w-6 h-6 bg-stone-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                        Q
                      </div>
                      <p className="text-base font-bold pt-0.5">{entry.question}</p>
                    </div>

                    {/* Answer Card */}
                    <div className="space-y-4">
                      {/* Trust & Retrieval metadata header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                        <span className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase border ${
                          entry.answer.isGrounded
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          {entry.answer.isGrounded ? 'Grounded in Document Evidence' : 'Unverified Query'}
                        </span>
                        <div className="font-mono text-[10px] text-stone-500 uppercase flex items-center space-x-2">
                          <span>Mode: {entry.answer.retrievalMode || 'semantic_rag'}</span>
                          {entry.answer.counselRequired && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200">
                              Counsel Required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Prose */}
                      <div className="text-sm whitespace-pre-line leading-relaxed text-stone-800">
                        {entry.answer.answer}
                      </div>

                      {/* Verifiable Claims */}
                      {entry.answer.claims && entry.answer.claims.length > 0 && (
                        <div className="border border-stone-200 bg-stone-50 p-3 space-y-2">
                          <div className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            Verifiable Claims & Citations
                          </div>
                          {entry.answer.claims.map((claim, ci) => (
                            <div key={ci} className="bg-white p-2.5 border border-stone-200 text-xs space-y-1">
                              <div className="flex items-start space-x-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                <span className="font-medium text-stone-800">{claim.text}</span>
                              </div>
                              {claim.sourceRefs.length > 0 && (
                                <div className="font-mono text-[10px] text-stone-500 pl-5">
                                  Cited: {claim.sourceRefs.join(' | ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Document Source Citations */}
                      {entry.answer.sourceRefs.length > 0 && (
                        <div className="pt-2 border-t border-stone-200 space-y-1.5">
                          <div className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            Document Evidence
                          </div>
                          {entry.answer.sourceRefs.map((ref, ri) => (
                            <div key={ri} className="font-mono text-[11px] text-stone-600 bg-stone-50 p-2 border border-stone-200">
                              <span className="font-bold text-stone-800">{ref.documentTitle}</span>
                              {ref.pageNumber ? ` → Page ${ref.pageNumber}` : ''}
                              {ref.snippet ? ` — "${ref.snippet}"` : ''}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Why it Matters */}
                      {entry.answer.whyThisMatters && (
                        <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 p-3 space-y-1">
                          <strong className="font-mono text-[10px] uppercase tracking-wider block">Why this matters:</strong>
                          <p>{entry.answer.whyThisMatters}</p>
                        </div>
                      )}

                      {/* Uncertainty Flags */}
                      {entry.answer.uncertainty && entry.answer.uncertainty.length > 0 && (
                        <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 p-3 space-y-1">
                          <strong className="font-mono text-[10px] uppercase tracking-wider block flex items-center space-x-1">
                            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                            <span>Uncertainties to Verify:</span>
                          </strong>
                          <ul className="list-disc list-inside space-y-0.5">
                            {entry.answer.uncertainty.map((u, ui) => (
                              <li key={ui}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!entry.answer.isGrounded && entry.answer.cannotVerifyDisclaimer && (
                        <div className="text-xs text-stone-500 italic border-t border-stone-200 pt-2 flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{entry.answer.cannotVerifyDisclaimer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question input */}
            <div className="border border-stone-300 bg-white p-4 space-y-3">
              <label htmlFor="qa-input" className="font-mono text-xs font-bold uppercase text-stone-700 block">
                Ask a Grounded Question
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  id="qa-input"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') askQuestion(); }}
                  placeholder="e.g., What is the lock-in period? What are tenant maintenance obligations?"
                  className="flex-1 px-3 py-3 border border-stone-300 text-sm bg-white focus:outline-none focus:border-rose-600"
                  aria-label="Type your question about the loaded documents"
                />
                <button
                  onClick={askQuestion}
                  disabled={loading || !question.trim()}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase disabled:opacity-50 transition-colors min-tap-target flex items-center space-x-2"
                  aria-label="Submit question"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Ask</span>
                </button>
              </div>
              <p className="font-mono text-[10px] text-stone-400 uppercase">
                Answers will cite specific clauses from the uploaded document. If an answer cannot be verified from the document, it will explicitly decline to fabricate facts.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-200">
              <Link
                href="/compare"
                className="px-6 py-3 bg-[#0A0A0A] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Compare With Another Version</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/understand"
                className="px-6 py-3 border border-stone-300 hover:border-stone-900 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Full Document Overview</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
