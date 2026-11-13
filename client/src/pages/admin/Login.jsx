import { useState } from "react";
import { KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "./auth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e.message || "Impossible de se connecter.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <img src="/images/logo.webp" alt="ER RAMMACH" className="login-logo" />
        <h1>Administration</h1>
        <p className="login-sub">Connectez-vous pour gérer votre salon.</p>
        {error && <div className="login-error">{error}</div>}
        <label className="login-field">
          <Mail size={17} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="username"
            required
          />
        </label>
        <label className="login-field">
          <Lock size={17} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" className="button button-primary login-submit" disabled={busy}>
          {busy ? <Loader2 className="spin" size={17} /> : <KeyRound size={17} />}
          {busy ? "Connexion…" : "Se connecter"}
        </button>
        <p className="login-hint">Espace réservé à l&apos;administration du salon.</p>
      </form>
    </div>
  );
}