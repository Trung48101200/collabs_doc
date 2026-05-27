import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: "20px", color: "#ef4444", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "8px", margin: "20px" }}>
            <h2>Something went wrong.</h2>
            <details style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
              {this.state.error?.toString()}
            </details>
            <button 
              onClick={() => window.location.reload()}
              style={{ marginTop: "15px", padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
