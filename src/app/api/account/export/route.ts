import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { getMatterService } from '@/lib/repository';
import { apiSuccess, apiError } from '@/lib/api/response';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { SecurityAuditLogger } from '@/lib/observability/audit-logger';

export async function GET(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser(req);
    if (!user) {
      return apiError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const rateLimitRes = await enforceRateLimit(req, 'account_export', 5, 60, user.id);
    if (rateLimitRes) return rateLimitRes;

    const service = getMatterService(user.token);
    const userMatters = await service.listMatters({ userId: user.id });

    const exportData = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        formatVersion: '1.0.0',
        system: 'NyaySaathi Legal Action Navigator',
        jurisdiction: 'Republic of India',
        complianceNotice: 'Exported under India Digital Personal Data Protection Act (DPDP Act 2023) provisions.'
      },
      userProfile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      matters: userMatters.map(m => ({
        id: m.id,
        title: m.title,
        category: m.category,
        subCategory: m.subCategory,
        locationCity: m.locationCity,
        locationState: m.locationState,
        status: m.status,
        claimAmount: m.claimAmount,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        userStory: m.userStory,
        parties: m.parties,
        facts: m.facts,
        timelineEvents: m.timelineEvents,
        actionPlan: m.actionPlan,
        documents: m.documents.map(d => ({
          id: d.id,
          title: d.title,
          type: d.type
        })),
        drafts: m.drafts
      }))
    };

    SecurityAuditLogger.log({
      action: 'data_export_requested',
      userId: user.id,
      resourceType: 'user_account',
      status: 'success',
      metadata: { matterCount: userMatters.length }
    });

    return apiSuccess(exportData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to export account data';
    return apiError(message, 500, 'EXPORT_FAILED');
  }
}
