import { useState } from "react";
import { KeyRound, Loader2, Mail, Phone, Save, ShieldCheck, User } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "./auth";
import { AdminButton, ErrorState, Field, ImagePicker, PageHeader, Spinner, Toast, formatDate, useToast } from "./ui";

export default function Profile() {
  const { admin, logout, reload } = useAuth();
  const [form, setForm] = useState(() => ({ ...(admin || {}) }));
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState(null);
  const { toast, notify, dismiss } = useToast();

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await api("/admin/profile", { method: "PATCH", body: JSON.stringify(form) });
      setForm((p) => ({ ...p, ...updated }));
      await reload();
      notify("Profil mis à jour.");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError(null);
    if (password.next !== password.confirm) {
      setPwError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setPwBusy(true);
    try {
      await api("/admin/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: password.current, new_password: password.next }),
      });
      notify("Mot de passe mis à jour. Vous allez être déconnecté.");
      setPassword({ current: "", next: "", confirm: "" });
      window.setTimeout(() => logout(), 1200);
    } catch (err) {
      setPwError(err.message || "Impossible de modifier le mot de passe.");
    } finally {
      setPwBusy(false);
    }
  };

  if (!admin) return <Spinner label="Chargement du profil…" />;

  return (
    <>
      <PageHeader title="Mon Profil" subtitle="Vos informations de connexion et de sécurité." />
      <section className="profile-grid">
        <aside className="panel profile-summary">
          <img src={admin.avatar || "/images/barber-1.webp"} alt="" />
          <h3>{admin.name}</h3>
          <BadgeRole role={admin.role} />
          <dl>
            <div><dt><Mail size={14} /> Email</dt><dd>{admin.email}</dd></div>
            <div><dt><Phone size={14} /> Téléphone</dt><dd>{admin.phone || "—"}</dd></div>
            <div><dt><ShieldCheck size={14} /> Rôle</dt><dd>{admin.role}</dd></div>
            <div><dt><User size={14} /> Membre depuis</dt><dd>{formatDate(admin.created_at)}</dd></div>
          </dl>
          <AdminButton variant="outline" onClick={logout}>Se déconnecter</AdminButton>
        </aside>

        <div className="panel settings-panel">
          <h4>Informations personnelles</h4>
          <form className="form-grid two" onSubmit={saveProfile}>
            <Field label="Nom complet">
              <input value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </Field>
            <Field label="Téléphone">
              <input value={form.phone ?? ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </Field>
            <Field label="Photo de profil">
              <ImagePicker
                value={form.avatar ?? ""}
                onChange={(avatar) => setForm((p) => ({ ...p, avatar }))}
                onError={(msg) => notify(msg, "error")}
                fallback="/images/barber-1.webp"
              />
            </Field>
            <Field label="Email">
              <input value={form.email ?? ""} disabled />
            </Field>
            <div className="field-span">
              <button className="button button-primary" type="submit" disabled={busy}>
                {busy ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                Enregistrer le profil
              </button>
            </div>
          </form>
        </div>

        <div className="panel settings-panel">
          <h4>Changer le mot de passe</h4>
          <form className="form-grid" onSubmit={changePassword}>
            {pwError && <div className="form-error">{pwError}</div>}
            <Field label="Mot de passe actuel">
              <input type="password" value={password.current} onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))} autoComplete="current-password" required />
            </Field>
            <Field label="Nouveau mot de passe (8 caractères min.)">
              <input type="password" value={password.next} onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" required />
            </Field>
            <Field label="Confirmer le nouveau mot de passe">
              <input type="password" value={password.confirm} onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" required />
            </Field>
            <div className="field-span">
              <AdminButton type="submit" icon={KeyRound} disabled={pwBusy}>
                {pwBusy ? "Enregistrement…" : "Mettre à jour le mot de passe"}
              </AdminButton>
            </div>
          </form>
        </div>
      </section>
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}
    </>
  );
}

function BadgeRole({ role }) {
  return <span className="badge badge-gold">{role || "Administrateur"}</span>;
}