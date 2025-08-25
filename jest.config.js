const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/setup/test-setup.ts'
  ],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.{js,ts,tsx}',
    '**/*.test.{js,ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.config.{js,ts}',
    '!**/coverage/**',
    '!**/.next/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB',
  verbose: true,
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@radix-ui))',
  ],
};

module.exports = createJestConfig(customJestConfig);
