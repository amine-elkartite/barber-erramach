import { useState } from "react";
import {
  Phone,
  MapPin,
  Instagram,
  Clock,
  Send,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { Hero, Button } from "../components/Common";
import { business, instagramUrl } from "../config/business";
import { api } from "../services/api";
import Modal from "../components/Modal";
export default function Contact() {
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [mapOpen, setMapOpen] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    setPending(true);
    setError("");
    try {
      await api("/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      setSent(true);
      form.reset();
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Hero
        page="contact"
        label="CONTACT"
        title={
          <>
            RESTONS EN <em>CONTACT</em>
          </>
        }
        description={
          <>
            Une question, une demande particulière ou envie de prendre
            rendez-vous ?<br />
            Notre équipe est là pour vous répondre rapidement.
          </>
        }
      >
        <div className="contact-cards">
          <article className="panel">
            <Phone />
            <div>
              <h3>Téléphone</h3>
              <a href={`tel:${business.internationalPhone}`}>
                {business.phoneDisplay}
              </a>
              <small>{business.openingHours}</small>
            </div>
          </article>
          <article className="panel">
            <MapPin />
            <div>
              <h3>Adresse</h3>
              <p>
                {business.address}
                <br />
                {business.city}
              </p>
            </div>
          </article>
          <article className="panel">
            <Instagram />
            <div>
              <h3>Instagram</h3>
              <a href={instagramUrl} target="_blank" rel="noreferrer">
                {business.instagram}
              </a>
              <small>Suivez-nous</small>
            </div>
          </article>
          <article className="panel">
            <Clock />
            <div>
              <h3>Horaires d’ouverture</h3>
              <p>
                {business.openingHours}
                <br />
                Dimanche : Fermé
              </p>
            </div>
          </article>
        </div>
      </Hero>
      <div className="container contact-layout">
        <section className="panel contact-form-panel">
          <h2>
            ENVOYEZ-NOUS <em>UN MESSAGE</em>
          </h2>
          <p>
            Remplissez le formulaire ci-dessous et nous vous répondrons dans les
            plus brefs délais.
          </p>
          <form onSubmit={submit}>
            <div className="form-grid">
              <label>
                Votre nom
                <input
                  required
                  name="name"
                  placeholder="Votre nom"
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                />
              </label>
              <label>
                Votre email
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Votre email"
                  maxLength={254}
                  autoComplete="email"
                />
              </label>
              <label>
                Votre téléphone
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="Votre téléphone"
                  pattern="\+?[0-9\s\(\)\-]{9,25}"
                  maxLength={25}
                  autoComplete="tel"
                />
              </label>
              <label>
                Sujet
                <select name="subject" aria-label="Sujet" required defaultValue="">
                  <option value="" disabled>
                    Choisissez un sujet
                  </option>
                  <option>Renseignements</option>
                  <option>Rendez-vous</option>
                  <option>Prestations et tarifs</option>
                  <option>Autre demande</option>
                </select>
              </label>
            </div>
            <label>
              Votre message
              <textarea
                required
                name="message"
                placeholder="Votre message"
                minLength={10}
                maxLength={5000}
                rows={5}
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              <Send size={20} />
              {pending ? "ENVOI EN COURS…" : "ENVOYER LE MESSAGE"}
            </Button>
          </form>
        </section>
        <div className="contact-right">
          <section className="panel map-panel">
            <div className="map-visual">
              {mapOpen ? (
                <iframe
                  title="Carte de Meknès, Maroc"
                  src="https://maps.google.com/maps?q=Meknes%2C%20Maroc&z=13&output=embed"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  aria-label="Afficher la carte interactive de Meknès"
                >
                  <img
                    src="/images/location-map.webp"
                    alt="Aperçu du plan de Meknès"
                    loading="lazy"
                  />
                  <span>Afficher la carte interactive</span>
                </button>
              )}
            </div>
            <div>
              <h3>NOTRE EMPLACEMENT</h3>
              <p>
                <MapPin />
                {business.address}
                <br />
                {business.city}
              </p>
              <a
                className="button outline"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address + ", " + business.city)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={18} />
                ITINÉRAIRE
              </a>
            </div>
          </section>
          <section className="contact-cinematic">
            <p className="eyebrow">LE SENS DU DÉTAIL</p>
            <h2>
              UNE EXPÉRIENCE
              <br />
              QUI FAIT LA DIFFÉRENCE
            </h2>
            <p>
              N’hésitez pas à nous contacter, nous sommes toujours ravis
              d’échanger avec vous.
            </p>
          </section>
        </div>
      </div>
      {sent && (
        <Modal title="Message envoyé" onClose={() => setSent(false)}>
          <CheckCircle2 size={48} className="success-icon" />
          <h2>Merci pour votre message</h2>
          <p>Votre message a bien été envoyé.</p>
          <p>Notre équipe vous répondra dans les plus brefs délais.</p>
          <Button onClick={() => setSent(false)}>FERMER</Button>
        </Modal>
      )}
    </>
  );
}
