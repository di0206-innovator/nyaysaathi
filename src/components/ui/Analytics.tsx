'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    nyayAnalytics?: {
      trackEvent: (name: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  // Dispatch to Google Analytics if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, properties);
  }

  // Also log locally or to telemetry bus
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[NyaySaathi Telemetry] ${name}`, properties || {});
  }
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Track page views
    if (typeof window.gtag === 'function') {
      const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      if (gaId) {
        window.gtag('config', gaId, {
          page_path: url,
        });
      }
    }

    trackEvent('page_view', { path: url, timestamp: new Date().toISOString() });
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <>
      {gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true
                });
              `,
            }}
          />
        </>
      )}
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}
