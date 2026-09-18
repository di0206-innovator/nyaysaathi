'use client';

import React, { useState } from 'react';
import { DocumentEvidence } from '@/types/matter';
import {
  FolderLock,
  FileText,
  FileCheck,
  Plus,
  Quote
} from 'lucide-react';

interface EvidenceUploaderProps {
  documents: DocumentEvidence[];
  onUploadSimulate?: (newDoc: { title: string; type: DocumentEvidence['type']; extractedText?: string; file?: File }) => Promise<void>;
}

export function EvidenceUploader({ documents, onUploadSimulate }: EvidenceUploaderProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<DocumentEvidence['type']>('other');
  const [newSnippet, setNewSnippet] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle && !selectedFile) return;

    setIsSubmitting(true);
    try {
      if (onUploadSimulate) {
        await onUploadSimulate({
          title: newTitle || selectedFile?.name || 'Uploaded Document',
          type: newType,
          extractedText: newSnippet,
          file: selectedFile || undefined
        });
      }
      setShowAddModal(false);
      setNewTitle('');
      setNewSnippet('');
      setSelectedFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
              <FolderLock className="w-5 h-5 text-amber-700" />
              <span>Evidence Locker & Document Intelligence</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Securely stored contracts, transaction receipts, and digital chats with extracted evidentiary value.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Upload Evidence</span>
          </button>
        </div>

        {/* Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-stone-50/70 border border-stone-200 rounded-xl p-4 space-y-3 hover:border-amber-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{doc.title}</h4>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {doc.classification || 'Documentary Proof'} • {doc.fileSize || '1.2 MB'}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center space-x-1 shrink-0">
                  <FileCheck className="w-3 h-3" />
                  <span>OCR Verified</span>
                </span>
              </div>

              {doc.relevanceSummary && (
                <p className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200/80 leading-relaxed">
                  <strong className="text-stone-900">Legal Relevance: </strong>
                  {doc.relevanceSummary}
                </p>
              )}

              {doc.keyQuotes && doc.keyQuotes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center space-x-1">
                    <Quote className="w-3 h-3 text-amber-700" />
                    <span>Extracted Key Clauses</span>
                  </div>
                  {doc.keyQuotes.map((q, idx) => (
                    <blockquote
                      key={idx}
                      className="text-xs italic text-stone-700 pl-3 border-l-2 border-amber-500 bg-amber-50/40 py-1"
                    >
                      &ldquo;{q}&rdquo;
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Evidence Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Add Supporting Material / Evidence</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricity bill, WhatsApp chat with broker, Move-out photos"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Document Category
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as DocumentEvidence['type'])}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="rental_agreement">Rental / Lease Agreement</option>
                  <option value="invoice_bill">Invoice / Purchase Bill / Receipt</option>
                  <option value="whatsapp_chat">WhatsApp / SMS Chat Transcript</option>
                  <option value="email_thread">Email Communication Thread</option>
                  <option value="bank_statement">Bank / UPI Transfer Statement</option>
                  <option value="police_complaint_fir">Police Complaint / e-FIR Copy</option>
                  <option value="photo_proof">Timestamped Photo / Video Proof</option>
                  <option value="other">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Upload Document File (PDF, Image, Text up to 10MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setSelectedFile(f);
                    if (f && !newTitle) {
                      setNewTitle(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Or Paste Text / Key Excerpt (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste relevant text, chat messages, or payment transaction numbers here..."
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing OCR...' : 'Add to Evidence Locker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
