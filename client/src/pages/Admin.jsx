import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  Bell,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  Eye,
  Filter,
  Grid2X2,
  Image,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  UploadCloud,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  formatServicePrice,
  serviceCategories,
  services,
} from "../../../shared/catalog";
import { business } from "../config/business";
import { Button } from "../components/Common";

const navItems = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["rendez-vous", "Rendez-vous", Calendar],
  ["calendrier", "Calendrier", Calendar],
  ["clients", "Clients", User],
  ["services", "Services", Scissors],
  ["horaires", "Horaires", Clock],
  ["jours-fermes", "Jours fermés", Lock],
  ["galerie", "Galerie", Image],
  ["temoignages", "Témoignages", Star],
  ["parametres", "Paramètres", Settings],
];

const barbers = [
  ["Mohamed", "Barbier Senior", "/images/barber-1.webp"],
  ["Youssef", "Barbier", "/images/barber-2.webp"],
  ["Amine", "Barbier", "/images/barber-3.webp"],
  ["Karim", "Barbier", "/images/barber-1.webp"],
];

const appointments = [
  ["09:30", "Karim Benali", "Coupe + Barbe", "Mohamed", "Confirmé", "Payé"],
  ["10:00", "Reda Hammouch", "Entretien barbe", "Youssef", "Confirmé", "Payé"],
  ["10:30", "Ilyass Bouzid", "Soin du visage", "Amine", "Confirmé", "Payé"],
  ["11:00", "Yassine El Amrani", "Coupe + Barbe", "Mohamed", "Confirmé", "Payé"],
  ["11:30", "Omar Bouzidi", "Coupe moderne", "Youssef", "Annulé", "Remboursé"],
  ["12:00", "Hanna Kabbaji", "Coupe + soin", "Amine", "Confirmé", "Payé"],
  ["12:30", "Rachid Alaoui", "Entretien barbe", "Karim", "En attente", "En attente"],
  ["14:00", "Sofiane Rajae", "Coupe + Barbe", "Mohamed", "Confirmé", "Payé"],
  ["15:00", "Zakaria Chafaq", "Soin du visage", "Amine", "Terminé", "Payé"],
  ["16:00", "Amine El Idrissi", "Coupe moderne", "Youssef", "Terminé", "Payé"],
];

const clients = [
  ["Karim Benali", "06 12 34 56 78", "karim.benali@gmail.com", "17 Mai 2024", 12, "Coupe + Barbe", "Mohamed", "VIP", "1 850 DH"],
  ["Reda Hammouch", "06 98 76 54 32", "reda.hammouch@gmail.com", "16 Mai 2024", 9, "Entretien barbe", "Youssef", "Actif", "1 230 DH"],
  ["Ilyass Bouzid", "06 21 45 78 90", "ilyass.bouzid@gmail.com", "15 Mai 2024", 8, "Soin du visage", "Amine", "Actif", "1 050 DH"],
  ["Yassine El Amrani", "06 56 78 12 34", "yassine.amrani@gmail.com", "14 Mai 2024", 7, "Coupe + Barbe", "Mohamed", "VIP", "2 300 DH"],
  ["Omar Bouzidi", "06 11 22 33 44", "omar.bouzidi@gmail.com", "13 Mai 2024", 6, "Coupe moderne", "Youssef", "Actif", "980 DH"],
  ["Hanna Kabbaji", "06 33 44 55 66", "hanna.kabbaji@gmail.com", "10 Mai 2024", 5, "Coupe + soin", "Amine", "Actif", "870 DH"],
  ["Rachid Alaoui", "06 77 88 99 00", "rachid.alaoui@gmail.com", "08 Mai 2024", 4, "Entretien barbe", "Karim", "Nouveau", "560 DH"],
  ["Sofiane Rajae", "06 55 66 77 88", "sofiane.rajae@gmail.com", "07 Mai 2024", 4, "Coupe + Barbe", "Mohamed", "Actif", "760 DH"],
  ["Zakaria Chafaq", "06 44 55 66 77", "zakaria.chafaq@gmail.com", "05 Mai 2024", 3, "Soin du visage", "Amine", "Nouveau", "450 DH"],
  ["Amine El Idrissi", "06 66 77 88 99", "amine.idrissi@gmail.com", "03 Mai 2024", 3, "Coupe moderne", "Youssef", "Actif", "690 DH"],
  ["Mehdi Tahiri", "06 99 11 22 33", "mehdi.tahiri@gmail.com", "01 Mai 2024", 2, "Coupe moderne", "Mohamed", "Actif", "400 DH"],
  ["Youssef Alaoui", "06 88 99 00 11", "youssef.alaoui@gmail.com", "30 Avr. 2024", 2, "Entretien barbe", "Karim", "Nouveau", "320 DH"],
];

