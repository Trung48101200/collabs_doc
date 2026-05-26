import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider } from "../contexts/SessionContext";
import { LoginPage } from "../pages/Login/LoginPage";
import { DocumentsPage } from "../pages/Documents/DocumentsPage";
import { DocumentDetailPage } from "../pages/DocumentDetail/DocumentDetailPage";
import { EditorPage } from "../pages/Editor/EditorPage";
import type { User } from "../types";

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("collab-doc-user");
    return saved ? (JSON.parse(saved) as User) : null;
  });

  const session = useMemo(() => ({ user, setUser }), [user]);

  const handleLogin = (nextUser: User) => {
    localStorage.setItem("collab-doc-user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const isAuthenticated = Boolean(user);

  return (
    <SessionProvider value={session}>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/documents" replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/documents" replace /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/documents"
          element={isAuthenticated ? <DocumentsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/documents/:documentId"
          element={isAuthenticated ? <DocumentDetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/documents/:documentId/edit"
          element={isAuthenticated ? <EditorPage /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionProvider>
  );
}
