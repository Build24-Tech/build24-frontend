/**
 * Health Check API Endpoints
 * Provides health, readiness, and liveness checks for the Knowledge Hub
 */

import { handleHealthCheck } from '@/lib/health-check';

export async function GET() {
  return await handleHealthCheck();
}

export const dynamic = 'force-dynamic';
