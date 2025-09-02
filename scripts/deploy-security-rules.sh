#!/bin/bash

# Deploy Security Rules Script
# This script deploys Firestore and Storage security rules and runs validation tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    
    print_success "Firebase CLI is installed"
}

# Check if user is logged in to Firebase
check_firebase_auth() {
    if ! firebase projects:list &> /dev/null; then
        print_error "Not logged in to Firebase. Please login first:"
        echo "firebase login"
        exit 1
    fi
    
    print_success "Firebase authentication verified"
}

# Validate security rules syntax
validate_rules() {
    print_status "Validating Firestore security rules syntax..."
    
    if [ ! -f "firestore.rules" ]; then
        print_error "firestore.rules file not found!"
        exit 1
    fi
    
    # Basic syntax validation (Firebase CLI will do full validation)
    if grep -q "rules_version = '2'" firestore.rules; then
        print_success "Firestore rules syntax appears valid"
    else
        print_warning "Firestore rules may have syntax issues"
    fi
    
    if [ -f "storage.rules" ]; then
        print_status "Validating Storage security rules syntax..."
        if grep -q "rules_version = '2'" storage.rules; then
            print_success "Storage rules syntax appears valid"
        else
            print_warning "Storage rules may have syntax issues"
        fi
    fi
}

# Deploy rules to Firebase
deploy_rules() {
    local environment=${1:-"default"}
    
    print_status "Deploying security rules to $environment environment..."
    
    # Deploy Firestore rules
    print_status "Deploying Firestore security rules..."
    if firebase deploy --only firestore:rules --project "$environment"; then
        print_success "Firestore rules deployed successfully"
    else
        print_error "Failed to deploy Firestore rules"
        exit 1
    fi
    
    # Deploy Storage rules if they exist
    if [ -f "storage.rules" ]; then
        print_status "Deploying Storage security rules..."
        if firebase deploy --only storage --project "$environment"; then
            print_success "Storage rules deployed successfully"
        else
            print_error "Failed to deploy Storage rules"
            exit 1
        fi
    else
        print_warning "storage.rules file not found, skipping Storage rules deployment"
    fi
}

# Run security rules tests
run_tests() {
    print_status "Running security rules tests..."
    
    # Check if test file exists
    if [ ! -f "__tests__/firestore-security-rules.test.ts" ]; then
        print_warning "Security rules test file not found, skipping tests"
        return
    fi
    
    # Start Firebase emulator for testing
    print_status "Starting Firebase emulator for testing..."
    firebase emulators:start --only firestore &
    EMULATOR_PID=$!
    
    # Wait for emulator to start
    sleep 5
    
    # Run tests
    print_status "Running Jest tests..."
    if npm test -- __tests__/firestore-security-rules.test.ts --run; then
        print_success "All security rules tests passed"
    else
        print_error "Some security rules tests failed"
        kill $EMULATOR_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stop emulator
    kill $EMULATOR_PID 2>/dev/null || true
    print_success "Firebase emulator stopped"
}

# Backup existing rules (if any)
backup_rules() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_dir="backups/security-rules/$timestamp"
    
    print_status "Creating backup of existing rules..."
    mkdir -p "$backup_dir"
    
    # Try to download existing rules
    if firebase firestore:rules:get > "$backup_dir/firestore.rules.backup" 2>/dev/null; then
        print_success "Firestore rules backed up to $backup_dir/firestore.rules.backup"
    else
        print_warning "Could not backup existing Firestore rules (may not exist)"
    fi
    
    # Note: Firebase CLI doesn't have a direct command to download storage rules
    # Users would need to manually backup from Firebase Console if needed
}

# Main execution
main() {
    local environment=${1:-"default"}
    local skip_tests=${2:-"false"}
    
    print_status "Starting security rules deployment process..."
    print_status "Target environment: $environment"
    
    # Pre-deployment checks
    check_firebase_cli
    check_firebase_auth
    validate_rules
    
    # Create backup
    backup_rules
    
    # Run tests first (if not skipped)
    if [ "$skip_tests" != "true" ]; then
        run_tests
    else
        print_warning "Skipping tests as requested"
    fi
    
    # Deploy rules
    deploy_rules "$environment"
    
    print_success "Security rules deployment completed successfully!"
    print_status "Please verify the deployment in Firebase Console:"
    echo "  - Firestore Rules: https://console.firebase.google.com/project/$environment/firestore/rules"
    echo "  - Storage Rules: https://console.firebase.google.com/project/$environment/storage/rules"
}

# Help function
show_help() {
    echo "Deploy Security Rules Script"
    echo ""
    echo "Usage: $0 [environment] [skip-tests]"
    echo ""
    echo "Arguments:"
    echo "  environment    Firebase project ID (default: 'default')"
    echo "  skip-tests     Set to 'true' to skip running tests (default: 'false')"
    echo ""
    echo "Examples:"
    echo "  $0                          # Deploy to default project with tests"
    echo "  $0 my-project-staging       # Deploy to staging project with tests"
    echo "  $0 my-project-prod true     # Deploy to production project without tests"
    echo ""
    echo "Prerequisites:"
    echo "  - Firebase CLI installed (npm install -g firebase-tools)"
    echo "  - Logged in to Firebase (firebase login)"
    echo "  - firestore.rules file in project root"
    echo "  - storage.rules file in project root (optional)"
    echo ""
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Run main function with arguments
main "$@"
