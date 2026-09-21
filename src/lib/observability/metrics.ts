/**
 * Performance and Observability Telemetry for NyaySaathi
 * Tracks request latencies, agent execution profiles, and enforces payload sizing limits.
 */

export interface LatencyMetric {
  name: string;
  durationMs: number;
  timestamp: number;
  success: boolean;
  metadata?: Record<string, string | number>;
}

export interface MetricsSummary {
  count: number;
  successCount: number;
  errorCount: number;
  avgDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  p95DurationMs: number;
}

const MAX_SAMPLES = 500;
const DEFAULT_MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5MB

class MetricsRegistry {
  private routeMetrics: Map<string, LatencyMetric[]> = new Map();
  private agentMetrics: Map<string, LatencyMetric[]> = new Map();

  /**
   * Record HTTP Route Execution Latency
   */
  public recordRouteLatency(
    route: string,
    method: string,
    statusCode: number,
    durationMs: number
  ): void {
    const key = `${method.toUpperCase()} ${route}`;
    const samples = this.routeMetrics.get(key) || [];

    if (samples.length >= MAX_SAMPLES) {
      samples.shift(); // Evict oldest sample to maintain fixed ring buffer
    }

    samples.push({
      name: key,
      durationMs,
      timestamp: Date.now(),
      success: statusCode >= 200 && statusCode < 400,
      metadata: { statusCode }
    });

    this.routeMetrics.set(key, samples);
  }

  /**
   * Record Multi-Agent Reasoning Latency
   */
  public recordAgentLatency(
    agentName: string,
    durationMs: number,
    success: boolean = true,
    metadata?: Record<string, string | number>
  ): void {
    const samples = this.agentMetrics.get(agentName) || [];

    if (samples.length >= MAX_SAMPLES) {
      samples.shift();
    }

    samples.push({
      name: agentName,
      durationMs,
      timestamp: Date.now(),
      success,
      metadata
    });

    this.agentMetrics.set(agentName, samples);
  }

  /**
   * Get Statistical Summary for a given Agent or Route
   */
  public getSummary(category: 'route' | 'agent', name: string): MetricsSummary | null {
    const map = category === 'route' ? this.routeMetrics : this.agentMetrics;
    const samples = map.get(name);

    if (!samples || samples.length === 0) return null;

    const durations = samples.map(s => s.durationMs).sort((a, b) => a - b);
    const count = samples.length;
    const errorCount = samples.filter(s => !s.success).length;
    const sum = durations.reduce((acc, val) => acc + val, 0);

    const p95Index = Math.min(Math.floor(count * 0.95), count - 1);

    return {
      count,
      successCount: count - errorCount,
      errorCount,
      avgDurationMs: Math.round((sum / count) * 100) / 100,
      minDurationMs: durations[0],
      maxDurationMs: durations[count - 1],
      p95DurationMs: durations[p95Index]
    };
  }

  /**
   * Get all tracked agents summary
   */
  public getAllAgentSummaries(): Record<string, MetricsSummary> {
    const result: Record<string, MetricsSummary> = {};
    for (const agentName of this.agentMetrics.keys()) {
      const summary = this.getSummary('agent', agentName);
      if (summary) result[agentName] = summary;
    }
    return result;
  }

  /**
   * Dedicated Production Telemetry Counters (Zero PII)
   */
  private ocrTelemetry = {
    total: 0,
    success: 0,
    failure: 0,
    durations: [] as number[]
  };

  private aiTrustTelemetry = {
    evaluatedCount: 0,
    hallucinationRejections: 0,
    trustScoreSum: 0
  };

  private legalRetrievalTelemetry = {
    queries: 0,
    matchedSources: 0,
    unmatchedQueries: 0
  };

  public recordOcrProcessing(durationMs: number, success: boolean): void {
    this.ocrTelemetry.total++;
    if (success) {
      this.ocrTelemetry.success++;
    } else {
      this.ocrTelemetry.failure++;
    }
    if (this.ocrTelemetry.durations.length >= MAX_SAMPLES) {
      this.ocrTelemetry.durations.shift();
    }
    this.ocrTelemetry.durations.push(durationMs);
  }

