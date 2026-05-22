export function LoginPage({ onLogin }) {
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get("name") || "Demo User";
    onLogin({
      id: Number(form.get("id") || 1),
      name,
      color: form.get("color") || "#2f80ed"
    });
  }

  return (
    <main className="app-shell">
      <div className="page">
        <form className="panel stack" onSubmit={handleSubmit}>
          <div>
            <h1>Collaborative Docs</h1>
            <p className="muted">Dang nhap demo de test user online, permission va realtime editing.</p>
          </div>
          <label className="stack">
            User ID
            <input className="input" name="id" type="number" defaultValue="1" min="1" />
          </label>
          <label className="stack">
            Ten hien thi
            <input className="input" name="name" defaultValue="Demo User" />
          </label>
          <label className="stack">
            Mau cursor
            <input className="input" name="color" type="color" defaultValue="#2f80ed" />
          </label>
          <button className="button" type="submit">Vao he thong</button>
        </form>
      </div>
    </main>
  );
}
