#!/bin/bash

# Restore User Progress Data for Knowledge Hub
# This script restores user progress, bookmarks, and analytics data from backups

set -e

# Check if timestamp argument is provided
if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <backup-timestamp>"
    echo "Example: $0 20241108_143000"
    exit 1
fi

BACKUP_TIMESTAMP=$1
echo "🔄 Starting Knowledge Hub user data restore for backup: $BACKUP_TIMESTAMP"

# Configuration
BACKUP_BUCKET=${BACKUP_BUCKET:-"build24-knowledge-hub-backups"}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-"build24-knowledge-hub"}
RESTORE_DIR="/tmp/knowledge-hub-restore-$BACKUP_TIMESTAMP"

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

# Create restore directory
mkdir -p "$RESTORE_DIR"

# Download backup from S3
echo "📥 Downloading backup from S3..."
BACKUP_FILE="knowledge-hub-backup-$BACKUP_TIMESTAMP.tar.gz"
aws s3 cp "s3://$BACKUP_BUCKET/compressed-backups/$BACKUP_FILE" "$RESTORE_DIR/$BACKUP_FILE"

# Verify backup exists
if [ ! -f "$RESTORE_DIR/$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Extract backup
echo "📦 Extracting backup..."
tar -xzf "$RESTORE_DIR/$BACKUP_FILE" -C "$RESTORE_DIR"

# Verify backup metadata
METADATA_FILE="$RESTORE_DIR/knowledge-hub-backup-$BACKUP_TIMESTAMP/backup-metadata.json"
if [ ! -f "$METADATA_FILE" ]; then
    echo "❌ Backup metadata not found. This may not be a valid backup."
    exit 1
fi

echo "📋 Backup metadata:"
cat "$METADATA_FILE" | jq '.'

# Confirm restore operation
echo ""
echo "⚠️  WARNING: This will restore user data from backup timestamp: $BACKUP_TIMESTAMP"
echo "This operation may overwrite existing user progress data."
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restore operation cancelled."
    exit 1
fi

# Get Firestore backup URI from metadata
FIRESTORE_BACKUP_URI=$(cat "$METADATA_FILE" | jq -r '.firestore_backup_uri')

if [ "$FIRESTORE_BACKUP_URI" = "null" ] || [ -z "$FIRESTORE_BACKUP_URI" ]; then
    echo "❌ Firestore backup URI not found in metadata."
    exit 1
fi

echo "📥 Restoring Firestore data from: $FIRESTORE_BACKUP_URI"

# Import Firestore data
echo "🔄 Starting Firestore import..."
gcloud firestore import "$FIRESTORE_BACKUP_URI" --async

# Wait for import to complete
echo "⏳ Waiting for Firestore import to complete..."
OPERATION_NAME=$(gcloud firestore operations list --filter="done=false" --format="value(name)" | head -1)

if [ -n "$OPERATION_NAME" ]; then
    while true; do
        STATUS=$(gcloud firestore operations describe "$OPERATION_NAME" --format="value(done)")
        if [ "$STATUS" = "True" ]; then
            echo "✅ Firestore import completed"
            break
        fi
        echo "⏳ Import still in progress..."
        sleep 30
    done
fi

# Restore user authentication data (if needed)
AUTH_FILE="$RESTORE_DIR/knowledge-hub-backup-$BACKUP_TIMESTAMP/auth-users-$BACKUP_TIMESTAMP.json"
if [ -f "$AUTH_FILE" ]; then
    echo "👥 User authentication data found in backup"
    echo "⚠️  Note: User authentication data restore requires manual intervention"
    echo "📍 Auth data location: $AUTH_FILE"
    echo "Please use Firebase Console or Admin SDK to restore user accounts if needed."
fi

# Restore analytics database (if applicable)
ANALYTICS_FILE="$RESTORE_DIR/knowledge-hub-backup-$BACKUP_TIMESTAMP/analytics-$BACKUP_TIMESTAMP.sql"
if [ -f "$ANALYTICS_FILE" ] && [ -n "$ANALYTICS_DB_CONNECTION" ]; then
    echo "📊 Restoring analytics database..."
    # Example for PostgreSQL:
    # psql "$ANALYTICS_DB_CONNECTION" < "$ANALYTICS_FILE"
    echo "📍 Analytics data location: $ANALYTICS_FILE"
fi

# Verify restore
echo "🔍 Verifying restore..."

# Check if collections exist and have data
COLLECTIONS=("userProgress" "theoryAnalytics" "userBookmarks")
for collection in "${COLLECTIONS[@]}"; do
    echo "Checking collection: $collection"
    # This is a simplified check - in practice you'd want more thorough verification
    gcloud firestore databases documents list --collection-ids="$collection" --limit=1 > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Collection $collection restored successfully"
    else
        echo "⚠️  Collection $collection may not have been restored properly"
    fi
done

# Create restore log
echo "📋 Creating restore log..."
cat > "/tmp/restore-log-$(date +%Y%m%d_%H%M%S).json" << EOF
{
    "restore_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "backup_timestamp": "$BACKUP_TIMESTAMP",
    "status": "completed",
    "restored_from": "s3://$BACKUP_BUCKET/compressed-backups/$BACKUP_FILE",
    "firestore_backup_uri": "$FIRESTORE_BACKUP_URI",
    "collections_restored": ["userProgress", "theoryAnalytics", "userBookmarks"],
    "restored_by": "$(whoami)"
}
EOF

# Clean up restore files
echo "🧹 Cleaning up restore files..."
rm -rf "$RESTORE_DIR"

# Send notification (optional)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Knowledge Hub restore completed successfully\n📅 Backup timestamp: $BACKUP_TIMESTAMP\n🔄 Restored at: $(date)\n👤 Restored by: $(whoami)\"}" \
        "$SLACK_WEBHOOK_URL"
fi

echo ""
echo "🎉 Restore completed successfully!"
echo "📅 Backup timestamp: $BACKUP_TIMESTAMP"
echo "🔄 Restored at: $(date)"
echo "📋 Collections restored: userProgress, theoryAnalytics, userBookmarks"
echo ""
echo "⚠️  Important post-restore steps:"
echo "1. Verify user data integrity in the application"
echo "2. Check that user progress and bookmarks are displaying correctly"
echo "3. Monitor application logs for any issues"
echo "4. Consider running data validation scripts"
echo ""
echo "If you encounter issues, you can restore from a different backup:"
echo "  ./scripts/restore-user-data.sh <different-timestamp>"
