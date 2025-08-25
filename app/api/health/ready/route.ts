/**
 * Kubernetes Readiness Probe Endpoint
 * Returns 200 if the application is ready to serve traffic
 */

import { handleReadinessCheck } from '@/lib/health-check';

export async function GET() {
  return await handleReadinessCheck();
}

export const runtime = 'edge';
