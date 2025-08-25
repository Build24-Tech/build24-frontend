/**
 * Health Check System for Knowledge Hub
 * Monitors system health and provides status endpoints
 */

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      responseTime?: number;
    };
  };
  version: string;
  uptime: number;
}

interface ServiceCheck {
  name: string;
  check: () => Promise<{ status: 'pass' | 'fail' | 'warn'; message?: string; responseTime?: number }>;
  timeout: number;
}

class HealthCheckService {
  private startTime: number;
  private version: string;
  private checks: ServiceCheck[] = [];

  constructor() {
    this.startTime = Date.now();
    this.version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    this.setupDefaultChecks();
  }

  private setupDefaultChecks(): void {
    // Firebase connection check
    this.addCheck({
      name: 'firebase',
      timeout: 5000,
      check: async () => {
        try {
          const startTime = Date.now();

          // Try to access Firebase Auth
          const { auth } = await import('@/lib/firebase');
          if (!auth) {
            return { status: 'fail', message: 'Firebase Auth not initialized' };
          }

          const responseTime = Date.now() - startTime;
          return { status: 'pass', responseTime };
        } catch (error) {
          return {
            status: 'fail',
            message: error instanceof Error ? error.message : 'Firebase connection failed'
          };
        }
      }
    });

    // Firestore connection check
    this.addCheck({
      name: 'firestore',
      timeout: 5000,
      check: async () => {
        try {
          const startTime = Date.now();

          const { db } = await import('@/lib/firebase');
          const { doc, getDoc } = await import('firebase/firestore');

          // Try to read a test document
          const testDoc = doc(db, 'health', 'check');
          await getDoc(testDoc);

          const responseTime = Date.now() - startTime;
          return { status: 'pass', responseTime };
        } catch (error) {
          return {
            status: 'fail',
            message: error instanceof Error ? error.message : 'Firestore connection failed'
          };
        }
      }
    });

    // Theory content availability check
    this.addCheck({
      name: 'theory-content',
      timeout: 3000,
      check: async () => {
        try {
          const startTime = Date.now();

          // Check if theory content is accessible
          const response = await fetch('/content/theories/anchoring-bias.md', {
            method: 'HEAD',
            cache: 'no-cache'
          });

          const responseTime = Date.now() - startTime;

          if (response.ok) {
            return { status: 'pass', responseTime };
          } else {
            return {
              status: 'warn',
              message: `Theory content returned ${response.status}`,
              responseTime
            };
          }
        } catch (error) {
          return {
            status: 'fail',
            message: 'Theory content not accessible'
          };
        }
      }
    });

    // CDN health check
    this.addCheck({
      name: 'cdn',
      timeout: 5000,
      check: async () => {
        try {
          const startTime = Date.now();
          const cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL;

          if (!cdnBaseUrl) {
            return { status: 'warn', message: 'CDN not configured' };
          }

          const response = await fetch(`${cdnBaseUrl}/health-check.txt`, {
            method: 'HEAD',
            cache: 'no-cache'
          });

          const responseTime = Date.now() - startTime;

          if (response.ok) {
            return { status: 'pass', responseTime };
          } else {
            return {
              status: 'warn',
              message: `CDN returned ${response.status}`,
              responseTime
            };
          }
        } catch (error) {
          return {
            status: 'warn',
            message: 'CDN health check failed'
          };
        }
      }
    });

    // Memory usage check
    this.addCheck({
      name: 'memory',
      timeout: 1000,
      check: async () => {
        try {
          if (typeof process !== 'undefined' && process.memoryUsage) {
            const memUsage = process.memoryUsage();
            const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
            const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

            // Warn if heap usage is over 80%
            const usagePercent = (heapUsedMB / heapTotalMB) * 100;

            if (usagePercent > 90) {
              return {
                status: 'fail',
                message: `High memory usage: ${heapUsedMB}MB (${usagePercent.toFixed(1)}%)`
              };
            } else if (usagePercent > 80) {
              return {
                status: 'warn',
                message: `Elevated memory usage: ${heapUsedMB}MB (${usagePercent.toFixed(1)}%)`
              };
            } else {
              return {
                status: 'pass',
                message: `Memory usage: ${heapUsedMB}MB (${usagePercent.toFixed(1)}%)`
              };
            }
          } else {
            return { status: 'warn', message: 'Memory usage not available' };
          }
        } catch (error) {
          return { status: 'warn', message: 'Memory check failed' };
        }
      }
    });
  }

  addCheck(check: ServiceCheck): void {
    this.checks.push(check);
  }

  async runHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;
    const checks: HealthCheckResult['checks'] = {};

    // Run all checks in parallel with timeouts
    const checkPromises = this.checks.map(async (check) => {
      try {
        const timeoutPromise = new Promise<{ status: 'fail'; message: string }>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), check.timeout);
        });

        const result = await Promise.race([check.check(), timeoutPromise]);
        checks[check.name] = result;
      } catch (error) {
        checks[check.name] = {
          status: 'fail',
          message: error instanceof Error ? error.message : 'Check failed'
        };
      }
    });

    await Promise.allSettled(checkPromises);

    // Determine overall status
    const statuses = Object.values(checks).map(check => check.status);
    let overallStatus: HealthCheckResult['status'];

    if (statuses.includes('fail')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('warn')) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp,
      checks,
      version: this.version,
      uptime
    };
  }

  async getReadinessCheck(): Promise<{ ready: boolean; message?: string }> {
    try {
      // Check critical services only
      const criticalChecks = ['firebase', 'firestore'];
      const results = await this.runHealthCheck();

      const criticalFailures = criticalChecks.filter(
        checkName => results.checks[checkName]?.status === 'fail'
      );

      if (criticalFailures.length > 0) {
        return {
          ready: false,
          message: `Critical services failing: ${criticalFailures.join(', ')}`
        };
      }

      return { ready: true };
    } catch (error) {
      return {
        ready: false,
        message: error instanceof Error ? error.message : 'Readiness check failed'
      };
    }
  }

  async getLivenessCheck(): Promise<{ alive: boolean; message?: string }> {
    try {
      // Basic liveness check - just verify the service is responding
      return { alive: true };
    } catch (error) {
      return {
        alive: false,
        message: error instanceof Error ? error.message : 'Liveness check failed'
      };
    }
  }
}

// Global health check service
export const healthCheckService = new HealthCheckService();

// Convenience functions for Next.js API routes
export async function handleHealthCheck(): Promise<Response> {
  try {
    const result = await healthCheckService.runHealthCheck();
    const statusCode = result.status === 'healthy' ? 200 :
      result.status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(result, null, 2), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function handleReadinessCheck(): Promise<Response> {
  try {
    const result = await healthCheckService.getReadinessCheck();

    return new Response(JSON.stringify(result), {
      status: result.ready ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ready: false,
      error: error instanceof Error ? error.message : 'Readiness check failed'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function handleLivenessCheck(): Promise<Response> {
  try {
    const result = await healthCheckService.getLivenessCheck();

    return new Response(JSON.stringify(result), {
      status: result.alive ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      alive: false,
      error: error instanceof Error ? error.message : 'Liveness check failed'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export default healthCheckService;
