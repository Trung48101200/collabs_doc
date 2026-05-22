import { useMemo, useState } from "react";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DocumentListPage } from "./pages/DocumentListPage.jsx";
import { EditorPage } from "./pages/EditorPage.jsx";

export function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("collab-doc-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const session = useMemo(() => ({ user, setUser }), [user]);

  function handleLogin(nextUser) {
    localStorage.setItem("collab-doc-user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  if (selectedDocumentId) {
    return (
      <EditorPage
        session={session}
        documentId={selectedDocumentId}
        onBack={() => setSelectedDocumentId(null)}
      />
    );
  }

  return <DocumentListPage session={session} onOpenDocument={setSelectedDocumentId} />;
}
