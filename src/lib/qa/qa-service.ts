import { Matter, SourceReference, TrustSafetyTier } from '@/types/matter';
import { getLLMProvider, getTranslationProvider, LLMProvider, QAResponse, SupportedLanguage, TranslationProvider } from '@/lib/ai';

export class MatterQAService {
  private llm: LLMProvider;
  private translator: TranslationProvider;

  constructor(llm?: LLMProvider, translator?: TranslationProvider) {
    this.llm = llm || getLLMProvider();
    this.translator = translator || getTranslationProvider();
  }

  /**
   * Evaluates a user query against the specific matter evidence locker and legal context.
   */
  public async answerQuestion(
    matter: Matter,
    query: string,
    language: SupportedLanguage = 'en'
  ): Promise<QAResponse> {
    const qLower = query.toLowerCase();
    const citations: SourceReference[] = [];

    // 1. Check for documentary evidence references
    const nonSpecificWords = new Set([
      'landlord', 'tenant', 'deposit', 'agreement', 'document', 'proof', 'notice',
      'letter', 'matter', 'party', 'issue', 'amount', 'money', 'state'
    ]);

    const matchedDocs = matter.documents.filter(
      d =>
        qLower.includes(d.title.toLowerCase()) ||
        (d.type !== 'other' && qLower.includes(d.type.replace(/_/g, ' '))) ||
        (d.extractedText &&
          qLower
            .split(/\s+/)
            .some(w => w.length > 4 && !nonSpecificWords.has(w) && d.extractedText?.toLowerCase().includes(w)))
    );

    matchedDocs.forEach(d => {
      citations.push({
        id: `doc-${d.id}`,
        type: 'doc',
        label: `${d.title} (${d.type.replace(/_/g, ' ')})`,
        excerpt: d.relevanceSummary || d.extractedText?.slice(0, 100)
      });
    });

    // 2. Check for timeline references
    const matchedTimeline = matter.timelineEvents.filter(
      t =>
        qLower.includes(t.title.toLowerCase()) ||
        (t.date && qLower.includes(t.date))
    );

    matchedTimeline.forEach(t => {
      citations.push({
        id: `timeline-${t.id}`,
        type: 'event',
        label: `${t.date}: ${t.title}`,
        excerpt: t.description
      });
    });

    // 3. Check for statutory references in Lawyer Brief / Risks
    const statutoryRefs = matter.lawyerBrief?.statutoryReferences || [];
    const matchedStatutes = statutoryRefs.filter(
      s =>
        qLower.includes(s.statute.toLowerCase()) ||
        (s.section && qLower.includes(s.section.toLowerCase())) ||
        qLower.includes('statute') ||
        qLower.includes('section') ||
        qLower.includes('act') ||
        qLower.includes('limitation')
    );

    matchedStatutes.forEach((s, idx) => {
      citations.push({
        id: `statute-${idx + 1}`,
        type: 'statute',
        label: `${s.statute}${s.section ? ` (${s.section})` : ''}`,
        excerpt: s.applicability
      });
    });

    // 4. Comprehensive Matter Text Corpus
    const fullMatterText = (
      matter.userStory + ' ' +
      matter.title + ' ' +
      matter.documents.map(d => d.title + ' ' + (d.extractedText || '')).join(' ') + ' ' +
      matter.timelineEvents.map(t => t.title + ' ' + t.description).join(' ') + ' ' +
      matter.facts.map(f => f.statement).join(' ')
    ).toLowerCase();

    // Standard procedural and inquiry questions
    const proceduralKeywords = [
      'notice', 'lawyer', 'advocate', 'court', 'police', 'ignore', 'reply', 'unanswered',
      'file', 'next step', 'dlsa', 'limitation', 'procedure', 'rights', 'help',
      'what happens', 'time limit', 'commission', 'fees', 'process', 'prove', 'proof',
      'legal', 'action', 'remedy', 'valid', 'validity'
    ];
    const isPurelyProcedural = proceduralKeywords.some(k => qLower.includes(k));

    // Identify significant non-stopword query tokens (length > 3)
    const stopWords = new Set([
      'what', 'when', 'where', 'which', 'does', 'have', 'party', 'this', 'that',
      'with', 'from', 'about', 'your', 'after', 'before', 'landlord', 'tenant',
      'matter', 'will', 'should', 'could', 'would', 'there', 'they', 'them', 'their',
      'give', 'gave', 'given', 'taking', 'taken'
    ]);

    const queryTokens = qLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

    // Tokens neither in the matter corpus nor recognized procedural terms
    const alienTokens = queryTokens.filter(
      w => !fullMatterText.includes(w) && !proceduralKeywords.includes(w)
    );

    // Query is grounded ONLY IF it does not introduce unrecorded alien factual claims
    // AND (has explicit citations OR is a recognized procedural inquiry)
    const isGrounded = alienTokens.length === 0 && (citations.length > 0 || isPurelyProcedural);

    // IF UNGROUNDED: Refuse to guess, articulate missing facts, generate targeted questions
    if (!isGrounded) {
      const missingPrompt = `Your question touches on external circumstances or details that are not currently documented in your matter timeline or uploaded files.`;
      const clarifyingQuestions = [
        `Do you have an email, chat transcript, or bank statement confirming this specific event?`,
        `Was there a written clause or agreement covering this situation?`,
        `Did this take place before or after the key handover date documented in your timeline?`
      ];

      let refusalText = `I cannot safely answer this without factual grounding in your matter dossier. Under legal navigation guidelines, guessing undocumented facts could mislead your strategy. Please upload corroborating proof or consult an advocate before taking action.`;

      if (language !== 'en') {
        const trans = await this.translator.translateExplanation(refusalText, language);
        refusalText = trans.translatedText;
      }

      return {
        answer: refusalText,
        tier: 'unsupported',
        citations: [],
        isFullyGrounded: false,
        missingInfoPrompt: missingPrompt,
        suggestedQuestions: clarifyingQuestions
      };
    }

    // IF GROUNDED: Formulate careful, referenced answer
    let answer = '';
    let tier: TrustSafetyTier = 'explanation';

    if (qLower.includes('ignore') || qLower.includes('not reply') || qLower.includes('unanswered')) {
      answer = `Under Indian legal procedure, if the opposing party fails to respond to your written notice within the stipulated contractual or statutory cure period (commonly 15 to 30 days depending on the underlying agreement or specific statute), their non-response can be cited as prima facie proof of default in subsequent proceedings before the District Legal Services Authority (DLSA) or the competent forum.`;
      tier = 'explanation';
    } else if (qLower.includes('lawyer') || qLower.includes('hire') || qLower.includes('advocate')) {
      answer = `For pre-litigation notices and forum filings like e-Daakhil (Consumer Commission) or DLSA mediation, Indian law permits complainants to represent themselves in person without mandatory advocate engagement. However, if the opposing party contests with extensive pleadings or the matter involves complex pecuniary cross-examination, formal advocate representation is strongly advised.`;
      tier = 'explanation';
    } else if (qLower.includes('limitation') || qLower.includes('time limit') || qLower.includes('deadline')) {
      const activeRisk = matter.risks.find(r => r.limitationPeriodInfo);
      if (activeRisk?.limitationPeriodInfo) {
        const lim = activeRisk.limitationPeriodInfo;
        answer = `Based on the ${lim.statute} applicable to your matter, the statutory limitation period is approximately ${lim.deadlineMonths} months from the cause of action. Initiating a formal demand or mediation promptly prevents limitation expiry.`;
      } else {
        answer = `Statutory limitation under the Indian Limitation Act typically provides 3 years for civil debt and money recovery, and 2 years from the date of cause of action for consumer complaints under Section 69 of the Consumer Protection Act, 2019.`;
      }
      tier = 'explanation';
    } else {
      // General grounded explanation referencing the specific matter
      const primaryDoc = matter.documents[0]?.title || 'submitted documentary proof';
      const conflict = matter.summary.keyConflict || 'unresolved legal dispute';
      answer = `Regarding "${matter.title}": The dispute centers on ${conflict}. According to ${primaryDoc} and established Indian statutory remedies, you have documented grounds to seek resolution through structured pre-litigation notice before filing formal complaints.`;
      tier = citations.length > 0 ? 'explanation' : 'possibility';
    }

    // Translate if user requested non-English
    if (language !== 'en') {
      const trans = await this.translator.translateExplanation(answer, language);
      answer = trans.translatedText;
    }

    const isFullyGrounded = citations.length > 0 && tier !== 'possibility';

    return {
      answer,
      tier,
      citations,
      isFullyGrounded,
      suggestedQuestions: [
        'What terms should I specify in my formal legal notice?',
        'Can I file this online on the government portal?',
        'What evidence should I show to a DLSA legal aid advocate?'
      ]
    };
  }
}

let globalQAService: MatterQAService | null = null;
export function getMatterQAService(): MatterQAService {
  if (!globalQAService) {
    globalQAService = new MatterQAService();
  }
  return globalQAService;
}