const reviews = [
  ["Yassine El Amrani", "Meilleur coiffeur de la ville ! Service professionnel, équipe accueillante et résultats toujours au top. Je recommande à 100%.", "Approuvé", 5, "15 Mai 2024"],
  ["Adil Benjelloun", "Ambiance exceptionnelle et service irréprochable. Chaque visite est une expérience unique. Merci à toute l’équipe !", "Approuvé", 5, "12 Mai 2024"],
  ["Omar Tazi", "Très satisfait de la coupe et de la barbe. Le souci du détail fait toute la différence. À bientôt !", "Approuvé", 5, "10 Mai 2024"],
  ["Mehdi Alaoui", "Professionnalisme, ponctualité et qualité. Je ne confie mes cheveux à personne d’autre. ER RAMMACH c’est la référence.", "Approuvé", 5, "08 Mai 2024"],
  ["Karim Bouzid", "Accueil chaleureux, cadre élégant et coupe parfaite. C’est devenu mon rituel chaque semaine.", "Approuvé", 5, "05 Mai 2024"],
  ["Soufiane El Idrissi", "J’ai essayé plusieurs salons, mais celui-ci est vraiment au-dessus du lot. Bravo !", "Approuvé", 5, "03 Mai 2024"],
  ["Hamza Lahlou", "Bon service dans l’ensemble, mais j’ai eu un léger retard sur mon rendez-vous.", "En attente", 4, "02 Mai 2024"],
  ["Rachid Belkacem", "La coupe est bien faite, mais j’aurais aimé plus de conseils sur le style.", "En attente", 4, "01 Mai 2024"],
];

const closedDays = [
  ["16 Juin 2024", "Dimanche", "Férié", "Aïd al-Adha", "Toute la journée", 18, "Actif"],
  ["14 Juil. 2024", "Dimanche", "Férié", "Fête Nationale", "Toute la journée", 15, "Planifié"],
  ["15 Août 2024", "Jeudi", "Férié", "Assomption", "Toute la journée", 12, "Planifié"],
  ["01 Sept. 2024", "Dimanche", "Maintenance", "Maintenance du salon", "Toute la journée", 9, "Planifié"],
  ["10 Sept. 2024", "Mardi", "Formation", "Formation équipe", "09:00 - 17:00", 6, "Planifié"],
  ["06 Oct. 2024", "Dimanche", "Congé exceptionnel", "Événement familial", "Toute la journée", 11, "Planifié"],
  ["Tous les Lundis", "Lundi", "Récurrent", "Fermeture hebdomadaire", "Toute la journée", 0, "Actif"],
  ["20 Mai 2024", "Lundi", "Maintenance", "Réparation climatisation", "09:00 - 13:00", 4, "Passé"],
  ["01 Mai 2024", "Mercredi", "Férié", "Fête du Travail", "Toute la journée", 10, "Passé"],
];

function StatCard({ icon: Icon, title, value, detail, trend = "+ 12%" }) {
  return (
    <article className="admin-stat">
      <span className="admin-stat-icon">
        <Icon />
      </span>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <small className={trend.startsWith("-") ? "down" : ""}>
          {trend} vs mois dernier
        </small>
        {detail && <em>{detail}</em>}
      </div>
      <Sparkline />
    </article>
  );
}

function Sparkline() {
  return (
    <svg className="sparkline" viewBox="0 0 110 40" aria-hidden="true">
      <path d="M2 31 C14 34 17 20 29 22 S47 34 57 16 72 11 80 25 96 11 108 16" />
    </svg>
  );
}

function Badge({ children }) {
  const status = String(children).toLowerCase();
  return <span className={`admin-badge ${status.replaceAll(" ", "-")}`}>{children}</span>;
}

function AdminButton({ children, danger = false, outline = false, icon: Icon = Plus }) {
  return (
    <button className={`admin-button ${outline ? "outline" : ""} ${danger ? "danger" : ""}`}>
      <Icon size={17} />
      {children}
    </button>
  );
}

