import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CalendarCheck2,
  Image,
  Mail,
  MessageSquare,
  Scissors,
  Star,
  Timer,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useAdminData } from "./data";
import { Badge, EmptyState, ErrorState, Spinner, StatCard, formatDate, money, statLabel } from "./ui";

export default function Dashboard() {
  const stats = useAdminData("/admin/stats");
  const recent = useAdminData("/admin/appointments?limit=6");

  const cards = useMemo(() => {
    if (!stats.data) return [];
    const s = stats.data;
    return [
      { icon: CalendarCheck2, title: "Rendez-vous", value: s.appointments, hint: `${s.appointmentsPending} en attente`, accent: "gold" },
      { icon: Calendar, title: "Aujourd’hui", value: s.appointmentsToday, hint: `${s.appointmentsThisMonth} ce mois`, accent: "" },
      { icon: Users, title: "Clients", value: s.customers, hint: `${s.barbers} barbiers`, accent: "" },
      { icon: Scissors, title: "Services", value: s.services, hint: `${s.barbers} barbiers`, accent: "" },
      { icon: Image, title: "Photos galerie", value: s.gallery, hint: "", accent: "" },
      { icon: Star, title: "Avis", value: s.reviews, hint: `${s.reviewsPending} en attente`, accent: "" },
      { icon: Mail, title: "Messages", value: s.messages, hint: `${s.messagesUnread} non lus`, accent: "danger" },
      { icon: Wallet, title: "Chiffre d’affaires", value: money(s.revenue), hint: "confirmés + terminés", accent: "gold" },
    ];
  }, [stats.data]);

  if (stats.loading) return <Spinner label="Chargement du tableau de bord…" />;
  if (stats.error || !stats.data) return <ErrorState message={stats.error || "Impossible de charger les données."} onRetry={stats.reload} />;

  return (
    <>
      <section className="stat-grid">
        {cards.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </section>

      <section className="admin-split dashboard-split">
        <div className="panel">
          <div className="panel-head">
            <h3>Derniers rendez-vous</h3>
            <Link to="/admin/rendez-vous" className="panel-link">Tout voir</Link>
          </div>
          {recent.loading ? (
            <Spinner label="…" />
          ) : recent.error ? (
            <EmptyState message={recent.error} />
          ) : recent.data?.items?.length ? (
            <div className="recent-appointments">
              {recent.data.items.map((a) => (
                <div className="recent-row" key={a.id}>
                  <span className="recent-avatar">{String(a.customer_name || "?").charAt(0)}</span>
                  <div className="recent-main">
                    <strong>{a.customer_name}</strong>
                    <small>{a.service_name} · {a.barber_name}</small>
                  </div>
                  <time>{formatDate(a.appointment_date)} · {a.appointment_time.slice(0, 5)}</time>
                  <Badge tone={a.status}>{statLabel(a.status)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Aucun rendez-vous" message="Les nouvelles réservations apparaîtront ici." />
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Activité</h3>
          </div>
          <ul className="activity-list">
            <li>
              <span className="activity-icon gold"><TrendingUp size={16} /></span>
              <div><strong>{stats.data.appointmentsThisMonth} rendez-vous ce mois-ci</strong><small>{money(stats.data.revenue)} de chiffre d’affaires</small></div>
            </li>
            <li>
              <span className="activity-icon"><Timer size={16} /></span>
              <div><strong>{stats.data.reviewsPending} avis à valider</strong><small>dans Témoignages</small></div>
            </li>
            <li>
              <span className="activity-icon danger"><MessageSquare size={16} /></span>
              <div><strong>{stats.data.messagesUnread} messages non lus</strong><small>dans Messages</small></div>
            </li>
            <li>
              <span className="activity-icon"><Calendar size={16} /></span>
              <div><strong>{stats.data.appointmentsPending} rendez-vous en attente</strong><small>à confirmer dans Rendez-vous</small></div>
            </li>
          </ul>
          <div className="quick-links">
            <Link to="/admin/rendez-vous" className="button button-primary">Gérer les rendez-vous</Link>
            <Link to="/admin/services" className="button button-outline">Services</Link>
          </div>
        </div>
      </section>
    </>
  );
}