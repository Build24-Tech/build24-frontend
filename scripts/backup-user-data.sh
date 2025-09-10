#!/bin/bash

# Backup User Progress Data for Knowledge Hub
# This script creates backups of user progress, bookmarks, and analytics data

set -e

echo "🔄 Starting Knowledge Hub user data backup..."

# Configuration
BACKUP_BUCKET=${BACKUP_BUCKET:-"build24-knowledge-hub-backups"}
BACKUP_REGION=${BACKUP_REGION:-"us-east-1"}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-"build24-knowledge-hub"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/knowledge-hub-backup-$TIMESTAMP"

# Check dependencies
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Authenticate with Google Cloud
echo "🔐 Authenticating with Google Cloud..."
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
else
    echo "⚠️  GOOGLE_APPLICATION_CREDENTIALS not set. Using default authentication."
fi

gcloud config set project "$FIREBASE_PROJECT_ID"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Export Firestore data
echo "📦 Exporting Firestore data..."
FIRESTORE_BACKUP_URI="gs://$BACKUP_BUCKET/firestore-backups/$TIMESTAMP"

gcloud firestore export "$FIRESTORE_BACKUP_URI" \
    --collection-ids=userProgress,theoryAnalytics,userBookmarks \
    --async

# Wait for export to complete
echo "⏳ Waiting for Firestore export to complete..."
OPERATION_NAME=$(gcloud firestore operations list --filter="done=false" --format="value(name)" | head -1)

if [ -n "$OPERATION_NAME" ]; then
    while true; do
        STATUS=$(gcloud firestore operations describe "$OPERATION_NAME" --format="value(done)")
        if [ "$STATUS" = "True" ]; then
            echo "✅ Firestore export completed"
            break
        fi
        echo "⏳ Export still in progress..."
        sleep 30
    done
fi

# Create metadata file
echo "📝 Creating backup metadata..."
cat > "$BACKUP_DIR/backup-metadata.json" << EOF
{
    "timestamp": "$TIMESTAMP",
    "type": "knowledge-hub-user-data",
    "version": "1.0",
    "firebase_project": "$FIREBASE_PROJECT_ID",
    "collections": [
        "userProgress",
        "theoryAnalytics", 
        "userBookmarks"
    ],
    "firestore_backup_uri": "$FIRESTORE_BACKUP_URI",
    "backup_size_estimate": "$(du -sh $BACKUP_DIR | cut -f1)",
    "created_by": "$(whoami)",
    "retention_days": 90
}
EOF

# Export user authentication data (if needed)
echo "👥 Exporting user authentication data..."
gcloud auth print-access-token | \
    curl -X GET \
    -H "Authorization: Bearer $(cat -)" \
    -H "Content-Type: application/json" \
    "https://identitytoolkit.googleapis.com/v1/projects/$FIREBASE_PROJECT_ID/accounts:batchGet" \
    > "$BACKUP_DIR/auth-users-$TIMESTAMP.json"

# Create SQL dump equivalent for analytics (if using additional DB)
if [ -n "$ANALYTICS_DB_CONNECTION" ]; then
    echo "📊 Backing up analytics database..."
    # Add your analytics DB backup logic here
    # Example for PostgreSQL:
    # pg_dump "$ANALYTICS_DB_CONNECTION" > "$BACKUP_DIR/analytics-$TIMESTAMP.sql"
fi

# Compress backup directory
echo "🗜️  Compressing backup..."
tar -czf "$BACKUP_DIR.tar.gz" -C "/tmp" "knowledge-hub-backup-$TIMESTAMP"

# Upload to S3 for additional redundancy
echo "☁️  Uploading backup to S3..."
aws s3 cp "$BACKUP_DIR.tar.gz" "s3://$BACKUP_BUCKET/compressed-backups/knowledge-hub-backup-$TIMESTAMP.tar.gz" \
    --storage-class STANDARD_IA \
    --metadata "backup-type=knowledge-hub-user-data,timestamp=$TIMESTAMP"

# Set lifecycle policy for automatic cleanup
aws s3api put-object-tagging \
    --bucket "$BACKUP_BUCKET" \
    --key "compressed-backups/knowledge-hub-backup-$TIMESTAMP.tar.gz" \
    --tagging "TagSet=[{Key=backup-type,Value=knowledge-hub},{Key=retention-days,Value=90}]"

# Verify backup integrity
echo "🔍 Verifying backup integrity..."
BACKUP_SIZE=$(stat -f%z "$BACKUP_DIR.tar.gz" 2>/dev/null || stat -c%s "$BACKUP_DIR.tar.gz")
S3_SIZE=$(aws s3api head-object --bucket "$BACKUP_BUCKET" --key "compressed-backups/knowledge-hub-backup-$TIMESTAMP.tar.gz" --query ContentLength --output text)

if [ "$BACKUP_SIZE" -eq "$S3_SIZE" ]; then
    echo "✅ Backup integrity verified"
else
    echo "❌ Backup integrity check failed. Local: $BACKUP_SIZE, S3: $S3_SIZE"
    exit 1
fi

# Clean up local files
echo "🧹 Cleaning up local backup files..."
rm -rf "$BACKUP_DIR"
rm -f "$BACKUP_DIR.tar.gz"

# Log backup completion
echo "📋 Logging backup completion..."
cat > "/tmp/backup-log-$TIMESTAMP.json" << EOF
{
    "timestamp": "$TIMESTAMP",
    "status": "completed",
    "backup_location": "s3://$BACKUP_BUCKET/compressed-backups/knowledge-hub-backup-$TIMESTAMP.tar.gz",
    "firestore_location": "$FIRESTORE_BACKUP_URI",
    "size_bytes": $BACKUP_SIZE,
    "collections_backed_up": ["userProgress", "theoryAnalytics", "userBookmarks"],
    "retention_policy": "90 days"
}
EOF

# Send notification (optional)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Knowledge Hub backup completed successfully\n📅 Timestamp: $TIMESTAMP\n💾 Size: $(numfmt --to=iec $BACKUP_SIZE)\n📍 Location: s3://$BACKUP_BUCKET/compressed-backups/\"}" \
        "$SLACK_WEBHOOK_URL"
fi

echo ""
echo "🎉 Backup completed successfully!"
echo "📍 Backup location: s3://$BACKUP_BUCKET/compressed-backups/knowledge-hub-backup-$TIMESTAMP.tar.gz"
echo "📍 Firestore backup: $FIRESTORE_BACKUP_URI"
echo "💾 Backup size: $(numfmt --to=iec $BACKUP_SIZE)"
echo "🗓️  Retention: 90 days"
echo ""
echo "To restore from this backup, run:"
echo "  ./scripts/restore-user-data.sh $TIMESTAMP"
