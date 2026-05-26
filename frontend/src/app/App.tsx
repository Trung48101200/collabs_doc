import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider } from "../contexts/SessionContext";
import { LoginPage } from "../pages/Login/LoginPage";
import { RegisterPage } from "../pages/Register/RegisterPage";
import { DocumentsPage } from "../pages/Documents/DocumentsPage";
import { EditorPage } from "../pages/Editor/EditorPage";
import { ErrorBoundary } from "../components/ErrorBoundary";
import type { User } from "../types";

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("collab-doc-user");
      return saved ? (JSON.parse(saved) as User) : null;
    } catch (err) {
      console.error("Failed to load user from localStorage", err);
      localStorage.removeItem("collab-doc-user");
      return null;
    }
  });

  const setSessionUser = useCallback((nextUser: User | null) => {
    if (nextUser) {
      localStorage.setItem("collab-doc-user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("collab-doc-user");
    }
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionUser(null);
    };

    const handleSessionUpdated = (event: Event) => {
      const nextUser = (event as CustomEvent<User>).detail;
      if (nextUser) setUser(nextUser);
    };

    window.addEventListener("collab-doc-session-expired", handleSessionExpired);
    window.addEventListener("collab-doc-session-updated", handleSessionUpdated);

    return () => {
      window.removeEventListener("collab-doc-session-expired", handleSessionExpired);
      window.removeEventListener("collab-doc-session-updated", handleSessionUpdated);
    };
  }, [setSessionUser]);

  const session = useMemo(() => ({ user, setUser: setSessionUser }), [user, setSessionUser]);

  const handleAuth = (nextUser: User) => {
    setSessionUser(nextUser);
  };

  const isAuthenticated = Boolean(user);

  return (
    <ErrorBoundary>
      <SessionProvider value={session}>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/documents" replace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/documents" replace /> : <LoginPage onLogin={handleAuth} />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/documents" replace /> : <RegisterPage onRegister={handleAuth} />}
          />
          <Route
            path="/documents"
            element={isAuthenticated ? <DocumentsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/documents/:documentId"
            element={isAuthenticated ? <Navigate to="edit" replace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/documents/:documentId/edit"
            element={isAuthenticated ? <EditorPage /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionProvider>
    </ErrorBoundary>
  );
}
