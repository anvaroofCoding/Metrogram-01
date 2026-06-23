import { env } from "@/config/env";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Socket.io http/https origin qabul qiladi (ws/wss emas). */
export function normalizeHttpOrigin(url: string): string {
  const trimmed = trimTrailingSlash(url.trim());
  if (!trimmed) return "";
  if (trimmed.startsWith("ws://")) return `http://${trimmed.slice(5)}`;
  if (trimmed.startsWith("wss://")) return `https://${trimmed.slice(6)}`;
  return trimmed;
}

export function getApiBaseUrl(): string {
  return normalizeHttpOrigin(env.apiUrl);
}

export function getRealtimeBaseUrl(): string {
  const ws = normalizeHttpOrigin(env.wsUrl);
  if (ws) return ws;

  const api = getApiBaseUrl();
  if (api) return api;

  if (import.meta.env.DEV) return "http://localhost:3000";

  return window.location.origin;
}

/**
 * Frontend `/api/...` yo'lini backend `/api/v1/...` ga aylantiradi.
 * Dev: nisbiy yo'l (Vite proxy). Production: VITE_API_URL bo'lsa to'liq URL.
 */
export function resolveApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const backendBase = getApiBaseUrl();

  if (backendBase) {
    const suffix = normalized.startsWith("/api")
      ? normalized.slice("/api".length)
      : normalized;
    return `${backendBase}/api/v1${suffix}`;
  }

  return normalized.startsWith("/api") ? normalized : `/api${normalized}`;
}
