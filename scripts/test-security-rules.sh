#!/bin/bash

# Test Security Rules Script
# This script runs Firestore security rules tests with proper emulator setup

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

# Check if test file exists
check_test_file() {
    if [ ! -f "__tests__/firestore-security-rules.test.ts" ]; then
        print_error "Security rules test file not found!"
        print_error "Expected: __tests__/firestore-security-rules.test.ts"
        exit 1
    fi
    
    print_success "Security rules test file found"
}

# Check if rules file exists
check_rules_file() {
    if [ ! -f "firestore.rules" ]; then
        print_error "Firestore rules file not found!"
        print_error "Expected: firestore.rules"
        exit 1
    fi
    
    print_success "Firestore rules file found"
}

# Run tests with emulator
run_tests_with_emulator() {
    print_status "Running security rules tests with Firebase emulator..."
    
    # Use firebase emulators:exec to automatically manage emulator lifecycle
    if firebase emulators:exec --only firestore "npm test __tests__/firestore-security-rules.test.ts --run"; then
        print_success "All security rules tests passed!"
        return 0
    else
        print_error "Some security rules tests failed!"
        return 1
    fi
}

# Run tests with manual emulator management
run_tests_manual() {
    print_status "Starting Firebase emulator manually..."
    
    # Start emulator in background
    firebase emulators:start --only firestore &
    EMULATOR_PID=$!
    
    # Wait for emulator to start
    print_status "Waiting for emulator to start..."
    sleep 10
    
    # Check if emulator is running
    if ! curl -s http://localhost:8080 > /dev/null; then
        print_error "Emulator failed to start or is not accessible"
        kill $EMULATOR_PID 2>/dev/null || true
        exit 1
    fi
    
    print_success "Emulator is running"
    
    # Run tests
    print_status "Running tests..."
    if npm test __tests__/firestore-security-rules.test.ts --run; then
        print_success "All security rules tests passed!"
        TEST_RESULT=0
    else
        print_error "Some security rules tests failed!"
        TEST_RESULT=1
    fi
    
    # Stop emulator
    print_status "Stopping emulator..."
    kill $EMULATOR_PID 2>/dev/null || true
    
    # Wait for emulator to stop
    sleep 2
    
    return $TEST_RESULT
}

# Validate rules before testing
validate_rules() {
    print_status "Validating security rules..."
    
    if [ -f "scripts/validate-security-rules.js" ]; then
        if node scripts/validate-security-rules.js; then
            print_success "Rules validation passed"
        else
            print_warning "Rules validation had warnings (continuing with tests)"
        fi
    else
        print_warning "Validation script not found, skipping validation"
    fi
}

# Main execution
main() {
    local method=${1:-"auto"}
    
    print_status "Starting Firestore security rules testing..."
    print_status "Test method: $method"
    
    # Pre-test checks
    check_firebase_cli
    check_test_file
    check_rules_file
    
    # Validate rules
    validate_rules
    
    # Run tests based on method
    case $method in
        "auto")
            print_status "Using automatic emulator management (firebase emulators:exec)"
            if run_tests_with_emulator; then
                print_success "Security rules testing completed successfully!"
                exit 0
            else
                print_error "Security rules testing failed!"
                exit 1
            fi
            ;;
        "manual")
            print_status "Using manual emulator management"
            if run_tests_manual; then
                print_success "Security rules testing completed successfully!"
                exit 0
            else
                print_error "Security rules testing failed!"
                exit 1
            fi
            ;;
        *)
            print_error "Invalid method: $method"
            print_error "Valid methods: auto, manual"
            exit 1
            ;;
    esac
}

# Help function
show_help() {
    echo "Test Security Rules Script"
    echo ""
    echo "Usage: $0 [method]"
    echo ""
    echo "Methods:"
    echo "  auto     Use firebase emulators:exec for automatic emulator management (default)"
    echo "  manual   Start and stop emulator manually"
    echo ""
    echo "Examples:"
    echo "  $0           # Use automatic method"
    echo "  $0 auto      # Use automatic method"
    echo "  $0 manual    # Use manual method"
    echo ""
    echo "Prerequisites:"
    echo "  - Firebase CLI installed (npm install -g firebase-tools)"
    echo "  - firestore.rules file in project root"
    echo "  - __tests__/firestore-security-rules.test.ts test file"
    echo "  - Node.js dependencies installed (npm install)"
    echo ""
    echo "Environment Variables:"
    echo "  FIRESTORE_EMULATOR_HOST    Override emulator host (default: localhost:8080)"
    echo "  FIRESTORE_EMULATOR_DEBUG   Enable debug logging (set to 'true')"
    echo ""
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Run main function with arguments
main "$@"
