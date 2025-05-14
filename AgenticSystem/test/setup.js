const { jest: jestConfig } = require('../jest.config');

// Setup global mocks and test environment
beforeAll(() => {
  // Only mock console in non-debug mode
  if (!process.env.DEBUG) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.MCP_JWT_SECRET = 'test-secret';
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

afterAll(() => {
  // Restore original console methods
  jest.restoreAllMocks();
});

// Set test timeout to 10 seconds
jest.setTimeout(10000);
