import { useEffect, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="admin-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <header className="admin-modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </header>
        <div className="admin-modal-body">{children}</div>
        {footer && <footer className="admin-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function ImagePicker({ value, onChange, onError, fallback = "/images/service-1.webp" }) {
  const [uploading, setUploading] = useState(false);
  const inputId = `image-upload-${Math.random().toString(36).slice(2)}`;
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadImage } = await import("./data");
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      onError?.(err.message || "Téléversement impossible.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  return (
    <div className="image-picker">
      <img src={value || fallback} alt="" onError={(e) => { e.currentTarget.src = fallback; }} />
      <div className="image-picker-actions">
        <input id={inputId} type="file" accept="image/*" onChange={pick} hidden />
        <label htmlFor={inputId} className="button button-outline button-sm">
          {uploading ? <Loader2 className="spin" size={14} /> : "Téléverser"}
        </label>
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="ou URL de l’image" />
      </div>
    </div>
  );
}

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast ${type || "success"}`} role="status">
      <Check size={16} />
      <span>{message}</span>
      <button className="icon-btn" onClick={onClose} aria-label="Fermer"><X size={14} /></button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const notify = (message, type = "success") => setToast({ message, type });
  const dismiss = () => setToast(null);
  return { toast, notify, dismiss };
}

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function statusClass(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("'", "");
}

const FR_DATE = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const FR_DATETIME = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? "—" : FR_DATE.format(d);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? "—" : FR_DATETIME.format(d);
}

export function money(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

export function servicePrice(service) {
  if (!service) return "—";
  return service.price_type === "starting_from"
    ? `À partir de ${money(service.price)}`
    : money(service.price);
}

export function statLabel(status) {
  return {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé",
  }[status] || status;
}

export function Badge({ children, tone = "neutral", className }) {
  return <span className={cn("badge", tone && `badge-${tone}`, className, statusClass(children))}>{children}</span>;
}

export function AdminButton({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  icon: Icon,
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`button button-${variant}`}
      onClick={onClick}
      {...rest}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function IconButton({ label, icon: Icon, onClick, tone }) {
  return (
    <button className={cn("icon-btn", tone && `icon-${tone}`)} aria-label={label} title={label} onClick={onClick}>
      <Icon size={16} />
    </button>
  );
}

export function Spinner({ label = "Chargement…" }) {
  return (
    <div className="admin-state">
      <Loader2 className="spin" size={28} />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="admin-state admin-error">
      <p>{message}</p>
      {onRetry && <AdminButton variant="outline" onClick={onRetry}>Réessayer</AdminButton>}
    </div>
  );
}

export function EmptyState({ title = "Aucune donnée", message = "Aucun élément à afficher pour le moment." }) {
  return (
    <div className="admin-state">
      <Search size={28} />
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

export function Toolbar({ value, onChange, placeholder = "Rechercher…", children }) {
  return (
    <div className="toolbar">
      <label className="search-box">
        <Search size={16} />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        {value ? (
          <button className="search-clear" type="button" onClick={() => onChange("")} aria-label="Effacer"><X size={14} /></button>
        ) : null}
      </label>
      <div className="toolbar-actions">{children}</div>
    </div>
  );
}

export function StatCard({ icon: Icon, title, value, accent, hint }) {
  return (
    <article className="stat-card">
      <span className={cn("stat-icon", accent)}><Icon size={20} /></span>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
    </article>
  );
}

export function useSearch(list, keys) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const filtered = !term
    ? list
    : list.filter((item) =>
        keys.some((key) =>
          String(item[key] ?? "").toLowerCase().includes(term),
        ),
      );
  return { query, setQuery, filtered };
}

export function ConfirmDialog({ message, onConfirm, onCancel, danger = true }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="confirm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="confirm-actions">
          <AdminButton variant="outline" onClick={onCancel}>Annuler</AdminButton>
          <AdminButton variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            <Check size={16} /> Confirmer
          </AdminButton>
        </div>
      </div>
    </div>
  );
}