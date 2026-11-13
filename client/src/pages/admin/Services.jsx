import { useState } from "react";
import { Download, Edit3, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { serviceCategories } from "../../../../shared/catalog";
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
  servicePrice,
  useSearch,
  useToast,
} from "./ui";

const empty = { name: "", category: "coupe_moderne", price: 0, price_type: "fixed", duration: 30, description: "", image: "/images/service-1.webp", active: true, display_order: 0 };

function ServiceForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...empty, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
        display_order: Number(form.display_order || 0),
        active: Boolean(form.active),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de l’enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={initial?.id ? "Modifier le service" : "Ajouter un service"}
      onClose={onClose}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>Annuler</AdminButton>
          <AdminButton type="submit" form="service-form" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </AdminButton>
        </>
      }
    >
      <form id="service-form" className="form-grid two" onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <Field label="Nom du service">
          <input value={form.name} onChange={set("name")} required />
        </Field>
        <Field label="Catégorie">
          <select value={form.category} onChange={set("category")}>
            {serviceCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Prix (DH)">
          <input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} required />
        </Field>
        <Field label="Type de prix">
          <select value={form.price_type} onChange={set("price_type")}>
            <option value="fixed">Prix fixe</option>
            <option value="starting_from">À partir de</option>
          </select>
        </Field>
        <Field label="Durée (minutes)">
          <input type="number" min="5" step="5" value={form.duration} onChange={set("duration")} required />
        </Field>
        <Field label="Ordre d’affichage">
          <input type="number" min="0" value={form.display_order} onChange={set("display_order")} />
        </Field>
        <div className="field-span">
          <Field label="Image">
            <ImagePicker value={form.image} onChange={(image) => setForm((p) => ({ ...p, image }))} onError={setError} />
          </Field>
        </div>
        <div className="field-span">
          <Field label="Description">
            <textarea value={form.description} onChange={set("description")} rows="3" />
          </Field>
        </div>
        <label className="check-field">
          <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
          <span>Service visible sur le site</span>
        </label>
      </form>
    </Modal>
  );
}

export default function Services() {
  const { items, loading, error, reload, create, update, remove } = useCrud("/admin/services");
  const { query, setQuery, filtered } = useSearch(items, ["name", "category", "description"]);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const { toast, notify, dismiss } = useToast();

  const saveService = async (form) => {
    if (form.id) {
      const saved = await update(form.id, form);
      notify("Service mis à jour.");
      return saved;
    }
    const created = await create(form);
    notify("Service créé.");
    return created;
  };

  const toggleActive = async (s) => {
    await update(s.id, { active: !s.active });
    notify(s.active ? "Service masqué." : "Service visible sur le site.");
  };

  const exportRows = () => {
    const csv = filtered
      .map((s) => `"${s.name}","${s.category}","${s.duration}","${servicePrice(s)}","${s.active ? "Actif" : "Masqué"}"`)
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "services.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Services"
        subtitle="Gérez votre catalogue de prestations."
        actions={
          <>
            <AdminButton variant="outline" icon={Download} onClick={exportRows}>Exporter CSV</AdminButton>
            <AdminButton icon={Plus} onClick={() => setEditing({})}>Ajouter un service</AdminButton>
          </>
        }
      />
      <Toolbar value={query} setValue={setQuery} placeholder="Rechercher un service…">
        <AdminButton variant="outline" onClick={reload}>Actualiser</AdminButton>
      </Toolbar>

      {loading ? (
        <Spinner label="Chargement des services…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun service" message="Ajoutez un service pour commencer." />
      ) : (
        <div className="card-grid">
          {filtered.map((s) => (
            <article className="service-card" key={s.id}>
              <img src={s.image || "/images/service-1.webp"} alt="" />
              <div className="service-card-body">
                <div className="service-card-head">
                  <h3>{s.name}</h3>
                  <Badge tone={s.active ? "success" : "neutral"}>{s.active ? "Visible" : "Masqué"}</Badge>
                </div>
                <small className="service-category">
                  {serviceCategories.find((c) => c.id === s.category)?.label || s.category}
                </small>
                <p className="service-price">{servicePrice(s)}</p>
                <span className="service-duration">{s.duration} min</span>
                <div className="service-card-actions">
                  <IconButton label="Modifier" icon={Edit3} onClick={() => setEditing(s)} />
                  <IconButton label={s.active ? "Masquer" : "Afficher"} icon={s.active ? EyeOff : Eye} onClick={() => toggleActive(s)} />
                  <IconButton label="Supprimer" tone="danger" icon={Trash2} onClick={() => setToDelete(s)} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <ServiceForm
          initial={editing}
          onSave={saveService}
          onClose={() => setEditing(null)}
        />
      )}
      {toDelete && (
        <ConfirmDialog
          message={`Supprimer le service « ${toDelete.name} » ?`}
          onConfirm={async () => {
            try {
              await remove(toDelete.id);
              notify("Service supprimé.");
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