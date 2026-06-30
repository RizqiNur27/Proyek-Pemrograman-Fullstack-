import "../assets/css/AuthPage.css";
import useAuthPage from "../hooks/useAuthPage";

export default function AuthPage({ onSuccess, onClose }) {
  const {
    mode,
    setMode,
    form,
    loading,
    error,
    handleChange,
    handleSubmit,
  } = useAuthPage(onSuccess);

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="auth-brand">
          <img
            src="/logo-warkop.svg"
            className="auth-logo-img"
            alt="Logo Warkop"
          />
          <h1>Warkop Sibontot</h1>
          <p>Tempat Ngopi Terbaik Abad Ini</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Masuk
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="field">
              <label>Nama Lengkap</label>
              <input
                name="nama"
                type="text"
                placeholder="Nama kamu"
                value={form.nama}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="field">
            <label>Email Anda</label>
            <input
              name="email"
              type="email"
              placeholder="Masukkan Email Anda"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Masukkan Password Anda"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Memproses..."
              : mode === "login"
              ? "Masuk"
              : "Buat Akun"}
          </button>
        </form>
      </div>
    </div>
  );
}