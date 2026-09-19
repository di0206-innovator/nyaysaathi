/**
 * Centralized authenticated API client for NyaySaathi.
 * Automatically injects verified session tokens and handles common response envelopes.
 */

export interface ApiFetchOptions extends RequestInit {
  token?: string | null;
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nyaysaathi_token');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiFetchResult<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
  json: () => Promise<T>;
  text: () => Promise<string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch<T = any>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<ApiFetchResult<T>> {
  const token = options.token !== undefined ? options.token : getStoredAuthToken();

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type') || '';
    let data: T | null = null;
    let error: string | null = null;

    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (!res.ok) {
        error = json.error || json.message || `Request failed with status ${res.status}`;
      } else {
        data = json as T;
      }
    } else {
      const text = await res.text();
      if (!res.ok) {
        error = text || `Request failed with status ${res.status}`;
      } else {
        data = text as unknown as T;
      }
    }

    return {
      data,
      error,
      status: res.status,
      ok: res.ok,
      json: async () => data as T,
      text: async () => (typeof data === 'string' ? data : JSON.stringify(data))
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network request failed';
    return {
      data: null,
      error: msg,
      status: 0,
      ok: false,
      json: async () => null as unknown as T,
      text: async () => msg
    };
  }
}
