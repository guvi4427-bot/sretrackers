/**
 * Centralized API Configuration
 * Supports unified edge-proxy mode (default, same-origin) or direct cross-origin API mode.
 */

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined" ? process.env.BACKEND_API_URL || "" : "");

/**
 * Resolves an API endpoint path to the configured backend URL.
 * Defaults to relative paths (e.g. `/api/health`) for same-origin or reverse-proxy routing.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!BACKEND_BASE_URL) {
    return cleanPath;
  }
  return `${BACKEND_BASE_URL.replace(/\/$/, "")}${cleanPath}`;
}

export const API_CONFIG = {
  baseUrl: BACKEND_BASE_URL,
  timeoutMs: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

