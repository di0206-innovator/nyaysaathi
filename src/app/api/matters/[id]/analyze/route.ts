import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/db/mock-db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reanalyzed = await MockDB.reanalyzeMatter(id);

    if (!reanalyzed) {
      return NextResponse.json(
        { success: false, error: 'Matter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Matter re-analyzed across 9 internal agents successfully',
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
