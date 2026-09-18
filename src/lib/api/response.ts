import { NextResponse } from 'next/server';

export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: unknown;
}

export function apiSuccess<T>(data: T, status: number = 200, meta?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {})
    },
    { status }
  );
}

export function apiError(message: string, status: number = 400, code: string = 'BAD_REQUEST', details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {})
      }
    },
    { status }
  );
}
