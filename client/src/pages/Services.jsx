import {
  Hero,
  ServiceCard,
  Benefits,
  BookingLink,
  ApiState,
} from "../components/Common";
import { useApi } from "../services/api";
import { serviceCategories } from "../../../shared/catalog";
export default function Services() {
  const resource = useApi("/services");
  return (
    <>
      <Hero
        page="services"
        label="NOS SERVICES"
        title={
          <>
            NOS <em>SERVICES</em>
          </>
        }
        description="Des prestations de qualité pour un style unique, réalisées par des professionnels."
      />
      <section className="container services-section">
        <ApiState resource={resource}>
          {(services) => (
            <>
              {serviceCategories.map((category) => {
                const categoryServices = services.filter(
                  (service) => service.category === category.id,
                );
                if (!categoryServices.length) return null;
                return (
                  <section className="service-category" key={category.id}>
                    <div className="section-heading compact-heading">
                      <p className="eyebrow">{category.arabicLabel}</p>
                      <h2>{category.label}</h2>
                    </div>
                    <div className="service-grid">
                      {categoryServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </ApiState>
      </section>
      <div className="benefits-strip">
        <div className="container benefits-cta">
          <Benefits />
          <BookingLink />
        </div>
      </div>
    </>
  );
}
