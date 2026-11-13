import { useState } from "react";
import { Mail, Phone, Trash2 } from "lucide-react";
import { useAdminData } from "./data";
import {
  AdminButton,
  Badge,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  Spinner,
  Toolbar,
  formatDate,
  formatDateTime,
  useSearch,
} from "./ui";
import { api } from "../../services/api";

export default function Messages() {
  const { data, loading, error, reload } = useAdminData("/admin/contacts");
  const items = Array.isArray(data) ? data : data?.items || [];
  const { query, setQuery, filtered } = useSearch(items, ["name", "email", "phone", "subject", "message"]);
  const [toDelete, setToDelete] = useState(null);
  const [selected, setSelected] = useState(null);

  const toggleRead = async (m) => {
    await api(`/admin/contacts/${m.id}/read`, { method: "PATCH", body: JSON.stringify({ is_read: !m.is_read }) });
    reload();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api(`/admin/contacts/${toDelete.id}`, { method: "DELETE" });
      reload();
    } catch (e) {
      // reload will surface errors; keep quiet
    }
    setToDelete(null);
  };

  const unread = items.filter((m) => !m.is_read).length;

  return (
    <>
      <PageHeader title="Messages" subtitle={`${unread} message(s) non lu(s) depuis le formulaire de contact.`} />
      <Toolbar value={query} setValue={setQuery} placeholder="Rechercher un message…">
        <AdminButton variant="outline" onClick={reload}>Actualiser</AdminButton>
      </Toolbar>

      {loading ? (
        <Spinner label="Chargement des messages…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun message" message="Les messages envoyés depuis le site apparaîtront ici." />
      ) : (
        <div className="messages-list">
          {filtered.map((m) => (
            <article
              className={`message-row ${m.is_read ? "read" : "unread"} ${selected?.id === m.id ? "active" : ""}`}
              key={m.id}
              onClick={() => setSelected(m)}
            >
              <span className="cell-avatar">{String(m.name || "?").charAt(0)}</span>
              <div className="message-main">
                <div className="message-top">
                  <strong>{m.name}</strong>
                  <time>{formatDateTime(m.created_at)}</time>
                </div>
                <span className="message-subject">{m.subject}</span>
                <p className="message-preview">{m.message}</p>
                <span className="message-contact">
                  {m.phone} · {m.email}
                </span>
              </div>
              <div className="message-actions" onClick={(e) => e.stopPropagation()}>
                <IconButton label={m.is_read ? "Marquer non lu" : "Marquer lu"} icon={Mail} onClick={() => toggleRead(m)} />
                <IconButton label="Appeler" icon={Phone} onClick={() => { window.location.href = `tel:${m.phone}`; }} />
                <IconButton label="Supprimer" tone="danger" icon={Trash2} onClick={() => setToDelete(m)} />
              </div>
              {!m.is_read && <Badge tone="danger">Nouveau</Badge>}
            </article>
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          message={`Supprimer le message de « ${toDelete.name} » ?`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}