import { LogIn, Mail, PenLine, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../../services/authApi";
import type { User } from "../../types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="stitch-auth-page">
      <section className="stitch-auth-shell">
        <header className="stitch-auth-brand">
          <div className="stitch-auth-logo">
            <PenLine size={24} />
          </div>
          <h1>ProWrite Collab</h1>
          <p>Sign in to your collaborative workspace</p>
        </header>

        <form className="stitch-auth-card" onSubmit={handleSubmit}>
          <label>
            <span>Email Address</span>
            <div className="stitch-input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="stitch-input-with-icon">
              <ShieldCheck size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </label>

          {error ? <div className="stitch-error">{error}</div> : null}

          <button className="stitch-primary-button full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
            <LogIn size={18} />
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
