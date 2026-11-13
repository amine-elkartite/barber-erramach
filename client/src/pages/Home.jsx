import { Phone } from "lucide-react";
import {
  Benefits,
  BookingLink,
  Button,
  InfoPanel,
  ServiceCard,
  ApiState,
} from "../components/Common";
import QuickBooking from "../components/QuickBooking";
import { useApi } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";
const previewServiceIds = [1, 2, 10, 13];
export default function Home() {
  const resource = useApi("/services");
  const { settings } = useSettings();
  const heroTitle = settings.hero_title || "ER RAMMACH";
  const heroSubTop = settings.hero_subtitle_top || "MOHAMED";
  const heroSubBottom = settings.hero_subtitle_bottom || "BARBER SHOP";
  const heroSlogan = settings.hero_slogan || "Style · Confiance · Excellence";
  const heroDescription =
    settings.hero_description ||
    "Bienvenue dans votre espace dédié à l’élégance masculine.\nDes coupes modernes, des soins de qualité et une expérience unique vous attendent.";
  const homeServicesTitle = settings.home_services_title || "NOS SERVICES";
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-copy">
            <h1>
              <span>{heroTitle}</span>
              <small>{heroSubTop}</small>
              {heroSubBottom}
            </h1>
            <p className="signature">{heroSlogan}</p>
            {heroDescription.split("\n").map((line) => (
              <p key={line}>{line}</p>
            ))}
            <div className="button-row">
              <BookingLink />
              <Button to="/contact" outline>
                <Phone size={18} />
                NOUS CONTACTER
              </Button>
            </div>
          </div>
          <QuickBooking />
        </div>
      </section>
      <div className="home-benefits container">
        <Benefits home />
      </div>
      <section className="container home-services">
        <div>
          <h2 className="center-title">{homeServicesTitle}</h2>
          <ApiState resource={resource}>
            {(services) => (
              <div className="service-grid home-grid">
                {services
                  .filter((s) => previewServiceIds.includes(s.id))
                  .map((service) => (
                    <ServiceCard compact key={service.id} service={service} />
                  ))}
              </div>
            )}
          </ApiState>
        </div>
        <InfoPanel />
      </section>
    </>
  );
}
