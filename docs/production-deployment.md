# Knowledge Hub Production Deployment Guide

This guide covers the complete production deployment process for the Knowledge Hub feature, including infrastructure setup, monitoring, and backup procedures.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- AWS CLI (for CDN and backups)
- Google Cloud CLI (for Firebase/Firestore)
- Domain name and SSL certificates

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# CDN Configuration
NEXT_PUBLIC_CDN_BASE_URL=https://your-cdn-domain.com

# Monitoring and Logging
NEXT_PUBLIC_LOGGING_ENDPOINT=https://your-logging-service.com/api/logs
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-service.com/api/events
NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT=https://your-error-service.com/api/errors
NEXT_PUBLIC_PERFORMANCE_ENDPOINT=https://your-performance-service.com/api/metrics

# Backup Configuration
BACKUP_BUCKET=build24-knowledge-hub-backups
CDN_BUCKET=build24-knowledge-hub-assets
FIREBASE_PROJECT_ID=your_project_id

# AWS Credentials (for backups and CDN)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1

# Google Cloud Credentials (for Firestore backups)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
ALERT_EMAIL=admin@your-domain.com
```

## Deployment Steps

### 1. Build and Deploy Application

#### Option A: Automated Deployment Script

```bash
# Use the automated deployment script
./scripts/deploy-production.sh [docker|k8s|vercel|netlify]

# Examples:
./scripts/deploy-production.sh docker     # Deploy with Docker
./scripts/deploy-production.sh k8s       # Deploy with Kubernetes
./scripts/deploy-production.sh vercel    # Deploy with Vercel
./scripts/deploy-production.sh netlify   # Deploy with Netlify
```

#### Option B: Manual Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# or use CLI:
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# ... repeat for all environment variables
```

#### Option C: Manual Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the application
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=out

# Set environment variables in Netlify dashboard
```

#### Option D: Docker Deployment

```bash
# Build Docker image
docker build -f docker/Dockerfile -t build24-knowledge-hub .

# Run with Docker Compose
docker-compose -f docker/docker-compose.yml up -d

# Or with monitoring stack
docker-compose -f docker/docker-compose.yml --profile monitoring up -d
```

#### Option E: Kubernetes Deployment

```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/knowledge-hub-deployment.yaml

# Create secrets (replace with actual values)
kubectl create secret generic firebase-secrets \
  --from-literal=api-key=your_api_key \
  --from-literal=auth-domain=your_auth_domain \
  --from-literal=project-id=your_project_id \
  --from-literal=storage-bucket=your_storage_bucket \
  --from-literal=messaging-sender-id=your_sender_id \
  --from-literal=app-id=your_app_id \
  -n build24

# Monitor deployment
kubectl rollout status deployment/knowledge-hub -n build24
```

### 2. Set Up CDN for Media Assets

```bash
# Deploy assets to CDN
./scripts/deploy-assets.sh

# Set CDN_BUCKET and other AWS variables first
export CDN_BUCKET=build24-knowledge-hub-assets
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# Run the deployment
./scripts/deploy-assets.sh
```

### 3. Configure Monitoring

```bash
# Set up monitoring infrastructure
./scripts/setup-monitoring.sh

# Start monitoring services
cd monitoring
./start-monitoring.sh
```

### 4. Set Up Automated Backups

```bash
# Test backup system
./scripts/backup-user-data.sh

# Set up cron job for automated backups
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-user-data.sh >> /var/log/knowledge-hub-backup.log 2>&1
```

### 5. Configure Health Checks

The application provides several health check endpoints:

- `/api/health` - Overall application health
- `/api/health/ready` - Readiness probe (for Kubernetes)
- `/api/health/live` - Liveness probe (for Kubernetes)

Configure your load balancer or orchestration system to use these endpoints.

## Post-Deployment Verification

### 1. Application Health

```bash
# Check application is running
curl https://your-domain.com/api/health

# Verify Knowledge Hub pages load
curl https://your-domain.com/dashboard/knowledge-hub

# Test theory content loading
curl https://your-domain.com/content/theories/anchoring-bias.md
```

### 2. CDN Verification

```bash
# Test CDN health
curl https://your-cdn-domain.com/health-check.txt

