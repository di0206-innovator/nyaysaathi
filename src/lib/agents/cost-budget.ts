/**
 * NyaySaathi Matter Cost Budget & Spend Governance
 * Prevents unbounded AI/LLM spend and resource consumption per matter.
 */

export interface MatterBudgetLimits {
  maxRequestsPerMatter: number;
  maxModelCalls: number;
  maxRetries: number;
  maxOutputTokens: number;
  maxRetrievalDepth: number;
  maxOcrCalls: number;
  maxQaCalls: number;
}

export interface MatterBudgetUsage {
  requests: number;
  modelCalls: number;
  retries: number;
  outputTokens: number;
  retrievalDepth: number;
  ocrCalls: number;
  qaCalls: number;
}

export const DEFAULT_MATTER_BUDGET: MatterBudgetLimits = {
  maxRequestsPerMatter: 50,
  maxModelCalls: 30,
  maxRetries: 5,
  maxOutputTokens: 60000,
  maxRetrievalDepth: 15,
  maxOcrCalls: 10,
  maxQaCalls: 20
};

class MatterBudgetManager {
  private usageMap = new Map<string, MatterBudgetUsage>();
  private customLimits = new Map<string, Partial<MatterBudgetLimits>>();

  private getUsage(matterId: string): MatterBudgetUsage {
    if (!this.usageMap.has(matterId)) {
      this.usageMap.set(matterId, {
        requests: 0,
        modelCalls: 0,
        retries: 0,
        outputTokens: 0,
        retrievalDepth: 0,
        ocrCalls: 0,
        qaCalls: 0
      });
    }
    return this.usageMap.get(matterId)!;
  }

  public getLimits(matterId?: string): MatterBudgetLimits {
    const custom = matterId ? this.customLimits.get(matterId) : undefined;
    return {
      ...DEFAULT_MATTER_BUDGET,
      ...custom
    };
  }

  public setCustomLimits(matterId: string, limits: Partial<MatterBudgetLimits>): void {
    this.customLimits.set(matterId, limits);
  }

  public checkBudget(
    matterId: string,
    action: keyof MatterBudgetUsage,
    increment = 1
  ): { allowed: boolean; reason?: string; usage: MatterBudgetUsage; limits: MatterBudgetLimits } {
    const usage = this.getUsage(matterId);
    const limits = this.getLimits(matterId);

    const projected = usage[action] + increment;

    switch (action) {
      case 'requests':
        if (projected > limits.maxRequestsPerMatter) {
          return { allowed: false, reason: `Matter request limit exceeded (${projected}/${limits.maxRequestsPerMatter})`, usage, limits };
        }
        break;
      case 'modelCalls':
        if (projected > limits.maxModelCalls) {
          return { allowed: false, reason: `Matter model call limit exceeded (${projected}/${limits.maxModelCalls})`, usage, limits };
        }
        break;
      case 'retries':
        if (projected > limits.maxRetries) {
          return { allowed: false, reason: `Max retries exceeded (${projected}/${limits.maxRetries})`, usage, limits };
        }
        break;
      case 'outputTokens':
        if (projected > limits.maxOutputTokens) {
          return { allowed: false, reason: `Token budget exceeded (${projected}/${limits.maxOutputTokens})`, usage, limits };
        }
        break;
      case 'retrievalDepth':
        if (projected > limits.maxRetrievalDepth) {
          return { allowed: false, reason: `Retrieval depth limit reached (${projected}/${limits.maxRetrievalDepth})`, usage, limits };
        }
        break;
      case 'ocrCalls':
        if (projected > limits.maxOcrCalls) {
          return { allowed: false, reason: `OCR allowance exceeded for matter (${projected}/${limits.maxOcrCalls})`, usage, limits };
        }
        break;
      case 'qaCalls':
        if (projected > limits.maxQaCalls) {
          return { allowed: false, reason: `Legal Q&A allowance exceeded (${projected}/${limits.maxQaCalls})`, usage, limits };
        }
        break;
    }

    return { allowed: true, usage, limits };
  }

  public recordUsage(matterId: string, action: keyof MatterBudgetUsage, amount = 1): void {
    const usage = this.getUsage(matterId);
    usage[action] += amount;
  }

  public getMatterUsage(matterId: string): MatterBudgetUsage {
    return { ...this.getUsage(matterId) };
  }

  public resetMatterUsage(matterId: string): void {
    this.usageMap.delete(matterId);
  }
}

export const matterBudget = new MatterBudgetManager();
