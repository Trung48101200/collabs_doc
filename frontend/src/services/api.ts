import type { User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiFetch<T>(path: string, options: RequestInit = {}, user?: User): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user?.id?.toString() || "1",
      "x-user-name": user?.name || "Demo User",
      ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any).message || "Request failed");
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}
