import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring
  tracesSampleRate: 0.1,

  // Debug mode for development
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,
});
