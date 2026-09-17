import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/db/mock-db';
import { ReanalysisTrigger } from '@/lib/agents/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let trigger: ReanalysisTrigger | undefined;

    try {
      const body = await req.json();
      if (body && body.trigger) {
        trigger = body.trigger as ReanalysisTrigger;
      }
    } catch {
      // Body may be empty, default to full
      trigger = 'full';
    }

    const reanalyzed = await MockDB.reanalyzeMatter(id, trigger);

    if (!reanalyzed) {
      return NextResponse.json(
        { success: false, error: 'Matter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Matter re-analyzed successfully (Trigger: ${trigger || 'full'})`,
      data: reanalyzed
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze matter';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
