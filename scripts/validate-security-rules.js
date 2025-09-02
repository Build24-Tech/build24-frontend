#!/usr/bin/env node

/**
 * Security Rules Validation Script
 * 
 * This script validates the Firestore and Storage security rules
 * for syntax errors and common security issues.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  WARNING: ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ SUCCESS: ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  INFO: ${message}`, 'blue');
}

// Validation functions
function validateFirestoreRules() {
  const rulesPath = path.join(process.cwd(), 'firestore.rules');

  if (!fs.existsSync(rulesPath)) {
    logError('firestore.rules file not found');
    return false;
  }

  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  let isValid = true;

  logInfo('Validating Firestore security rules...');

  // Check for rules version
  if (!rulesContent.includes("rules_version = '2'")) {
    logError('Missing or incorrect rules_version. Should be "rules_version = \'2\'"');
    isValid = false;
  } else {
    logSuccess('Rules version is correct');
  }

  // Check for service declaration
  if (!rulesContent.includes('service cloud.firestore')) {
    logError('Missing service declaration for cloud.firestore');
    isValid = false;
  } else {
    logSuccess('Service declaration found');
  }

  // Check for authentication helpers
  const requiredHelpers = [
    'function isAuthenticated()',
    'function isOwner(',
    'function isValidEmail(',
    'function isValidUrl('
  ];

  requiredHelpers.forEach(helper => {
    if (!rulesContent.includes(helper)) {
      logWarning(`Missing helper function: ${helper}`);
    } else {
      logSuccess(`Helper function found: ${helper}`);
    }
  });

  // Check for required collections
  const requiredCollections = [
    'match /users/{userId}',
    'match /userFollows/{followId}'
  ];

  requiredCollections.forEach(collection => {
    if (!rulesContent.includes(collection)) {
      logError(`Missing collection rule: ${collection}`);
      isValid = false;
    } else {
      logSuccess(`Collection rule found: ${collection}`);
    }
  });

  // Check for security best practices
  const securityChecks = [
    {
      pattern: 'request.auth != null',
      message: 'Authentication checks found'
    },
    {
      pattern: 'isOwner(',
      message: 'Ownership validation found'
    },
    {
      pattern: 'isValidUserData(',
      message: 'Data validation found'
    }
  ];

  securityChecks.forEach(check => {
    if (rulesContent.includes(check.pattern)) {
      logSuccess(check.message);
    } else {
      logWarning(`Security check missing: ${check.pattern}`);
    }
  });

  // Check for potential security issues
  const securityIssues = [
    {
      pattern: 'allow read: if true',
      message: 'Found unrestricted read access - verify this is intentional'
    },
    {
      pattern: 'allow write: if true',
      message: 'Found unrestricted write access - this is likely a security issue'
    }
  ];

  securityIssues.forEach(issue => {
    if (rulesContent.includes(issue.pattern)) {
      logWarning(issue.message);
    }
  });

  return isValid;
}

function validateStorageRules() {
  const rulesPath = path.join(process.cwd(), 'storage.rules');

  if (!fs.existsSync(rulesPath)) {
    logWarning('storage.rules file not found - this is optional');
    return true;
  }

  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  let isValid = true;

  logInfo('Validating Storage security rules...');

  // Check for rules version
  if (!rulesContent.includes("rules_version = '2'")) {
    logError('Missing or incorrect rules_version in storage.rules');
    isValid = false;
  } else {
    logSuccess('Storage rules version is correct');
  }

  // Check for service declaration
  if (!rulesContent.includes('service firebase.storage')) {
    logError('Missing service declaration for firebase.storage');
    isValid = false;
  } else {
    logSuccess('Storage service declaration found');
  }

  // Check for profile images rules
  if (rulesContent.includes('match /profile-images/{userId}/{fileName}')) {
    logSuccess('Profile images rules found');
  } else {
    logWarning('Profile images rules not found');
  }

  // Check for authentication in storage rules
  if (rulesContent.includes('request.auth != null')) {
    logSuccess('Authentication checks found in storage rules');
  } else {
    logWarning('No authentication checks found in storage rules');
  }

  return isValid;
}

function validateTestFiles() {
  const testPath = path.join(process.cwd(), '__tests__', 'firestore-security-rules.test.ts');

  if (!fs.existsSync(testPath)) {
    logWarning('Security rules test file not found');
    return false;
  }

  const testContent = fs.readFileSync(testPath, 'utf8');

  logInfo('Validating security rules test file...');

  // Check for required test imports
  const requiredImports = [
    'initializeTestEnvironment',
    'RulesTestEnvironment'
  ];

  requiredImports.forEach(importName => {
    if (testContent.includes(importName)) {
      logSuccess(`Test import found: ${importName}`);
    } else {
      logError(`Missing test import: ${importName}`);
    }
  });

  // Check for test categories
  const testCategories = [
    'User Profile Access Control',
    'Follow System Access Control',
    'Privacy Controls'
  ];

  testCategories.forEach(category => {
    if (testContent.includes(category)) {
      logSuccess(`Test category found: ${category}`);
    } else {
      logWarning(`Test category missing: ${category}`);
    }
  });

  return true;
}

function validatePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packagePath)) {
    logError('package.json not found');
    return false;
  }

  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  logInfo('Validating package.json for required dependencies...');

  // Check for Firebase dependencies
  const requiredDeps = [
    'firebase',
    '@firebase/rules-unit-testing'
  ];

  const allDeps = {
    ...packageContent.dependencies,
    ...packageContent.devDependencies
  };

  requiredDeps.forEach(dep => {
    if (allDeps[dep]) {
      logSuccess(`Dependency found: ${dep}`);
    } else {
      logWarning(`Missing dependency: ${dep}`);
    }
  });

  return true;
}

function generateReport(results) {
  log('\n' + '='.repeat(50), 'cyan');
  log('SECURITY RULES VALIDATION REPORT', 'cyan');
  log('='.repeat(50), 'cyan');

  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.passed).length;
  const failedChecks = totalChecks - passedChecks;

  log(`\nTotal Checks: ${totalChecks}`);
  log(`Passed: ${passedChecks}`, 'green');
  log(`Failed: ${failedChecks}`, failedChecks > 0 ? 'red' : 'green');

  if (failedChecks === 0) {
    log('\n🎉 All validation checks passed!', 'green');
    log('Your security rules appear to be properly configured.', 'green');
  } else {
    log('\n⚠️  Some validation checks failed.', 'yellow');
    log('Please review the errors and warnings above.', 'yellow');
  }

  log('\nNext Steps:', 'blue');
  log('1. Fix any errors reported above');
  log('2. Run the security rules tests: npm test firestore-security-rules.test.ts');
  log('3. Deploy rules: ./scripts/deploy-security-rules.sh');
  log('4. Verify deployment in Firebase Console');

  return failedChecks === 0;
}

// Main execution
function main() {
  log('Starting security rules validation...', 'blue');
  log('='.repeat(50), 'blue');

  const results = [
    { name: 'Firestore Rules', passed: validateFirestoreRules() },
    { name: 'Storage Rules', passed: validateStorageRules() },
    { name: 'Test Files', passed: validateTestFiles() },
    { name: 'Package Dependencies', passed: validatePackageJson() }
  ];

  const allPassed = generateReport(results);

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateFirestoreRules,
  validateStorageRules,
  validateTestFiles,
  validatePackageJson
};
