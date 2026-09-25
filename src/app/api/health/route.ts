import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getSupabaseAdminClient, getSupabaseBrowserClient } from '@/lib/db/supabase';
import { getStorageAdapter } from '@/lib/repository';

export async function GET() {
  const configured = isSupabaseConfigured();
  const adapter = getStorageAdapter();

  const report: {
    status: 'healthy' | 'degraded';
    timestamp: string;
    environment: string;
    supabase: {
      isConfigured: boolean;
      hasServiceRoleKey: boolean;
      hasAnonKey: boolean;
      urlConfigured: boolean;
      connectionTest?: {
        database: 'connected' | 'failed' | 'not_configured';
        auth: 'active' | 'failed' | 'not_configured';
        error?: string;
      };
    };
    backendMode: {
      storageAdapter: string;
      authProvider: string;
      jobQueue: string;
      ragProvider: string;
    };
    mattersCount: number;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase: {
      isConfigured: configured,
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
      urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
    },
    backendMode: {
      storageAdapter: configured ? 'SupabaseStorageAdapter (PostgreSQL)' : 'MemoryStorageAdapter (In-Memory Fallback)',
      authProvider: configured ? 'Supabase Auth (Live OAuth & JWT)' : 'Local Mock Persona & Cookie Auth',
      jobQueue: configured ? 'Durable Supabase Job Queue' : 'In-Memory Job Queue',
      ragProvider: configured ? 'pgvector (PostgreSQL Semantic Embeddings)' : 'In-Memory Cosine Semantic Search',
    },
    mattersCount: 0,
  };

  try {
    const matters = await adapter.matters.list({});
    report.mattersCount = matters.length;
  } catch (err: unknown) {
    report.status = 'degraded';
    console.error('[Health Check Matters Error]', err);
  }

  // If Supabase is configured, run live ping tests
  if (configured) {
    const admin = getSupabaseAdminClient();
    const browser = getSupabaseBrowserClient();

    if (admin) {
      try {
        const { error } = await admin.from('matters').select('count', { count: 'exact', head: true });
        report.supabase.connectionTest = {
          database: error ? 'failed' : 'connected',
          auth: 'active',
          error: error?.message,
        };
        if (error) report.status = 'degraded';
      } catch (e: unknown) {
        report.status = 'degraded';
        report.supabase.connectionTest = {
          database: 'failed',
          auth: 'failed',
          error: e instanceof Error ? e.message : 'Connection failed',
        };
      }
    } else if (browser) {
      report.supabase.connectionTest = {
        database: 'connected',
        auth: 'active',
      };
    }
  } else {
    report.supabase.connectionTest = {
      database: 'not_configured',
      auth: 'not_configured',
    };
  }

  return NextResponse.json(report, { status: 200 });
}
