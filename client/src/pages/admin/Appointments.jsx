import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "../../services/api";
import AdminBookingModal from "./AdminBookingModal";
import {
  AdminButton,
  Badge,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  Spinner,
  Toast,
  Toolbar,
  cn,
  statLabel,
  useSearch,
} from "./ui";

const STATUS_FILTERS = ["", "pending", "confirmed", "cancelled", "completed"];
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const CHIP_LIMIT = 3;

const MONTH_TITLE = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
const DAY_TITLE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function pad(n) {
  return String(n).padStart(2, "0");
}

function isoKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthKeyOf(key) {
  return key?.slice(0, 7);
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function dayTitle(key) {
  const [y, m, d] = String(key).split("-").map(Number);
  if (!y || !m || !d) return "—";
  return capitalize(DAY_TITLE.format(new Date(y, m - 1, d)));
}

function exportCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Appointments() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => isoKey(new Date()));
  const [toDelete, setToDelete] = useState(null);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const { query, setQuery, filtered } = useSearch(rows || [], [
    "customer_name",
    "customer_phone",
    "customer_email",
    "service_name",
    "barber_name",
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const path = "/admin/appointments" + (status ? `?status=${status}` : "");
      const data = await api(path);
      setRows(data.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const byDate = useMemo(() => {
    const map = {};
    for (const a of filtered) {
      const key = String(a.appointment_date).slice(0, 10);
      (map[key] = map[key] || []).push(a);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((x, y) => String(x.appointment_time).localeCompare(String(y.appointment_time)));
    }
    return map;
  }, [filtered]);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < offset; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const monthKey = `${cursor.year}-${pad(cursor.month + 1)}`;
  const todayKey = isoKey(new Date());
  const selectedList = byDate[selectedDate] || [];
  const selectedInMonth = monthKeyOf(selectedDate) === monthKey;

  const gotoMonth = (delta) => {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
    const key = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-01`;
    if (monthKeyOf(selectedDate) !== key.slice(0, 7)) setSelectedDate(key);
  };

  const goToday = () => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(todayKey);
  };

  const applyStatus = async (id, next) => {
    setBusy(true);
    try {
      await api(`/admin/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setRows((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api(`/admin/appointments/${toDelete.id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((a) => a.id !== toDelete.id));
    } catch (e) {
      setError(e.message);
    }
    setToDelete(null);
  };

  const exportRows = () =>
    exportCsv(
      "rendez-vous.csv",
      filtered.map((a) => [
        a.customer_name,
        a.customer_phone,
        a.customer_email,
        a.service_name,
        a.barber_name,
        a.appointment_date,
        a.appointment_time,
        statLabel(a.status),
        a.total_price,
      ]),
    );

  const onBookingCreated = async (created) => {
    setBooking(false);
    await load();
    if (created?.date) setSelectedDate(String(created.date).slice(0, 10));
    setToast(`Rendez-vous créé pour ${created?.date ?? ""} à ${created?.time ?? ""}.`);
  };

  return (
    <>
      <PageHeader
        title="Rendez-vous"
        subtitle="Cliquez sur un jour pour voir et gérer les réservations."
        actions={
          <>
            <AdminButton icon={Plus} onClick={() => setBooking(true)}>
              Nouveau rendez-vous
            </AdminButton>
            <AdminButton variant="outline" icon={Download} onClick={exportRows}>
              Exporter CSV
            </AdminButton>
          </>
        }
      />
      <Toolbar value={query} setValue={setQuery} placeholder="Rechercher un client, téléphone ou service…">
        <label className="select-wrap">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_FILTERS.map((s) => (
              <option key={s || "all"} value={s}>
                {s === "" ? "Tous les statuts" : statLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <AdminButton variant="outline" onClick={load}>Actualiser</AdminButton>
      </Toolbar>

      {loading ? (
        <Spinner label="Chargement des rendez-vous…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <section className="calendar-layout">
          <div className="panel calendar-panel">
            <div className="calendar-head">
              <div className="calendar-month">
                <button
                  className="cal-arrow"
                  type="button"
                  onClick={() => gotoMonth(-1)}
                  aria-label="Mois précédent"
                >
                  <ChevronLeft size={18} />
                </button>
                <h3>{capitalize(MONTH_TITLE.format(new Date(cursor.year, cursor.month, 1)))}</h3>
                <button
                  className="cal-arrow"
                  type="button"
                  onClick={() => gotoMonth(1)}
                  aria-label="Mois suivant"
                >
                  <ChevronRight size={18} />
                </button>
                <button className="cal-today" type="button" onClick={goToday}>
                  Aujourd’hui
                </button>
              </div>
              <div className="calendar-legend" aria-hidden="true">
                <span className="legend-item"><i className="legend-dot dot-confirmed" />Confirmé</span>
                <span className="legend-item"><i className="legend-dot dot-completed" />Terminé</span>
                <span className="legend-item"><i className="legend-dot dot-pending" />En attente</span>
                <span className="legend-item"><i className="legend-dot dot-cancelled" />Annulé</span>
              </div>
            </div>

            <div className="calendar-grid">
              {WEEKDAYS.map((d) => (
                <div className="cal-weekday" key={d}>{d}</div>
              ))}
              {cells.map((day, i) => {
                if (!day) return <span className="calendar-day blank" key={`b${i}`} />;
                const key = `${monthKey}-${pad(day)}`;
                const dayAppts = byDate[key] || [];
                const visible = dayAppts.slice(0, CHIP_LIMIT);
                const extra = dayAppts.length - visible.length;
                return (
                  <button
                    type="button"
                    className={cn(
                      "calendar-day",
                      key === todayKey && "today",
                      key === selectedDate && "selected",
                      dayAppts.length > 0 && "has-appts",
                    )}
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    aria-label={`${day} ${MONTH_TITLE.format(new Date(cursor.year, cursor.month, 1))}, ${dayAppts.length} rendez-vous`}
                  >
                    <span className="day-num">{day}</span>
                    <div className="cal-chips">
                      {visible.map((a) => (
                        <span
                          className={cn("cal-chip", `chip-${a.status}`)}
                          key={a.id}
                          title={`${a.customer_name} — ${a.service_name}`}
                        >
                          {String(a.appointment_time).slice(0, 5)} · {a.customer_name}
                        </span>
                      ))}
                      {extra > 0 && <span className="cal-more">+{extra} autres</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <footer className="calendar-foot">
              <CalendarDays size={15} />
              <span>{dayTitle(selectedDate)}</span>
              <span className="calendar-foot-count">
                {selectedList.length
                  ? `${selectedList.length} rendez-vous ce jour`
                  : "Aucune réservation ce jour"}
              </span>
            </footer>
          </div>

          <div className="panel day-panel">
            <div className="day-panel-head">
              <h3>{selectedInMonth ? dayTitle(selectedDate) : "Jour sélectionné"}</h3>
              <span>
                {selectedList.length
                  ? `${selectedList.length} rendez-vous`
                  : "jour libre"}
              </span>
            </div>

            {selectedList.length ? (
              <div className="appointment-list">
                {selectedList.map((a) => (
                  <article className="appointment-card" key={a.id}>
                    <div className="appointment-time">
                      <strong>{String(a.appointment_time).slice(0, 5)}</strong>
                    </div>
                    <div className="appointment-main">
                      <strong>{a.customer_name}</strong>
                      <span className="appointment-meta">
                        {a.service_name}{a.barber_name ? ` · ${a.barber_name}` : ""}
                      </span>
                      <div className="appointment-sub">
                        <Badge tone={a.status}>{statLabel(a.status)}</Badge>
                        <span className="appointment-price">{a.displayed_price}</span>
                      </div>
                    </div>
                    <div className="appointment-actions">
                      <select
                        className={cn("status-select", `status-${a.status}`)}
                        value={a.status}
                        onChange={(e) => applyStatus(a.id, e.target.value)}
                        aria-label={`Statut de ${a.customer_name}`}
                        disabled={busy}
                      >
                        {STATUS_FILTERS.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{statLabel(s)}</option>
                        ))}
                      </select>
                      <IconButton label="Appeler" icon={Phone} onClick={() => { window.location.href = `tel:${a.customer_phone}`; }} />
                      {a.customer_email && (
                        <IconButton label="Écrire" icon={Mail} onClick={() => { window.location.href = `mailto:${a.customer_email}`; }} />
                      )}
                      <IconButton label="Supprimer" tone="danger" icon={Trash2} onClick={() => setToDelete(a)} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Aucun rendez-vous" message="Ce jour est libre." />
            )}
          </div>
        </section>
      )}

      {toDelete && (
        <ConfirmDialog
          message={`Supprimer le rendez-vous de « ${toDelete.customer_name} » ? Cette action est irréversible.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {booking && (
        <AdminBookingModal onClose={() => setBooking(false)} onCreated={onBookingCreated} />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}