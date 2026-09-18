import { Matter } from '@/types/matter';
import { getTranslationProvider, SupportedLanguage, TranslationProvider } from '@/lib/ai';

export interface LocalizedMatterContent {
  language: SupportedLanguage;
  summary: {
    plainLanguage: string;
    keyConflict: string;
    legalNature: string;
  };
  risks: Array<{
    id: string;
    title: string;
    description: string;
    mitigatingAction: string;
  }>;
  actionPlan: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  glossary: Record<string, string>;
  preservedCitations: string[];
}

export class LanguageService {
  private translator: TranslationProvider;

  constructor(translator?: TranslationProvider) {
    this.translator = translator || getTranslationProvider();
  }

  /**
   * Translates the matter's plain language situation summary, risks, and next steps into the target Indian language.
   */
  public async localizeMatter(
    matter: Matter,
    targetLanguage: SupportedLanguage
  ): Promise<LocalizedMatterContent> {
    if (targetLanguage === 'en') {
      return {
        language: 'en',
        summary: matter.summary,
        risks: matter.risks.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          mitigatingAction: r.mitigatingAction
        })),
        actionPlan: matter.actionPlan.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description
        })),
        glossary: {},
        preservedCitations: []
      };
    }

    const glossary = this.translator.getLegalGlossary(targetLanguage);
    const allCitations: string[] = [];

    // Translate summary
    const plainTrans = await this.translator.translateExplanation(
      matter.summary.plainLanguage,
      targetLanguage
    );
    const conflictTrans = await this.translator.translateExplanation(
      matter.summary.keyConflict,
      targetLanguage
    );
    const legalTrans = await this.translator.translateExplanation(
      matter.summary.legalNature,
      targetLanguage
    );

    allCitations.push(...plainTrans.preservedCitations, ...conflictTrans.preservedCitations);

    // Translate risks
    const localizedRisks = await Promise.all(
      matter.risks.map(async (r) => {
        const titleTrans = await this.translator.translateExplanation(r.title, targetLanguage);
        const descTrans = await this.translator.translateExplanation(r.description, targetLanguage);
        const actTrans = await this.translator.translateExplanation(r.mitigatingAction, targetLanguage);
        allCitations.push(...descTrans.preservedCitations);
        return {
          id: r.id,
          title: titleTrans.translatedText.replace(/^\[.*?\]\n\n/, ''),
          description: descTrans.translatedText.replace(/^\[.*?\]\n\n/, ''),
          mitigatingAction: actTrans.translatedText.replace(/^\[.*?\]\n\n/, '')
        };
      })
    );

    // Translate action steps
    const localizedActions = await Promise.all(
      matter.actionPlan.map(async (a) => {
        const titleTrans = await this.translator.translateExplanation(a.title, targetLanguage);
        const descTrans = await this.translator.translateExplanation(a.description, targetLanguage);
        return {
          id: a.id,
          title: titleTrans.translatedText.replace(/^\[.*?\]\n\n/, ''),
          description: descTrans.translatedText.replace(/^\[.*?\]\n\n/, '')
        };
      })
    );

    return {
      language: targetLanguage,
      summary: {
        plainLanguage: plainTrans.translatedText,
        keyConflict: conflictTrans.translatedText.replace(/^\[.*?\]\n\n/, ''),
        legalNature: legalTrans.translatedText.replace(/^\[.*?\]\n\n/, '')
      },
      risks: localizedRisks,
      actionPlan: localizedActions,
      glossary,
      preservedCitations: Array.from(new Set(allCitations))
    };
  }

  public getGlossary(language: SupportedLanguage): Record<string, string> {
    return this.translator.getLegalGlossary(language);
  }
}

let globalLanguageService: LanguageService | null = null;
export function getLanguageService(): LanguageService {
  if (!globalLanguageService) {
    globalLanguageService = new LanguageService();
  }
  return globalLanguageService;
}
