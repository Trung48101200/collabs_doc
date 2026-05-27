import { ArrowLeft, Edit3, FileText, HelpCircle, History, Settings, Share2 } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ManageAccessModal } from "../../components/ManageAccessModal/ManageAccessModal";
import { DocumentEditor } from "../../editor/DocumentEditor";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useDocumentCollaborators } from "../../hooks/useDocumentCollaborators";
import { useDocumentDetail } from "../../hooks/useDocumentDetail";
import { useSession } from "../../hooks/useSession";
import { updateDocumentTitle } from "../../services/documentApi";
import type { Collaborator, DocumentModel, User } from "../../types";

function CollaboratorRow({ collaborator, isCurrentUser }: { collaborator: Collaborator; isCurrentUser: boolean }) {
  const initial = (collaborator.name || "U").charAt(0).toUpperCase();
  return (
    <div className={`stitch-collaborator ${isCurrentUser ? "active" : ""}`}>
      <div className="presence-avatar" style={{ backgroundColor: collaborator.color || "#2563eb" }}>
        {initial}
        <span className="presence-dot" />
      </div>
      <div>
        <strong>{collaborator.name || "Unknown"}{isCurrentUser ? " (You)" : ""}</strong>
        <span>{collaborator.role}</span>
      </div>
    </div>
  );
}

