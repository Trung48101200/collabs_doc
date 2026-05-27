import { useConnectionStatus } from "../hooks/useConnectionStatus";

export function EditorStatus({ connectionState, collaboratorLabel }: { connectionState: "connecting" | "online" | "offline"; collaboratorLabel: string }) {
  const { label, color } = useConnectionStatus(connectionState);
  const isOffline = connectionState === "offline";
  
  return (
    <div className="panel row editor-status" style={{ justifyContent: "space-between" }}>
      <div>
        <p className="muted">Kết nối: <span className={color}>{label}</span></p>
        {isOffline ? (
          <p className="muted text-sm" style={{ color: "#f87171" }}>
            ⚠ Đang chỉnh sửa ở chế độ offline. Backend không kết nối được.
          </p>
        ) : (
          <p className="muted">{collaboratorLabel}</p>
        )}
      </div>
      <div className="row">
        <span className="button secondary">{isOffline ? "Offline Mode" : "Realtime"}</span>
      </div>
    </div>
  );
}
