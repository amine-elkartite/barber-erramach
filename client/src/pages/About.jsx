import {
  Target,
  Diamond,
  CheckCircle2,
  CalendarDays,
  Users,
  Scissors,
  Clock,
  Star,
} from "lucide-react";
import {
  Hero,
  SectionTitle,
  Benefits,
  BookingLink,
  Button,
  ApiState,
} from "../components/Common";
import { useApi } from "../services/api";
export default function About() {
  const reviews = useApi("/reviews");
  return (
    <>
      <Hero
        page="about"
        label="NOTRE UNIVERS"
        title={
          <>
            À <em>PROPOS</em>
          </>
        }
        description="Plus qu’un salon, une expérience."
      >
        <p className="about-intro">
          Chez ER RAMMACH Mohamed Barber Shop, nous croyons qu’une coupe de
          cheveux est bien plus qu’un simple service. C’est un moment pour soi,
          une confiance retrouvée, une meilleure version de vous-même.
        </p>
        <p className="signature">
          “ Un style, une attitude,
          <br />
          une confiance retrouvée. ”
        </p>
      </Hero>
      <section className="container about-story">
        <img
          className="story-image"
          src="/images/about-work.webp"
          alt="Mohamed réalise une coupe avec précision"
          loading="lazy"
        />
        <div>
          <SectionTitle label="QUI SOMMES-NOUS ?">
            L’EXCELLENCE{" "}
            <em>
              AU SERVICE
              <br />
              DE VOTRE STYLE
            </em>
          </SectionTitle>
          <p>
            ER RAMMACH Mohamed Barber Shop est un salon dédié à l’élégance
            masculine, où tradition et modernité se rencontrent. Fondé par
            Mohamed Er Rammach, passionné par l’art du barbering, notre salon
            accueille chaque client dans un cadre raffiné et chaleureux pour une
            expérience unique et personnalisée.
          </p>
          <Button to="/gallery" outline>
            DÉCOUVRIR NOTRE UNIVERS
          </Button>
        </div>
        <article className="panel value-card">
          <Target />
          <h3>NOTRE MISSION</h3>
          <p>
            Sublimer chaque homme à travers des prestations de qualité, en
            offrant un service personnalisé, des conseils experts et une
            expérience inoubliable dans un cadre élégant.
          </p>
        </article>
        <article className="panel value-card">
          <Diamond />
          <h3>NOS VALEURS</h3>
          <ul>
            {[
              "Excellence dans chaque détail",
              "Respect et écoute de nos clients",
              "Hygiène irréprochable",
              "Passion pour notre métier",
              "Style et modernité",
            ].map((v) => (
              <li key={v}>
                <CheckCircle2 size={15} />
                {v}
              </li>
            ))}
          </ul>
        </article>
      </section>
      <section className="benefits-strip">
        <div className="container about-benefits">
          <SectionTitle label="POURQUOI NOUS CHOISIR ?">
            BIEN PLUS <em>QU’UNE COUPE</em>
          </SectionTitle>
          <Benefits />
        </div>
      </section>
      <section className="container founder-section">
        <img
          src="/images/about-founder.webp"
          alt="Mohamed Er Rammach, fondateur"
          loading="lazy"
        />
        <div>
          <SectionTitle label="NOTRE FONDATEUR">
            <em>MOHAMED ER RAMMACH</em>
          </SectionTitle>
          <p className="overline">PASSIONNÉ PAR L’ART DU BARBERING</p>
          <p>
            Barbier par passion, Mohamed Er Rammach a fondé ce salon avec une
            vision claire : offrir aux hommes un espace où le style, le
            bien-être et la confiance se rencontrent. Fort de plusieurs années
            d’expérience, il met tout son savoir-faire au service de chaque
            client, avec exigence, précision et passion.
          </p>
          <p className="signature">
            “ Chaque coupe est une rencontre,
            <br />
            chaque client une histoire. ”
          </p>
        </div>
        <div className="panel statistics">
          {[
            [CalendarDays, "5+", "Années d’expérience"],
            [Users, "1000+", "Clients satisfaits"],
            [Scissors, "15+", "Prestations premium"],
            [Clock, "Rapides", "Rendez-vous"],
          ].map(([Icon, value, label]) => (
            <div key={label}>
              <Icon />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="container reviews-section">
        <SectionTitle label="ILS NOUS FONT CONFIANCE">
          AVIS DE <em>NOS CLIENTS</em>
        </SectionTitle>
        <ApiState
          resource={reviews}
          empty="Votre expérience compte. Partagez votre avis avec notre équipe lors de votre prochaine visite."
        >
          {(items) => (
            <div className="reviews-grid">
              {items.map((r) => (
                <article key={r.id} className="panel review-card">
                  <div aria-label={`${r.rating} étoiles sur 5`}>
                    {Array.from({ length: r.rating }, (_, i) => (
                      <Star size={15} key={i} fill="currentColor" />
                    ))}
                  </div>
                  <p>“ {r.review} ”</p>
                  <strong>{r.customer_name}</strong>
                </article>
              ))}
            </div>
          )}
        </ApiState>
        <div className="panel about-cta">
          <h2>
            PRÊT POUR VOTRE
            <br />
            <em>PROCHAINE COUPE ?</em>
          </h2>
          <BookingLink />
        </div>
      </section>
    </>
  );
}
