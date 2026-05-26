import type { DocumentRole } from "../types";

export function EditorPermissionGuard({ role, children }: { role: DocumentRole; children: React.ReactNode }) {
  if (role === "viewer") {
    return (
      <div className="panel">
        <h2 className="heading">Chế độ xem</h2>
        <p className="muted">Bạn chỉ có quyền xem nội dung, không thể chỉnh sửa.</p>
      </div>
    );
  }

  return <>{children}</>;
}
