import { createContext, ReactNode, useContext } from "react";
import type { User } from "../types";

interface SessionContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ value, children }: { value: SessionContextValue; children: ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
}
