import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
const STORAGE_KEY = "collab-doc-user";

function getSavedUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createSocketClient() {
  const savedUser = getSavedUser();
  return io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket", "polling"],
    auth: savedUser?.token ? { token: savedUser.token } : undefined
  });
}
