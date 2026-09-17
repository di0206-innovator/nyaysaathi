'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Matter, DocumentEvidence } from '@/types/matter';
import { MatterHeader } from '@/components/matter/MatterHeader';
import { TrustSafetyCard } from '@/components/matter/TrustSafetyCard';
import { TimelineView } from '@/components/matter/TimelineView';
import { RiskAlertBox } from '@/components/matter/RiskAlertBox';
import { ActionChecklist } from '@/components/matter/ActionChecklist';
import { EvidenceUploader } from '@/components/matter/EvidenceUploader';
import { DraftStudio } from '@/components/matter/DraftStudio';
import { LawyerBriefCard } from '@/components/matter/LawyerBriefCard';
import { EscalationPathwayCard } from '@/components/matter/EscalationPathwayCard';
import { FollowUpQA } from '@/components/matter/FollowUpQA';
import {
  Scale,
  Sparkles,
  Calendar,
  ShieldAlert,
  ListTodo,
  FileText,
  FolderLock,
  Briefcase,
  Users,
  MessageSquare
} from 'lucide-react';

type TabType =
  | 'overview'
  | 'timeline'
  | 'risks'
  | 'actions'
  | 'drafts'
  | 'evidence'
  | 'brief'
  | 'escalate'
  | 'qa';

export default function MatterDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    let isMounted = true;
    async function loadMatter() {
      try {
        const res = await fetch(`/api/matters/${id}`);
        const data = await res.json();
        if (isMounted && data.success) {
          setMatter(data.data);
        }
      } catch (err) {
        console.error('Failed to load matter', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadMatter();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleReanalyze = async () => {
    try {
      const res = await fetch(`/api/matters/${id}/analyze`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setMatter(data.data);
      }
    } catch (err) {
      console.error('Failed to re-analyze', err);
    }
  };

  const handleAnswerSubmit = async (infoId: string, answer: string) => {
    if (!matter) return;
    const updatedMissing = matter.missingInformation.map((m) =>
      m.id === infoId ? { ...m, isAnswered: true, answer } : m
    );

    const updated = { ...matter, missingInformation: updatedMissing };
    setMatter(updated);

    await fetch(`/api/matters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missingInformation: updatedMissing })
    });
  };

  const handleUploadSimulate = async (newDoc: { title: string; type: DocumentEvidence['type']; extractedText?: string }) => {
    if (!matter) return;
    const updatedDocs: DocumentEvidence[] = [
      ...matter.documents,
      {
        id: `doc-${Date.now()}`,
        title: newDoc.title,
        type: newDoc.type,
        fileSize: '1.4 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        extractedText: newDoc.extractedText,
        classification: 'User Uploaded Proof',
        confidenceScore: 0.95,
        relevanceSummary: 'Corroborating evidence item supplied during active matter review.',
        status: 'verified' as const
      }
    ];

    setMatter({ ...matter, documents: updatedDocs });

    await fetch(`/api/matters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents: updatedDocs })
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Scale className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-semibold">Loading matter dossier...</p>
        </div>
      </div>
    );
  }

  if (!matter) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3 max-w-md">
          <h2 className="text-base font-bold text-stone-900">Matter not found</h2>
          <p className="text-xs text-stone-500">The requested legal matter does not exist or was removed.</p>
          <Link
            href="/matters"
            className="inline-block px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
          >
            Return to All Matters
          </Link>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'overview' as const, label: 'Situation & Trust', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'timeline' as const, label: 'What Happened (Timeline)', icon: <Calendar className="w-4 h-4" /> },
    { id: 'risks' as const, label: 'Pay Attention (Risks)', icon: <ShieldAlert className="w-4 h-4" />, count: matter.risks.length },
    { id: 'actions' as const, label: 'Next Steps (Action Plan)', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'drafts' as const, label: 'Drafts & Notices', icon: <FileText className="w-4 h-4" />, count: matter.drafts.length },
    { id: 'evidence' as const, label: 'Evidence Locker', icon: <FolderLock className="w-4 h-4" />, count: matter.documents.length },
    { id: 'brief' as const, label: 'Prepare for Lawyer (Brief)', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'escalate' as const, label: 'Escalation Routes', icon: <Scale className="w-4 h-4" /> },
    { id: 'qa' as const, label: 'Follow-Up Q&A', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20">
      {/* 1. Header */}
      <MatterHeader matter={matter} onReanalyze={handleReanalyze} />

      {/* 2. Responsive Navigation Sub-Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-2.5 no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span className={isActive ? 'text-amber-400' : 'text-stone-400'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW & SITUATION SUMMARY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Plain Language Situation Summary */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-stone-100">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">Legal Situation Summary</h3>
                  <p className="text-[11px] text-stone-500">Plain-language translation of what matters in your case.</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/80 font-normal">
                {matter.summary.plainLanguage}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                  <strong className="text-amber-950 font-bold block mb-0.5">Core Conflict:</strong>
                  <span className="text-stone-700">{matter.summary.keyConflict}</span>
                </div>
                <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
                  <strong className="text-blue-950 font-bold block mb-0.5">Legal Nature:</strong>
                  <span className="text-stone-700">{matter.summary.legalNature}</span>
                </div>
              </div>
            </div>

            {/* Parties Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center space-x-2 pb-3 border-b border-stone-100">
                <Users className="w-4 h-4 text-stone-500" />
                <span>Parties in this Matter</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matter.parties.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200 text-stone-800">
                        {p.role}
                      </span>
                    </div>
                    {p.address && <p className="text-stone-600 text-[11px]">{p.address}</p>}
                    {p.city && <p className="text-stone-500 text-[11px]">{p.city}, {p.state}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Tier Trust & Safety Card */}
            <TrustSafetyCard items={matter.trustSafetyItems} />
          </div>
        )}

        {/* TAB 2: TIMELINE */}
        {activeTab === 'timeline' && (
          <TimelineView events={matter.timelineEvents} />
        )}

        {/* TAB 3: RISKS & LIMITATION */}
        {activeTab === 'risks' && (
          <RiskAlertBox
            risks={matter.risks}
            missingInformation={matter.missingInformation}
            onAnswerSubmit={handleAnswerSubmit}
          />
        )}

        {/* TAB 4: ACTION PLAN */}
        {activeTab === 'actions' && (
          <ActionChecklist matterId={matter.id} steps={matter.actionPlan} />
        )}

        {/* TAB 5: DRAFTS & NOTICES */}
        {activeTab === 'drafts' && (
          <DraftStudio drafts={matter.drafts} />
        )}

        {/* TAB 6: EVIDENCE LOCKER */}
        {activeTab === 'evidence' && (
          <EvidenceUploader documents={matter.documents} onUploadSimulate={handleUploadSimulate} />
        )}

        {/* TAB 7: LAWYER BRIEF */}
        {activeTab === 'brief' && (
          <LawyerBriefCard brief={matter.lawyerBrief} />
        )}

        {/* TAB 8: ESCALATION PATHWAYS */}
        {activeTab === 'escalate' && (
          <EscalationPathwayCard routes={matter.escalationRoutes} />
        )}

        {/* TAB 9: FOLLOW-UP Q&A */}
        {activeTab === 'qa' && (
          <FollowUpQA matterTitle={matter.title} matterCategory={matter.category} />
        )}
      </main>
    </div>
  );
}
