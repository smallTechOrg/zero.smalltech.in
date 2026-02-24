'use client';

import { useEffect } from 'react';
import { analytics } from './analytics';

/**
 * Client component that initialises analytics and wires up
 * global listeners (uncaught errors, visibility changes, etc.).
 * Rendered once in the root layout — no UI output.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    analytics.init();

    /* ── Global JS error tracking ─────────────────────────────── */
    const onError = (e: ErrorEvent) => {
      analytics.track('js_error', {
        message: e.message ?? 'Unknown error',
        source: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    };

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      analytics.track('js_error', {
        message:
          e.reason instanceof Error
            ? e.reason.message
            : String(e.reason ?? 'Unhandled promise rejection'),
        source: 'unhandledrejection',
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