  public recordAiTrustEvaluation(trustScore: number, rejectedHallucination: boolean): void {
    this.aiTrustTelemetry.evaluatedCount++;
    this.aiTrustTelemetry.trustScoreSum += trustScore;
    if (rejectedHallucination) {
      this.aiTrustTelemetry.hallucinationRejections++;
    }
  }

  public recordLegalRetrieval(sourcesFound: number): void {
    this.legalRetrievalTelemetry.queries++;
    if (sourcesFound > 0) {
      this.legalRetrievalTelemetry.matchedSources += sourcesFound;
    } else {
      this.legalRetrievalTelemetry.unmatchedQueries++;
    }
  }

  public getProductionTelemetry() {
    const ocrDurations = this.ocrTelemetry.durations;
    const avgOcrDurationMs = ocrDurations.length > 0
      ? Math.round(ocrDurations.reduce((a, b) => a + b, 0) / ocrDurations.length)
      : 0;

    const avgTrustScore = this.aiTrustTelemetry.evaluatedCount > 0
      ? Math.round((this.aiTrustTelemetry.trustScoreSum / this.aiTrustTelemetry.evaluatedCount) * 10) / 10
      : 0;

    return {
      ocr: {
        total: this.ocrTelemetry.total,
        successRate: this.ocrTelemetry.total > 0
          ? Math.round((this.ocrTelemetry.success / this.ocrTelemetry.total) * 100) / 100
          : 0,
        failureRate: this.ocrTelemetry.total > 0
          ? Math.round((this.ocrTelemetry.failure / this.ocrTelemetry.total) * 100) / 100
          : 0,
        avgProcessingTimeMs: avgOcrDurationMs
      },
      aiTrust: {
        evaluatedCount: this.aiTrustTelemetry.evaluatedCount,
        averageTrustScore: avgTrustScore,
        hallucinationRejections: this.aiTrustTelemetry.hallucinationRejections
      },
      legalRetrieval: {
        queries: this.legalRetrievalTelemetry.queries,
        retrievalSuccessRate: this.legalRetrievalTelemetry.queries > 0
          ? Math.round(((this.legalRetrievalTelemetry.queries - this.legalRetrievalTelemetry.unmatchedQueries) / this.legalRetrievalTelemetry.queries) * 100) / 100
          : 0,
        noSourceResponses: this.legalRetrievalTelemetry.unmatchedQueries
      }
    };
  }

  /**
   * Reset all collected samples (useful for isolated tests)
   */
  public reset(): void {
    this.routeMetrics.clear();
    this.agentMetrics.clear();
    this.ocrTelemetry = { total: 0, success: 0, failure: 0, durations: [] };
    this.aiTrustTelemetry = { evaluatedCount: 0, hallucinationRejections: 0, trustScoreSum: 0 };
    this.legalRetrievalTelemetry = { queries: 0, matchedSources: 0, unmatchedQueries: 0 };
  }

  /**
   * Payload Size Enforcement Guard
   * Prevents Denial-of-Service and memory exhaustion attacks from oversized JSON or multipart bodies.
   */
  public validatePayloadSize(
    data: unknown,
    maxBytes: number = DEFAULT_MAX_PAYLOAD_BYTES
  ): { valid: boolean; byteLength: number; limit: number } {
    let byteLength = 0;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data, 'utf-8');
    } else if (data instanceof Uint8Array || Buffer.isBuffer(data)) {
      byteLength = data.byteLength;
    } else if (data !== null && typeof data === 'object') {
      byteLength = Buffer.byteLength(JSON.stringify(data), 'utf-8');
    }

    return {
      valid: byteLength <= maxBytes,
      byteLength,
      limit: maxBytes
    };
  }
}

export const Metrics = new MetricsRegistry();
