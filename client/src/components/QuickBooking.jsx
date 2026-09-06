import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../services/api";
import { initialDate, useSlots, Slots } from "./BookingControls";
import { Button } from "./Common";
import { localNow } from "../../../shared/schedule";
export default function QuickBooking() {
  const services = useApi("/services");
  const [serviceId, setServiceId] = useState("12");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("");
  const slots = useSlots(date, 1, serviceId);
  const navigate = useNavigate();
  return (
    <section className="panel quick-booking">
      <h2>PRENDRE RENDEZ-VOUS</h2>
      <label htmlFor="quick-service">1. Choisissez un service</label>
      <select
        id="quick-service"
        value={serviceId}
        onChange={(e) => {
          setServiceId(e.target.value);
          setTime("");
        }}
        disabled={services.loading || Boolean(services.error)}
      >
        {services.loading ? (
          <option>Chargement…</option>
        ) : services.error ? (
          <option>Services indisponibles</option>
        ) : (
          services.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.duration} min
            </option>
          ))
        )}
      </select>
      {services.error && (
        <button className="text-button" onClick={services.retry}>
          Réessayer
        </button>
      )}
      <label htmlFor="quick-date">2. Choisissez une date</label>
      <input
        id="quick-date"
        type="date"
        min={localNow().date}
        max={new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)}
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setTime("");
        }}
      />
      <p>3. Choisissez un créneau</p>
      <Slots compact resource={slots} value={time} onChange={setTime} />
      <Button
        disabled={!time || slots.loading || Boolean(slots.error)}
        onClick={() =>
          navigate(
            `/booking?${new URLSearchParams({ service: serviceId, date, time, barber: 1 })}`,
          )
        }
      >
        CONTINUER
      </Button>
    </section>
  );
}
