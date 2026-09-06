import { metadata } from "../../../shared/seo";
import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Phone,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { business, whatsappUrl, instagramUrl } from "../config/business";
import { Button } from "./Common";
export const navigation = [
  ["/", "Accueil"],
  ["/services", "Nos Services"],
  ["/booking", "Prendre Rendez-vous"],
  ["/gallery", "Galerie"],
  ["/about", "À Propos"],
  ["/contact", "Contact"],
];
function Logo() {
  return (
    <Link to="/" className="logo" aria-label="ER RAMMACH — Accueil">
      <img
        src="/images/logo.webp"
        alt="ER RAMMACH Mohamed Barber Shop"
        width="223"
        height="70"
      />
    </Link>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav
          className={open ? "main-nav is-open" : "main-nav"}
          aria-label="Navigation principale"
          id="main-navigation"
        >
          {navigation.map(([to, label]) => (
            <NavLink end={to === "/"} to={to} key={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-contact">
          <a href={`tel:${business.internationalPhone}`}>
            <Phone size={17} />
            {business.phoneDisplay}
          </a>
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            <Instagram size={18} />
            {business.instagram}
          </a>
        </div>
        <Button to="/booking" outline className="header-book">
          PRENDRE RENDEZ-VOUS
        </Button>
        <button
          className="menu-toggle"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Logo />
        <nav aria-label="Navigation de pied de page">
          {navigation.map(([to, label]) => (
            <Link to={to} key={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="social-links">
          <a
            href={instagramUrl}
            aria-label="Instagram"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram />
          </a>
          <a
            href={`https://www.facebook.com/search/top?q=${encodeURIComponent(business.name)}`}
            aria-label="Rechercher ER RAMMACH sur Facebook"
            target="_blank"
            rel="noreferrer"
          >
            <Facebook />
          </a>
          <a
            href={whatsappUrl}
            aria-label="WhatsApp"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle />
          </a>
        </div>
        <small>© 2026 ER RAMMACH. Tous droits réservés.</small>
      </div>
    </footer>
  );
}

function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const [title, description] = metadata[pathname] || [
      "Page introuvable | ER RAMMACH",
      "Retrouvez votre chemin vers ER RAMMACH Barber Shop.",
    ];
    document.title = title;
    const origin = import.meta.env.VITE_SITE_URL || window.location.origin;
    function meta(key, value, attribute = "name") {
      let el = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attribute, key);
        document.head.append(el);
      }
      el.content = value;
    }
    meta("description", description);
    meta("og:title", title, "property");
    meta("og:description", description, "property");
    meta("og:url", origin + pathname, "property");
    meta("og:type", "website", "property");
    meta("og:image", origin + "/images/hero-barber.webp", "property");
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = origin + pathname;
    let schema = document.getElementById("business-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "business-schema";
      schema.type = "application/ld+json";
      document.head.append(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: business.name,
      url: origin,
      telephone: business.internationalPhone,
      image: origin + "/images/hero-barber.webp",
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: "Meknès",
        addressCountry: "MA",
      },
      openingHours: "Mo-Sa 09:00-20:00",
      priceRange: "50–200 MAD",
      sameAs: [instagramUrl],
    });
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
export default function Layout() {
  return (
    <>
      <Seo />
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <a
        className="whatsapp-float"
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Nous contacter sur WhatsApp"
      >
        <MessageCircle size={32} />
      </a>
    </>
  );
}
