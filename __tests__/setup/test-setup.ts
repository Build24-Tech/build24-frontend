/**
 * Comprehensive test setup for Knowledge Hub
 * Configures mocks, utilities, and global test environment
 */

import '@testing-library/jest-dom';
import React from 'react';
import { TextDecoder, TextEncoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve('# Mock Theory Content\n\nThis is mock content for testing.'),
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock performance APIs
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    mark: jest.fn(),
    measure: jest.fn(),
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
});

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
  GithubAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
  OAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  increment: jest.fn(),
  writeBatch: jest.fn(),
}));

// Mock Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/dashboard/knowledge-hub',
    query: {},
    asPath: '/dashboard/knowledge-hub',
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard/knowledge-hub',
  useParams: () => ({}),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props);
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => {
    return React.createElement('a', { href, ...props }, children);
  },
}));

// Mock file system operations
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(),
  basename: jest.fn(),
  extname: jest.fn(),
}));

// Mock gray-matter for markdown processing
jest.mock('gray-matter', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.FIREBASE_API_KEY = 'test-api-key';
process.env.FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.FIREBASE_APP_ID = 'test-app-id';

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
  },

  // Mock theory data
  mockTheory: {
    id: 'test-theory',
    title: 'Test Theory',
    category: 'cognitive-biases',
    summary: 'This is a test theory summary that contains exactly fifty words to meet the minimum requirement for theory summaries in the knowledge hub system. It provides comprehensive overview of psychological concepts.',
    content: {
      description: 'Test description',
      applicationGuide: 'Test application guide',
      examples: [],
      relatedContent: [],
    },
    metadata: {
      difficulty: 'beginner',
      relevance: ['marketing', 'ux'],
      readTime: 3,
      tags: ['test', 'psychology'],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // Mock user progress
  mockUserProgress: {
    userId: 'test-user-id',
    readTheories: [],
    bookmarkedTheories: [],
    badges: [],
    stats: {
      totalReadTime: 0,
      theoriesRead: 0,
      categoriesExplored: [],
      lastActiveDate: new Date(),
    },
    quizResults: [],
  },

  // Test helpers
  waitForLoadingToFinish: async () => {
    const { waitForElementToBeRemoved, screen } = await import('@testing-library/react');
    try {
      await waitForElementToBeRemoved(() => screen.queryByText(/loading/i), {
        timeout: 3000,
      });
    } catch (error) {
      // Loading element might not exist, which is fine
    }
  },

  // Mock API responses
  mockApiSuccess: (data: any) => Promise.resolve(data),
  mockApiError: (error: string) => Promise.reject(new Error(error)),

  // Performance testing helpers
  measureRenderTime: (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },
};

// Console error suppression for expected errors in tests
const originalError = console.error;
console.error = (...args: any[]) => {
  // Suppress specific expected errors
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('Warning: An invalid form control') ||
      message.includes('Not implemented: HTMLCanvasElement.prototype.getContext'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();

  // Clear any timers
  jest.clearAllTimers();

  // Reset DOM
  document.body.innerHTML = '';

  // Reset window properties
  delete (window as any).location;
  (window as any).location = { href: 'http://localhost:3000' };
});

// Global test timeout
jest.setTimeout(10000);

export { };
