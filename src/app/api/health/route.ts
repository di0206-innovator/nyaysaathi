import { apiSuccess } from '@/lib/api/response';

export async function GET() {
  return apiSuccess({
    status: 'healthy',
    application: 'NyaySaathi',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'api_server'
  });
}
