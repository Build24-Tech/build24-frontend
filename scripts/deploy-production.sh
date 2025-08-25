#!/bin/bash

# Production Deployment Script for Knowledge Hub
# This script handles the complete production deployment process

set -e

echo "🚀 Starting Knowledge Hub production deployment..."

# Configuration
DEPLOYMENT_TYPE=${DEPLOYMENT_TYPE:-"docker"}  # docker, k8s, vercel, netlify
ENVIRONMENT=${ENVIRONMENT:-"production"}
VERSION=${VERSION:-$(date +%Y%m%d-%H%M%S)}
REGISTRY=${REGISTRY:-"build24"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if required tools are installed
    case $DEPLOYMENT_TYPE in
        "docker")
            if ! command -v docker &> /dev/null; then
                log_error "Docker is not installed"
                exit 1
            fi
            if ! command -v docker-compose &> /dev/null; then
                log_error "Docker Compose is not installed"
                exit 1
            fi
            ;;
        "k8s")
            if ! command -v kubectl &> /dev/null; then
                log_error "kubectl is not installed"
                exit 1
            fi
            ;;
        "vercel")
            if ! command -v vercel &> /dev/null; then
                log_error "Vercel CLI is not installed"
                exit 1
            fi
            ;;
        "netlify")
            if ! command -v netlify &> /dev/null; then
                log_error "Netlify CLI is not installed"
                exit 1
            fi
            ;;
    esac

    # Check environment variables
    if [ -z "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" ]; then
        log_error "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set"
        exit 1
    fi

    log_info "Prerequisites check passed"
}

# Build the application
build_application() {
    log_info "Building Knowledge Hub application..."

    # Install dependencies
    npm ci --only=production

    # Run tests
    log_info "Running tests..."
    npm run test -- --passWithNoTests --watchAll=false

    # Build the application
    log_info "Building application..."
    npm run build

    log_info "Application build completed"
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."

    # Build Docker image
    log_info "Building Docker image..."
    docker build -f docker/Dockerfile -t $REGISTRY/knowledge-hub:$VERSION .
    docker tag $REGISTRY/knowledge-hub:$VERSION $REGISTRY/knowledge-hub:latest

    # Push to registry if configured
    if [ -n "$DOCKER_REGISTRY" ]; then
        log_info "Pushing to Docker registry..."
        docker push $REGISTRY/knowledge-hub:$VERSION
        docker push $REGISTRY/knowledge-hub:latest
    fi

    # Deploy with Docker Compose
    log_info "Deploying with Docker Compose..."
    export IMAGE_TAG=$VERSION
    docker-compose -f docker/docker-compose.yml up -d

    # Wait for health check
    log_info "Waiting for application to be healthy..."
    for i in {1..30}; do
        if curl -f http://localhost:3000/api/health/live > /dev/null 2>&1; then
            log_info "Application is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Application failed to become healthy"
            exit 1
        fi
        sleep 10
    done
}

# Deploy with Kubernetes
deploy_k8s() {
    log_info "Deploying with Kubernetes..."

    # Build and push Docker image
    log_info "Building and pushing Docker image..."
    docker build -f docker/Dockerfile -t $REGISTRY/knowledge-hub:$VERSION .
    docker push $REGISTRY/knowledge-hub:$VERSION

    # Update Kubernetes deployment
    log_info "Updating Kubernetes deployment..."
    kubectl set image deployment/knowledge-hub knowledge-hub=$REGISTRY/knowledge-hub:$VERSION -n build24

    # Wait for rollout
    log_info "Waiting for rollout to complete..."
    kubectl rollout status deployment/knowledge-hub -n build24 --timeout=300s

    # Verify deployment
    log_info "Verifying deployment..."
    kubectl get pods -n build24 -l app=knowledge-hub
}

# Deploy with Vercel
deploy_vercel() {
    log_info "Deploying with Vercel..."

    # Deploy to Vercel
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod --yes
    else
        vercel --yes
    fi

    log_info "Vercel deployment completed"
}

# Deploy with Netlify
deploy_netlify() {
    log_info "Deploying with Netlify..."

    # Deploy to Netlify
    if [ "$ENVIRONMENT" = "production" ]; then
        netlify deploy --prod --dir=out
    else
        netlify deploy --dir=out
    fi

    log_info "Netlify deployment completed"
}

# Deploy CDN assets
deploy_cdn() {
    log_info "Deploying CDN assets..."

    if [ -f "./scripts/deploy-assets.sh" ]; then
        ./scripts/deploy-assets.sh
    else
        log_warn "CDN deployment script not found, skipping..."
    fi
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."

    if [ -f "./scripts/setup-monitoring.sh" ]; then
        ./scripts/setup-monitoring.sh
    else
        log_warn "Monitoring setup script not found, skipping..."
    fi
}

