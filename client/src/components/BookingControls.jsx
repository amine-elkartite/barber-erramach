import { useEffect, useState } from "react";
import { api } from "../services/api";
import { localNow, validDate } from "../../../shared/schedule";
export function initialDate() {
  const d = new Date(localNow().date + "T12:00:00");
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function useSlots(date, barberId, serviceId) {
  const [state, setState] = useState({ slots: [], loading: false, error: "" });
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!date || !barberId || !serviceId || !validDate(date)) {
      setState({
        slots: [],
        loading: false,
        error: "Choisissez une date d’ouverture, un service et un barbier.",
      });
      return;
    }
    const controller = new AbortController();
    setState({ slots: [], loading: true, error: "" });
    api(
      `/appointments/availability?${new URLSearchParams({ date, barberId, serviceId })}`,
      { signal: controller.signal },
    )
      .then((slots) => setState({ slots, loading: false, error: "" }))
      .catch((e) => {
        if (e.name !== "AbortError")
          setState({ slots: [], loading: false, error: e.message });
      });
    return () => controller.abort();
  }, [date, barberId, serviceId, refresh]);
  return { ...state, retry: () => setRefresh((v) => v + 1) };
}
export function Slots({ resource, value, onChange, compact = false }) {
  return (
    <>
      <div
        className={`time-slots ${compact ? "compact" : ""}`}
        aria-label="Créneaux horaires"
      >
        {resource.loading ? (
          <p role="status">Recherche des disponibilités…</p>
        ) : resource.error ? (
          <div className="slot-error" role="alert">
            {resource.error}
            <button type="button" onClick={resource.retry}>
              Réessayer
            </button>
          </div>
        ) : resource.slots.length ? (
          resource.slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              className={`${slot.status} ${slot.time === value ? "selected" : ""}`}
              disabled={slot.status !== "available"}
              aria-pressed={slot.time === value}
              onClick={() => onChange(slot.time)}
            >
              {slot.time}
            </button>
          ))
        ) : (
          <p>Aucun créneau disponible à cette date.</p>
        )}
      </div>
      <div className="slot-legend">
        <span>
          <i className="available" />
          Disponible
        </span>
        <span>
          <i className="reserved" />
          Réservé
        </span>
        <span>
          <i className="unavailable" />
          Indisponible
        </span>
      </div>
    </>
  );
}
