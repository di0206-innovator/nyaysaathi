import {
  DocumentParserProvider,
  LegalRAGProvider,
  MatterStorageProvider,
  MultilingualExplanationProvider,
  Matter,
  MatterCategory
} from '@/types/matter';
import { INDIAN_STATUTES } from '@/lib/legal/statutes';

/**
 * Mock Document Parser Provider
 * Ready to be swapped with Google Cloud Document AI, AWS Textract, or LlamaParse.
 */
export class MockDocumentParserProvider implements DocumentParserProvider {
  public async parseDocument(file: {
    buffer?: ArrayBuffer;
    text?: string;
    mimeType: string;
    filename: string;
  }): Promise<{
    extractedText: string;
    confidence: number;
    detectedPages?: number;
    clauses?: Array<{ title: string; text: string; pageNumber?: number }>;
    entities?: Array<{ name: string; type: string }>;
  }> {
    const raw = file.text || `Extracted text from ${file.filename}`;
    const clauses: Array<{ title: string; text: string; pageNumber?: number }> = [];
    const entities: Array<{ name: string; type: string }> = [];

    // Simple regex entity extractor
    const currencyMatches = raw.match(/₹\s*[\d,]+|Rs\.?\s*[\d,]+/gi);
    if (currencyMatches) {
      currencyMatches.forEach(c => entities.push({ name: c, type: 'FINANCIAL_SUM' }));
    }

    const dateMatches = raw.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b/gi);
    if (dateMatches) {
      dateMatches.forEach(d => entities.push({ name: d, type: 'DATE' }));
    }

    if (raw.toLowerCase().includes('clause') || raw.toLowerCase().includes('section')) {
      clauses.push({
        title: 'Notice & Refund Covenant',
        text: 'The security deposit shall be refunded within stipulated days of vacant handover.',
        pageNumber: 1
      });
    }

    return {
      extractedText: raw,
      confidence: 0.96,
      detectedPages: 1,
      clauses,
      entities
    };
  }
}

/**
 * Mock Legal RAG Provider
 * Ready to be plugged into Supabase pgvector or Vertex AI Search.
 */
export class MockLegalRAGProvider implements LegalRAGProvider {
  public async searchStatutes(
    query: string,
    criteria: {
      category: MatterCategory;
      state?: string;
      limit?: number;
    }
  ): Promise<Array<{
    statute: string;
    section: string;
    title: string;
    relevanceScore: number;
    snippet: string;
    precedents?: string[];
  }>> {
    const matched = INDIAN_STATUTES.filter(s => s.category === criteria.category);
    const limit = criteria.limit || 5;

    return matched.slice(0, limit).map((s, idx) => ({
      statute: s.statute,
      section: s.section,
      title: s.title,
      relevanceScore: Math.max(0.7, 0.98 - idx * 0.05),
      snippet: s.plainSummary,
      precedents: [
        'Supreme Court of India - Landmark Interpretation (2021)',
        'State High Court Precedent on Pecuniary Jurisdiction'
      ]
    }));
  }
}

/**
 * Mock Matter Storage Provider
 * Production-ready interface matching Supabase / Postgres matter persistence schema.
 */
export class MockMatterStorageProvider implements MatterStorageProvider {
  private memoryStore: Map<string, Matter> = new Map();

  public async saveMatter(matter: Matter): Promise<Matter> {
    this.memoryStore.set(matter.id, { ...matter, updatedAt: new Date().toISOString() });
    return this.memoryStore.get(matter.id)!;
  }

  public async getMatter(id: string): Promise<Matter | null> {
    return this.memoryStore.get(id) || null;
  }

  public async listMatters(userId?: string): Promise<Matter[]> {
    if (userId) {
      // Future Supabase RLS integration filters by user identifier
      return Array.from(this.memoryStore.values()).filter(m => (m as { userId?: string }).userId === userId);
    }
    return Array.from(this.memoryStore.values());
  }

  public async deleteMatter(id: string): Promise<boolean> {
    return this.memoryStore.delete(id);
  }
}

/**
 * Mock Multilingual Provider
 * Ready for Bhashini (Government of India Indic AI) or Gemini Multilingual.
 */
export class MockMultilingualProvider implements MultilingualExplanationProvider {
  private static INDIC_DICTIONARY: Record<string, { hi: string; hinglish: string; mr: string }> = {
    'Security Deposit': {
      hi: 'सुरक्षा जमा (सिक्योरिटी डिपॉजिट)',
      hinglish: 'Security Deposit',
      mr: 'सुरक्षा अनामत रक्कम (Security Deposit)'
    },
    'Notice Period': {
      hi: 'नोटिस अवधि',
      hinglish: 'Notice Period',
      mr: 'नोटीस कालावधी'
    },
    'Legal Notice': {
      hi: 'कानूनी नोटिस',
      hinglish: 'Legal Notice',
      mr: 'कायदेशीर नोटीस'
    },
    'Deficiency in Service': {
      hi: 'सेवा में कमी',
      hinglish: 'Service mein kami (Deficiency)',
      mr: 'सेवेतील त्रुटी'
    }
  };

  public async translateExplanation(
    text: string,
    targetLanguage: 'en' | 'hi' | 'hinglish' | 'mr'
  ): Promise<{
    translatedText: string;
    language: 'en' | 'hi' | 'hinglish' | 'mr';
    glossaryTerms?: Record<string, string>;
  }> {
    if (targetLanguage === 'en') {
      return { translatedText: text, language: 'en' };
    }

    const glossary: Record<string, string> = {};
    for (const [enTerm, trans] of Object.entries(MockMultilingualProvider.INDIC_DICTIONARY)) {
      if (text.includes(enTerm)) {
        glossary[enTerm] = trans[targetLanguage];
      }
    }

    let localizedNote = '';
    if (targetLanguage === 'hi') {
      localizedNote = `[हिंदी अनुवाद] न्यायसाथी कानूनी स्पष्टीकरण:\n\n`;
    } else if (targetLanguage === 'hinglish') {
      localizedNote = `[Hinglish Translation] NyaySaathi Legal Guidance:\n\n`;
    } else if (targetLanguage === 'mr') {
      localizedNote = `[मराठी भाषांतर] न्यायसाथी कायदेशीर मार्गदर्शन:\n\n`;
    }

    return {
      translatedText: localizedNote + text,
      language: targetLanguage,
      glossaryTerms: glossary
    };
  }
}
