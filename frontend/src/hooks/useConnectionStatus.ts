export function useConnectionStatus(state: "connecting" | "online" | "offline") {
  const label = state === "online" ? "Online" : state === "offline" ? "Offline" : "Connecting";
  const color = state === "online" ? "text-emerald-400" : state === "offline" ? "text-rose-400" : "text-amber-300";
  return { label, color };
}
