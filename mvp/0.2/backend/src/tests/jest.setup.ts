import { TestLogger } from './test-logger';
import '@jest/globals';

// Configure test logging based on environment variables
const LOG_LEVEL = process.env.TEST_LOG_LEVEL || 'info';
const SHOW_PASSING = process.env.TEST_SHOW_PASSING === 'true';
const SHOW_TIMESTAMPS = process.env.TEST_SHOW_TIMESTAMPS !== 'false';

// Configure logger before tests start
beforeAll(() => {
  TestLogger.configure({
    enabled: true,
    level: LOG_LEVEL as any,
    categories: ['auth', 'database', 'test', 'request', 'response'],
    showPassingTests: SHOW_PASSING,
    showTimestamps: SHOW_TIMESTAMPS,
    truncateStrings: true,
    truncateLength: 50
  });

  TestLogger.info('Test logger configured', {
    level: LOG_LEVEL,
    showPassing: SHOW_PASSING,
    showTimestamps: SHOW_TIMESTAMPS
  }, 'test');
});

// Optional: Reset logger configuration after all tests
afterAll(() => {
  TestLogger.configure({
    enabled: true,
    level: 'info',
    categories: ['test'],
    showPassingTests: false,
    showTimestamps: true,
    truncateStrings: true,
    truncateLength: 50
  });
}); 