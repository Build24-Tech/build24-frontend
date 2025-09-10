#!/bin/bash

# Deploy Knowledge Hub Assets to CDN
# This script uploads theory content and media assets to a CDN

set -e

echo "🚀 Deploying Knowledge Hub assets to CDN..."

# Configuration
CDN_BUCKET=${CDN_BUCKET:-"build24-knowledge-hub-assets"}
CDN_REGION=${CDN_REGION:-"us-east-1"}
CONTENT_DIR="public/content"
ASSETS_DIR="public/assets"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
    exit 1
fi

# Create S3 bucket if it doesn't exist
echo "📦 Checking S3 bucket..."
if ! aws s3 ls "s3://$CDN_BUCKET" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "✅ Bucket $CDN_BUCKET exists"
else
    echo "🆕 Creating bucket $CDN_BUCKET..."
    aws s3 mb "s3://$CDN_BUCKET" --region "$CDN_REGION"
    
    # Configure bucket for static website hosting
    aws s3 website "s3://$CDN_BUCKET" \
        --index-document index.html \
        --error-document error.html
fi

# Set bucket policy for public read access
echo "🔐 Setting bucket policy..."
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$CDN_BUCKET/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$CDN_BUCKET" \
    --policy file:///tmp/bucket-policy.json

# Upload theory content with appropriate cache headers
echo "📚 Uploading theory content..."
if [ -d "$CONTENT_DIR" ]; then
    aws s3 sync "$CONTENT_DIR" "s3://$CDN_BUCKET/content" \
        --delete \
        --cache-control "public, max-age=86400" \
        --metadata-directive REPLACE
    echo "✅ Theory content uploaded"
else
    echo "⚠️  Content directory not found: $CONTENT_DIR"
fi

# Upload static assets with long-term caching
echo "🖼️  Uploading static assets..."
if [ -d "$ASSETS_DIR" ]; then
    # Images and media files
    aws s3 sync "$ASSETS_DIR" "s3://$CDN_BUCKET/assets" \
        --delete \
        --exclude "*.html" \
        --exclude "*.json" \
        --cache-control "public, max-age=31536000, immutable" \
        --metadata-directive REPLACE
    
    # HTML and JSON files with shorter cache
    aws s3 sync "$ASSETS_DIR" "s3://$CDN_BUCKET/assets" \
        --delete \
        --include "*.html" \
        --include "*.json" \
        --cache-control "public, max-age=3600" \
        --metadata-directive REPLACE
    
    echo "✅ Static assets uploaded"
else
    echo "⚠️  Assets directory not found: $ASSETS_DIR"
fi

# Create CloudFront distribution if specified
if [ "$CREATE_CLOUDFRONT" = "true" ]; then
    echo "☁️  Creating CloudFront distribution..."
    
    cat > /tmp/cloudfront-config.json << EOF
{
    "CallerReference": "build24-knowledge-hub-$(date +%s)",
    "Comment": "Build24 Knowledge Hub CDN",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$CDN_BUCKET",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "ForwardedValues": {
            "QueryString": true,
            "Cookies": {
                "Forward": "none"
            }
        },
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        }
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$CDN_BUCKET",
                "DomainName": "$CDN_BUCKET.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF
    
    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/cloudfront-config.json \
        --query 'Distribution.Id' \
        --output text)
    
    echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"
    echo "🌐 CDN URL: https://$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)"
fi

# Create health check file
echo "healthy" | aws s3 cp - "s3://$CDN_BUCKET/health-check.txt" \
    --cache-control "public, max-age=60"

# Get the S3 website URL
S3_WEBSITE_URL="http://$CDN_BUCKET.s3-website-$CDN_REGION.amazonaws.com"

echo ""
echo "🎉 Deployment completed successfully!"
echo "📍 S3 Website URL: $S3_WEBSITE_URL"
echo "💡 Set NEXT_PUBLIC_CDN_BASE_URL=$S3_WEBSITE_URL in your environment variables"
echo ""
echo "Next steps:"
echo "1. Update your environment variables"
echo "2. Configure your DNS to point to the CDN"
echo "3. Set up monitoring and alerts"

# Clean up temporary files
rm -f /tmp/bucket-policy.json /tmp/cloudfront-config.json
