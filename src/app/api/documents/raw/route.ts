import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return new NextResponse('Path parameter is required', { status: 400 });
  }

  // Return a synthetic development document stream / text
  return new NextResponse(`Document Preview: ${decodeURIComponent(path)}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'inline'
    }
  });
}
