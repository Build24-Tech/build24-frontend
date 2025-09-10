#!/bin/bash

# Setup Production Monitoring for Knowledge Hub
# This script configures monitoring, alerting, and logging infrastructure

set -e

echo "🔧 Setting up Knowledge Hub production monitoring..."

# Configuration
MONITORING_STACK=${MONITORING_STACK:-"prometheus-grafana"}
ALERT_EMAIL=${ALERT_EMAIL:-"admin@build24.dev"}
SLACK_WEBHOOK=${SLACK_WEBHOOK:-""}

# Create monitoring configuration directory
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/alertmanager

echo "📊 Creating Prometheus configuration..."

# Prometheus configuration
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "knowledge_hub_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'knowledge-hub'
    static_configs:
      - targets: ['build24-knowledge-hub:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
EOF

# Prometheus alerting rules
cat > monitoring/prometheus/knowledge_hub_rules.yml << 'EOF'
groups:
  - name: knowledge_hub_alerts
    rules:
      - alert: KnowledgeHubDown
        expr: up{job="knowledge-hub"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Knowledge Hub is down"
          description: "Knowledge Hub has been down for more than 1 minute."

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second."

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "95th percentile response time is {{ $value }} seconds."

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%."

      - alert: FirestoreConnectionFailed
        expr: firestore_connection_status == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Firestore connection failed"
          description: "Unable to connect to Firestore database."

      - alert: CDNHealthCheckFailed
        expr: cdn_health_check_status == 0
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "CDN health check failed"
          description: "CDN is not responding to health checks."

      - alert: BackupFailed
        expr: increase(backup_failures_total[24h]) > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Backup failed"
          description: "Knowledge Hub backup has failed in the last 24 hours."
EOF

echo "🚨 Creating Alertmanager configuration..."

# Alertmanager configuration
cat > monitoring/alertmanager/alertmanager.yml << EOF
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@build24.dev'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    email_configs:
      - to: '$ALERT_EMAIL'
        subject: 'Knowledge Hub Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
EOF

# Add Slack webhook if provided
if [ -n "$SLACK_WEBHOOK" ]; then
cat >> monitoring/alertmanager/alertmanager.yml << EOF
    slack_configs:
      - api_url: '$SLACK_WEBHOOK'
        channel: '#alerts'
        title: 'Knowledge Hub Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}: {{ .Annotations.description }}{{ end }}'
EOF
fi

echo "📈 Creating Grafana configuration..."

# Grafana datasource configuration
cat > monitoring/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Grafana dashboard provisioning
cat > monitoring/grafana/provisioning/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

# Knowledge Hub Grafana dashboard
cat > monitoring/grafana/dashboards/knowledge-hub.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "Knowledge Hub Monitoring",
    "tags": ["knowledge-hub"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ]
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          },
          {
            "expr": "rate(http_requests_total{status=~\"4..\"}[5m])",
            "legendFormat": "4xx errors"
          }
        ],
        "yAxes": [
          {
            "label": "Errors/sec"
          }
        ]
      },
      {
        "id": 4,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory Usage %"
          }
        ],
        "yAxes": [
          {
            "label": "Percentage",
            "max": 100
          }
        ]
      },
      {
        "id": 5,
        "title": "Theory Views",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(theory_views_total[5m])",
            "legendFormat": "Theory views/sec"
          }
        ]
      },
      {
        "id": 6,
        "title": "Search Queries",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(search_queries_total[5m])",
            "legendFormat": "Search queries/sec"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
EOF

echo "🐳 Creating Docker Compose for monitoring stack..."

# Docker Compose for monitoring
cat > monitoring/docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager:/etc/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
EOF

echo "📋 Creating monitoring startup script..."

# Monitoring startup script
cat > monitoring/start-monitoring.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Knowledge Hub monitoring stack..."

# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check Prometheus
if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo "✅ Prometheus is healthy"
else
    echo "❌ Prometheus health check failed"
fi

# Check Grafana
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Grafana is healthy"
else
    echo "❌ Grafana health check failed"
fi

# Check Alertmanager
if curl -f http://localhost:9093/-/healthy > /dev/null 2>&1; then
    echo "✅ Alertmanager is healthy"
else
    echo "❌ Alertmanager health check failed"
fi

echo ""
echo "🎉 Monitoring stack started successfully!"
echo "📊 Prometheus: http://localhost:9090"
echo "📈 Grafana: http://localhost:3001 (admin/admin)"
echo "🚨 Alertmanager: http://localhost:9093"
echo ""
echo "Import the Knowledge Hub dashboard in Grafana for detailed metrics."
EOF

chmod +x monitoring/start-monitoring.sh

echo "📝 Creating monitoring documentation..."

# Monitoring documentation
cat > monitoring/README.md << 'EOF'
# Knowledge Hub Monitoring

This directory contains the monitoring infrastructure for the Knowledge Hub production deployment.

## Components

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and notification
- **Node Exporter**: System metrics
- **cAdvisor**: Container metrics

## Quick Start

1. Start the monitoring stack:
   ```bash
   ./start-monitoring.sh
   ```

2. Access the services:
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)
   - Alertmanager: http://localhost:9093

## Configuration

### Alerts

Alerts are configured in `prometheus/knowledge_hub_rules.yml`. Key alerts include:

- Application downtime
- High error rates
- High response times
- Memory usage
- Database connectivity
- CDN health
- Backup failures

### Dashboards

The Knowledge Hub dashboard shows:

- Request rates and response times
- Error rates
- System resource usage
- Application-specific metrics (theory views, searches)

### Notifications

Configure email and Slack notifications in `alertmanager/alertmanager.yml`.

## Metrics

The Knowledge Hub application exposes metrics at `/api/metrics` including:

- HTTP request metrics
- Theory view counts
- Search query counts
- User progress metrics
- Bookmark activity
- Premium gate interactions

## Maintenance

- Prometheus data retention: 200 hours
- Regular backup of Grafana dashboards
- Monitor disk usage for metrics storage
- Update alert thresholds based on usage patterns
EOF

echo ""
echo "🎉 Monitoring setup completed successfully!"
echo ""
echo "📁 Created monitoring configuration in: ./monitoring/"
echo "🚀 Start monitoring with: ./monitoring/start-monitoring.sh"
echo "📊 Prometheus will be available at: http://localhost:9090"
echo "📈 Grafana will be available at: http://localhost:3001"
echo "🚨 Alertmanager will be available at: http://localhost:9093"
echo ""
echo "Next steps:"
echo "1. Review and customize alert thresholds"
echo "2. Configure notification channels"
echo "3. Import additional dashboards as needed"
echo "4. Set up log aggregation (ELK stack, etc.)"
