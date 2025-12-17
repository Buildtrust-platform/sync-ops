"use client";

import { Suspense, memo } from "react";

/**
 * LAZY LOADING UTILITIES
 *
 * This file provides loading fallback components for lazy-loaded modules.
 * Heavy components are lazy-loaded inline using React.lazy() in the pages
 * that use them for better code organization.
 *
 * Usage in page components:
 * ```tsx
 * import { lazy, Suspense } from "react";
 * import { LoadingFallback } from "@/app/components/lazy";
 *
 * const HeavyComponent = lazy(() => import("./HeavyComponent"));
 *
 * <Suspense fallback={<LoadingFallback message="Loading..." />}>
 *   <HeavyComponent {...props} />
 * </Suspense>
 * ```
 */

// Loading fallback component with spinner animation
export const LoadingFallback = memo(function LoadingFallback({
  message = "Loading..."
}: {
  message?: string
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      color: 'var(--text-secondary)',
    }}>
      <div style={{
        width: '2rem',
        height: '2rem',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

// Compact loading fallback for inline use
export const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        width: '1.5rem',
        height: '1.5rem',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

// Pre-configured Suspense wrapper with default loading state
interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  message?: string;
}

export function LazyLoadWrapper({
  children,
  fallback,
  message = "Loading..."
}: LazyLoadWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingFallback message={message} />}>
      {children}
    </Suspense>
  );
}
