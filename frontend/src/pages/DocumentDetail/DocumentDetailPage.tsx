import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { useDocumentDetail } from "../../hooks/useDocumentDetail";

export function DocumentDetailPage() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { user } = useSession();
  const numericDocumentId = Number(documentId);

  if (!documentId || Number.isNaN(numericDocumentId)) {
    return <Navigate to="/documents" replace />;
  }

  const { document, loading, error } = useDocumentDetail(numericDocumentId, user!);

  if (loading) {
    return (
      <main className="app-shell docs-shell">
        <header className="docs-topbar docs-topbar-detail">
          <div className="docs-brand">
            <button className="button secondary" onClick={() => navigate("/documents")}>Quay lại</button>
            <div>
              <h1>Đang mở tài liệu...</h1>
              <p className="muted">Vui lòng chờ trong giây lát.</p>
            </div>
          </div>
        </header>
        <section className="page docs-page">
          <div className="panel docs-hero">Đang tải chi tiết tài liệu...</div>
        </section>
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="app-shell docs-shell">
        <header className="docs-topbar docs-topbar-detail">
          <div className="docs-brand">
            <button className="button secondary" onClick={() => navigate("/documents")}>Quay lại</button>
            <div>
              <h1>Không thể mở tài liệu</h1>
              <p className="muted">Kiểm tra lại và thử lại sau.</p>
            </div>
          </div>
        </header>
        <section className="page docs-page">
          <div className="panel docs-error">Lỗi tải tài liệu: {error || "Không tìm thấy"}</div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell docs-shell">
      <header className="docs-topbar docs-topbar-detail">
        <div className="docs-brand">
          <span className="brand-mark">PW</span>
          <div>
            <h1>{document.title}</h1>
            <p className="muted">Trạng thái: {document.role}</p>
          </div>
        </div>
        <div className="docs-actions">
          <button className="button secondary" onClick={() => navigate("/documents")}>Quay lại</button>
          <button className="button primary" onClick={() => navigate(`/documents/${document.id}/edit`)}>Mở trình soạn thảo</button>
        </div>
      </header>

      <section className="page docs-page docs-detail-page">
        <div className="panel docs-overview">
          <h2>Giới thiệu</h2>
          <p>{document.contentText || "Không có nội dung tóm tắt cho tài liệu này."}</p>
          <div className="docs-detail-actions">
            <span className="tag">ID: {document.id}</span>
            <span className="tag">Role: {document.role}</span>
          </div>
        </div>
        <div className="panel docs-versions">
          <div className="doc-card-header">
            <div>
              <h2>Lịch sử phiên bản</h2>
              <p className="muted">Duyệt các bản lưu trạng thái trước đó.</p>
            </div>
          </div>
          {document.versions?.length ? (
            <div className="version-list">
              {document.versions.map((version) => (
                <div key={version.id} className="version-item">
                  <div>
                    <strong>{version.title}</strong>
                    <p className="muted">{new Date(version.createdAt).toLocaleString()}</p>
                  </div>
                  <button className="button secondary">Xem</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Chưa có phiên bản nào.</p>
          )}
        </div>
      </section>
    </main>
  );
}
