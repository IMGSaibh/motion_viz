export const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
  timeout_ms?: number;
};

export class HttpError extends Error {
  status: number;
  url: string;
  payload?: unknown;
  constructor(message: string, status: number, url: string, payload?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.payload = payload;
  }
}

export async function fetch_json<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = 'GET', headers, body, signal, timeout_ms: timeoutMs = 15000 } = opts;
  const controller = new AbortController();
  const timeout_id = timeoutMs
    ? setTimeout(() => controller.abort(new DOMException('Request timeout', 'AbortError')), timeoutMs)
    : undefined;

  try {
    const respond = await fetch(BASE_URL + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      body,
      signal: signal ?? controller.signal,
    });

    if (!respond.ok) {
      let payload: any = undefined;
      try {
        payload = await respond.json();
      } catch {
        /* ignore */
      }
      throw new HttpError(payload?.message || respond.statusText, respond.status, BASE_URL + path, payload);
    }

    // Auto-handle empty responses
    const text = await respond.text();
    return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
  } finally {
    if (timeout_id) clearTimeout(timeout_id);
  }
}

export async function fetch_form<T>(path: string, form: FormData, opts: Omit<FetchOptions, 'body'> = {}): Promise<T> {
  const { method = 'POST', headers, signal, timeout_ms: timeout_ms = 0 } = opts;
  const controller = new AbortController();
  const timeout_id = timeout_ms
    ? setTimeout(() => controller.abort(new DOMException('Request timeout', 'AbortError')), timeout_ms)
    : undefined;
  try {
    const respond = await fetch(BASE_URL + path, {
      method,
      headers, // do not set Content-Type for FormData
      body: form,
      signal: signal ?? controller.signal,
    });
    if (!respond.ok) {
      let payload: any = undefined;
      try {
        payload = await respond.json();
      } catch {
        /* ignore */
      }
      throw new HttpError(payload?.message || respond.statusText, respond.status, BASE_URL + path, payload);
    }
    const text = await respond.text();
    return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
  } finally {
    if (timeout_id) clearTimeout(timeout_id);
  }
}
