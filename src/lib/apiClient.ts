/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAllCookies } from "./getAllCookie";

const BASE = process.env.RESOURCE_API_URL || "";

const normalizeHeaders = (headers: HeadersInit | undefined) => {
  if (!headers)
    return { "Content-Type": "application/json" } as Record<string, string>;
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((v, k) => (out[k] = v));
    return out;
  }
  return {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };
};

export const apiFetch = async (path: string, init: RequestInit = {}) => {
  const cookie = await getAllCookies();
  const headers = normalizeHeaders(init.headers);
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...headers,
      cookie,
    },
    credentials: "include",
  });
  return res;
};

export const apiGet = (path: string, init?: RequestInit) =>
  apiFetch(path, { method: "GET", ...init });

export const apiPost = (path: string, body?: any, init?: RequestInit) =>
  apiFetch(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

export const apiPut = (path: string, body?: any, init?: RequestInit) =>
  apiFetch(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

export const apiPatch = (path: string, body?: any, init?: RequestInit) =>
  apiFetch(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

export const apiDelete = (path: string, init?: RequestInit) =>
  apiFetch(path, { method: "DELETE", ...init });

export const createApiClient = (base?: string) => {
  const resolvedBase = base ?? BASE;
  const apiFetchWithBase = async (path: string, init: RequestInit = {}) => {
    const cookie = await getAllCookies();
    const headers = normalizeHeaders(init.headers);
    const res = await fetch(`${resolvedBase}${path}`, {
      ...init,
      headers: {
        ...headers,
        cookie,
      },
      credentials: "include",
    });
    return res;
  };

  return {
    get: (path: string, init?: RequestInit) =>
      apiFetchWithBase(path, { method: "GET", ...init }),
    post: (path: string, body?: any, init?: RequestInit) =>
      apiFetchWithBase(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        ...init,
      }),
    put: (path: string, body?: any, init?: RequestInit) =>
      apiFetchWithBase(path, {
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
        ...init,
      }),
    patch: (path: string, body?: any, init?: RequestInit) =>
      apiFetchWithBase(path, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
        ...init,
      }),
    delete: (path: string, init?: RequestInit) =>
      apiFetchWithBase(path, { method: "DELETE", ...init }),
  };
};
