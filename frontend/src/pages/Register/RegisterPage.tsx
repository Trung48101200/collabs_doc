import { ArrowRight, Lock, Mail, PenLine, UserRound } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { login, register } from "../../services/authApi";
import type { User } from "../../types";

interface RegisterPageProps {
  onRegister: (user: User) => void;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      const user = await login(email, password);
      onRegister(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="stitch-auth-page register">
      <section className="stitch-auth-shell">
        <header className="stitch-auth-brand">
          <div className="stitch-auth-logo">
            <PenLine size={24} />
          </div>
          <h1>ProWrite Collab</h1>
          <p>Start collaborating with your team today.</p>
        </header>

        <form className="stitch-auth-card" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <div className="stitch-input-with-icon">
              <UserRound size={18} />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          </label>

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
              <Lock size={18} />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </label>

          <label>
            <span>Confirm Password</span>
            <div className="stitch-input-with-icon">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
          </label>

          {error ? <div className="stitch-error">{error}</div> : null}

          <button className="stitch-primary-button full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register Account"}
            <ArrowRight size={18} />
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
