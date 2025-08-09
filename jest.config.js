const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.config.{js,ts}',
    '!**/coverage/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './lib/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './app/launch-essentials/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  maxWorkers: '50%',
  // Performance and memory settings
  workerIdleMemoryLimit: '512MB',
  // Test categorization
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
  ],
  // Custom test environments for different test types
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/__tests__/**/*.test.{ts,tsx}',
        '<rootDir>/__tests__/**/!(e2e-|performance-|accessibility-comprehensive)*.test.{ts,tsx}'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'integration',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/__tests__/**/*integration*.test.{ts,tsx}',
        '<rootDir>/__tests__/**/*firestore*.test.{ts,tsx}'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 15000,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'e2e',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/**/e2e-*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 30000,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'performance',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/**/performance*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 60000,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'accessibility',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/__tests__/**/accessibility*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 20000,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    }
  ],
};

module.exports = createJestConfig(customJestConfig);
