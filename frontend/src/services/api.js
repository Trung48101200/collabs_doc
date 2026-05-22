const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}, user) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user?.id || 1,
      "x-user-name": user?.name || "Demo User",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) return null;
  return response.json();
}
