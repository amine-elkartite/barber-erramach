import { useState } from "react";
import { Edit3, Eye, EyeOff, Plus, Trash2, Upload } from "lucide-react";
import { uploadImage, useCrud } from "./data";
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

const empty = { title: "", category: "Coupes", description: "", image: "/images/gallery-1.webp", active: true, position: 0 };
const CATEGORIES = ["Coupes", "Barbe", "Avant / Après", "Salon", "Équipe"];

function GalleryForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const inputId = `gallery-upload-${Math.random().toString(36).slice(2)}`;

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setForm((p) => ({ ...p, image: url }));
    } catch (err) {
      setError(err.message || "Téléversement impossible.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSave({ ...form, position: Number(form.position || 0), active: Boolean(form.active) });
      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de l’enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={initial?.id ? "Modifier la photo" : "Ajouter une photo"}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Annuler</AdminButton>
          <AdminButton type="submit" form="gallery-form" disabled={busy || uploading}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </AdminButton>
        </>
      }
    >
      <form id="gallery-form" className="form-grid two" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <div className="field-span">
          <div className="gallery-preview">
            <img src={form.image || "/images/gallery-1.webp"} alt="" />
            <input id={inputId} type="file" accept="image/*" hidden onChange={pickImage} />
            <label htmlFor={inputId} className="button button-outline button-sm">
              {uploading ? "Téléversement…" : "Téléverser une image"}
              <Upload size={14} />
            </label>
          </div>
        </div>
        <Field label="Titre">
          <input value={form.title} onChange={set("title")} />
        </Field>
        <Field label="Catégorie">
          <select value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="field-span">
          <Field label="Description">
            <textarea value={form.description} onChange={set("description")} rows="2" />
          </Field>
        </div>
        <Field label="Position (ordre)">
          <input type="number" min="0" value={form.position} onChange={set("position")} />
        </Field>
        <label className="check-field">
          <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
          <span>Photo visible sur le site</span>
        </label>
      </form>
    </Modal>
  );
}

export default function Gallery() {
  const { items, loading, error, reload, create, update, remove } = useCrud("/admin/gallery");
  const [filter, setFilter] = useState("Toutes");
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const { toast, notify, dismiss } = useToast();
  const categories = ["Toutes", ...CATEGORIES];
  const shown = filter === "Toutes" ? items : items.filter((g) => g.category === filter);
  const { query, setQuery, filtered } = useSearch(shown, ["title", "description"]);

  const save = async (form) => {
    if (form.id) {
      await update(form.id, form);
      notify("Photo mise à jour.");
      return;
    }
    await create(form);
    notify("Photo ajoutée.");
  };

  return (
    <>
      <PageHeader
        title="Galerie"
        subtitle="Les photos qui illustrent votre travail."
        actions={
          <>
            <AdminButton variant="outline" onClick={reload}>Actualiser</AdminButton>
            <AdminButton icon={Plus} onClick={() => setEditing({})}>Ajouter une photo</AdminButton>
          </>
        }
      />
      <div className="gallery-tabs">
        {categories.map((c) => (
          <button key={c} className={c === filter ? "active" : ""} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>
      <Toolbar value={query} setValue={setQuery} placeholder="Rechercher un titre…" />

      {loading ? (
        <Spinner label="Chargement de la galerie…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucune photo" message="Ajoutez des photos à votre galerie." />
      ) : (
        <div className="gallery-grid">
          {filtered.map((g) => (
            <article className="gallery-card" key={g.id}>
              <img src={g.image} alt={g.title || "Photo"} loading="lazy" />
              <div className="gallery-overlay">
                <span className="gallery-cat">{g.category}</span>
                {g.title && <strong>{g.title}</strong>}
                <small>{formatDate(g.updated_at || g.created_at)}</small>
              </div>
              <div className="gallery-actions">
                <IconButton label={g.active ? "Masquer" : "Afficher"} icon={g.active ? EyeOff : Eye} tone="dark" onClick={async () => {
                  await update(g.id, { active: !g.active });
                  notify(g.active ? "Photo masquée." : "Photo visible.");
                }} />
                <IconButton label="Modifier" icon={Edit3} tone="dark" onClick={() => setEditing(g)} />
                <IconButton label="Supprimer" icon={Trash2} tone="danger" onClick={() => setToDelete(g)} />
              </div>
              <Badge tone={g.active ? "success" : "neutral"} className="gallery-status">
                {g.active ? "Visible" : "Masquée"}
              </Badge>
            </article>
          ))}
        </div>
      )}

      {editing && <GalleryForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
      {toDelete && (
        <ConfirmDialog
          message={`Supprimer cette photo${toDelete.title ? ` « ${toDelete.title} »` : ""} ?`}
          onConfirm={async () => {
            try {
              await remove(toDelete.id);
              notify("Photo supprimée.");
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