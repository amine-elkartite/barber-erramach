import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { localNow } from "../../../../shared/schedule";
import { AdminButton, Field, Modal, Spinner } from "./ui";
import { Slots, useSlots } from "../../components/BookingControls";

function pad(n) {
  return String(n).padStart(2, "0");
}

function isoKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function AdminBookingModal({ onClose, onCreated }) {
  const [services, setServices] = useState(null);
  const [barbers, setBarbers] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date(localNow().date + "T12:00:00");
    while (d.getDay() === 0 || isoKey(d) < localNow().date) d.setDate(d.getDate() + 1);
    return isoKey(d);
  });
  const [time, setTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    Promise.all([api("/admin/services"), api("/admin/barbers")])
      .then(([svc, brb]) => {
        setServices(svc);
        setBarbers(brb);
        setServiceId((svc.find((s) => s.active) || svc[0])?.id || "");
        setBarberId((brb.find((b) => b.active) || brb[0])?.id || "");
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  useEffect(() => {
    setTime(null);
  }, [serviceId, barberId, date]);

  const slots = useSlots(date, barberId, serviceId);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return isoKey(d);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim())
      return setFormError("Le nom et le téléphone du client sont requis.");
    if (!serviceId || !barberId || !date || !time)
      return setFormError("Choisissez un service, un barbier, une date et un créneau.");
    setSubmitting(true);
    setFormError("");
    try {
      const created = await api("/admin/appointments", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          barberId,
          date,
          time,
          name,
          phone,
          email,
          message,
        }),
      });
      onCreated(created);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Nouveau rendez-vous" onClose={onClose}>
      {services === null || barbers === null ? (
        <Spinner label="Chargement des services…" />
      ) : loadError ? (
        <p className="error-state">{loadError}</p>
      ) : (
        <form className="admin-form stack" onSubmit={submit}>
          <div className="form-grid">
            <Field label="Service">
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.price}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Barbier">
              <select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="form-grid">
            <Field label="Date">
              <input
                type="date"
                value={date}
                min={localNow().date}
                max={maxDate}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Heure">
              <Slots resource={slots} value={time} onChange={setTime} compact />
            </Field>
          </div>
          <div className="form-grid">
            <Field label="Nom du client">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prénom et nom"
                autoComplete="name"
              />
            </Field>
            <Field label="Téléphone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 00 00 00 00"
                autoComplete="tel"
              />
            </Field>
          </div>
          <div className="form-grid">
            <Field label="Email (optionnel)">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@exemple.ma"
                autoComplete="email"
              />
            </Field>
            <Field label="Message (optionnel)">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Remarque, motif…"
              />
            </Field>
          </div>
          {formError && (
            <p className="error-state" role="alert">
              {formError}
            </p>
          )}
          <footer className="modal-actions">
            <AdminButton type="button" variant="outline" onClick={onClose}>
              Annuler
            </AdminButton>
            <AdminButton type="submit" disabled={submitting}>
              {submitting ? "Réservation…" : "Confirmer le rendez-vous"}
            </AdminButton>
          </footer>
        </form>
      )}
    </Modal>
  );
}