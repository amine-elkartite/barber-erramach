import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Scissors,
  ShieldCheck,
  Users,
  Diamond,
  Smile,
  Instagram,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";
import { business, instagramUrl } from "../config/business";
import { ServicePrice } from "./ServicePrice";
export function Button({
  to,
  children,
  outline = false,
  className = "",
  ...props
}) {
  const classes = `button ${outline ? "outline" : ""} ${className}`;
  return to ? (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  ) : (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
export function BookingLink({ outline = false }) {
  return (
    <Button to="/booking" outline={outline}>
      <CalendarDays size={19} /> PRENDRE RENDEZ-VOUS
    </Button>
  );
}
export function SectionTitle({ label, children }) {
  return (
    <div className="section-heading">
      {label && <p className="eyebrow">{label}</p>}
      <h2>{children}</h2>
    </div>
  );
}
export function Hero({ page, label, children, title, description, quote }) {
  return (
    <section className={`page-hero hero-${page}`}>
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">{label}</p>
          <h1>{title}</h1>
          <p className="hero-description">{description}</p>
          {children}
        </div>
        {quote && (
          <p className="signature hero-quote">
            “ {quote} ”<small>ER RAMMACH</small>
          </p>
        )}
      </div>
    </section>
  );
}
export function Benefits({ home = false }) {
  const items = home
    ? [
        [Scissors, "Outils modernes", "et professionnels"],
        [Diamond, "Produits", "de qualité"],
        [ShieldCheck, "Nettoyage et", "désinfection"],
        [Users, "Satisfaction", "client"],
      ]
    : [
        [Diamond, "Produits", "haut de gamme"],
        [ShieldCheck, "Hygiène et", "désinfection"],
        [Users, "Barbiers", "expérimentés"],
        [Smile, "Satisfaction", "client"],
      ];
  return (
    <div className="benefits">
      {items.map(([Icon, a, b]) => (
        <div className="benefit" key={a}>
          <span className="icon-circle">
            <Icon />
          </span>
          <span>
            {a}
            <br />
            {b}
          </span>
        </div>
      ))}
    </div>
  );
}
export function InfoPanel() {
  return (
    <aside className="panel info-panel">
      <div>
        <Clock />
        <section>
          <h3>Horaires d’ouverture</h3>
          <p>
            {business.openingHours}
            <br />
            Dimanche : Fermé
          </p>
        </section>
      </div>
      <div>
        <MapPin />
        <section>
          <h3>Adresse</h3>
          <p>
            {business.address}
            <br />
            {business.city}
          </p>
        </section>
      </div>
      <div>
        <Instagram />
        <section>
          <h3>Suivez-nous</h3>
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            {business.instagram}
          </a>
        </section>
      </div>
      <div>
        <Phone />
        <section>
          <h3>Téléphone</h3>
          <a href={`tel:${business.internationalPhone}`}>
            {business.phoneDisplay}
          </a>
        </section>
      </div>
    </aside>
  );
}
export function ServiceCard({ service, compact = false }) {
  return (
    <article className="service-card">
      <Link
        to={`/booking?service=${service.id}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <img src={service.image} alt="" loading="lazy" />
      </Link>
      <div className="service-content">
        <h3>{service.name}</h3>
        <div className="service-meta">
          <span>
            <Clock size={15} />
            {service.duration} min
          </span>
          <strong>
            <ServicePrice service={service} />
          </strong>
        </div>
        {!compact && <p>{service.description}</p>}
        <Button outline to={`/booking?service=${service.id}`}>
          RÉSERVER <ArrowRight size={15} />
        </Button>
      </div>
    </article>
  );
}
export function ApiState({
  resource,
  children,
  empty = "Aucun élément à afficher pour le moment.",
}) {
  if (resource.loading)
    return (
      <div
        className="loading-grid"
        role="status"
        aria-label="Chargement en cours"
      >
        {[1, 2, 3, 4].map((i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
    );
  if (resource.error)
    return (
      <div className="api-error" role="alert">
        <p>{resource.error}</p>
        <Button outline onClick={resource.retry}>
          Réessayer
        </Button>
      </div>
    );
  if (!resource.data?.length) return <p className="empty-state">{empty}</p>;
  return children(resource.data);
}
