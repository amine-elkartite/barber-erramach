import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  CalendarDays,
  CalendarOff,
  Clock,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Scissors,
  Settings,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "./auth";
import { cn } from "./ui";

const NAV = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["rendez-vous", "Rendez-vous", Calendar],
  ["clients", "Clients", Users],
  ["services", "Services", Scissors],
  ["barbiers", "Barbiers", User],
  ["galerie", "Galerie", Image],
  ["temoignages", "Témoignages", Star],
  ["jours-fermes", "Jours fermés", CalendarOff],
  ["horaires", "Horaires", Clock],
  ["messages", "Messages", Mail],
  ["parametres", "Paramètres", Settings],
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active =
    NAV.find(([id]) => location.pathname.startsWith(`/admin/${id}`))?.[1] ||
    (location.pathname.includes("profile") ? "Mon Profil" : "Dashboard");

  return (
    <div className={cn("admin-shell", open && "nav-open")}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/images/logo.webp" alt="ER RAMMACH" />
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <nav className="admin-nav">
          {NAV.map(([id, label, Icon]) => (
            <NavLink
              key={id}
              to={`/admin/${id}`}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(isActive && "active")}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/admin/profile" onClick={() => setOpen(false)} className={({ isActive }) => cn(isActive && "active")}>
            <User size={18} />
            <span>Mon Profil</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-admin">
            <img src={admin?.avatar || "/images/barber-1.webp"} alt="" />
            <div>
              <strong>{admin?.name || "Administrateur"}</strong>
              <small>{admin?.role || "Administrateur"}</small>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="hamburger" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
            <Menu size={20} />
          </button>
          <h1>{active}</h1>
          <div className="topbar-right">
            <a className="topbar-link" href="/" target="_blank" rel="noreferrer">
              <CalendarDays size={16} /> Voir le site
            </a>
            <button className="topbar-user" onClick={logout} title="Se déconnecter">
              <img src={admin?.avatar || "/images/barber-1.webp"} alt="" />
            </button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}