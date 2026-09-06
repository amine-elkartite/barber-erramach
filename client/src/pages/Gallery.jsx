import { useState } from "react";
import {
  Instagram,
  ArrowRight,
  CalendarDays,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Hero,
  Benefits,
  BookingLink,
  InfoPanel,
  ApiState,
} from "../components/Common";
import { useApi } from "../services/api";
import { instagramUrl, business } from "../config/business";
import Modal from "../components/Modal";
export default function Gallery() {
  const resource = useApi("/gallery");
  const [category, setCategory] = useState("Toutes"),
    [active, setActive] = useState(null);
  const filtered =
    resource.data?.filter(
      (item) => category === "Toutes" || item.category === category,
    ) || [];
  const selected = filtered.find((item) => item.id === active);
  function move(direction) {
    const index = filtered.findIndex((item) => item.id === active);
    setActive(
      filtered[(index + direction + filtered.length) % filtered.length].id,
    );
  }
  return (
    <>
      <Hero
        page="gallery"
        label="NOTRE UNIVERS EN IMAGES"
        title={
          <>
            NOTRE <em>GALERIE</em>
          </>
        }
        description="Découvrez nos réalisations, l’ambiance du salon et l’excellence de notre savoir-faire à travers des moments authentiques."
        quote="Plus qu’une coupe, une confiance retrouvée."
      />
      <section className="container gallery-section">
        <div
          className="filter-bar"
          role="group"
          aria-label="Filtrer la galerie"
        >
          {["Toutes", "Coupes", "Barbes", "Soins", "Salon"].map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
                setActive(null);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="gallery-layout">
          <ApiState resource={resource}>
            {() =>
              filtered.length ? (
                <div className="gallery-grid">
                  {filtered.map((item) => (
                    <button
                      className={`gallery-image category-${item.category}`}
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      aria-label={`Agrandir : ${item.title}`}
                    >
                      <img src={item.image} alt={item.title} loading="lazy" />
                      <span>
                        <ZoomIn size={22} />
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p>Aucune photo dans cette catégorie pour le moment.</p>
              )
            }
          </ApiState>
          <aside>
            <div className="panel gallery-cta">
              <h3>
                <CalendarDays />
                Envie du même résultat ?
              </h3>
              <p>
                Réservez votre rendez-vous et confiez votre style à nos experts.
              </p>
              <BookingLink />
              <InfoPanel />
            </div>
          </aside>
        </div>
        <div className="gallery-bottom">
          <section className="panel transformation">
            <div>
              <p className="eyebrow">TRANSFORMATION</p>
              <h2>
                <em>AVANT / APRÈS</em>
              </h2>
              <p>Des résultats réels, une confiance retrouvée.</p>
            </div>
            <figure>
              <img
                src="/images/before.webp"
                alt="Cheveux longs avant la coupe"
                loading="lazy"
              />
              <figcaption>AVANT</figcaption>
            </figure>
            <ArrowRight className="gold-icon" />
            <figure>
              <img
                src="/images/after.webp"
                alt="Dégradé soigné après la coupe"
                loading="lazy"
              />
              <figcaption>APRÈS</figcaption>
            </figure>
          </section>
          <section className="panel instagram-panel">
            <div>
              <p className="eyebrow">
                <Instagram size={18} />
                SUIVEZ NOTRE AVENTURE
              </p>
              <h2>
                REJOIGNEZ-NOUS
                <br />
                <em>SUR INSTAGRAM</em>
              </h2>
              <p>
                Découvrez plus de réalisations, les coulisses du salon et nos
                dernières actualités.
              </p>
              <a
                className="button outline"
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Instagram size={18} />
                Suivre @{business.instagramHandle}
                <ArrowRight size={17} />
              </a>
            </div>
            <img
              src="/images/about-work.webp"
              alt="Mohamed au travail dans le salon"
              loading="lazy"
            />
          </section>
        </div>
      </section>
      <div className="container">
        <Benefits />
      </div>
      {selected && (
        <Modal
          title={selected.title}
          className="lightbox"
          onClose={() => setActive(null)}
        >
          <img src={selected.image} alt={selected.title} />
          <div className="lightbox-caption">
            <button aria-label="Photo précédente" onClick={() => move(-1)}>
              <ChevronLeft />
            </button>
            <p>
              {selected.title}
              <small>
                {filtered.findIndex((item) => item.id === active) + 1} /{" "}
                {filtered.length}
              </small>
            </p>
            <button aria-label="Photo suivante" onClick={() => move(1)}>
              <ChevronRight />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
