import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/db/mock-db';

export async function GET() {
  try {
    const matters = await MockDB.getAllMatters();
    return NextResponse.json({ success: true, count: matters.length, data: matters });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch matters';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.title || !body.category || !body.userStory) {
      return NextResponse.json(
        { success: false, error: 'Title, category, and user story narrative are required.' },
        { status: 400 }
      );
    }

    const created = await MockDB.createMatter({
      title: body.title,
      category: body.category,
      userStory: body.userStory,
      claimAmount: body.claimAmount ? Number(body.claimAmount) : undefined,
      locationCity: body.locationCity,
      locationState: body.locationState,
      parties: body.parties || [],
      documents: body.documents || []
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create matter';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
