import { useEffect, useState } from "react";
import { createDocument, listDocuments } from "../services/documentApi.js";

export function DocumentListPage({ session, onOpenDocument }) {
  const { user } = session;
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("Tai lieu moi");
  const [error, setError] = useState("");

  async function loadDocuments() {
    try {
      setDocuments(await listDocuments(user));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    const doc = await createDocument(title, user);
    onOpenDocument(doc.id);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">Collaborative Docs</div>
        <div className="muted">{user.name}</div>
      </header>
      <section className="page stack">
        <form className="panel row" onSubmit={handleCreate}>
          <input
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ten tai lieu"
          />
          <button className="button" type="submit">Tao tai lieu</button>
        </form>
        {error ? <div className="panel">{error}</div> : null}
        <div className="document-grid">
          {documents.map((doc) => (
            <article
              className="document-card"
              key={doc.id}
              onClick={() => onOpenDocument(doc.id)}
            >
              <h3>{doc.title}</h3>
              <p className="muted">{doc.contentText || "Chua co noi dung"}</p>
              <p className="muted">Role: {doc.role || "unknown"}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
