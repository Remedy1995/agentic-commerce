import type { GalleryResponse, StatsResponse, MerchantResponse } from "./types";

// In dev (port 3000), use localhost:4000. In prod (static export served by express), use empty string for relative paths
const isDev = typeof window !== "undefined" && window.location.origin.includes("3000");
const BASE = process.env.NEXT_PUBLIC_API_URL ?? (isDev ? "http://localhost:4000" : "");

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  gallery: () => apiFetch<GalleryResponse>("/api/gallery"),
  stats: () => apiFetch<StatsResponse>("/api/gallery/stats"),
  merchant: () => apiFetch<MerchantResponse>("/api/wallet/merchant"),

  triggerAgent: (body: { prompt: string }) =>
    apiFetch<{ success: boolean; generation: import("./types").Generation }>(
      "/api/agent/trigger",
      { method: "POST", body: JSON.stringify(body) }
    ),
};
