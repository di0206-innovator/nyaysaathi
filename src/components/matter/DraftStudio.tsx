'use client';

import React, { useState } from 'react';
import { LegalDraft } from '@/types/matter';
import {
  FileText,
  Copy,
  Check,
  Download,
  ShieldAlert,
  Edit3,
  Sparkles,
  Send,
  Scale,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

interface DraftStudioProps {
  drafts: LegalDraft[];
}

export function DraftStudio({ drafts }: DraftStudioProps) {
  // Find initial tier: default to soft or formal, falling back to 0
  const [selectedTier, setSelectedTier] = useState<'soft' | 'formal' | 'lawyer_ready' | 'all'>('soft');
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const tierFilteredDrafts = selectedTier === 'all'
    ? drafts
    : drafts.filter(d => (d.communicationTier || 'formal') === selectedTier);

  // Active draft fallback
  const activeDraft = (selectedDraftId ? drafts.find(d => d.id === selectedDraftId) : null)
    || tierFilteredDrafts[0]
    || drafts[0];

  const handleCopy = () => {
    const textToCopy = isEditing ? editedContent : (activeDraft?.content || '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = isEditing ? editedContent : (activeDraft?.content || '');
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeDraft?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'Legal_Draft'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!activeDraft) {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <FileText className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-base text-stone-900">
                Draft Studio & 3-Tier Action Suite
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Safer communication ladder: Start with a soft settlement, escalate to a formal demand, and keep statutory notices lawyer-ready.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                if (!isEditing) setEditedContent(activeDraft.content);
                setIsEditing(!isEditing);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Preview Mode' : 'Edit Text'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .TXT</span>
            </button>
          </div>
        </div>

        {/* 3-Tier Escalation Ladder Tabs */}
        <div className="mb-5">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Select Communication Tone (Settlement-First Strategy)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Tier 1: Soft Request */}
            <button
              onClick={() => {
                setSelectedTier('soft');
                const matched = drafts.find(d => d.communicationTier === 'soft');
                if (matched) setSelectedDraftId(matched.id);
                setIsEditing(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                selectedTier === 'soft'
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tier 1: Soft Settlement</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
                  Default
                </span>
              </div>
              <p className="text-[11px] text-stone-600 line-clamp-1">
                WhatsApp / Email polite reconciliation with direct payment details.
              </p>
            </button>

            {/* Tier 2: Formal Demand */}
            <button
              onClick={() => {
                setSelectedTier('formal');
                const matched = drafts.find(d => d.communicationTier === 'formal');
                if (matched) setSelectedDraftId(matched.id);
                setIsEditing(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedTier === 'formal'
                  ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tier 2: Formal Demand</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                  7-Day Cure
                </span>
              </div>
              <p className="text-[11px] text-stone-600 line-clamp-1">
                Structured business requisition citing contractual terms and deadlines.
              </p>
            </button>

            {/* Tier 3: Lawyer-Ready Notice */}
            <button
              onClick={() => {
                setSelectedTier('lawyer_ready');
                const matched = drafts.find(d => d.communicationTier === 'lawyer_ready');
                if (matched) setSelectedDraftId(matched.id);
                setIsEditing(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedTier === 'lawyer_ready'
                  ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center space-x-1.5 text-xs font-bold text-purple-900">
                  <Scale className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tier 3: Statutory Notice</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                  Court Ready
                </span>
              </div>
              <p className="text-[11px] text-stone-600 line-clamp-1">
                RPAD Legal Notice / e-Daakhil Plaint draft with statutory interest claims.
              </p>
            </button>
          </div>
        </div>

        {/* Sub-Tabs if multiple drafts exist in current tier */}
        {tierFilteredDrafts.length > 1 && (
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-1">
            {tierFilteredDrafts.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDraftId(d.id);
                  setIsEditing(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeDraft.id === d.id
                    ? 'bg-stone-900 text-white shadow'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>
        )}

        {/* Draft Metadata & Evidentiary Grounding Bar */}
        <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200 mb-4 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-stone-900 text-sm">{activeDraft.title}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {activeDraft.statutoryReference && (
                <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Law: {activeDraft.statutoryReference}
                </span>
              )}
              {activeDraft.groundingRefIds && activeDraft.groundingRefIds.length > 0 && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{activeDraft.groundingRefIds.length} Grounded Source{activeDraft.groundingRefIds.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-600 text-[11px]">
            <p>
              <strong>Recipient: </strong> {activeDraft.recipientName}
            </p>
            {activeDraft.recipientAddress && (
              <p>
                <strong>Address: </strong> {activeDraft.recipientAddress}
              </p>
            )}
          </div>
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
              {activeDraft.content}
            </pre>
          )}
        </div>

        {/* Dispatch & Evidentiary Guidance */}
        <div className="mt-4 p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <div className="space-y-0.5">
            <p>
              <strong>Evidentiary Recommendation: </strong>
              {activeDraft.communicationTier === 'soft'
                ? 'Send this directly via WhatsApp or registered email. Capture full screenshots with visible timestamps and delivery ticks.'
                : activeDraft.communicationTier === 'formal'
                ? 'Send this via email with a read receipt and delivery confirmation, or print and deliver with a physical receipt endorsement.'
                : 'For statutory notices, dispatch via Registered Speed Post with Acknowledgement Due (RPAD) and retain the postal booking receipt with tracking pod.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