# Verify theory assets load from CDN
curl https://your-cdn-domain.com/content/theories/anchoring-bias.md
```

### 3. Database Connectivity

```bash
# Test Firestore connection through health check
curl https://your-domain.com/api/health | jq '.checks.firestore'
```

### 4. Monitoring Setup

- Access Grafana: `http://your-monitoring-server:3001`
- Login with admin/admin
- Verify Knowledge Hub dashboard shows data
- Test alert notifications

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Application Metrics**
   - Request rate and response times
   - Error rates (4xx, 5xx)
   - Theory view counts
   - Search query performance
   - User engagement metrics

2. **Infrastructure Metrics**
   - CPU and memory usage
   - Disk space
   - Network I/O
   - Container health

3. **Database Metrics**
   - Firestore connection status
   - Read/write operations
   - Query performance

4. **CDN Metrics**
   - Asset delivery performance
   - Cache hit rates
   - Geographic distribution

### Alert Thresholds

- **Critical Alerts**
  - Application downtime > 1 minute
  - Error rate > 10%
  - Database connection failures
  - Backup failures

- **Warning Alerts**
  - Response time > 2 seconds (95th percentile)
  - Memory usage > 80%
  - CDN health check failures

## Backup and Recovery

### Automated Backups

- **Schedule**: Daily at 2 AM UTC
- **Retention**: 90 days
- **Storage**: AWS S3 with cross-region replication
- **Encryption**: AES-256 encryption at rest

### Recovery Procedures

1. **Identify Backup to Restore**
   ```bash
   # List available backups
   aws s3 ls s3://build24-knowledge-hub-backups/compressed-backups/
   ```

2. **Restore from Backup**
   ```bash
   # Restore from specific timestamp
   ./scripts/restore-user-data.sh 20241108_143000
   ```

3. **Verify Restoration**
   - Check user progress data in application
   - Verify bookmarks are restored
   - Test theory analytics

### Disaster Recovery

1. **Complete Infrastructure Loss**
   - Redeploy application using Docker images
   - Restore database from latest backup
   - Reconfigure CDN and monitoring

2. **Database Corruption**
   - Stop application to prevent further writes
   - Restore from most recent clean backup
   - Verify data integrity before resuming service

3. **CDN Failure**
   - Application will fallback to local assets
   - Redeploy assets to new CDN endpoint
   - Update CDN configuration

## Security Considerations

### Application Security

- HTTPS enforced for all traffic
- Content Security Policy headers
- Rate limiting on API endpoints
- Input validation and sanitization

### Data Security

- Firebase security rules properly configured
- User data encrypted in transit and at rest
- Regular security audits of dependencies
- Backup encryption with separate key management

### Infrastructure Security

- Regular OS and container updates
- Network segmentation
- Access logging and monitoring
- Principle of least privilege for service accounts

## Performance Optimization

### Application Performance

- Static asset optimization and compression
- Image optimization with WebP format
- Lazy loading for theory content
- Service worker for offline functionality

### Database Performance

- Proper Firestore indexing
- Query optimization
- Connection pooling
- Read replicas for analytics queries

### CDN Performance

- Global edge locations
- Intelligent caching strategies
- Image optimization at edge
- HTTP/2 and HTTP/3 support

## Troubleshooting

### Common Issues

1. **Application Won't Start**
   - Check environment variables
   - Verify Firebase configuration
   - Check Docker container logs

2. **Database Connection Issues**
   - Verify Firebase project settings
   - Check service account permissions
   - Review Firestore security rules

3. **CDN Assets Not Loading**
   - Verify CDN bucket permissions
   - Check CORS configuration
   - Test CDN health endpoint

4. **Monitoring Not Working**
   - Check Prometheus targets
   - Verify metrics endpoint accessibility
   - Review Grafana datasource configuration

### Log Locations

- Application logs: `/var/log/knowledge-hub/app.log`
- Backup logs: `/var/log/knowledge-hub-backup.log`
- Monitoring logs: `/var/log/prometheus/`, `/var/log/grafana/`
- System logs: `/var/log/syslog`

## Maintenance

### Regular Tasks

- **Daily**: Review monitoring dashboards and alerts
- **Weekly**: Check backup integrity and test restore procedures
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and update monitoring thresholds

### Scaling Considerations

- Horizontal scaling with load balancers
- Database read replicas for high traffic
- CDN optimization for global users
- Container orchestration with Kubernetes

## Support and Documentation

- **Runbooks**: Detailed procedures for common operations
- **Architecture Diagrams**: System design and data flow
- **API Documentation**: Internal API specifications
- **Incident Response**: Escalation procedures and contacts

For additional support, contact the development team or refer to the internal documentation wiki.
