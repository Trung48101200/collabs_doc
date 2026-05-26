import { Download, History, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { restoreVersion } from "../services/documentApi";
import { useDocumentVersions } from "../hooks/useDocumentVersions";
import type { DocumentVersion, User } from "../types";

interface VersionPanelProps {
  documentId: number;
  user: User;
  canEdit: boolean;
  isOpen: boolean;
  onClose: () => void;
  onBeforeCreateVersion: () => Promise<void>;
  onRestored: () => Promise<void> | void;
}

function formatVersionDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getVersionLabel(version: DocumentVersion, index: number) {
  if (index === 0) return "Current Version";
  if (index === 1) return "Previous";
  return `Version ${version.versionNumber}`;
}

export function VersionPanel({
  documentId,
  user,
  canEdit,
  isOpen,
  onClose,
  onBeforeCreateVersion,
  onRestored
}: VersionPanelProps) {
  const { versions, loading, error, refresh } = useDocumentVersions(documentId, user);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyVersionId, setBusyVersionId] = useState<number | null>(null);
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  const handleCreateVersion = async () => {
    setActionError(null);
    setBusyVersionId(-1);
    try {
      await onBeforeCreateVersion();
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to create version");
    } finally {
      setBusyVersionId(null);
    }
  };

  const handleRestore = async (versionId: number) => {
    const confirmed = window.confirm("Restore this version? Your current document will be replaced.");
    if (!confirmed) return;

    setActionError(null);
    setBusyVersionId(versionId);
    try {
      await restoreVersion(documentId, versionId, user);
      await refresh();
      await onRestored();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to restore version");
    } finally {
      setBusyVersionId(null);
    }
  };

  return (
    <aside className={`version-drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="version-drawer-header">
        <div className="drawer-title">
          <History size={20} />
          <h2>Version History</h2>
        </div>
        <button className="stitch-icon-button" type="button" onClick={onClose} aria-label="Close version history">
          <X size={18} />
        </button>
      </div>

      <div className="version-list-panel">
        {loading ? <p className="stitch-muted">Loading versions...</p> : null}
        {error ? <div className="stitch-error">{error}</div> : null}
        {actionError ? <div className="stitch-error">{actionError}</div> : null}

        {!loading && sortedVersions.length === 0 ? (
          <div className="version-empty">
            <p>No versions yet.</p>
            <span>Create one after saving the document.</span>
          </div>
        ) : null}

        {sortedVersions.map((version, index) => (
          <article className={`version-item-row ${index === 0 ? "current" : ""}`} key={version.id}>
            <div className="version-item-main">
              <div className="version-item-top">
                <span>{getVersionLabel(version, index)}</span>
                <strong>v{version.versionNumber}</strong>
              </div>
              <p>{formatVersionDate(version.createdAt)}</p>
              <small>
                {version.updateCount || 0} updates
                {version.changeSetKey ? ` - ${version.changeSetKey}` : ""}
              </small>
            </div>
            {index > 0 && canEdit ? (
              <button
                className="version-restore-button"
                type="button"
                disabled={busyVersionId === version.id}
                onClick={() => handleRestore(version.id)}
              >
                <RotateCcw size={14} />
                {busyVersionId === version.id ? "Restoring" : "Restore"}
              </button>
            ) : null}
          </article>
        ))}
      </div>

      <footer className="version-drawer-footer">
        <p>Versions are saved automatically during edits, and you can create a named checkpoint anytime.</p>
        <button className="stitch-secondary-button" type="button" onClick={handleCreateVersion} disabled={!canEdit || busyVersionId === -1}>
          <Download size={16} />
          {busyVersionId === -1 ? "Creating..." : "Create version"}
        </button>
      </footer>
    </aside>
  );
}
