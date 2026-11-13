import { useState } from "react";
import { Edit3, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useCrud } from "./data";
import {
  AdminButton,
  Badge,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  ImagePicker,
  Modal,
  PageHeader,
  Spinner,
  Toast,
  Toolbar,
  useSearch,
  useToast,
} from "./ui";

const empty = { name: "", role: "", phone: "", email: "", image: "/images/barber-1.webp", active: true };

function BarberForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSave({ ...form, active: Boolean(form.active) });
      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de l’enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={initial?.id ? "Modifier le barbier" : "Ajouter un barbier"}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Annuler</AdminButton>
          <AdminButton type="submit" form="barber-form" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </AdminButton>
        </>
      }
    >
      <form id="barber-form" className="form-grid two" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <Field label="Nom complet">
          <input value={form.name} onChange={set("name")} required />
        </Field>
        <Field label="Rôle / spécialité">
          <input value={form.role} onChange={set("role")} placeholder="Barbier, Coiffeur…" />
        </Field>
        <Field label="Téléphone">
          <input type="tel" value={form.phone} onChange={set("phone")} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={set("email")} />
        </Field>
        <div className="field-span">
          <Field label="Photo">
            <ImagePicker value={form.image} onChange={(image) => setForm((p) => ({ ...p, image }))} onError={setError} />
          </Field>
        </div>
        <label className="check-field">
          <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
          <span>Barbier visible sur le site</span>
        </label>
      </form>
    </Modal>
  );
}

export default function Barbers() {
  const { items, loading, error, reload, create, update, remove } = useCrud("/admin/barbers");
  const { query, setQuery, filtered } = useSearch(items, ["name", "role", "phone", "email"]);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const { toast, notify, dismiss } = useToast();

  const save = async (form) => {
    if (form.id) {
      await update(form.id, form);
      notify("Barbier mis à jour.");
      return;
    }
    await create(form);
    notify("Barbier créé.");
  };

  return (
    <>
      <PageHeader
        title="Barbiers"
        subtitle="L’équipe du salon."
        actions={
          <>
            <AdminButton variant="outline" onClick={reload}>Actualiser</AdminButton>
            <AdminButton icon={Plus} onClick={() => setEditing({})}>Ajouter un barbier</AdminButton>
          </>
        }
      />
      <Toolbar value={query} setValue={setQuery} placeholder="Rechercher un barbier…" />

      {loading ? (
        <Spinner label="Chargement des barbiers…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun barbier" message="Ajoutez un membre de l’équipe." />
      ) : (
        <div className="card-grid">
          {filtered.map((b) => (
            <article className="service-card barber-card" key={b.id}>
              <img src={b.image || "/images/barber-1.webp"} alt="" />
              <div className="service-card-body">
                <div className="service-card-head">
                  <h3>{b.name}</h3>
                  <Badge tone={b.active ? "success" : "neutral"}>{b.active ? "Visible" : "Masqué"}</Badge>
                </div>
                <small className="service-category">{b.role || "Barbier"}</small>
                <p className="service-duration">{b.phone && <span className="cell-contact">{b.phone}</span>}</p>
                <div className="service-card-actions">
                  <IconButton label="Modifier" icon={Edit3} onClick={() => setEditing(b)} />
                  <IconButton
                    label={b.active ? "Masquer" : "Afficher"}
                    icon={b.active ? EyeOff : Eye}
                    onClick={async () => {
                      await update(b.id, { active: !b.active });
                      notify(b.active ? "Barbier masqué." : "Barbier visible.");
                    }}
                  />
                  <IconButton label="Supprimer" tone="danger" icon={Trash2} onClick={() => setToDelete(b)} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && <BarberForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
      {toDelete && (
        <ConfirmDialog
          message={`Supprimer le barbier « ${toDelete.name} » ?`}
          onConfirm={async () => {
            try {
              await remove(toDelete.id);
              notify("Barbier supprimé.");
            } catch (e) {
              notify(e.message, "error");
            }
            setToDelete(null);
          }}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismiss} />}
    </>
  );
}