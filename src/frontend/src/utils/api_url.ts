export const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

// builds a URL for DEV (localhost:8000) und PROD (same-origin/Nginx)
export function api_get_base_url(path: string): string {
  const base = BASE_URL || window.location.origin; // PROD: same Origin
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  return `${base}${endpoint}`;
}
