import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  LockKeyhole,
  Scissors,
  User,
  Clock,
} from "lucide-react";
import {
  Hero,
  ApiState,
  Benefits,
  InfoPanel,
  Button,
} from "../components/Common";
import { ServicePrice, StartingPriceNote } from "../components/ServicePrice";
import { api, useApi } from "../services/api";
import { initialDate, useSlots, Slots } from "../components/BookingControls";
import Calendar from "../components/Calendar";
import Modal from "../components/Modal";
import { validDate, localNow } from "../../../shared/schedule";
function Step({ number, title, subtitle, children, className = "" }) {
  return (
    <section className={`panel booking-step ${className}`}>
      <div className="step-heading">
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
export default function Booking() {
  const [params] = useSearchParams();
  const services = useApi("/services"),
    barbers = useApi("/barbers");
  const [serviceId, setServiceId] = useState(
    Number(params.get("service")) || 1,
  );
  const [barberId, setBarberId] = useState(Number(params.get("barber")) || 1);
  const [date, setDate] = useState(() =>
    validDate(params.get("date") || "") && params.get("date") >= localNow().date
      ? params.get("date")
      : initialDate(),
  );
  const [time, setTime] = useState(params.get("time") || "");
  const slots = useSlots(date, barberId, serviceId);
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [confirmation, setConfirmation] = useState(null);
  const service = services.data?.find((s) => s.id === serviceId),
    barber = barbers.data?.find((b) => b.id === barberId);
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
    dateStyle: "full",
  });
  function change(setter, value) {
    setter(value);
    setTime("");
    setError("");
  }
  async function submit(e) {
    e.preventDefault();
    if (pending) return;
    if (
      !service ||
      !barber ||
      !slots.slots.some((s) => s.time === time && s.status === "available")
    ) {
      setError(
        "Veuillez sélectionner un service, un barbier et un créneau disponible.",
      );
      return;
    }
    setPending(true);
    setError("");
    try {
      const fields = Object.fromEntries(new FormData(e.currentTarget));
      const result = await api("/appointments", {
        method: "POST",
        body: JSON.stringify({ ...fields, serviceId, barberId, date, time }),
      });
      setConfirmation(result);
      setTime("");
      slots.retry();
      e.target.reset();
    } catch (e) {
      setError(e.message);
      if (e.status === 409) {
        setTime("");
        slots.retry();
      }
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Hero
        page="booking"
        label="RÉSERVATION"
        title={
          <>
            <em>PRENDRE</em>
            <br />
            RENDEZ-VOUS
          </>
        }
        description="Réservez votre coupe ou soin en quelques clics et profitez d’une expérience unique chez Er Rammach."
        quote="Plus qu’une coupe, une confiance retrouvée."
      >
        <div className="hero-perks">
          <span>◇ Qualité professionnelle</span>
          <span>♧ Hygiène et sécurité</span>
          <span>◷ Ponctualité garantie</span>
        </div>
      </Hero>
      <form className="container booking-layout" onSubmit={submit}>
        <div className="booking-main">
          <div className="booking-top">
            <Step
              number="1"
              title="Choisissez votre service"
              subtitle="Sélectionnez la prestation souhaitée"
            >
              <ApiState resource={services}>
                {(items) => (
                  <div className="choice-grid services-choices">
                    {items.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className={`choice-card ${s.id === serviceId ? "selected" : ""}`}
                        aria-pressed={s.id === serviceId}
                        onClick={() => change(setServiceId, s.id)}
                      >
                        <img src={s.image} alt="" />
                        {s.id === serviceId && (
                          <span className="choice-check">
                            <Check size={15} />
                          </span>
                        )}
                        <span className="choice-description">
                          <strong>{s.name}</strong>
                          <b>
                            <ServicePrice service={s} />
                          </b>
                          <small>{s.duration} min</small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </ApiState>
            </Step>
            <Step
              number="2"
              title="Choisissez votre barbier"
              subtitle="Nos barbiers professionnels"
            >
              <ApiState resource={barbers}>
                {(items) => (
                  <div className="choice-grid barber-choices">
                    {items.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        className={`choice-card ${b.id === barberId ? "selected" : ""}`}
                        aria-pressed={b.id === barberId}
                        onClick={() => change(setBarberId, b.id)}
                      >
                        <img src={b.image} alt={b.name} />
                        {b.id === barberId && (
                          <span className="choice-check">
                            <Check size={15} />
                          </span>
                        )}
                        <span className="choice-description">
                          <strong>{b.name}</strong>
                          <small>{b.role}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </ApiState>
            </Step>
          </div>
          <div className="booking-bottom">
            <Step number="3" title="Choisissez une date">
              <Calendar
                value={date}
                onChange={(value) => change(setDate, value)}
              />
            </Step>
            <Step
              number="4"
              title="Choisissez un créneau horaire"
              subtitle={dateLabel}
            >
              <Slots resource={slots} value={time} onChange={setTime} />
            </Step>
            <Step
              number="5"
              title="Vos informations"
              subtitle="Remplissez vos coordonnées"
            >
              <div className="customer-fields">
                <label>
                  Nom complet <span>*</span>
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Votre nom complet"
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </label>
                <label>
                  Téléphone <span>*</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="06 23 44 44 65"
                    required
                    pattern="\+?[0-9\s\(\)\-]{9,25}"
                    maxLength={25}
                  />
                </label>
                <label>
                  Email <span>*</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="votre@email.com"
                    required
                    maxLength={254}
                  />
                </label>
                <label>
                  Message (optionnel)
                  <textarea
                    name="message"
                    placeholder="Une demande particulière ?"
                    maxLength={2000}
                    rows={2}
                  />
                </label>
              </div>
            </Step>
          </div>
        </div>
        <aside className="booking-sidebar">
          <section className="panel booking-summary">
            <h2>
              <CalendarDays />
              Récapitulatif du rendez-vous
            </h2>
            <dl>
              <div>
                <dt>
                  <Scissors />
                  Service
                </dt>
                <dd>{service?.name || "À sélectionner"}</dd>
              </div>
              <div>
                <dt>
                  <User />
                  Barbier
                </dt>
                <dd>{barber?.name || "À sélectionner"}</dd>
              </div>
              <div>
                <dt>
                  <CalendarDays />
                  Date
                </dt>
                <dd>{dateLabel}</dd>
              </div>
              <div>
                <dt>
                  <Clock />
                  Heure
                </dt>
                <dd>{time || "À sélectionner"}</dd>
              </div>
            </dl>
            <div className="booking-total">
              <span>Prix</span>
              <strong>
                {service ? <ServicePrice service={service} /> : "—"}
              </strong>
            </div>
            <StartingPriceNote service={service} />
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending || slots.loading}>
              <CalendarDays size={18} />
              {pending ? "CONFIRMATION…" : "CONFIRMER LE RENDEZ-VOUS"}
            </Button>
            <small className="privacy-note">
              <LockKeyhole size={13} />
              Vos informations sont sécurisées et confidentielles.
            </small>
          </section>
          <InfoPanel />
        </aside>
      </form>
      <div className="container">
        <Benefits />
      </div>
      {confirmation && (
        <Modal
          title="Rendez-vous confirmé"
          onClose={() => setConfirmation(null)}
        >
          <CheckCircle2 className="success-icon" size={48} />
          <h2>Rendez-vous confirmé !</h2>
          <p>Merci de votre confiance. Nous avons hâte de vous accueillir.</p>
          <div className="confirmation-details">
            <strong>{confirmation.service}</strong>
            <p>Avec {confirmation.barber}</p>
            <p>
              {new Date(confirmation.date + "T12:00:00").toLocaleDateString(
                "fr-FR",
                { dateStyle: "full" },
              )}{" "}
              à {confirmation.time}
            </p>
            <b>{confirmation.displayedPrice}</b>
            {confirmation.priceType === "starting_from" && (
              <small>
                Le prix final sera confirmé au salon selon vos cheveux.
              </small>
            )}
            <small>Réservation n° {confirmation.id}</small>
          </div>
          <Button onClick={() => setConfirmation(null)}>
            PARFAIT, À BIENTÔT
          </Button>
        </Modal>
      )}
    </>
  );
}
