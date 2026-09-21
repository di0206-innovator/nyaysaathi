/**
 * Privacy-First Analytics Event Dispatcher (DPDPA 2023 Compliant)
 * Strictly records functional interaction telemetry without PII or third-party trackers.
 */

export interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  timestamp: string;
  source?: string;
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;

  try {
    // Check consent preference if present
    const consent = localStorage.getItem('nyaysaathi_cookie_consent');
    if (consent === 'rejected') return;

    const payload: AnalyticsEvent = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...properties,
    };

    // Store in session telemetry queue
    const queueKey = 'nyaysaathi_event_queue';
    const existing = JSON.parse(sessionStorage.getItem(queueKey) || '[]');
    existing.push(payload);
    // Keep last 50 session events max
    if (existing.length > 50) existing.shift();
    sessionStorage.setItem(queueKey, JSON.stringify(existing));

    // Optional beacon dispatch if endpoint is accepting client telemetry
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics', blob);
    }
  } catch {
    // Silently ignore telemetry failure in restricted/sandboxed environments
  }
}
