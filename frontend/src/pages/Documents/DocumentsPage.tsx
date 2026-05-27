import { Copy, Edit3, FileDiff, FileText, Grid2X2, List, LogOut, Search, Share2, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "../../hooks/useDocuments";
import { useSession } from "../../hooks/useSession";
import type { DocumentModel } from "../../types";

function getPreview(document: DocumentModel) {
  return document.contentText?.trim() || "Start writing your next update here.";
}

export function DocumentsPage() {
  const { user, setUser } = useSession();
  const navigate = useNavigate();
  const { documents, loading, error, create, remove, copy } = useDocuments(user!);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [scope, setScope] = useState<"documents" | "shared">("documents");

  const handleCreateBlank = async () => {
    const document = await create("Untitled Document");
    navigate(`/documents/${document.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this document?");
    if (!confirmed) return;

    try {
      await remove(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete document");
    }
  };

  const handleCopy = async (id: number) => {
    const document = await copy(id);
    navigate(`/documents/${document.id}/edit`);
  };

  const handleLogout = () => {
    localStorage.removeItem("collab-doc-user");
    setUser(null);
    navigate("/login");
  };

  const filteredDocs = documents.filter((document) => {
    const matchesScope = scope === "shared" ? document.role !== "owner" : document.role === "owner";
    const matchesSearch = document.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScope && matchesSearch;
  });

  return (
    <div className="stitch-app-shell">
      <header className="stitch-topbar">
        <div className="stitch-topbar-left">
          <button className="brand-wordmark" type="button" onClick={() => navigate("/documents")}>
            ProWrite Collab
          </button>
          <label className="stitch-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="stitch-topbar-actions">
          <button className="stitch-icon-button" type="button" aria-label="History">
            <Grid2X2 size={18} />
          </button>
          <button className="stitch-icon-button" type="button" aria-label="Share">
            <Share2 size={18} />
          </button>
          <button className="stitch-secondary-button" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
          <button className="topbar-avatar" style={{ backgroundColor: user?.color || "#2563eb" }} type="button" onClick={handleLogout}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </button>
        </div>
      </header>

      <div className="stitch-dashboard-layout">
        <aside className="stitch-dashboard-sidebar">
          <div className="workspace-heading">
            <div className="stitch-brand-mark">
              <Users size={21} />
            </div>
            <div>
              <h2>Workspace</h2>
              <p>Collaborative Team</p>
            </div>
          </div>

          <button className="stitch-primary-button full" type="button" onClick={handleCreateBlank}>
            <FileText size={17} />
            New Document
          </button>

          <nav className="stitch-sidebar-nav">
            <button className={scope === "documents" ? "active" : ""} type="button" onClick={() => setScope("documents")}>
              <FileDiff size={18} />
              My Documents
            </button>
            <button className={scope === "shared" ? "active" : ""} type="button" onClick={() => setScope("shared")}>
              <Users size={18} />
              Shared
            </button>
          </nav>
        </aside>

        <main className="stitch-dashboard-main">
          <section className="stitch-page-header">
            <div>
              <h1>Your Documents</h1>
              <p>{scope === "shared" ? "Documents shared with you by collaborators." : "Manage and collaborate on your latest writing projects."}</p>
            </div>
            <div className="view-switcher">
              <button className={viewMode === "grid" ? "active" : ""} type="button" onClick={() => setViewMode("grid")}>
                <Grid2X2 size={17} />
                Grid
              </button>
              <button className={viewMode === "list" ? "active" : ""} type="button" onClick={() => setViewMode("list")}>
                <List size={17} />
                List
              </button>
            </div>
          </section>

          {error ? <div className="stitch-error">{error}</div> : null}

          {loading ? (
            <p className="stitch-muted">Loading documents...</p>
          ) : filteredDocs.length === 0 ? (
            <div className="stitch-empty-state">No documents found.</div>
          ) : (
            <section className={viewMode === "grid" ? "stitch-document-grid" : "stitch-document-list"}>
              {filteredDocs.map((document) => (
                <article
                  className="stitch-document-card"
                  key={document.id}
                  onClick={() => navigate(`/documents/${document.id}/edit`)}
                >
                  <div className="document-card-top">
                    <div className="document-card-icon">
                      <FileText size={24} />
                    </div>
                    <div className="document-card-actions">
                      <button type="button" aria-label="Edit document" onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/documents/${document.id}/edit`);
                      }}>
                        <Edit3 size={16} />
                      </button>
                      <button type="button" aria-label="Copy document" onClick={(event) => {
                        event.stopPropagation();
                        handleCopy(document.id);
                      }}>
                        <Copy size={16} />
                      </button>
                      <button type="button" aria-label="Delete document" disabled={document.role !== "owner"} onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(document.id);
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h2>{document.title || "Untitled Document"}</h2>
                  <p>{getPreview(document)}</p>

                  <div className="document-tags">
                    <span>v{document.versions?.length || 1}.0</span>
                    <span className="role">{document.role}</span>
                  </div>

                  <footer>
                    <div className="footer-author">
                      <span className="mini-avatar" style={{ backgroundColor: user?.color || "#2563eb" }}>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                      <span>{user?.name || "User"}</span>
                    </div>
                    <span>ID {document.id}</span>
                  </footer>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
