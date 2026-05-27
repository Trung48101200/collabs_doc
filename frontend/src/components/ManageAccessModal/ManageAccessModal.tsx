import { Mail, Shield, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import type { Collaborator } from "../../types";

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  canManage: boolean;
  onInvite: (email: string, role: "viewer" | "editor") => Promise<void> | void;
  onRemove: (userId: number) => Promise<void> | void;
  onChangeRole: (userId: number, role: "viewer" | "editor") => Promise<void> | void;
}

export function ManageAccessModal({
  isOpen,
  onClose,
  collaborators,
  canManage,
  onInvite,
  onRemove,
  onChangeRole
}: ManageAccessModalProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor">("editor");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;

    setError(null);
    setLoading(true);
    try {
      await onInvite(inviteEmail.trim(), inviteRole);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to invite collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: number) => {
    setError(null);
    try {
      await onRemove(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove collaborator");
    }
  };

  const handleChangeRole = async (userId: number, role: "viewer" | "editor") => {
    setError(null);
    try {
      await onChangeRole(userId, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update collaborator");
    }
  };

  return (
    <div className="access-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="manage-access-title">
      <section className="access-modal">
        <header className="access-modal-header">
          <h2 id="manage-access-title">Manage Access</h2>
          <button className="stitch-icon-button" type="button" onClick={onClose} aria-label="Close access modal">
            <X size={18} />
          </button>
        </header>

        <form className="access-invite-row" onSubmit={handleInvite}>
          <label>
            <span>Invite collaborators via email</span>
            <div className="stitch-input-with-icon">
              <Mail size={17} />
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                disabled={!canManage || loading}
              />
            </div>
          </label>
          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as "viewer" | "editor")}
            disabled={!canManage || loading}
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button className="stitch-primary-button" type="submit" disabled={!canManage || loading || !inviteEmail.trim()}>
            {loading ? "Inviting..." : "Invite"}
          </button>
        </form>

        {error ? <div className="stitch-error">{error}</div> : null}
        {!canManage ? <div className="access-note">Only the owner can invite or change collaborator roles.</div> : null}

        <div className="access-list">
          <h3>People with access</h3>
          {collaborators.length === 0 ? (
            <p className="stitch-muted">No collaborators have been added yet.</p>
          ) : (
            collaborators.map((collaborator) => (
              <article className="access-person" key={`${collaborator.userId}-${collaborator.role}`}>
                <div className="access-person-main">
                  <div className="presence-avatar" style={{ backgroundColor: collaborator.color || "#2563eb" }}>
                    {collaborator.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{collaborator.name}</strong>
                    <span>{collaborator.email || "No email"}</span>
                  </div>
                </div>

                <div className="access-person-actions">
                  {collaborator.role === "owner" ? (
                    <span className="owner-chip">
                      <Shield size={14} />
                      Owner
                    </span>
                  ) : (
                    <select
                      value={collaborator.role}
                      disabled={!canManage}
                      onChange={(event) => handleChangeRole(collaborator.userId, event.target.value as "viewer" | "editor")}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  )}
                  <button
                    className="stitch-danger-button"
                    type="button"
                    disabled={!canManage || collaborator.role === "owner"}
                    onClick={() => handleRemove(collaborator.userId)}
                    aria-label={`Remove ${collaborator.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
