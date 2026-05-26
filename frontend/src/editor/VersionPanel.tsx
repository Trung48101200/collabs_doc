export function VersionPanel({ onCreateVersion }: { onCreateVersion: () => Promise<void> }) {
  return (
    <div className="panel row" style={{ justifyContent: "space-between" }}>
      <div>
        <strong>Phiên bản tài liệu</strong>
        <p className="muted">Tạo snapshot mới để dễ dàng phục hồi sau này.</p>
      </div>
      <button className="button" type="button" onClick={onCreateVersion}>
        Tạo version
      </button>
    </div>
  );
}
