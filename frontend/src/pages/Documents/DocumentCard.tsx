import type { DocumentModel } from "../../types";

interface DocumentCardProps {
  document: DocumentModel;
  onSelect: () => void;
}

export function DocumentCard({ document, onSelect }: DocumentCardProps) {
  return (
    <article className="document-card panel" onClick={onSelect}>
      <div className="doc-card-header">
        <span className="doc-icon">W</span>
        <div>
          <h3>{document.title}</h3>
          <p className="muted">{document.role.toUpperCase()}</p>
        </div>
      </div>
      <p className="doc-card-body">{document.contentText || "Không có mô tả"}</p>
      <div className="doc-card-footer">
        <span className="muted">Xem chi tiết</span>
        <span className="tag">{document.role}</span>
      </div>
    </article>
  );
}
