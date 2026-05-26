import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { useDocuments } from "../../hooks/useDocuments";
import type { DocumentModel } from "../../types";
import { DocumentCard } from "./DocumentCard";

export function DocumentsPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const { documents, loading, error, create } = useDocuments(user!);
  const [title, setTitle] = useState("Tài liệu mới");

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const document = await create(title);
    navigate(`/documents/${document.id}`);
  };

  const handleQuickCreate = async () => {
    const document = await create(title);
    navigate(`/documents/${document.id}`);
  };

  return (
    <main className="app-shell docs-shell">
      <header className="docs-topbar">
        <div className="docs-brand">
          <span className="brand-mark">PW</span>
          <div>
            <h1>ProWrite Collab</h1>
            <p className="muted">Bảng điều khiển tài liệu cộng tác. Tạo, mở và chia sẻ tài liệu ngay lập tức.</p>
          </div>
        </div>
        <div className="docs-actions">
          <span className="muted">Xin chào, {user?.name}</span>
          <button className="button primary" onClick={handleQuickCreate}>Tạo mới</button>
        </div>
      </header>

      <section className="page docs-page">
        <div className="panel docs-hero">
          <div>
            <h2>Chào mừng đến với ProWrite Collab</h2>
            <p className="muted">Tạo tài liệu mới, quản lý nội dung và bắt đầu làm việc cùng bạn bè ngay lập tức.</p>
          </div>
          <button className="button primary" onClick={handleQuickCreate}>Tạo tài liệu mới</button>
        </div>

        <form className="panel docs-create" onSubmit={handleCreate}>
          <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tên tài liệu" />
          <button className="button primary" type="submit">Tạo ngay</button>
        </form>

        {error ? <div className="panel docs-error">{error}</div> : null}

        {loading ? (
          <div className="panel">Đang tải danh sách tài liệu...</div>
        ) : (
          <div className="docs-grid">
            {documents.map((doc: DocumentModel) => (
              <DocumentCard key={doc.id} document={doc} onSelect={() => navigate(`/documents/${doc.id}`)} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