function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active =
    navItems.find(([id]) => location.pathname.includes(`/admin/${id}`)) ||
    navItems[0];
  return (
    <div className={`admin-shell ${open ? "nav-open" : ""}`}>
      <aside className="admin-sidebar">
        <NavLink to="/admin/dashboard" className="admin-logo">
          <img src="/images/logo.webp" alt="ER RAMMACH Mohamed Barber Shop" />
        </NavLink>
        <nav aria-label="Navigation administrateur">
          {navItems.map(([id, label, Icon]) => (
            <NavLink key={id} to={`/admin/${id}`} onClick={() => setOpen(false)}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
          <NavLink to="/admin/profile" onClick={() => setOpen(false)}>
            <User size={20} />
            Mon Profil
          </NavLink>
        </nav>
        <div className="admin-brand-card">
          <img src="/images/logo.webp" alt="" />
          <small>Style · Confiance · Excellence</small>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu" aria-label="Ouvrir le menu" onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
          <h1>{active[1]}</h1>
          <div className="admin-user">
            <button aria-label="Notifications">
              <Bell />
              <span>3</span>
            </button>
            <img src="/images/barber-1.webp" alt="" />
            <div>
              <strong>Mohamed Er rammach</strong>
              <small>Administrateur</small>
            </div>
            <ChevronDown size={18} />
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

function Filters({ search = "Rechercher..." }) {
  return (
    <section className="admin-panel admin-filters">
      <label>
        <Search size={17} />
        <input placeholder={search} />
      </label>
      <select aria-label="Statut">
        <option>Tous les statuts</option>
      </select>
      <select aria-label="Barbier">
        <option>Tous les barbiers</option>
      </select>
      <select aria-label="Service">
        <option>Tous les services</option>
      </select>
      <AdminButton outline icon={RefreshCw}>
        Réinitialiser
      </AdminButton>
    </section>
  );
}

function Dashboard() {
  return (
    <>
      <section className="admin-stats four">
        <StatCard icon={Calendar} title="RENDEZ-VOUS AUJOURD’HUI" value="18" trend="+ 12%" />
        <StatCard icon={Users} title="CETTE SEMAINE" value="87" trend="+ 18%" />
        <StatCard icon={Clock} title="CRÉNEAUX DISPONIBLES" value="23" detail="Aujourd’hui" trend="+ 9%" />
        <StatCard icon={MessageSquare} title="CHIFFRE ESTIMÉ" value="2 850 DH" trend="+ 15%" />
      </section>
      <section className="admin-dashboard-grid">
        <CalendarTimeline />
        <SlotsPanel />
        <TodayTable />
        <WeeklyChart />
        <QuickActions />
      </section>
    </>
  );
}

function CalendarTimeline() {
  const blocks = [
    [0, 2, "Karim Benali", "Coupe + Barbe", "09:30 - 10:30"],
    [1, 4, "Reda Hammouch", "Entretien barbe", "10:00 - 10:30"],
    [2, 3, "Ilyass Bouzid", "Soin du visage", "11:00 - 12:00"],
    [0, 6, "Yassine El Amrani", "Coupe + Barbe", "12:00 - 13:00"],
    [3, 5, "Pause", "", "12:30 - 13:00", "pause"],
    [1, 8, "Omar Boudali", "Coupe moderne", "13:30 - 14:30"],
    [2, 9, "Hamza Kabbaj", "Coupe moderne", "14:30 - 15:30"],
    [0, 10, "Mehdi Tahiri", "Coupe moderne", "15:00 - 16:00"],
    [3, 11, "Client Walk-in", "Coupe moderne", "16:00 - 17:00"],
    [1, 12, "Sofiane Rajoe", "Coupe + Barbe", "17:00 - 18:00"],
    [2, 14, "Zakaria Chafiq", "Entretien barbe", "18:30 - 19:00"],
  ];
  return (
    <section className="admin-panel timeline-panel">
      <div className="admin-panel-head">
        <h2>CALENDRIER - AUJOURD’HUI</h2>
        <button>18 Mai 2024</button>
      </div>
      <div className="timeline">
        <div className="timeline-hours">
          <span />
          {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((hour) => (
            <b key={hour}>{hour}</b>
          ))}
        </div>
        {barbers.map(([name, role, image], row) => (
          <div className="timeline-row" key={name}>
            <div className="timeline-barber">
              <img src={image} alt="" />
              <strong>{name}</strong>
              <small>{role}</small>
            </div>
            <div className="timeline-grid">
              {blocks
                .filter(([blockRow]) => blockRow === row)
                .map(([, start, client, service, time, type]) => (
                  <article className={type === "pause" ? "pause" : ""} style={{ gridColumn: `${start} / span 2` }} key={client + time}>
                    <strong>{client}</strong>
                    {service && <span>{service}</span>}
                    <small>{time}</small>
                  </article>
                ))}
            </div>
          </div>
        ))}
      </div>
      <Legend items={["Réservé", "Disponible", "Bloqué", "Pause"]} />
    </section>
  );
}

function SlotsPanel() {
  return (
    <section className="admin-panel slots-admin">
      <h2>DISPONIBILITÉ DES CRÉNEAUX - AUJOURD’HUI</h2>
      <div>
        {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"].map((time, index) => (
          <button className={["free", "free", "free", "reserved", "free", "reserved", "blocked", "closed", "free", "reserved", "reserved", "free", "reserved", "reserved", "free", "free", "blocked", "reserved", "reserved", "free", "free", "free", "closed", "closed"][index]} key={time}>
            {time}
            <span />
          </button>
        ))}
      </div>
      <Legend items={["Disponible", "Réservé", "Bloqué", "Fermé"]} />
    </section>
  );
}

function Legend({ items }) {
  return (
    <div className="admin-legend">
      {items.map((item) => (
        <span key={item}>
          <i />
          {item}
        </span>
      ))}
    </div>
  );
}

function TodayTable() {
  return (
    <section className="admin-panel today-panel">
      <h2>RENDEZ-VOUS D’AUJOURD’HUI</h2>
      <div className="admin-table compact">
        <table>
          <thead>
            <tr>
              <th>Heure</th>
              <th>Client</th>
              <th>Service</th>
              <th>Barbier</th>
              <th>Statut</th>
              <th>Paiement</th>
            </tr>
          </thead>
          <tbody>
            {appointments.slice(0, 5).map((row) => (
              <tr key={row.join("-")}>
                {row.map((cell, index) => (
                  <td key={cell}>{index > 3 ? <Badge>{cell}</Badge> : cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="admin-link">Voir tous les rendez-vous <ChevronRight size={16} /></button>
    </section>
  );
}

function WeeklyChart() {
  return (
    <section className="admin-panel chart-panel">
      <div className="admin-panel-head">
        <h2>RENDEZ-VOUS DE LA SEMAINE</h2>
        <select aria-label="Période">
          <option>Cette semaine</option>
        </select>
      </div>
      <strong>87</strong>
      <small>+ 18% vs semaine dernière</small>
      <div className="bar-chart">
        {[12, 15, 18, 16, 21, 32, 28].map((value, index) => (
          <span style={{ height: `${value * 3}px` }} key={value + index}>
            <b>{value}</b>
          </span>
        ))}
      </div>
      <div className="chart-days">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <section className="admin-panel quick-actions">
      <h2>ACTIONS RAPIDES</h2>
      <AdminButton>Ajouter un rendez-vous</AdminButton>
      <AdminButton outline icon={Lock}>Bloquer un créneau</AdminButton>
      <AdminButton outline icon={Scissors}>Ajouter un service</AdminButton>
    </section>
  );
}

function AppointmentsPage() {
  return (
    <>
      <section className="admin-stats five">
        <StatCard icon={Calendar} title="AUJOURD’HUI" value="18" detail="Rendez-vous" />
        <StatCard icon={Check} title="CONFIRMÉS" value="12" detail="66.7%" />
        <StatCard icon={Clock} title="EN ATTENTE" value="3" detail="16.7%" />
        <StatCard icon={X} title="ANNULÉS" value="1" detail="5.6%" trend="- 4%" />
        <StatCard icon={Star} title="TERMINÉS" value="2" detail="11.1%" />
      </section>
      <Filters search="Rechercher client ou téléphone..." />
      <section className="admin-split">
        <AppointmentsTable />
        <AppointmentDetail />
      </section>
    </>
  );
}

function AppointmentsTable() {
  return (
    <section className="admin-panel">
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              {["Heure", "Client", "Téléphone", "Service", "Barbier", "Date", "Statut", "Paiement", "Actions"].map((head) => (
                <th key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.map((row, index) => (
              <tr className={index === 0 ? "selected" : ""} key={row.join("-")}>
                <td>{row[0]}</td>
                <td><Avatar name={row[1]} index={index} /></td>
                <td>06 {12 + index} 34 56 78</td>
                <td>{row[2]}<small>30 min</small></td>
                <td><Avatar name={row[3]} index={index + 1} small /></td>
                <td>18 Mai 2024</td>
                <td><Badge>{row[4]}</Badge></td>
                <td><Badge>{row[5]}</Badge></td>
                <td><RowActions /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter total="18 rendez-vous" />
    </section>
  );
}

function AppointmentDetail() {
  return (
    <aside className="admin-panel detail-card">
      <h2>DÉTAIL DU RENDEZ-VOUS SÉLECTIONNÉ</h2>
      <div className="detail-client">
        <img src="/images/barber-1.webp" alt="" />
        <div>
          <strong>Karim Benali</strong>
          <Badge>Client fidèle</Badge>
          <small><Phone size={14} /> 06 12 34 56 78</small>
          <small><Mail size={14} /> karim.benali@gmail.com</small>
        </div>
      </div>
      <DetailList
        rows={[
          ["Service réservé", "Coupe + Barbe"],
          ["Barbier", "Mohamed"],
          ["Date et heure", "Samedi 18 Mai 2024 · 09:30"],
          ["Statut", "Confirmé"],
          ["Paiement", "Payé · 100 DH"],
          ["Notes", "Client préfère une coupe dégradée basse."],
        ]}
      />
      <AdminButton icon={Edit3}>Modifier le rendez-vous</AdminButton>
      <div className="detail-actions">
        <AdminButton outline icon={Check}>Confirmer</AdminButton>
        <AdminButton danger outline icon={X}>Annuler</AdminButton>
      </div>
    </aside>
  );
}

function CalendarPage() {
  return (
    <>
      <section className="admin-stats four">
        <StatCard icon={Calendar} title="AUJOURD’HUI" value="18" detail="Rendez-vous" />
        <StatCard icon={Users} title="CETTE SEMAINE" value="87" detail="Rendez-vous" />
        <StatCard icon={Check} title="CRÉNEAUX RÉSERVÉS" value="236" />
        <StatCard icon={Clock} title="CRÉNEAUX DISPONIBLES" value="128" />
      </section>
      <section className="calendar-admin-grid">
        <MonthCalendar />
        <DayAppointments />
      </section>
    </>
  );
}

function MonthCalendar() {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return (
    <section className="admin-panel month-panel">
      <div className="admin-panel-head">
        <div>
          <button><ChevronLeft size={17} /></button>
          <button><ChevronRight size={17} /></button>
        </div>
        <h2>Mai 2024</h2>
        <div className="segmented"><button>Jour</button><button>Semaine</button><button className="active">Mois</button></div>
      </div>
      <div className="month-grid">
        {["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"].map((day) => <b key={day}>{day}</b>)}
        {days.map((day) => (
          <article className={day === 18 ? "selected" : day % 7 === 5 ? "blocked" : ""} key={day}>
            <strong>{day <= 31 ? day : day - 31}</strong>
            {day % 3 !== 0 && <small><i /> {day % 4}</small>}
            {day % 2 === 0 && <span>09:30 Karim B.</span>}
            {day % 5 === 0 && <span className="wait">14:00 Hamza K.</span>}
            {day % 7 === 5 && <em>Fermé</em>}
          </article>
        ))}
      </div>
      <Legend items={["Confirmé / Disponible", "En attente", "Annulé / Bloqué", "Fermé / Passé"]} />
    </section>
  );
}

function DayAppointments() {
  return (
    <aside className="admin-panel day-panel">
      <h2>RENDEZ-VOUS DU 18 MAI 2024</h2>
      {appointments.slice(0, 4).map((row, index) => (
        <article key={row.join("-")}>
          <b>{row[0]}</b>
          <Avatar name={row[1]} index={index} />
          <span>{row[2]}<small>{row[3]}</small></span>
          <Badge>{index === 2 ? "En attente" : index === 3 ? "Annulé" : "Confirmé"}</Badge>
          <MoreVertical size={18} />
        </article>
      ))}
      <div className="mini-stats">
        <span>Rendez-vous <b>4</b></span>
        <span>Confirmés <b>2</b></span>
        <span>En attente <b>1</b></span>
        <span>Annulés <b>1</b></span>
      </div>
      <QuickList />
    </aside>
  );
}

function ClientsPage() {
  return (
    <>
      <section className="admin-stats four">
        <StatCard icon={Users} title="TOTAL CLIENTS" value="248" />
        <StatCard icon={UserPlus} title="NOUVEAUX CE MOIS" value="18" />
        <StatCard icon={Star} title="CLIENTS FIDÈLES" value="76" />
        <StatCard icon={RefreshCw} title="TAUX DE RETOUR" value="68%" />
      </section>
      <Filters search="Nom, téléphone ou e-mail..." />
      <section className="admin-split">
        <section className="admin-panel">
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  {["Client", "Téléphone", "E-mail", "Dernière visite", "RDV", "Service favori", "Barbier favori", "Statut", "Dépensé", "Actions"].map((head) => <th key={head}>{head}</th>)}
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => (
                  <tr className={index === 0 ? "selected" : ""} key={client[0]}>
                    <td><Avatar name={client[0]} index={index} /></td>
                    {client.slice(1, 7).map((cell) => <td key={cell}>{cell}</td>)}
                    <td><Badge>{client[7]}</Badge></td>
                    <td>{client[8]}</td>
                    <td><RowActions /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter total="248 clients" />
        </section>
        <ClientDetail />
      </section>
    </>
  );
}

function ClientDetail() {
  return (
    <aside className="admin-panel detail-card">
      <h2>DÉTAIL DU CLIENT SÉLECTIONNÉ</h2>
      <div className="detail-client">
        <img src="/images/barber-1.webp" alt="" />
        <div>
          <strong>Karim Benali</strong>
          <Badge>VIP</Badge>
          <small><Phone size={14} /> 06 12 34 56 78</small>
          <small><Mail size={14} /> karim.benali@gmail.com</small>
        </div>
      </div>
      <DetailList rows={[
        ["Date d’inscription", "12 Décembre 2023"],
        ["Dernière visite", "17 Mai 2024"],
        ["Service favori", "Coupe + Barbe"],
        ["Barbier favori", "Mohamed"],
        ["Nombre de rendez-vous", "12"],
        ["Total dépensé", "1 850 DH"],
        ["Notes", "Client très régulier, apprécie les coupes modernes."],
      ]} />
      <AdminButton icon={Edit3}>Modifier le client</AdminButton>
      <AdminButton outline icon={Phone}>Appeler</AdminButton>
      <button className="whatsapp-admin">WhatsApp</button>
    </aside>
  );
}

function ServicesPage() {
  const selected = services[9];
  return (
    <>
      <section className="admin-stats four">
        <StatCard icon={Scissors} title="TOTAL SERVICES" value={services.length} />
        <StatCard icon={Check} title="SERVICES ACTIFS" value={services.length} />
        <StatCard icon={Star} title="SERVICE LE PLUS RÉSERVÉ" value="Dégradé cheveux" />
        <StatCard icon={Clock} title="DURÉE MOYENNE" value="33 min" />
      </section>
      <section className="admin-panel admin-filters services-filter">
        <label><Search size={17} /><input placeholder="Rechercher un service" /></label>
        <select aria-label="Statut"><option>Tous les statuts</option></select>
        <select aria-label="Catégorie"><option>Toutes les catégories</option></select>
        <select aria-label="Durée"><option>Toutes les durées</option></select>
        <AdminButton>Ajouter un service</AdminButton>
        <AdminButton outline icon={Download}>Exporter (CSV)</AdminButton>
      </section>
      <section className="admin-split">
        <section className="admin-panel">
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  {["Service", "Catégorie", "Durée", "Prix", "Réservations ce mois", "Statut", "Dernière modification", "Actions"].map((head) => <th key={head}>{head}</th>)}
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => {
                  const category = serviceCategories.find((item) => item.id === service.category);
                  return (
                    <tr className={index === 9 ? "selected" : ""} key={service.id}>
                      <td><Avatar name={service.name} index={index} service /></td>
                      <td>{category?.label || service.category}</td>
                      <td>{service.duration} min</td>
                      <td>{formatServicePrice(service)}</td>
                      <td>{[24, 18, 14, 9, 11, 28, 16, 7][index % 8]}</td>
                      <td><Badge>{index === 15 ? "Populaire" : "Actif"}</Badge></td>
                      <td>{String(10 - (index % 8)).padStart(2, "0")} Mai 2024</td>
                      <td><RowActions /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TableFooter total={`${services.length} services`} />
        </section>
        <aside className="admin-panel detail-card service-detail">
          <h2>DÉTAIL DU SERVICE SÉLECTIONNÉ</h2>
          <img src={selected.image} alt="" />
          <h3>{selected.name}</h3>
          <DetailList rows={[
            ["Prix", formatServicePrice(selected)],
            ["Durée", `${selected.duration} min`],
            ["Catégorie", "SOINS & BEAUTÉ"],
            ["Réservations ce mois", "32"],
            ["Popularité", "★★★★★ (4.8)"],
          ]} />
          <h2>DESCRIPTION</h2>
          <p>{selected.description}</p>
          <AdminButton icon={Edit3}>Modifier le service</AdminButton>
          <AdminButton outline icon={X}>Désactiver</AdminButton>
        </aside>
      </section>
    </>
  );
}

function HoursPage() {
  const rows = [
    ["Lundi", "Ouvert", "09:00", "20:00", "13:00 - 14:00", 20],
    ["Mardi", "Ouvert", "09:00", "20:00", "13:00 - 14:00", 20],
    ["Mercredi", "Ouvert", "09:00", "20:00", "13:00 - 14:00", 20],
    ["Jeudi", "Ouvert", "09:00", "20:00", "13:00 - 14:00", 20],
    ["Vendredi", "Ouvert", "09:00", "20:00", "13:00 - 14:00", 20],
    ["Samedi", "Ouvert", "09:00", "21:00", "13:00 - 14:00", 24],
    ["Dimanche", "Fermé", "—", "—", "—", 0],
  ];
  return (
    <>
      <section className="admin-stats four">
        <StatCard icon={Clock} title="HEURES CETTE SEMAINE" value="66h 30" />
        <StatCard icon={Calendar} title="JOURS OUVERTS" value="6" />
        <StatCard icon={MessageSquare} title="PAUSES CONFIGURÉES" value="6" />
        <StatCard icon={Shield} title="EXCEPTIONS CE MOIS" value="2" trend="- 1%" />
      </section>
      <Filters search="Rechercher un jour" />
      <section className="admin-split">
        <section className="admin-panel">
          <h2>HORAIRES HEBDOMADAIRES</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>{["Jour", "Statut", "Ouverture", "Fermeture", "Pause", "Créneaux générés", "Dernière modification", "Actions"].map((head) => <th key={head}>{head}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr className={index === 5 ? "selected" : ""} key={row[0]}>
                    <td>{row[0]}</td>
                    <td><Badge>{row[1]}</Badge></td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                    <td>{row[4]}</td>
                    <td>{row[5]}</td>
                    <td>10 Mai 2024 · 14:32</td>
                    <td><RowActions /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter total="7 jours" />
        </section>
        <aside className="admin-panel detail-card">
          <h2>DÉTAIL DU JOUR SÉLECTIONNÉ</h2>
          <h3>Samedi</h3>
          <DetailList rows={[
            ["Ouverture", "09:00"],
            ["Fermeture", "21:00"],
            ["Pause", "13:00 - 14:00"],
            ["Durée totale d’ouverture", "11 h 00"],
            ["Créneaux", "24"],
            ["Capacité estimée", "48 clients"],
          ]} />
          <AdminButton icon={Edit3}>Modifier les horaires</AdminButton>
          <AdminButton outline icon={Lock}>Bloquer un créneau</AdminButton>
        </aside>
      </section>
      <section className="admin-bottom-grid">
        <Donut title="RÉPARTITION DES HEURES" center="66h 30" />
        <WeeklyChart />
        <SlotsPanel />
      </section>
    </>
  );
}

function ClosedDaysPage() {
  return (
    <>
      <section className="admin-stats four">
        <StatCard icon={Calendar} title="JOURS FERMÉS CE MOIS" value="5" trend="- 17%" />
        <StatCard icon={Shield} title="EXCEPTIONS PLANIFIÉES" value="8" />
        <StatCard icon={RefreshCw} title="JOURS RÉCURRENTS FERMÉS" value="1" />
        <StatCard icon={Users} title="RENDEZ-VOUS IMPACTÉS" value="42" trend="- 9%" />
      </section>
      <section className="admin-panel admin-filters">
        <label><Search size={17} /><input placeholder="Rechercher une date ou une raison" /></label>
        <select aria-label="Type de fermeture"><option>Type de fermeture</option></select>
        <select aria-label="Statut"><option>Statut</option></select>
        <AdminButton>Ajouter un jour fermé</AdminButton>
        <AdminButton danger icon={Lock}>Bloquer une période</AdminButton>
        <AdminButton outline icon={Download}>Exporter (CSV)</AdminButton>
      </section>
      <section className="admin-split">
        <section className="admin-panel">
          <h2>LISTE DES JOURS FERMÉS</h2>
          <div className="admin-table">
            <table>
              <thead><tr>{["Date", "Jour", "Type", "Raison", "Durée", "Rendez-vous impactés", "Statut", "Dernière modification", "Actions"].map((head) => <th key={head}>{head}</th>)}</tr></thead>
              <tbody>
                {closedDays.map((row, index) => (
                  <tr className={index === 0 ? "selected" : ""} key={row[0]}>
                    {row.map((cell, cellIndex) => <td key={cell}>{[2, 6].includes(cellIndex) ? <Badge>{cell}</Badge> : cell}</td>)}
                    <td>08 Mai 2024 · 14:22</td>
                    <td><RowActions /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TableFooter total="9 jours" />
        </section>
        <aside className="admin-panel detail-card">
          <h2>DÉTAIL DU JOUR FERMÉ SÉLECTIONNÉ</h2>
          <h3>Aïd al-Adha</h3>
          <DetailList rows={[
            ["Date", "Dimanche 16 Juin 2024"],
            ["Type", "Férié"],
            ["Raison", "Aïd al-Adha"],
            ["Heure / Durée", "Toute la journée"],
            ["Impact", "18 rendez-vous impactés"],
            ["Notification clients", "Envoyée le 08 Mai 2024 à 14:25"],
          ]} />
          <AdminButton icon={Edit3}>Modifier la fermeture</AdminButton>
          <AdminButton outline icon={Mail}>Notifier les clients</AdminButton>
          <AdminButton danger outline icon={Trash2}>Supprimer</AdminButton>
        </aside>
      </section>
    </>
  );
}

function GalleryPage() {
  const categories = ["Toutes", "Coupes", "Barbe", "Avant / Après", "Salon", "Équipe"];
  return (
    <>
      <section className="admin-page-head">
        <div><Image /><span><h2>Galerie</h2><p>Gérez les photos de votre galerie</p></span></div>
        <div><AdminButton outline icon={Filter}>Trier</AdminButton><AdminButton>Ajouter des photos</AdminButton></div>
      </section>
      <div className="gallery-tabs">{categories.map((item, index) => <button className={index === 0 ? "active" : ""} key={item}>{item}</button>)}</div>
      <section className="admin-gallery-grid">
        {Array.from({ length: 12 }, (_, index) => (
          <article className="admin-gallery-card" key={index}>
            <img src={`/images/gallery-${(index % 9) + 1}.webp`} alt="" />
            <span>{categories[(index % 5) + 1]}</span>
            <footer>
              <time>{16 - index} Mai 2024</time>
              <div><button><Edit3 size={15} /></button><button><Trash2 size={15} /></button></div>
            </footer>
          </article>
        ))}
      </section>
      <Pagination />
    </>
  );
}

function ReviewsPage() {
  return (
    <>
      <section className="admin-page-head">
        <div><span><h2>Témoignages</h2><p>Découvrez ce que nos clients disent de nous.</p></span></div>
        <AdminButton>Ajouter un témoignage</AdminButton>
      </section>
      <section className="admin-stats four">
        <StatCard icon={MessageSquare} title="TOTAL TÉMOIGNAGES" value="26" />
        <StatCard icon={Star} title="NOTE MOYENNE" value="4.9 / 5" />
        <StatCard icon={Check} title="APPROUVÉS" value="24" />
        <StatCard icon={Eye} title="EN ATTENTE" value="2" />
      </section>
      <section className="review-grid-admin">
        {reviews.map((review, index) => (
          <article className="admin-panel review-admin-card" key={review[0]}>
            <header>
              <Avatar name={review[0]} index={index} />
              <Badge>{review[2]}</Badge>
            </header>
            <div className="stars">★★★★★ <small>{review[4]}</small></div>
            <p>{review[1]}</p>
            <b>”</b>
          </article>
        ))}
      </section>
      <Pagination />
    </>
  );
}

function SettingsPage() {
  return (
    <>
      <section className="admin-page-head">
        <div><Settings /><span><h2>Paramètres</h2><p>Gérez les paramètres généraux de votre établissement.</p></span></div>
        <AdminButton icon={Check}>Enregistrer les modifications</AdminButton>
      </section>
      <section className="settings-grid">
        <PanelTitle title="Profil de l’entreprise" subtitle="Informations générales de votre établissement.">
          <div className="company-profile">
            <img src="/images/logo.webp" alt="" />
            <div className="settings-form">
              <label>Nom de l’établissement<input defaultValue="Er Rammach Barber Shop" /></label>
              <label>Téléphone<input defaultValue={business.internationalPhone.replace("+212", "+212 ")} /></label>
              <label>Email<input defaultValue="contact@errammach.ma" /></label>
              <label>Adresse<input defaultValue="123, Avenue Mohammed V, Meknès, Maroc" /></label>
            </div>
          </div>
        </PanelTitle>
        <PanelTitle title="Préférences générales" subtitle="Configurez les préférences générales de l’application.">
          <SettingsRows rows={["Langue", "Fuseau horaire", "Devise", "Format de date", "Format de l’heure", "Première heure de la journée"]} />
        </PanelTitle>
        <PanelTitle title="Notifications" subtitle="Gérez vos préférences de notifications.">
          <ToggleRows rows={["Nouveaux rendez-vous", "Rappels de rendez-vous", "Annulations", "Promotions et offres"]} />
        </PanelTitle>
        <PanelTitle title="Sécurité" subtitle="Gérez vos paramètres de sécurité et de compte.">
          <SettingsRows rows={["Mot de passe", "Authentification à deux facteurs", "Sessions actives"]} button />
        </PanelTitle>
        <PanelTitle title="Sauvegarde et données" subtitle="Gérez vos données et sauvegardes.">
          <SettingsRows rows={["Sauvegarde automatique", "Exporter les données", "Supprimer le cache"]} button />
        </PanelTitle>
        <PanelTitle title="Personnalisation" subtitle="Personnalisez l’apparence de votre espace de travail.">
          <div className="swatches">{["#d8a33b", "#d84a4a", "#8f4fd4", "#3f6bd6", "#3ea45a", "#22b8bd"].map((color) => <button style={{ background: color }} key={color} />)}</div>
        </PanelTitle>
      </section>
    </>
  );
}

function ProfilePage() {
  return (
    <>
      <section className="admin-page-title">
        <h2>Mon Profil</h2>
        <p><NavLink to="/admin/dashboard">Dashboard</NavLink> <ChevronRight size={14} /> Mon Profil</p>
      </section>
      <section className="profile-grid">
        <aside className="admin-panel profile-card">
          <img src="/images/barber-1.webp" alt="" />
          <button><Camera size={16} /></button>
          <h2>Mohamed Er rammach</h2>
          <strong>Administrateur</strong>
          <DetailList rows={[
            ["Email", "mohamed.errammach@gmail.com"],
            ["Téléphone", "+212 6 12 34 56 78"],
            ["Date", "15 Mai 1995"],
            ["Adresse", "Casablanca, Maroc"],
            ["Rôle", "Administrateur"],
          ]} />
          <AdminButton outline icon={Edit3}>Changer la photo</AdminButton>
        </aside>
        <PanelTitle title="Informations personnelles">
          <div className="settings-form two">
            {["Nom complet", "Nom d’utilisateur", "Email", "Rôle", "Téléphone", "Langue", "Date de naissance", "Fuseau horaire", "Adresse"].map((label, index) => (
              <label key={label}>{label}<input defaultValue={["Mohamed Er rammach", "er_rammach", "mohamed.errammach@gmail.com", "Administrateur", "+212 6 12 34 56 78", "Français", "15/05/1995", "(GMT+01:00) Casablanca", "Casablanca, Maroc"][index]} /></label>
            ))}
          </div>
        </PanelTitle>
        <PanelTitle title="Changer le mot de passe">
          <div className="settings-form">
            <label>Mot de passe actuel<input placeholder="Entrez votre mot de passe actuel" type="password" /></label>
            <label>Nouveau mot de passe<input placeholder="Entrez votre nouveau mot de passe" type="password" /></label>
            <label>Confirmer le nouveau mot de passe<input placeholder="Confirmez votre nouveau mot de passe" type="password" /></label>
          </div>
          <AdminButton icon={Lock}>Mettre à jour le mot de passe</AdminButton>
        </PanelTitle>
        <PanelTitle title="Sessions actives" subtitle="Gérez vos sessions actives sur les autres appareils.">
          <div className="session-row"><span><Grid2X2 /> MacBook Pro · macOS<small>Casablanca, Maroc · 192.168.1.15</small></span><Badge>Session actuelle</Badge></div>
          <AdminButton danger outline icon={LogOut}>Se déconnecter de toutes les autres sessions</AdminButton>
        </PanelTitle>
      </section>
    </>
  );
}

function PanelTitle({ title, subtitle, children }) {
  return (
    <section className="admin-panel settings-panel">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </section>
  );
}

function SettingsRows({ rows, button = false }) {
  return (
    <div className="settings-rows">
      {rows.map((row) => (
        <div key={row}>
          <span><Settings size={18} /> {row}</span>
          {button ? <button>Voir</button> : <select aria-label={row}><option>Français</option></select>}
        </div>
      ))}
    </div>
  );
}

function ToggleRows({ rows }) {
  return (
    <div className="toggle-rows">
      {rows.map((row, index) => (
        <label key={row}>
          <span>{row}<small>Recevoir des notifications pour {row.toLowerCase()}</small></span>
          <input type="checkbox" defaultChecked={index < 3} />
        </label>
      ))}
    </div>
  );
}

function QuickList() {
  return (
    <div className="quick-list">
      <h2>ACTIONS RAPIDES</h2>
      {["Ajouter un rendez-vous pour le 18 mai", "Copier les rendez-vous de cette journée", "Bloquer cette date", "Exporter la journée (CSV)"].map((item) => (
        <button key={item}><Plus size={15} /> {item}</button>
      ))}
    </div>
  );
}

function Donut({ title, center }) {
  return (
    <section className="admin-panel donut-panel">
      <h2>{title}</h2>
      <div className="donut"><span>{center}</span></div>
    </section>
  );
}

function Avatar({ name, index = 0, small = false, service = false }) {
  return (
    <span className={`avatar-name ${small ? "small" : ""}`}>
      <img src={service ? `/images/service-${(index % 11) + 1}.webp` : `/images/barber-${(index % 3) + 1}.webp`} alt="" />
      {name}
    </span>
  );
}

function RowActions() {
  return (
    <span className="row-actions">
      <button><Eye size={15} /></button>
      <button><Edit3 size={15} /></button>
      <button><MoreVertical size={15} /></button>
    </span>
  );
}

function TableFooter({ total }) {
  return (
    <footer className="table-footer">
      <span>Affichage 1 à 12 sur {total}</span>
      <Pagination small />
      <label>Lignes par page<select aria-label="Lignes par page"><option>12</option><option>25</option></select></label>
    </footer>
  );
}

function Pagination({ small = false }) {
  return (
    <div className={`admin-pagination ${small ? "small" : ""}`}>
      <button><ChevronLeft size={16} /></button>
      <button className="active">1</button>
      <button>2</button>
      <button>3</button>
      {!small && <button>4</button>}
      <button><ChevronRight size={16} /></button>
    </div>
  );
}

function DetailList({ rows }) {
  return (
    <dl className="detail-list">
      {rows.map(([term, value]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Admin() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rendez-vous" element={<AppointmentsPage />} />
        <Route path="calendrier" element={<CalendarPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="horaires" element={<HoursPage />} />
        <Route path="jours-fermes" element={<ClosedDaysPage />} />
        <Route path="galerie" element={<GalleryPage />} />
        <Route path="temoignages" element={<ReviewsPage />} />
        <Route path="parametres" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}
