import type { User } from "../types";

export function CursorLayer({ collaborators }: { collaborators: User[] }) {
  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className="panel row" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
      <span className="muted">Người đang chỉnh sửa:</span>
      {collaborators.map((user) => (
        <span key={user.id} className="user-pill" style={{ borderColor: user.color }}>
          <span className="dot" style={{ backgroundColor: user.color }} />
          {user.name}
        </span>
      ))}
    </div>
  );
}
