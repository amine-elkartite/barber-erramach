import { useState } from "react";
import { Check, Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import { useCrud } from "./data";
import {
  AdminButton,
  Badge,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Modal,
  PageHeader,
  Spinner,
  Toast,
  Toolbar,
  formatDate,
  useSearch,
  useToast,
} from "./ui";

const empty = { customer_name: "", review: "", rating: 5, image: "", active: true };

function RatingInput({ value, onChange }) {
  return (
    <div className="rating-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={n <= Number(value) ? "on" : ""} onClick={() => onChange(n)} aria-label={`${n} étoiles`}>
          <Star size={20} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSave({ ...form, rating: Number(form.rating), active: Boolean(form.active) });
      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de l’enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={initial?.id ? "Modifier le témoignage" : "Ajouter un témoignage"}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Annuler</AdminButton>
          <AdminButton type="submit" form="review-form" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </AdminButton>
        </>
      }
    >
      <form id="review-form" className="form-grid" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <Field label="Nom du client">
          <input value={form.customer_name} onChange={set("customer_name")} required />
        </Field>
        <Field label="Note">
          <RatingInput value={Number(form.rating) || 5} onChange={(rating) => setForm((p) => ({ ...p, rating }))} />
        </Field>
        <div className="field-span">
          <Field label="Avis">
            <textarea value={form.review} onChange={set("review")} rows="4" required />
          </Field>
        </div>
        <label className="check-field">
          <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
          <span>Témoignage visible sur le site</span>
        </label>
      </form>
    </Modal>
  );
}

export default function Reviews() {
  const { items, loading, error, reload, create, update, remove } = useCrud("/admin/reviews");
  const { query, setQuery, filtered } = useSearch(items, ["customer_name", "review"]);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const { toast, notify, dismiss } = useToast();
  const average = items.length
    ? (items.reduce((s, r) => s + Number(r.rating || 0), 0) / items.length).toFixed(1)
    : "—";

  const save = async (form) => {
    if (form.id) {
      await update(form.id, form);
      notify("Témoignage mis à jour.");
      return;
    }
    await create(form);
    notify("Témoignage ajouté.");
  };

  return (
    <>
      <PageHeader
        title="Témoignages"
        subtitle={`Note moyenne : ${average} / 5`}
        actions={
          <>
            <AdminButton variant="outline" onClick={reload}>Actualiser</AdminButton>
            <AdminButton icon={Plus} onClick={() => setEditing({})}>Ajouter un témoignage</AdminButton>
          </>
        }
      />
      <Toolbar value={query} setValue={setQuery} placeholder="Rechercher un témoignage…" />

      {loading ? (
        <Spinner label="Chargement des témoignages…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun témoignage" message="Ajoutez un avis client." />
      ) : (
        <div className="reviews-grid">
          {filtered.map((r) => (
            <article className="panel review-card" key={r.id}>
              <header className="review-head">
                <span className="cell-avatar">{String(r.customer_name || "?").charAt(0)}</span>
                <div className="review-user">
                  <strong>{r.customer_name}</strong>
                  <small>{formatDate(r.created_at)}</small>
                </div>
                <Badge tone={r.active ? "success" : "neutral"}>{r.active ? "Approuvé" : "En attente"}</Badge>
              </header>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={16} fill={n <= Number(r.rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="review-text">{r.review}</p>
              <footer className="review-actions">
                <IconButton
                  label={r.active ? "Masquer" : "Approuver"}
                  icon={r.active ? EyeOff : Check}
                  onClick={async () => {
                    await update(r.id, { active: !r.active });
                    notify(r.active ? "Témoignage masqué." : "Témoignage approuvé.");
                  }}
                />
                <IconButton label="Modifier" icon={Eye} onClick={() => setEditing(r)} />
                <IconButton label="Supprimer" tone="danger" icon={Trash2} onClick={() => setToDelete(r)} />
              </footer>
            </article>
          ))}
        </div>
      )}

      {editing && <ReviewForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
      {toDelete && (
        <ConfirmDialog
          message={`Supprimer le témoignage de « ${toDelete.customer_name} » ?`}
          onConfirm={async () => {
            try {
              await remove(toDelete.id);
              notify("Témoignage supprimé.");
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