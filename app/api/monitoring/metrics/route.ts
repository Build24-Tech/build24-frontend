/**
 * Prometheus Metrics Endpoint
 * Exposes application metrics in Prometheus format
 */

import { NextRequest } from 'next/server';

// Simple metrics store (in production, use a proper metrics library like prom-client)
const metrics = {
  http_requests_total: new Map<string, number>(),
  http_request_duration_seconds: new Map<string, number[]>(),
  theory_views_total: 0,
  search_queries_total: 0,
  bookmark_actions_total: 0,
  premium_gate_interactions_total: 0,
  firestore_connection_status: 1,
  cdn_health_check_status: 1,
  backup_failures_total: 0
};

export async function GET(request: NextRequest) {
  try {
    // Generate Prometheus format metrics
    const prometheusMetrics = generatePrometheusMetrics();

    return new Response(prometheusMetrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new Response('Error generating metrics', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

function generatePrometheusMetrics(): string {
  const timestamp = Date.now();
  let output = '';

  // HTTP request metrics
  output += '# HELP http_requests_total Total number of HTTP requests\n';
  output += '# TYPE http_requests_total counter\n';
  for (const [key, value] of metrics.http_requests_total) {
    const [method, status] = key.split('_');
    output += `http_requests_total{method="${method}",status="${status}"} ${value} ${timestamp}\n`;
  }

  // HTTP request duration
  output += '# HELP http_request_duration_seconds HTTP request duration in seconds\n';
  output += '# TYPE http_request_duration_seconds histogram\n';
  for (const [key, durations] of metrics.http_request_duration_seconds) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length || 0;
    output += `http_request_duration_seconds{quantile="0.5"} ${avg} ${timestamp}\n`;
  }

  // Knowledge Hub specific metrics
  output += '# HELP theory_views_total Total number of theory views\n';
  output += '# TYPE theory_views_total counter\n';
  output += `theory_views_total ${metrics.theory_views_total} ${timestamp}\n`;

  output += '# HELP search_queries_total Total number of search queries\n';
  output += '# TYPE search_queries_total counter\n';
  output += `search_queries_total ${metrics.search_queries_total} ${timestamp}\n`;

  output += '# HELP bookmark_actions_total Total number of bookmark actions\n';
  output += '# TYPE bookmark_actions_total counter\n';
  output += `bookmark_actions_total ${metrics.bookmark_actions_total} ${timestamp}\n`;

  output += '# HELP premium_gate_interactions_total Total number of premium gate interactions\n';
  output += '# TYPE premium_gate_interactions_total counter\n';
  output += `premium_gate_interactions_total ${metrics.premium_gate_interactions_total} ${timestamp}\n`;

  // System health metrics
  output += '# HELP firestore_connection_status Firestore connection status (1=connected, 0=disconnected)\n';
  output += '# TYPE firestore_connection_status gauge\n';
  output += `firestore_connection_status ${metrics.firestore_connection_status} ${timestamp}\n`;

  output += '# HELP cdn_health_check_status CDN health check status (1=healthy, 0=unhealthy)\n';
  output += '# TYPE cdn_health_check_status gauge\n';
  output += `cdn_health_check_status ${metrics.cdn_health_check_status} ${timestamp}\n`;

  output += '# HELP backup_failures_total Total number of backup failures\n';
  output += '# TYPE backup_failures_total counter\n';
  output += `backup_failures_total ${metrics.backup_failures_total} ${timestamp}\n`;

  // Process metrics
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memUsage = process.memoryUsage();
    output += '# HELP process_resident_memory_bytes Resident memory size in bytes\n';
    output += '# TYPE process_resident_memory_bytes gauge\n';
    output += `process_resident_memory_bytes ${memUsage.rss} ${timestamp}\n`;

    output += '# HELP process_heap_bytes Process heap size in bytes\n';
    output += '# TYPE process_heap_bytes gauge\n';
    output += `process_heap_bytes ${memUsage.heapUsed} ${timestamp}\n`;
  }

  return output;
}

// Helper function to increment metrics (would be called from other parts of the app)
export function incrementMetric(metricName: string, labels?: Record<string, string>) {
  switch (metricName) {
    case 'http_requests_total':
      if (labels) {
        const key = `${labels.method}_${labels.status}`;
        metrics.http_requests_total.set(key, (metrics.http_requests_total.get(key) || 0) + 1);
      }
      break;
    case 'theory_views_total':
      metrics.theory_views_total++;
      break;
    case 'search_queries_total':
      metrics.search_queries_total++;
      break;
    case 'bookmark_actions_total':
      metrics.bookmark_actions_total++;
      break;
    case 'premium_gate_interactions_total':
      metrics.premium_gate_interactions_total++;
      break;
    case 'backup_failures_total':
      metrics.backup_failures_total++;
      break;
  }
}

export function setGaugeMetric(metricName: string, value: number) {
  switch (metricName) {
    case 'firestore_connection_status':
      metrics.firestore_connection_status = value;
      break;
    case 'cdn_health_check_status':
      metrics.cdn_health_check_status = value;
      break;
  }
}

export const runtime = 'nodejs';
