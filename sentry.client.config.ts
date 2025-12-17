import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Debug mode for development
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking (set by CI)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    /chrome-extension/,
    /moz-extension/,
    // Network errors
    'Network request failed',
    'Failed to fetch',
    // User aborted
    'AbortError',
  ],

  // Before sending
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    return event;
  },
});
