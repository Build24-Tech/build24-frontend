/**
 * Kubernetes Liveness Probe Endpoint
 * Returns 200 if the application is alive and responding
 */

import { handleLivenessCheck } from '@/lib/health-check';

export async function GET() {
  return await handleLivenessCheck();
}

export const runtime = 'edge';
