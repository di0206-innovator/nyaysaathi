import { Matter, Party, ExtractedFact } from '@/types/matter';

export interface AdvocateCasePack {
  matterId: string;
  generatedAt: string;
  matterSummary: string;
  parties: Party[];
  chronology: Array<{ date: string; title: string; description: string }>;
  verifiedFacts: ExtractedFact[];
  unresolvedFacts: Array<{ question: string; whyItMatters: string }>;
  evidenceIndex: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    summary: string;
    confidence: number;
  }>;
  relevantLaw: Array<{
    statute: string;
    section: string;
    applicability: string;
  }>;
  actionsTaken: Array<{
    title: string;
    status: string;
    completedAt?: string;
  }>;
  communications: Array<{
    date: string;
    direction: string;
    counterparty: string;
    summary: string;
  }>;
  limitationAndDeadlines: Array<{
    title: string;
    dueDate: string;
    isStatutory: boolean;
  }>;
  escalationHistory: Array<{
    authority: string;
    status: string;
  }>;
  advocateNote: string;
  aiLimitationsDisclaimer: string;
}

export class AdvocatePackService {
  public static compileAdvocateBrief(matter: Matter): AdvocateCasePack {
    const verifiedFacts = (matter.facts || []).filter(f => f.verified);
    const unresolvedFacts = (matter.missingInformation || [])
      .filter(m => !m.isAnswered)
      .map(m => ({ question: m.question, whyItMatters: m.whyItMatters }));

    const evidenceIndex = (matter.documents || []).map(d => ({
      id: d.id,
      title: d.title,
      type: d.classification || d.type || 'Document Attachment',
      status: d.extractionStatus || 'needs_review',
      summary: d.relevanceSummary || d.extractedText?.slice(0, 120) || 'Attachment awaiting text extraction.',
      confidence: d.confidenceScore || 0.5
    }));

    const relevantLaw = (matter.applicableStatutes || []).map(s => ({
      statute: s.statute,
      section: s.section,
      applicability: s.applicabilityNote
    }));

    const actionsTaken = (matter.actionPlan || []).map(a => ({
      title: a.title,
      status: a.status,
      completedAt: a.completedAt
    }));

    const communications = (matter.communications || []).map(c => ({
      date: c.date,
      direction: c.direction,
      counterparty: c.counterparty,
      summary: c.summary
    }));

    const limitationAndDeadlines = (matter.deadlines || []).map(d => ({
      title: d.title,
      dueDate: d.dueDate,
      isStatutory: d.isStatutory
    }));

    const escalationHistory = (matter.escalationWorkflows || []).map(e => ({
      authority: e.authorityName,
      status: e.status
    }));

    return {
      matterId: matter.id,
      generatedAt: new Date().toISOString(),
      matterSummary: `${matter.title}. ${matter.summary?.plainLanguage || matter.userStory || ''}`,
      parties: matter.parties || [],
      chronology: (matter.timelineEvents || []).map(t => ({
        date: t.date,
        title: t.title,
        description: t.description
      })),
      verifiedFacts,
      unresolvedFacts,
      evidenceIndex,
      relevantLaw,
      actionsTaken,
      communications,
      limitationAndDeadlines,
      escalationHistory,
      advocateNote: 'Case brief synthesized for legal counsel review. All facts are indexed against primary documents and client affirmations.',
      aiLimitationsDisclaimer: 'This brief is generated for advocate convenience as an organizational aide. It does not constitute formal legal representation, court pleading, or binding legal advice. Independent verification of statutory limitation and procedural rules is mandatory.'
    };
  }
}
