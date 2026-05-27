import type { User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://backend:4000";
const STORAGE_KEY = "collab-doc-user";
const SESSION_EXPIRED_EVENT = "collab-doc-session-expired";
const SESSION_UPDATED_EVENT = "collab-doc-session-updated";
let refreshPromise: Promise<string> | null = null;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function updateSavedUser(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(SESSION_UPDATED_EVENT, { detail: user }));
}

function expireSession() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

async function refreshToken(refreshToken: string) {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    throw new ApiError("Session expired", response.status);
  }

  const result = await response.json();
  return result.accessToken || result.token || "";
}

async function getFreshAccessToken(user: User) {
  if (!user.refreshToken) {
    throw new ApiError("Session expired", 401);
  }

  refreshPromise ||= refreshToken(user.refreshToken).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function request(path: string, options: RequestInit = {}, user?: User): Promise<Response> {
  const userHeaders = user
    ? {
        "x-user-id": user.id.toString(),
        "x-user-name": user.name
      }
    : {};

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...userHeaders,
      ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
      ...(options.headers || {})
    }
  });
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, user?: User): Promise<T> {
  let activeUser = user;
  let response = await request(path, options, activeUser);

  if (response.status === 401 && activeUser?.refreshToken && path !== "/api/auth/refresh" && path !== "/api/auth/logout") {
    try {
      const token = await getFreshAccessToken(activeUser);
      if (!token) throw new ApiError("Session expired", 401);
      activeUser = { ...activeUser, token };
      updateSavedUser(activeUser);
      response = await request(path, options, activeUser);
    } catch {
      expireSession();
    }
  }

  if (response.status === 401) {
    expireSession();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError((error as any).message || "Request failed", response.status);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}
