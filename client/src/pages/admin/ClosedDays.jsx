import { useMemo, useState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { localNow } from "../../../../shared/schedule";
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
  cn,
} from "./ui";

const FORMAT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(value) {
  const [y, m, d] = String(value || "").split("-").map(Number);
  if (!y || !m || !d) return value;
  return FORMAT.format(new Date(y, m - 1, d));
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export default function ClosedDays() {
  const {
    items,
    loading,
    error,
    reload,
    create,
    remove,
  } = useCrud("/admin/closed-days");
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const today = useMemo(() => localNow().date, []);

  const dayStatus = (value) => {
    const d = String(value || "").slice(0, 10);
    if (d === today) return ["today", "Aujourd’hui"];
    return [d < today ? "past" : "upcoming", d < today ? "Passé" : "À venir"];
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!date) return;
    setBusy(true);
    try {
      await create({ closed_date: date, reason });
      setToast("Jour fermé enregistré.");
      setDate("");
      setReason("");
      setAdding(false);
      reload();
    } catch (err) {
      setToast(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      setToast("Jour fermé supprimé.");
    } catch (err) {
      setToast(err.message);
    }
    setToDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Jours fermés"
        subtitle="Les dates où le salon est fermé (fêtes, congés…) bloquent tous les créneaux."
        actions={
          <AdminButton icon={Plus} onClick={() => setAdding(true)}>
            Ajouter un jour fermé
          </AdminButton>
        }
      />

      {loading ? (
        <Spinner label="Chargement des jours fermés…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length ? (
        <div className="panel">
          <ul className="closed-days-list">
            {items.map((item) => {
              const [tone, label] = dayStatus(item.closed_date);
              return (
                <li className="closed-day-row" key={item.id}>
                  <span className={cn("closed-day-icon", `tone-${tone}`)}>
                    <CalendarOff size={18} />
                  </span>
                  <div className="closed-day-main">
                    <strong>{capitalize(formatDate(item.closed_date))}</strong>
                    {item.reason ? (
                      <span className="closed-day-reason">{item.reason}</span>
                    ) : (
                      <span className="closed-day-reason muted">Sans motif</span>
                    )}
                  </div>
                  <Badge tone={tone === "past" ? "neutral" : "warning"}>{label}</Badge>
                  <IconButton label="Supprimer" tone="danger" icon={Trash2} onClick={() => setToDelete(item)} />
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState
          title="Aucun jour fermé"
          message="Ajoutez des dates de fermeture pour qu’elles soient indisponibles à la réservation."
        />
      )}

      {adding && (
        <Modal title="Ajouter un jour fermé" onClose={() => setAdding(false)}>
          <form className="admin-form stack" onSubmit={submit}>
            <div className="form-grid">
              <Field label="Date de fermeture">
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <Field label="Motif (optionnel)">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Fête religieuse, congé…"
                  maxLength={150}
                />
              </Field>
            </div>
            <footer className="modal-actions">
              <AdminButton type="button" variant="outline" onClick={() => setAdding(false)}>
                Annuler
              </AdminButton>
              <AdminButton type="submit" disabled={busy || !date}>
                {busy ? "Enregistrement…" : "Enregistrer"}
              </AdminButton>
            </footer>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          message={`Retirer le ${formatDate(toDelete.closed_date)} des jours fermés ?`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <Toast message={toast} type={toast.startsWith("Jour fermé") ? "success" : "error"} onClose={() => setToast(null)} />}
    </>
  );
}