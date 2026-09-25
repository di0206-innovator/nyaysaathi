import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/matters';

  if (code && isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data?.session) {
          const response = NextResponse.redirect(new URL(next, request.url));
          
          // Set server-side session cookies so API routes can authenticate user
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: data.session.expires_in || 60 * 60 * 24 * 7,
          });

          return response;
        } else {
          console.error('[OAuth Callback Error] Code exchange failed:', error?.message);
        }
      } catch (err) {
        console.error('[OAuth Callback Exception]:', err);
      }
    }
  }

  // Fallback redirect if no code or exchange failed
  return NextResponse.redirect(new URL(next, request.url));
}
