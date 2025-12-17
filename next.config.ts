import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // TypeScript errors are now enforced during build
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  // Organization and project from environment
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Auth token from environment
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Only upload source maps in production
  disableSourceMapUpload: process.env.NODE_ENV !== "production",
};

// Only wrap with Sentry if DSN is configured
const config = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;

export default config;
