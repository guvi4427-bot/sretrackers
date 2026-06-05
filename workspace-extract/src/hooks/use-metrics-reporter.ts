'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

/**
 * useMetricsReporter — Client-side metrics reporting hook
 *
 * Automatically reports page navigations and sends periodic heartbeats
 * to the server-side metrics endpoint for infrastructure analytics.
 *
 * This is the missing piece that caused "0 users" in the admin dashboard:
 * - Reports each page navigation to POST /api/infra/metrics
 * - Sends heartbeat every 30s to keep the user marked as "active"
 * - Uses Performance API for accurate timing data
 * - Only runs for authenticated users (guest metrics are not tracked)
 */
export function useMetricsReporter() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const lastReportedPath = useRef<string>('');
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isVisible = useRef(true);

  const reportMetric = useCallback(async (
    path: string,
    type: 'navigation' | 'heartbeat'
  ) => {
    // Don't report if not authenticated
    if (status !== 'authenticated' || !session?.user) return;

    // Don't report admin pages (they're not "user" traffic)
    if (path.startsWith('/admin')) return;

    // Don't report API routes
    if (path.startsWith('/api/')) return;

    // Don't report auth pages
    if (path.startsWith('/login') || path.startsWith('/signup')) return;

    try {
      // Get navigation timing if available
      let responseMs = 0;
      if (type === 'navigation' && typeof performance !== 'undefined') {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (navEntry) {
          responseMs = Math.round(navEntry.responseEnd - navEntry.requestStart);
        }
      }

      await fetch('/api/infra/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          method: 'GET',
          statusCode: 200,
          responseMs,
          type, // 'navigation' or 'heartbeat'
        }),
      });
    } catch {
      // Non-critical — don't spam console
    }
  }, [status, session]);

  // Report page navigations
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!pathname) return;
    if (pathname === lastReportedPath.current) return;

    // Small delay to let the page render before reporting
    const timer = setTimeout(() => {
      lastReportedPath.current = pathname;
      reportMetric(pathname, 'navigation');
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, status, reportMetric]);

  // Set up heartbeat — sends a ping every 30s while the user is active
  useEffect(() => {
    if (status !== 'authenticated') return;

    // Clear any existing heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(() => {
      // Only send heartbeat if the page is visible (user is actively using the app)
      if (isVisible.current && lastReportedPath.current) {
        reportMetric(lastReportedPath.current, 'heartbeat');
      }
    }, 30_000); // 30-second heartbeat

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [status, reportMetric]);

  // Track page visibility — pause heartbeats when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}
