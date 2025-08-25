/**
 * Comprehensive test runner for Knowledge Hub
 * Runs all test suites with proper configuration and reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
  unit: {
    pattern: '__tests__/unit/**/*.test.{ts,tsx}',
    description: 'Unit tests for components and services',
  },
  integration: {
    pattern: '__tests__/integration/**/*.test.{ts,tsx}',
    description: 'Integration tests for user flows',
  },
  e2e: {
    pattern: '__tests__/e2e/**/*.test.{ts,tsx}',
    description: 'End-to-end tests for critical journeys',
  },
  accessibility: {
    pattern: '__tests__/accessibility/**/*.test.{ts,tsx}',
    description: 'Accessibility and WCAG compliance tests',
  },
  performance: {
    pattern: '__tests__/performance/**/*.test.{ts,tsx}',
    description: 'Performance and optimization tests',
  },
  knowledgeHub: {
    pattern: '__tests__/**/knowledge-hub*.test.{ts,tsx}',
    description: 'All Knowledge Hub specific tests',
  },
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runTestSuite(suiteName, config) {
  log(`\n${colors.bright}${colors.blue}Running ${config.description}...${colors.reset}`);
  log(`Pattern: ${config.pattern}`, colors.cyan);

  try {
    const command = `npm test -- --testPathPatterns="${config.pattern.replace(/\{|\}/g, '')}" --verbose --passWithNoTests`;
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    log(`✅ ${suiteName} tests passed`, colors.green);
    return { success: true, output };
  } catch (error) {
    log(`❌ ${suiteName} tests failed`, colors.red);
    log(error.stdout || error.message, colors.red);
    return { success: false, error: error.stdout || error.message };
  }
}

function runCoverageReport() {
  log(`\n${colors.bright}${colors.magenta}Generating coverage report...${colors.reset}`);

  try {
    const command = 'npm test -- --coverage --testPathPatterns="__tests__/.*knowledge-hub.*" --passWithNoTests';
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10
    });

    log('✅ Coverage report generated', colors.green);
    return { success: true, output };
  } catch (error) {
    log('❌ Coverage report failed', colors.red);
    log(error.stdout || error.message, colors.red);
    return { success: false, error: error.stdout || error.message };
  }
}

function generateTestReport(results) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length,
    },
    results,
  };

  const reportPath = path.join(__dirname, '..', 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`\n${colors.bright}Test Report Summary:${colors.reset}`);
  log(`Total test suites: ${report.summary.total}`);
  log(`Passed: ${report.summary.passed}`, colors.green);
  log(`Failed: ${report.summary.failed}`, colors.red);
  log(`Report saved to: ${reportPath}`, colors.cyan);

  return report;
}

function main() {
  const args = process.argv.slice(2);
  const suiteToRun = args[0];

  log(`${colors.bright}${colors.cyan}Knowledge Hub Test Suite Runner${colors.reset}`);
  log(`${colors.bright}================================${colors.reset}`);

  const results = {};

  if (suiteToRun && testConfig[suiteToRun]) {
    // Run specific test suite
    log(`Running specific test suite: ${suiteToRun}`);
    results[suiteToRun] = runTestSuite(suiteToRun, testConfig[suiteToRun]);
  } else if (suiteToRun === 'coverage') {
    // Run coverage report
    results.coverage = runCoverageReport();
  } else {
    // Run all test suites
    log('Running all test suites...');

    for (const [suiteName, config] of Object.entries(testConfig)) {
      results[suiteName] = runTestSuite(suiteName, config);
    }

    // Generate coverage report
    results.coverage = runCoverageReport();
  }

  // Generate final report
  const report = generateTestReport(results);

  // Exit with appropriate code
  const hasFailures = Object.values(results).some(r => !r.success);
  process.exit(hasFailures ? 1 : 0);
}

// Handle CLI usage
if (require.main === module) {
  main();
}

module.exports = {
  runTestSuite,
  runCoverageReport,
  generateTestReport,
  testConfig,
};
