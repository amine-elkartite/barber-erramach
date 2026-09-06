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
const previewServiceIds = [1, 2, 10, 13];
export default function Home() {
  const resource = useApi("/services");
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-copy">
            <h1>
              <span>ER RAMMACH</span>
              <small>MOHAMED</small>BARBER SHOP
            </h1>
            <p className="signature">Style · Confiance · Excellence</p>
            <p>
              Bienvenue dans votre espace dédié à l’élégance masculine.
              <br />
              Des coupes modernes, des soins de qualité et une expérience unique
              vous attendent.
            </p>
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
          <h2 className="center-title">NOS SERVICES</h2>
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
