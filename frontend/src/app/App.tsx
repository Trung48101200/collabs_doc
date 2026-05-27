import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider } from "../contexts/SessionContext";
import { LoginPage } from "../pages/Login/LoginPage";
import { RegisterPage } from "../pages/Register/RegisterPage";
import { DocumentsPage } from "../pages/Documents/DocumentsPage";
import { EditorPage } from "../pages/Editor/EditorPage";
import { ErrorBoundary } from "../components/ErrorBoundary";
import type { User } from "../types";
import { getUserColor } from "../utils/userColor";

function withUserColor(user: User): User {
  return {
    ...user,
    color: user.color || getUserColor(user.id)
  };
}

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("collab-doc-user");
      if (!saved) return null;
      const parsed = withUserColor(JSON.parse(saved) as User);
      localStorage.setItem("collab-doc-user", JSON.stringify(parsed));
      return parsed;
    } catch (err) {
      console.error("Failed to load user from localStorage", err);
      localStorage.removeItem("collab-doc-user");
      return null;
    }
  });

  const setSessionUser = useCallback((nextUser: User | null) => {
    if (nextUser) {
      const normalized = withUserColor(nextUser);
      localStorage.setItem("collab-doc-user", JSON.stringify(normalized));
      setUser(normalized);
    } else {
      localStorage.removeItem("collab-doc-user");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionUser(null);
    };

    const handleSessionUpdated = (event: Event) => {
      const nextUser = (event as CustomEvent<User>).detail;
      if (nextUser) setUser(withUserColor(nextUser));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "collab-doc-user") return;
      if (event.newValue) {
        try {
          const nextUser = JSON.parse(event.newValue) as User;
          setUser(withUserColor(nextUser));
        } catch {
          setSessionUser(null);
        }
        return;
      }
      // user removed in another tab
      setSessionUser(null);
    };

    window.addEventListener("collab-doc-session-expired", handleSessionExpired);
    window.addEventListener("collab-doc-session-updated", handleSessionUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("collab-doc-session-expired", handleSessionExpired);
      window.removeEventListener("collab-doc-session-updated", handleSessionUpdated);
      window.removeEventListener("storage", handleStorage);
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
