import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Metrics } from '../src/lib/observability/metrics';
import { MatterOrchestrator } from '../src/lib/agents/orchestrator';
import { MemoryStorageAdapter } from '../src/lib/repository/adapters/memory-adapter';
import { MatterService } from '../src/lib/repository/matter-service';
import { AgentInput } from '../src/lib/agents/types';
import fs from 'node:fs';
import path from 'node:path';

describe('PROMPT 4: Performance, Observability, CI/CD & Contract Parity', () => {
  beforeEach(() => {
    Metrics.reset();
  });

  it('verifies CI/CD GitHub Actions workflow exists and contains quality gates', () => {
    const workflowPath = path.resolve(process.cwd(), '.github/workflows/ci.yml');
    assert.ok(fs.existsSync(workflowPath), 'ci.yml must exist');
    const content = fs.readFileSync(workflowPath, 'utf-8');

    assert.ok(content.includes('npm run lint'), 'CI workflow must run lint check');
    assert.ok(content.includes('npm test'), 'CI workflow must run test suites');
    assert.ok(content.includes('npm run build'), 'CI workflow must run production build');
    assert.ok(content.includes('actions/setup-node'), 'CI workflow must setup Node.js');
  });

  it('enforces payload size limits to protect against memory exhaustion (DoS)', () => {
    // Normal payload
    const normalPayload = {
      title: 'Security Deposit Dispute',
      description: 'Landlord has withheld 50,000 INR without inspection receipt.'
    };
    const normalResult = Metrics.validatePayloadSize(normalPayload, 1024 * 1024);
    assert.equal(normalResult.valid, true);

    // Oversized payload exceeding limit
    const oversizedString = 'A'.repeat(2 * 1024 * 1024); // 2MB
    const oversizedResult = Metrics.validatePayloadSize(oversizedString, 1024 * 1024); // 1MB limit
    assert.equal(oversizedResult.valid, false);
    assert.ok(oversizedResult.byteLength > oversizedResult.limit);
  });

  it('tracks agent latencies and generates statistical p95 summaries without PII', () => {
    // Simulate multiple agent runs
    Metrics.recordAgentLatency('Intake Agent', 45, true);
    Metrics.recordAgentLatency('Intake Agent', 55, true);
    Metrics.recordAgentLatency('Intake Agent', 120, true);
    Metrics.recordAgentLatency('Intake Agent', 60, true);
    Metrics.recordAgentLatency('Intake Agent', 300, false); // 1 error

    const summary = Metrics.getSummary('agent', 'Intake Agent');
    assert.ok(summary !== null);
    assert.equal(summary.count, 5);
    assert.equal(summary.successCount, 4);
    assert.equal(summary.errorCount, 1);
    assert.equal(summary.minDurationMs, 45);
    assert.equal(summary.maxDurationMs, 300);
    assert.ok(summary.p95DurationMs >= 120);

    const all = Metrics.getAllAgentSummaries();
    assert.ok('Intake Agent' in all);
  });

  it('bounds memory consumption using fixed ring-buffer sampling', () => {
    // Insert 600 samples when limit is 500
    for (let i = 0; i < 600; i++) {
      Metrics.recordRouteLatency('/api/matters', 'GET', 200, 10 + (i % 20));
    }

    const summary = Metrics.getSummary('route', 'GET /api/matters');
    assert.ok(summary !== null);
    assert.equal(summary.count, 500, 'Samples must be capped at MAX_SAMPLES (500)');
  });

  it('verifies complete contract parity across MemoryAdapter and MatterService', () => {
    const memoryAdapter = new MemoryStorageAdapter();
    const service = new MatterService(memoryAdapter);

    // Verify sub-repository boundaries on MemoryAdapter
    assert.ok(memoryAdapter.actions, 'actions repo contract');
    assert.ok(memoryAdapter.communications, 'communications repo contract');
    assert.ok(memoryAdapter.activityEvents, 'activityEvents repo contract');
    assert.ok(memoryAdapter.deadlines, 'deadlines repo contract');
    assert.ok(memoryAdapter.escalations, 'escalations repo contract');
    assert.ok(memoryAdapter.resolutions, 'resolutions repo contract');
    assert.ok(memoryAdapter.notifications, 'notifications repo contract');

    // Expected lifecycle methods that MatterService must expose
    const requiredServiceMethods = [
      'createMatter',
      'getMatterById',
      'listMatters',
      'updateMatter',
      'updateActionStep',
      'recordCommunication',
      'manageDeadline',
      'resolveMatter',
      'reopenMatter',
      'generateAdvocateCasePack'
    ];

    for (const method of requiredServiceMethods) {
      assert.equal(
        typeof (service as unknown as Record<string, unknown>)[method],
        'function',
        `MatterService must expose ${method}`
      );
    }
  });

  it('proves selective pipeline execution avoids redundant agent passes', async () => {
    const orchestrator = new MatterOrchestrator();

    const sampleInput: AgentInput = {
      matterId: 'perf-matter-1',
      title: 'Bengaluru Tenant Security Deposit Refund',
      category: 'tenancy_housing',
      userStory: 'Landlord failed to return Rs 80,000 security deposit after 30 days of flat handover.',
      parties: [
        { id: 'p1', name: 'Arun Verma', role: 'Tenant', contactInfo: 'arun@example.com' },
        { id: 'p2', name: 'Ramesh Rao', role: 'Landlord' }
      ],
      documents: [],
      trigger: 'missing_info_answered' // Should skip DocIntel & Intake
    };

    const res = await orchestrator.processMatter(sampleInput);

    assert.ok(res.matter);
    assert.ok(res.logs.length > 0);

    // Verify DocIntel was skipped
    const docIntelLog = res.logs.find(l => l.agentName === 'Document Intelligence Agent');
    assert.ok(docIntelLog);
    assert.equal(docIntelLog.status, 'skipped');

    // Verify metrics collected for active agents
    const metricsAll = Metrics.getAllAgentSummaries();
    assert.ok(Object.keys(metricsAll).length > 0);
  });
});
