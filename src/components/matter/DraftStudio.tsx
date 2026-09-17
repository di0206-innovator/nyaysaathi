'use client';

import React, { useState } from 'react';
import { LegalDraft } from '@/types/matter';
import {
  FileText,
  Copy,
  Check,
  Download,
  ShieldAlert,
  Edit3
} from 'lucide-react';

interface DraftStudioProps {
  drafts: LegalDraft[];
}

export function DraftStudio({ drafts }: DraftStudioProps) {
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  const handleCopy = () => {
    const textToCopy = isEditing ? editedContent : (currentDraft?.content || '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = isEditing ? editedContent : (currentDraft?.content || '');
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentDraft?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Legal_Draft'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!currentDraft) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500 text-sm">
        No drafts generated yet. Run the AI pipeline to create notices and grievance complaints.
      </div>
    );
  }

  return (
    <div className="space-y-6" id="drafts">
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-base text-stone-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-700" />
              <span>Draft Generator & Notice Studio</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Professionally formatted Indian legal notices, consumer court plaints, and formal demand letters.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                if (!isEditing) setEditedContent(currentDraft.content);
                setIsEditing(!isEditing);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Preview Mode' : 'Edit Draft'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .TXT</span>
            </button>
          </div>
        </div>

        {/* Multi-Draft Selector Tabs if more than 1 */}
        {drafts.length > 1 && (
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-1">
            {drafts.map((d, idx) => (
              <button
                key={d.id || idx}
                onClick={() => {
                  setSelectedDraftIndex(idx);
                  setIsEditing(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDraftIndex === idx
                    ? 'bg-stone-900 text-white shadow'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>
        )}

        {/* Draft Metadata */}
        <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200 mb-4 space-y-1 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-stone-900">{currentDraft.title}</span>
            {currentDraft.statutoryReference && (
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Governing Law: {currentDraft.statutoryReference}
              </span>
            )}
          </div>
          <p className="text-stone-600">
            <strong>Recipient: </strong> {currentDraft.recipientName}
          </p>
        </div>

        {/* Draft Paper Viewer / Editor */}
        <div className="border border-stone-300 rounded-xl bg-stone-50/40 p-4 sm:p-6 shadow-inner font-mono text-xs leading-relaxed text-stone-900 overflow-x-auto">
          {isEditing ? (
            <textarea
              rows={22}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-white p-4 border border-stone-300 rounded-lg font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-stone-800">
              {currentDraft.content}
            </pre>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <p>
            <strong>Note on Dispatch: </strong> {currentDraft.disclaimer} For maximum evidentiary weight in Indian courts, formal notices should be dispatched via <strong>Registered Speed Post with Acknowledgement Due (RPAD)</strong> and tracking receipts preserved.
          </p>
        </div>
      </div>
    </div>
  );
}
