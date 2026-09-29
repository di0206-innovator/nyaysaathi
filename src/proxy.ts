import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy layer for defense-in-depth security, method restriction, and CORS handling.
 */
export function proxy(req: NextRequest) {
  const method = req.method.toUpperCase();

  // 1. Reject dangerous / unpermitted HTTP methods
  if (['TRACE', 'TRACK', 'CONNECT'].includes(method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const isApi = pathname.startsWith('/api');

  // Allowed origins configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nyaysaathi.in';
  const allowedOrigins = [
    appUrl.replace(/\/$/, ''),
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];

  const isAllowedOrigin = Boolean(origin && allowedOrigins.includes(origin.replace(/\/$/, '')));

  // 2. Handle CORS Preflight for API routes
  if (isApi && method === 'OPTIONS') {
    const preflightHeaders = new Headers();
    if (isAllowedOrigin && origin) {
      preflightHeaders.set('Access-Control-Allow-Origin', origin);
      preflightHeaders.set('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      preflightHeaders.set('Access-Control-Allow-Origin', appUrl);
    }
    preflightHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    preflightHeaders.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Prefer, X-Idempotency-Key'
    );
    preflightHeaders.set('Access-Control-Max-Age', '86400');
    return new NextResponse(null, { status: 204, headers: preflightHeaders });
  }

  // 3. Process normal request
  const response = NextResponse.next();

  // Apply CORS headers on API responses
  if (isApi && isAllowedOrigin && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Defense-in-depth security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (.png, .jpg, .jpeg, .svg, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
