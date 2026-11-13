import { useEffect, useState } from "react";
import { Clock, Save } from "lucide-react";
import { api } from "../../services/api";
import {
  AdminButton,
  ErrorState,
  PageHeader,
  Spinner,
  Toast,
  cn,
} from "./ui";

const DAYS = [
  ["day_1", "Lundi"],
  ["day_2", "Mardi"],
  ["day_3", "Mercredi"],
  ["day_4", "Jeudi"],
  ["day_5", "Vendredi"],
  ["day_6", "Samedi"],
  ["day_0", "Dimanche"],
];

export default function WorkingHours() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    api("/admin/opening-hours", { signal: controller.signal })
      .then((data) => active && setRows(data))
      .catch((e) => {
        if (active && e.name !== "AbortError") setError(e.message);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const patch = (day, field, value) =>
    setRows((prev) =>
      prev.map((r) => (r.day_of_week === day ? { ...r, [field]: value } : r)),
    );

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const saved = await api("/admin/opening-hours", {
        method: "PUT",
        body: JSON.stringify({
          hours: rows.map((r) => ({
            day_of_week: r.day_of_week,
            open_time: r.open_time,
            close_time: r.close_time,
            break_start: r.break_start,
            break_end: r.break_end,
            is_open: Number(r.is_open),
          })),
        }),
      });
      setRows(saved);
      setToast("Horaires enregistrés.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const preview = () => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    const byDay = Object.fromEntries((rows || []).map((r) => [r.day_of_week, r]));
    return order
      .map((d) => {
        const r = byDay[d];
        if (!r) return "";
        const dayName = DAYS.find(([k]) => k === `day_${d}`)[1];
        if (!Number(r.is_open)) return `${dayName} : Fermé`;
        let label = `${r.open_time} - ${r.close_time}`;
        if (r.break_start && r.break_end)
          label += ` (pause ${r.break_start} - ${r.break_end})`;
        return `${dayName} : ${label}`;
      })
      .filter(Boolean);
  };

  return (
    <>
      <PageHeader
        title="Temps du travail"
        subtitle="Définissez les horaires d’ouverture par jour. Les créneaux de réservation respectent ces horaires."
        actions={
          <AdminButton icon={Save} onClick={save} disabled={saving || rows === null}>
            {saving ? "Enregistrement…" : "Enregistrer les horaires"}
          </AdminButton>
        }
      />

      {loading ? (
        <Spinner label="Chargement des horaires…" />
      ) : error ? (
        <ErrorState message={error} onRetry={save} />
      ) : rows === null ? null : (
        <>
          <div className="panel workhours-panel">
            <div className="workhours-head">
              <Clock size={16} />
              <span>Semaine type — l’ouverture conditionne toute réservation.</span>
            </div>
            <ul className="workhours-list">
              {DAYS.map(([key, name]) => {
                const day = Number(key.slice(4));
                const row = rows.find((r) => r.day_of_week === day);
                if (!row) return null;
                const open = Number(row.is_open) === 1;
                return (
                  <li className={cn("workhours-row", !open && "is-closed")} key={key}>
                    <div className="workhours-day">
                      <strong>{name}</strong>
                      {!open && <span className="workhours-closed">Fermé</span>}
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={open}
                        onChange={(e) => patch(day, "is_open", e.target.checked ? 1 : 0)}
                      />
                      <span aria-hidden="true" />
                      <em>{open ? "Ouvert" : "Fermé"}</em>
                    </label>
                    <div className="workhours-times">
                      <label className="field">
                        <span>Ouverture</span>
                        <input
                          type="time"
                          value={row.open_time}
                          disabled={!open}
                          onChange={(e) => patch(day, "open_time", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        <span>Fermeture</span>
                        <input
                          type="time"
                          value={row.close_time}
                          disabled={!open}
                          onChange={(e) => patch(day, "close_time", e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="workhours-break">
                      <span className="break-hint">Pause (optionnelle)</span>
                      <div className="workhours-break-fields">
                        <label className="field">
                          <span>Début</span>
                          <input
                            type="time"
                            value={row.break_start || ""}
                            disabled={!open}
                            onChange={(e) => patch(day, "break_start", e.target.value)}
                          />
                        </label>
                        <label className="field">
                          <span>Fin</span>
                          <input
                            type="time"
                            value={row.break_end || ""}
                            disabled={!open}
                            onChange={(e) => patch(day, "break_end", e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="panel workhours-preview">
            <h4>Aperçu affiché sur le site</h4>
            <div className="workhours-preview-rows">
              {preview().map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}