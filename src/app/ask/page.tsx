'use client';

import React, { useState, useCallback } from 'react';
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
} from 'lucide-react';
import { DEMO_DOCUMENT_SETS } from '@/lib/demo/demo-documents';
import type { DocumentQAAnswer } from '@/types/document-comparison';

interface QAHistoryEntry {
  question: string;
  answer: DocumentQAAnswer;
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

  const loadDemo = useCallback((setIndex: number) => {
    const set = DEMO_DOCUMENT_SETS[setIndex];
    if (!set) return;
    setDocumentText(set.documentA.text);
    setDocumentTitle(set.documentA.title);
    setDocumentBText(set.documentB.text);
    setDocumentBTitle(set.documentB.title);
    setIsDocumentLoaded(true);
    setHistory([]);
  }, []);

  const loadCustom = useCallback(() => {
    if (!documentText.trim()) return;
    setIsDocumentLoaded(true);
    setHistory([]);
  }, [documentText]);

  const askQuestion = useCallback(async () => {
    if (!question.trim() || !documentText.trim()) return;
    setLoading(true);

    try {
      const body: Record<string, string> = {
        question,
        documentAId: 'doc-a',
        documentAText: documentText,
        documentATitle: documentTitle || 'Document A',
      };
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
      // Silent
    } finally {
      setLoading(false);
    }
  }, [question, documentText, documentTitle, documentBText, documentBTitle]);

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
            Ask questions grounded in your uploaded documents. Every answer is sourced from the document text — never fabricated.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Document loading area */}
        {!isDocumentLoaded && (
          <>
            <section aria-label="Load demo documents" className="space-y-3">
              <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#0A0A0A] pb-2">
                Load Sample Documents
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

            <section aria-label="Paste document text" className="space-y-3">
              <h2 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#0A0A0A] pb-2">
                Or Paste Your Document
              </h2>
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
                  placeholder="Paste your document here..."
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
            </section>
          </>
        )}

        {/* Document loaded — Q&A interface */}
        {isDocumentLoaded && (
          <div className="space-y-6">
            {/* Loaded document indicator */}
            <div className="flex items-center justify-between p-3 border border-stone-200 bg-white">
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
              <button
                onClick={() => { setIsDocumentLoaded(false); setHistory([]); }}
                className="px-3 py-1 border border-stone-300 font-mono text-[10px] uppercase hover:bg-stone-50 transition-colors"
              >
                Change Documents
              </button>
            </div>

            {/* Q&A History */}
            {history.length > 0 && (
              <div className="space-y-4" role="log" aria-label="Question and answer history">
                {history.map((entry, i) => (
                  <div key={i} className="space-y-2">
                    {/* Question */}
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="font-mono text-[9px] font-bold text-stone-500">Q</span>
                      </div>
                      <p className="text-sm font-medium pt-0.5">{entry.question}</p>
                    </div>
                    {/* Answer */}
                    <div className="ml-9 p-4 bg-stone-50 border border-stone-200 space-y-3">
                      <div className="text-sm whitespace-pre-line leading-relaxed">{entry.answer.answer}</div>
                      {entry.answer.sourceRefs.length > 0 && (
                        <div className="border-t border-stone-200 pt-2 space-y-1">
                          <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Sources</div>
                          {entry.answer.sourceRefs.map((ref, ri) => (
                            <div key={ri} className="font-mono text-[10px] text-stone-600">
                              {ref.documentTitle}
                              {ref.pageNumber ? ` → Page ${ref.pageNumber}` : ''}
                              {ref.snippet ? ` — "${ref.snippet.slice(0, 60)}..."` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                      {entry.answer.whyThisMatters && (
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2">
                          <strong>Why this matters:</strong> {entry.answer.whyThisMatters}
                        </div>
                      )}
                      {!entry.answer.isGrounded && entry.answer.cannotVerifyDisclaimer && (
                        <div className="text-xs text-stone-500 italic border-t border-stone-200 pt-2">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {entry.answer.cannotVerifyDisclaimer}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="qa-input"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') askQuestion(); }}
                placeholder="Ask a question about your documents..."
                className="flex-1 px-3 py-3 border border-stone-300 text-sm bg-white focus:outline-none focus:border-rose-600"
                aria-label="Type your question about the loaded documents"
              />
              <button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase disabled:opacity-50 transition-colors min-tap-target"
                aria-label="Submit question"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Suggested questions */}
            {history.length === 0 && (
              <div className="space-y-2">
                <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider">Try asking:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What is the notice period?',
                    'What is the security deposit amount?',
                    'Can the landlord increase the deposit?',
                    'Did the notice period change?',
                    'What are the maintenance responsibilities?',
                  ].map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuestion(sq); }}
                      className="px-3 py-1.5 border border-stone-200 bg-white hover:border-rose-600 text-xs text-stone-600 transition-colors min-tap-target"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation CTAs */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-200">
              <Link
                href="/compare"
                className="px-5 py-2.5 bg-[#0A0A0A] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Compare Documents</span>
              </Link>
              <Link
                href="/understand"
                className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Understand a Document</span>
              </Link>
              <Link
                href="/matters/new"
                className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2"
              >
                <span>Save to Matter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
