import { useState } from "react";
import type { User } from "../../types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [id, setId] = useState(1);
  const [name, setName] = useState("Demo User");
  const [color, setColor] = useState("#2f80ed");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin({ id, name, color });
  };

  return (
    <main className="login-shell">
      <section className="auth-card auth-card-wide">
        <div className="auth-head">
          <span className="brand-mark brand-mark-lg">PW</span>
          <div>
            <h1>ProWrite Collab</h1>
            <p className="muted auth-tagline">Soạn thảo tài liệu đa người, quản lý phiên bản và cộng tác realtime.</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            User ID
            <input className="input" type="number" value={id} onChange={(event) => setId(Number(event.target.value))} min={1} />
          </label>
          <label>
            Tên hiển thị
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Màu cursor
            <input className="input input-color" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
          <button className="button primary" type="submit">Bắt đầu cùng ProWrite</button>
        </form>
        <div className="auth-foot">
          <p className="muted">Nhập ID để bắt đầu nhanh với môi trường thử nghiệm.</p>
        </div>
      </section>
    </main>
  );
}
