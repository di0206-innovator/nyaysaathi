'use client';

import React, { useState, useEffect, use, useMemo, useCallback } from 'react';
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
import { GroundingExplorer } from '@/components/matter/GroundingExplorer';
import { TrustDashboard } from '@/components/matter/TrustDashboard';
import { DeadlineTrackerCard } from '@/components/matter/DeadlineTrackerCard';
import { LanguageSelector } from '@/components/matter/LanguageSelector';
import { DeadlineEngine } from '@/lib/deadlines/deadline-engine';
import { SupportedLanguage } from '@/lib/ai';
import { LocalizedMatterContent } from '@/lib/multilingual/language-service';
import { CommunicationLog } from '@/components/matter/CommunicationLog';
import { ActivityTimeline } from '@/components/matter/ActivityTimeline';
import { AdvocateCasePackModal } from '@/components/matter/AdvocateCasePackModal';
import { ResolutionModal } from '@/components/matter/ResolutionModal';
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
  MessageSquare,
  ShieldCheck,
  Clock,
  Shield,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

type TabType =
  | 'overview'
  | 'trust'
  | 'grounding'
  | 'deadlines'
  | 'timeline'
  | 'activity'
  | 'risks'
  | 'actions'
  | 'comms'
  | 'drafts'
  | 'evidence'
  | 'brief'
  | 'escalate'
  | 'qa';

import { useAuth } from '@/lib/auth/AuthContext';

