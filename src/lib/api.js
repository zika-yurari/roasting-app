// src/lib/api.js
// APIリクエストにJWTトークンを自動付与するクライアント

import { getToken } from "./auth";
import { apiConfig } from "./config";

async function request(method, path, body = null) {
  const token = await getToken();
  const res = await fetch(`${apiConfig.baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── 豆マスタ ─────────────────────────────────────────
export const beans = {
  list:   ()         => request("GET",    "/beans"),
  get:    (id)       => request("GET",    `/beans/${id}`),
  create: (data)     => request("POST",   "/beans", data),
  update: (id, data) => request("PUT",    `/beans/${id}`, data),
  delete: (id)       => request("DELETE", `/beans/${id}`),
};

// ── 焙煎セッション ───────────────────────────────────
export const sessions = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/sessions${qs ? "?" + qs : ""}`);
  },
  get:    (id)       => request("GET",    `/sessions/${id}`),
  create: (data)     => request("POST",   "/sessions", data),
  update: (id, data) => request("PUT",    `/sessions/${id}`, data),
  delete: (id)       => request("DELETE", `/sessions/${id}`),
};

// ── 温度プロファイル ─────────────────────────────────
export const tempProfile = {
  get:         (sessionId)        => request("GET",  `/sessions/${sessionId}/temp-profile`),
  bulkInsert:  (sessionId, records) => request("POST", `/sessions/${sessionId}/temp-profile`, { records }),
};

// ── カッピング評価 ───────────────────────────────────
export const reviews = {
  get:    (sessionId)        => request("GET",  `/sessions/${sessionId}/reviews`),
  create: (sessionId, data)  => request("POST", `/sessions/${sessionId}/reviews`, data),
  update: (sessionId, data)  => request("PUT",  `/sessions/${sessionId}/reviews`, data),
};