function EditorLoadedWorkspace({ document, user }: { document: DocumentModel; user: User }) {
  const navigate = useNavigate();
  const { collaborators, invite, remove, updateRole } = useDocumentCollaborators(document.id, user);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
// --- Quản lý tài liệu và tiêu đề (từ nhánh feature/frontend-init) ---
  const [currentDocument, setCurrentDocument] = useState<DocumentModel>(document);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(document.title || "");
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  // --- Quản lý hiển thị người dùng cùng thao tác (từ nhánh collab/sync-cursor) ---
  const [presenceUsers, setPresenceUsers] = useState<User[]>([]);

  // --- Effects và Logic ---
  useEffect(() => {
    setCurrentDocument(document);
    setTitleDraft(document.title || "");
  }, [document]);

  const canEditTitle = currentDocument.role !== "viewer";

  const visibleCollaborators = collaborators.length
    ? collaborators
    : [{ id: user.id, userId: user.id, name: user.name, email: user.email, role: currentDocument.role, color: user.color }];

  const activeUsers = presenceUsers.slice(0, 3);
  const activeCount = presenceUsers.length;
  const onlineLabel = presenceUsers.length
    ? presenceUsers.map((item) => item.name || `User ${item.id}`).join(", ")
    : "No one online";

  return (
    <div className="stitch-editor-shell">
      <aside className="stitch-editor-sidebar">
        <div className="workspace-heading">
          <div className="stitch-brand-mark">
            <FileText size={22} />
          </div>
          <div>
            <h2>Workspace</h2>
            <p>Collaborative Team</p>
          </div>
        </div>

        <section className="sidebar-section">
          <h3>Collaborators</h3>
          <div className="collaborator-list">
            {visibleCollaborators.map((collaborator) => (
              <CollaboratorRow
                key={`${collaborator.userId}-${collaborator.role}`}
                collaborator={collaborator}
                isCurrentUser={collaborator.userId === user.id}
              />
            ))}
          </div>
        </section>

        <nav className="stitch-side-actions">
          <button type="button">
            <Settings size={18} />
            Settings
          </button>
          <button type="button">
            <HelpCircle size={18} />
            Help
          </button>
        </nav>
      </aside>

      <main className="stitch-editor-main">
        <header className="stitch-editor-topbar">
          <div className="editor-title-row">
            <button className="stitch-icon-button" type="button" onClick={() => navigate("/documents")} aria-label="Back to documents">
              <ArrowLeft size={18} />
            </button>
            <div className="editor-title-stack">
              {isEditingTitle ? (
                <div className="title-edit-row">
                  <input
                    className="document-title-input"
                    value={titleDraft}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setTitleDraft(event.target.value)}
                    onBlur={async () => {
                      if (!titleSaving) {
                        const trimmedTitle = titleDraft.trim() || "Untitled Document";
                        if (trimmedTitle !== currentDocument.title) {
                          setTitleSaving(true);
                          setTitleError(null);
                          try {
                            const updated = await updateDocumentTitle(currentDocument.id, trimmedTitle, user);
                            setCurrentDocument(updated);
                          } catch (err) {
                            setTitleError(err instanceof Error ? err.message : "Unable to update title");
                          } finally {
                            setTitleSaving(false);
                            setIsEditingTitle(false);
                          }
                        } else {
                          setIsEditingTitle(false);
                        }
                      }
                    }}
                    onKeyDown={async (event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        const trimmedTitle = titleDraft.trim() || "Untitled Document";
                        if (trimmedTitle !== currentDocument.title) {
                          setTitleSaving(true);
                          setTitleError(null);
                          try {
                            const updated = await updateDocumentTitle(currentDocument.id, trimmedTitle, user);
                            setCurrentDocument(updated);
                          } catch (err) {
                            setTitleError(err instanceof Error ? err.message : "Unable to update title");
                          } finally {
                            setTitleSaving(false);
                            setIsEditingTitle(false);
                          }
                        } else {
                          setIsEditingTitle(false);
                        }
                      }
                      if (event.key === "Escape") {
                        setTitleDraft(currentDocument.title || "");
                        setIsEditingTitle(false);
                        setTitleError(null);
                      }
                    }}
                    disabled={titleSaving}
                    autoFocus
                  />
                  {titleSaving ? <span className="saved-pill">Saving...</span> : null}
                  {titleError ? <div className="stitch-error title-error">{titleError}</div> : null}
                </div>
              ) : (
                <div className="title-display-row">
                  <div className="title-text-row">
                    <h1>{currentDocument.title || "Untitled Document"}</h1>
                    {canEditTitle ? (
                      <button
                        className="stitch-icon-button"
                        type="button"
                        onClick={() => setIsEditingTitle(true)}
                        aria-label="Edit document title"
                      >
                        <Edit3 size={16} />
                      </button>
                    ) : null}
                  </div>
                  <span className="saved-pill">Saved</span>
                </div>
              )}
            </div>
          </div>

          <div className="editor-topbar-actions">
            <div className="stacked-avatars" aria-label="Active collaborators">
              {activeUsers.map((collaborator) => (
                <div
                  className="small-avatar"
                  style={{ backgroundColor: collaborator.color || "#2563eb" }}
                  key={"userId" in collaborator ? collaborator.userId : collaborator.id}
                >
                  {(collaborator.name || "U").charAt(0).toUpperCase()}
                </div>
              ))}
              {activeCount > 3 ? <div className="small-avatar muted">+{activeCount - 3}</div> : null}
            </div>
            <span className="stitch-muted" title={onlineLabel}>
              Online ({activeCount}): {onlineLabel}
            </span>
            <button className="stitch-icon-button" type="button" onClick={() => setIsVersionOpen(true)} aria-label="Open version history">
              <History size={18} />
            </button>
            <button className="stitch-primary-button" type="button" onClick={() => setIsShareOpen(true)}>
              <Share2 size={16} />
              Share
            </button>
          </div>
        </header>

        <ErrorBoundary fallback={
          <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>Editor failed to load.</h2>
            <p>There was a problem initializing the collaboration system.</p>
            <button className="stitch-primary-button" onClick={() => window.location.reload()}>Retry</button>
          </div>
        }>
          <DocumentEditor
            documentData={currentDocument}
            user={user}
            isVersionOpen={isVersionOpen}
            onCloseVersions={() => setIsVersionOpen(false)}
            onPresenceChange={setPresenceUsers}
          />
        </ErrorBoundary>
      </main>

      <ManageAccessModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        collaborators={visibleCollaborators}
        canManage={currentDocument.role === "owner"}
        onInvite={invite}
        onRemove={remove}
        onChangeRole={updateRole}
      />
    </div>
  );
}

function EditorWorkspace({ documentId, user }: { documentId: number; user: User }) {
  const navigate = useNavigate();
  const { document, loading, error } = useDocumentDetail(documentId, user);

  if (loading) {
    return (
      <main className="stitch-loading-page">
        <div className="stitch-brand-mark">
          <FileText size={22} />
        </div>
        <p>Opening your workspace...</p>
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="stitch-loading-page">
        <div className="stitch-brand-mark error">
          <FileText size={22} />
        </div>
        <h1>Failed to load editor</h1>
        <p>{error || "Document not found"}</p>
        <button className="stitch-primary-button" type="button" onClick={() => navigate("/documents")}>
          Back to Dashboard
        </button>
      </main>
    );
  }

  return <EditorLoadedWorkspace document={document} user={user} />;
}

export function EditorPage() {
  const { documentId } = useParams();
  const { user } = useSession();
  const numericDocumentId = Number(documentId);

  if (!documentId || Number.isNaN(numericDocumentId) || !user) {
    return <Navigate to="/documents" replace />;
  }

  return <EditorWorkspace documentId={numericDocumentId} user={user} />;
}