# Run backup
run_backup() {
    log_info "Running initial backup..."

    if [ -f "./scripts/backup-user-data.sh" ]; then
        ./scripts/backup-user-data.sh
    else
        log_warn "Backup script not found, skipping..."
    fi
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    # Determine the base URL based on deployment type
    case $DEPLOYMENT_TYPE in
        "docker")
            BASE_URL="http://localhost:3000"
            ;;
        "k8s")
            BASE_URL="https://build24.dev"
            ;;
        "vercel"|"netlify")
            BASE_URL="https://build24.dev"
            ;;
    esac

    # Test health endpoints
    log_info "Testing health endpoints..."
    
    if curl -f "$BASE_URL/api/health/live" > /dev/null 2>&1; then
        log_info "✅ Liveness check passed"
    else
        log_error "❌ Liveness check failed"
        exit 1
    fi

    if curl -f "$BASE_URL/api/health/ready" > /dev/null 2>&1; then
        log_info "✅ Readiness check passed"
    else
        log_error "❌ Readiness check failed"
        exit 1
    fi

    # Test Knowledge Hub pages
    log_info "Testing Knowledge Hub pages..."
    
    if curl -f "$BASE_URL/dashboard/knowledge-hub" > /dev/null 2>&1; then
        log_info "✅ Knowledge Hub page accessible"
    else
        log_warn "⚠️  Knowledge Hub page test failed (may require authentication)"
    fi

    # Test theory content
    if curl -f "$BASE_URL/content/theories/anchoring-bias.md" > /dev/null 2>&1; then
        log_info "✅ Theory content accessible"
    else
        log_warn "⚠️  Theory content test failed"
    fi

    log_info "Deployment verification completed"
}

# Cleanup old deployments
cleanup() {
    log_info "Cleaning up old deployments..."

    case $DEPLOYMENT_TYPE in
        "docker")
            # Remove old Docker images
            docker image prune -f
            ;;
        "k8s")
            # Cleanup old ReplicaSets
            kubectl delete replicaset -n build24 -l app=knowledge-hub --field-selector='status.replicas=0'
            ;;
    esac

    log_info "Cleanup completed"
}

# Send deployment notification
send_notification() {
    log_info "Sending deployment notification..."

    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Knowledge Hub deployed successfully\n📅 Version: $VERSION\n🌐 Environment: $ENVIRONMENT\n🔧 Type: $DEPLOYMENT_TYPE\"}" \
            "$SLACK_WEBHOOK_URL"
    fi

    if [ -n "$ALERT_EMAIL" ]; then
        echo "Knowledge Hub deployment completed successfully. Version: $VERSION, Environment: $ENVIRONMENT" | \
            mail -s "Knowledge Hub Deployment Success" "$ALERT_EMAIL"
    fi
}

# Main deployment flow
main() {
    log_info "Knowledge Hub Production Deployment"
    log_info "Version: $VERSION"
    log_info "Environment: $ENVIRONMENT"
    log_info "Deployment Type: $DEPLOYMENT_TYPE"
    echo ""

    # Run deployment steps
    check_prerequisites
    build_application
    deploy_cdn

    case $DEPLOYMENT_TYPE in
        "docker")
            deploy_docker
            ;;
        "k8s")
            deploy_k8s
            ;;
        "vercel")
            deploy_vercel
            ;;
        "netlify")
            deploy_netlify
            ;;
        *)
            log_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            exit 1
            ;;
    esac

    setup_monitoring
    run_backup
    verify_deployment
    cleanup
    send_notification

    echo ""
    log_info "🎉 Knowledge Hub deployment completed successfully!"
    log_info "📍 Version: $VERSION"
    log_info "🌐 Environment: $ENVIRONMENT"
    log_info "🔧 Deployment Type: $DEPLOYMENT_TYPE"
    echo ""
    log_info "Next steps:"
    log_info "1. Monitor application logs and metrics"
    log_info "2. Verify user functionality in production"
    log_info "3. Update DNS if needed"
    log_info "4. Schedule regular backups"
}

# Handle script arguments
case "${1:-}" in
    "docker")
        DEPLOYMENT_TYPE="docker"
        ;;
    "k8s"|"kubernetes")
        DEPLOYMENT_TYPE="k8s"
        ;;
    "vercel")
        DEPLOYMENT_TYPE="vercel"
        ;;
    "netlify")
        DEPLOYMENT_TYPE="netlify"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [docker|k8s|vercel|netlify]"
        echo ""
        echo "Environment variables:"
        echo "  DEPLOYMENT_TYPE - Deployment method (docker, k8s, vercel, netlify)"
        echo "  ENVIRONMENT - Environment name (production, staging)"
        echo "  VERSION - Deployment version (default: timestamp)"
        echo "  REGISTRY - Docker registry name (default: build24)"
        echo ""
        exit 0
        ;;
    "")
        # Use default deployment type
        ;;
    *)
        log_error "Unknown deployment type: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac

# Run main deployment
main
