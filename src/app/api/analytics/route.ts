import { NextResponse } from 'next/server';
import { getMatterService } from '@/lib/repository';

export async function GET() {
  try {
    const matterService = getMatterService();
    const [funnel, feedbackMetrics, allMatters] = await Promise.all([
      matterService.calculateFunnelMetrics(),
      matterService.getPilotFeedbackMetrics(),
      matterService.getAdapter().matters.list()
    ]);

    // Calculate acquisition source breakdown
    const sourceBreakdown: Record<string, number> = {};
    for (const m of allMatters) {
      const src = m.acquisitionSource || 'direct';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    }

    // Financial totals
    const totalDisputed = allMatters.reduce((acc, m) => acc + (m.claimAmount || 0), 0);
    const resolvedMatters = allMatters.filter(m => m.resolution && !m.resolution.isReopened);
    const totalRecovered = resolvedMatters.reduce((acc, m) => acc + (m.resolution?.amountRecovered || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        funnel,
        feedback: feedbackMetrics,
        acquisition: sourceBreakdown,
        financial: {
          totalDisputed,
          totalRecovered,
          resolvedCount: resolvedMatters.length,
          sampleSize: allMatters.length
        }
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate analytics';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
