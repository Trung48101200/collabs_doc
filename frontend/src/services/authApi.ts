import type { User } from "../types";
import { apiFetch } from "./api";
import { getUserColor } from "../utils/userColor";

interface AuthResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user: {
    id: number;
    name: string;
    email?: string;
  };
}

export async function login(email: string, password: string): Promise<User> {
  const result = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    color: getUserColor(result.user.id),
    token: result.accessToken || result.token,
    refreshToken: result.refreshToken
  };
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const result = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    color: getUserColor(result.user.id)
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const result = await apiFetch<{ accessToken?: string; token?: string }>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });

  return result.accessToken || result.token || "";
}

export async function logout(user?: User): Promise<void> {
  await apiFetch<void>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: user?.refreshToken })
  }, user);
}
