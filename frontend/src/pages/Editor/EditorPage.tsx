import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { useDocumentDetail } from "../../hooks/useDocumentDetail";
import { DocumentEditor } from "../../editor/DocumentEditor";

export function EditorPage() {
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
        <header className="docs-topbar docs-topbar-edit">
          <div className="docs-brand">
            <button className="button secondary" onClick={() => navigate("/documents")}>Quay lại</button>
            <div>
              <h1>Đang mở tài liệu</h1>
              <p className="muted">Vui lòng chờ trong giây lát.</p>
            </div>
          </div>
        </header>
        <section className="page docs-page">
          <div className="panel docs-hero">Đang tải tài liệu...</div>
        </section>
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="app-shell docs-shell">
        <header className="docs-topbar docs-topbar-edit">
          <div className="docs-brand">
            <button className="button secondary" onClick={() => navigate("/documents")}>Quay lại</button>
            <div>
              <h1>Lỗi tải tài liệu</h1>
              <p className="muted">Vui lòng thử lại sau.</p>
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
      <header className="docs-topbar docs-topbar-edit">
        <div className="docs-brand">
          <span className="brand-mark">PW</span>
          <div>
            <h1>{document.title}</h1>
            <p className="muted">Chỉnh sửa realtime cho tài liệu này.</p>
          </div>
        </div>
        <div className="docs-actions">
          <span className="tag">Role: {document.role}</span>
          <button className="button secondary" onClick={() => navigate(`/documents/${document.id}`)}>Quay lại</button>
        </div>
      </header>
      <section className="docs-page">
        <div className="panel editor-page-hero">
          <div>
            <h2>{document.title}</h2>
            <p className="muted">Bạn đang làm việc trên tài liệu này với quyền {document.role}.</p>
          </div>
          <div className="row gap-2">
            <span className="tag">Realtime</span>
            <span className="tag">Collaboration</span>
          </div>
        </div>
        <DocumentEditor documentData={document} user={user!} />
      </section>
    </main>
  );
}