export default function MatterDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { token } = useAuth();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAdvocatePackOpen, setIsAdvocatePackOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [localizedContent, setLocalizedContent] = useState<LocalizedMatterContent | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    async function loadMatter() {
      try {
        const res = await fetch(`/api/matters/${id}`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setMatter(data.data);
          setErrorMessage(null);
        } else if (isMounted && !data.success) {
          setErrorMessage(data.error?.message || 'Failed to load matter');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load matter', err);
          setErrorMessage('Network or server error while retrieving matter');
        }
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
  }, [id, getAuthHeaders]);

  const handleReanalyze = async (trigger: string = 'full') => {
    setAnalyzing(true);
    setErrorMessage(null);

    // Stepped honest progress states
    setAnalysisStep('Querying applicable statutes & precedents...');
    const stepTimer1 = setTimeout(() => setAnalysisStep('Reconstructing chronological timeline & milestone dates...'), 400);
    const stepTimer2 = setTimeout(() => setAnalysisStep('Assessing risk vectors & limitation windows...'), 800);
    const stepTimer3 = setTimeout(() => setAnalysisStep('Running mandatory trust & safety verification audit...'), 1200);

    try {
      const res = await fetch(`/api/matters/${id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ trigger })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMatter(data.data);
      } else {
        setErrorMessage(data.error?.message || 'Re-analysis failed');
      }
    } catch (err) {
      console.error('Failed to re-analyze', err);
      setErrorMessage('Failed to connect to analysis service');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const calculatedDeadlines = useMemo(() => {
    return matter ? DeadlineEngine.calculateDeadlines(matter) : [];
  }, [matter]);

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    if (lang === 'en') {
      setLocalizedContent(null);
      return;
    }
    setIsTranslating(true);
    try {
      const res = await fetch(`/api/matters/${id}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ language: lang })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLocalizedContent(data.data);
      }
    } catch (err) {
      console.error('Failed to translate matter', err);
    } finally {
      setIsTranslating(false);
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
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ missingInformation: updatedMissing })
    });

    // Selective re-analysis trigger: missing_info_answered
    await handleReanalyze('missing_info_answered');
  };

  const handleUploadSimulate = async (newDoc: { title: string; type: DocumentEvidence['type']; extractedText?: string; file?: File }) => {
    if (!matter) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (newDoc.file) {
        formData.append('file', newDoc.file);
      } else {
        const textBlob = new Blob([newDoc.extractedText || newDoc.title], { type: 'text/plain' });
        formData.append('file', textBlob, `${newDoc.title.replace(/[^a-zA-Z0-9.-]/g, '_')}.txt`);
      }
      formData.append('title', newDoc.title);
      formData.append('type', newDoc.type);

      const res = await fetch(`/api/matters/${id}/documents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      const data = await res.json();
      if (data.success && data.data?.matter) {
        setMatter(data.data.matter);
      } else {
        await handleReanalyze('doc_uploaded');
      }
    } catch {
      await handleReanalyze('doc_uploaded');
    } finally {
      setAnalyzing(false);
    }
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

  const criticalDeadlinesCount = calculatedDeadlines.filter(d => d.urgency === 'critical').length;

  const navTabs = [
    { id: 'overview' as const, label: 'Situation Summary', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'trust' as const, label: 'Trust Dashboard', icon: <Shield className="w-4 h-4" /> },
    { id: 'grounding' as const, label: 'Evidence Graph', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'deadlines' as const, label: 'Deadlines & Windows', icon: <Clock className="w-4 h-4" />, count: criticalDeadlinesCount || undefined },
    { id: 'actions' as const, label: 'Executable Actions', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'comms' as const, label: 'Communication Log', icon: <MessageSquare className="w-4 h-4" />, count: matter.communications?.length || undefined },
    { id: 'activity' as const, label: 'Activity & Chronology', icon: <Clock className="w-4 h-4" /> },
    { id: 'timeline' as const, label: 'Evidence Facts', icon: <Calendar className="w-4 h-4" /> },
    { id: 'risks' as const, label: 'Pay Attention (Risks)', icon: <ShieldAlert className="w-4 h-4" />, count: matter.risks.length },
    { id: 'drafts' as const, label: 'Drafts & Notices', icon: <FileText className="w-4 h-4" />, count: matter.drafts.length },
    { id: 'evidence' as const, label: 'Evidence Locker', icon: <FolderLock className="w-4 h-4" />, count: matter.documents.length },
    { id: 'brief' as const, label: 'Lawyer Brief', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'escalate' as const, label: 'Escalation Routes', icon: <Scale className="w-4 h-4" /> },
    { id: 'qa' as const, label: 'Follow-Up Q&A', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20">
      {/* 1. Header */}
      <MatterHeader matter={matter} onReanalyze={() => handleReanalyze('full')} />

      {/* Dynamic Matter Health Status & Quick Action Toolbar */}
      <div className="bg-stone-900 text-white px-4 py-3 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
              matter.status === 'resolved'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : matter.status === 'awaiting_other_party'
                ? 'bg-blue-950 text-blue-300 border-blue-700'
                : matter.status === 'in_mediation'
                ? 'bg-purple-950 text-purple-300 border-purple-700'
                : matter.status === 'awaiting_authority'
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-stone-800 text-stone-200 border-stone-700'
            }`}>
              {matter.status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-stone-300">
              {matter.status === 'resolved'
                ? `Case closed: ${matter.resolution?.outcome || 'Resolved'} (Recovered ₹${matter.resolution?.amountRecovered || 0})`
                : matter.status === 'awaiting_other_party'
                ? 'Notice/demand dispatched. Monitoring statutory response window.'
                : matter.status === 'in_mediation'
                ? 'Pre-institution conciliation / Lok Adalat hearing active.'
                : matter.status === 'awaiting_authority'
                ? 'Grievance submitted. Awaiting portal acknowledgment.'
                : 'Action required: Review execution checklist and unblock pending tasks.'}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsAdvocatePackOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Advocate Case Pack</span>
            </button>
            <button
              onClick={() => setIsResolutionOpen(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors ${
                matter.status === 'resolved'
                  ? 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {matter.status === 'resolved' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Case</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stepped Honest Analysis Progress Banner */}
      {analyzing && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-stone-950 px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5">
            <Scale className="w-4 h-4 animate-spin text-stone-950" />
            <span className="font-bold tracking-tight">AI Reasoning Engine:</span>
            <span>{analysisStep || 'Ingesting document evidence and calculating grounding graph...'}</span>
          </div>
          <span className="text-[10px] uppercase font-mono bg-stone-950/20 px-2 py-0.5 rounded">Grounding Active</span>
        </div>
      )}

      {/* Error Callout Banner */}
      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 text-red-800 px-4 py-3 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => handleReanalyze('full')}
            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded font-semibold text-[11px] transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* 2. Responsive Navigation Sub-Bar & Multilingual Selector */}
      <div className="sticky top-16 z-40 bg-white border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2">
            <div className="flex items-center space-x-1 overflow-x-auto py-1 no-scrollbar">
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

            <div className="shrink-0 flex items-center justify-end">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                isLoading={isTranslating}
              />
            </div>
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

              <div className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/80 font-normal whitespace-pre-line">
                {localizedContent ? localizedContent.summary.plainLanguage : matter.summary.plainLanguage}
              </div>

              {localizedContent && Object.keys(localizedContent.glossary).length > 0 && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1.5">
                  <strong className="text-amber-950 font-bold block">
                    Legal Term Glossary ({currentLanguage.toUpperCase()}):
                  </strong>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(localizedContent.glossary).map(([en, loc], i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-amber-200 text-stone-800 text-[11px]">
                        <strong>{en}:</strong> {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                  <strong className="text-amber-950 font-bold block mb-0.5">Core Conflict:</strong>
                  <span className="text-stone-700">
                    {localizedContent ? localizedContent.summary.keyConflict : matter.summary.keyConflict}
                  </span>
                </div>
                <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
                  <strong className="text-blue-950 font-bold block mb-0.5">Legal Nature:</strong>
                  <span className="text-stone-700">
                    {localizedContent ? localizedContent.summary.legalNature : matter.summary.legalNature}
                  </span>
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

            {/* 5-Tier Trust & Safety Card with Safety Audit Trail */}
            <TrustSafetyCard items={matter.trustSafetyItems} auditLog={matter.auditLog} />
          </div>
        )}

        {/* TAB 1.2: TRUST DASHBOARD */}
        {activeTab === 'trust' && (
          <TrustDashboard matter={matter} onUploadClick={() => setActiveTab('evidence')} />
        )}

        {/* TAB 1.5: GROUNDING & EVIDENCE GRAPH EXPLORER */}
        {activeTab === 'grounding' && (
          <GroundingExplorer matter={matter} onUploadClick={() => setActiveTab('evidence')} />
        )}

        {/* TAB 1.8: STATUTORY DEADLINES & WINDOWS */}
        {activeTab === 'deadlines' && (
          <DeadlineTrackerCard deadlines={calculatedDeadlines} />
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
          <ActionChecklist
            matterId={matter.id}
            steps={matter.actionPlan}
            onNavigateToUpload={() => setActiveTab('evidence')}
          />
        )}

        {/* TAB 4.5: COMMUNICATIONS LOG */}
        {activeTab === 'comms' && (
          <CommunicationLog
            matterId={matter.id}
            communications={matter.communications || []}
            onCommunicationAdded={() => handleReanalyze('communication_recorded')}
          />
        )}

        {/* TAB 4.8: ACTIVITY & EVENT CHRONOLOGY */}
        {activeTab === 'activity' && (
          <ActivityTimeline
            historicalEvents={matter.timelineEvents}
            activityEvents={matter.activityEvents || []}
          />
        )}

        {/* TAB 5: DRAFTS & NOTICES */}
        {activeTab === 'drafts' && (
          <DraftStudio
            drafts={matter.drafts}
            matterId={matter.id}
            onNoticeDispatched={() => handleReanalyze('communication_recorded')}
          />
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
          <FollowUpQA
            matterId={matter.id}
            matterTitle={matter.title}
            matterCategory={matter.category}
            language={currentLanguage}
          />
        )}
      </main>

      {/* Advocate Case Pack Modal */}
      <AdvocateCasePackModal
        matterId={matter.id}
        isOpen={isAdvocatePackOpen}
        onClose={() => setIsAdvocatePackOpen(false)}
      />

      {/* Resolution & Reopening Modal */}
      <ResolutionModal
        matterId={matter.id}
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
        existingResolution={matter.resolution}
        onResolutionSaved={(res, isReopened) => {
          setMatter(prev => prev ? {
            ...prev,
            status: isReopened ? 'awaiting_user_action' : 'resolved',
            resolution: res
          } : null);
        }}
      />
    </div>
  );
}
