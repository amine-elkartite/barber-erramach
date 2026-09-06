import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Calendar, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, Edit3, Eye,
  Filter, Grid2X2, Image, LayoutDashboard, Lock, LogOut, Mail, MapPin, Menu, MessageSquare, MoreVertical,
  Phone, Plus, RefreshCw, Scissors, Search, Settings, Shield, Star, Trash2, User, UserPlus, Users, X,
} from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { serviceCategories } from "../../../shared/catalog";

const AdminContext = createContext(null);
const navItems = [
  ["dashboard", "Dashboard", LayoutDashboard], ["rendez-vous", "Rendez-vous", Calendar], ["calendrier", "Calendrier", Calendar],
  ["clients", "Clients", User], ["services", "Services", Scissors], ["horaires", "Horaires", Clock], ["jours-fermes", "Jours fermés", Lock],
  ["galerie", "Galerie", Image], ["temoignages", "Témoignages", Star], ["parametres", "Paramètres", Settings],
];
const emptyState = { business: {}, profile: {}, notifications: {}, barbers: [], clients: [], appointments: [], services: [], hours: [], closedDays: [], reviews: [], gallery: [] };
const formatDate = (value) => value ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "—";
const money = (value) => `${Number(value || 0).toLocaleString("fr-FR")} DH`;
const servicePrice = (service) => service?.price_type === "starting_from" ? `À partir de ${money(service.price)}` : money(service?.price);
const statusClass = (value) => String(value || "").toLowerCase().replaceAll(" ", "-");

async function requestAdmin(path, options = {}) {
  const response = await fetch(`/api/admin${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) throw new Error(payload.message || "Action admin impossible.");
  return payload;
}

function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("AdminContext manquant");
  return value;
}

function AdminProvider({ children }) {
  const [state, setState] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(AdminProvider.toastTimer);
    AdminProvider.toastTimer = window.setTimeout(() => setToast(null), 3200);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const payload = await requestAdmin("/state");
      setState({ ...emptyState, ...payload.data });
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const mutate = async (collection, method, body, id) => {
    const path = id ? `/${collection}/${id}` : `/${collection}`;
    const payload = await requestAdmin(path, { method, body: body ? JSON.stringify(body) : undefined });
    if (payload.data?.state) setState({ ...emptyState, ...payload.data.state });
    notify(payload.message || "Action enregistrée.");
    return payload.data?.item;
  };

  const addItem = (collection, defaults = {}) => setModal({ mode: "add", collection, item: defaults });
  const editItem = (collection, item) => setModal({ mode: "edit", collection, item });
  const deleteItem = async (collection, item) => {
    if (!window.confirm(`Supprimer « ${item.name || item.client || item.reason || item.title || item.id} » ?`)) return;
    await mutate(collection, "DELETE", null, item.id);
  };
  const patchSettings = async (collection, values) => mutate(collection, "PATCH", values);

  const value = { state, loading, notify, reload, mutate, addItem, editItem, deleteItem, patchSettings };
  return (
    <AdminContext.Provider value={value}>
      {children}
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.message}</div>}
      {modal && <AdminModal modal={modal} close={() => setModal(null)} mutate={mutate} />}
    </AdminContext.Provider>
  );
}

function AdminModal({ modal, close, mutate }) {
  const fields = fieldMap[modal.collection] || [];
  const [form, setForm] = useState(() => ({ ...modal.item }));
  const title = `${modal.mode === "add" ? "Ajouter" : "Modifier"} ${labels[modal.collection] || "élément"}`;
  const submit = async (event) => {
    event.preventDefault();
    const cleaned = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, ["price", "duration", "spent", "appointments", "slots", "rating", "bookingsThisMonth", "impacted"].includes(key) ? Number(value || 0) : value]));
    await mutate(modal.collection, modal.mode === "add" ? "POST" : "PATCH", cleaned, modal.mode === "edit" ? modal.item.id : undefined);
    close();
  };
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={close}>
      <form className="admin-modal admin-panel" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <header><h2>{title}</h2><button type="button" onClick={close}><X size={18} /></button></header>
        <div className="settings-form two">
          {fields.map((field) => <label key={field.name}>{field.label}<input type={field.type || "text"} value={form[field.name] ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.value }))} required={field.required} /></label>)}
        </div>
        <footer><AdminButton type="submit" icon={Check}>Enregistrer</AdminButton><AdminButton type="button" outline icon={X} onClick={close}>Annuler</AdminButton></footer>
      </form>
    </div>
  );
}

const labels = { appointments: "un rendez-vous", clients: "un client", services: "un service", closedDays: "un jour fermé", reviews: "un témoignage", gallery: "une photo" };
const nameLabels = { date: "Date", time: "Heure", client: "Client", phone: "Téléphone", service: "Service", barber: "Barbier", status: "Statut", payment: "Paiement", notes: "Notes", name: "Nom", username: "Nom d’utilisateur", email: "Email", spent: "Dépensé", appointments: "Rendez-vous", favoriteService: "Service favori", favoriteBarber: "Barbier favori", categoryLabel: "Catégorie", duration: "Durée", price: "Prix", price_type: "Type de prix", description: "Description", bookingsThisMonth: "Réservations ce mois", type: "Type", reason: "Raison", impacted: "Rendez-vous impactés", rating: "Note", text: "Texte", title: "Titre", image: "Image", role: "Rôle", birthDate: "Date de naissance", address: "Adresse", day: "Jour", open: "Ouverture", close: "Fermeture", pause: "Pause", slots: "Créneaux" };
const fieldMap = {
  appointments: ["date", "time", "client", "phone", "service", "barber", "status", "payment", "notes"].map((name) => ({ name, label: nameLabels[name], required: !["notes"].includes(name), type: name === "date" ? "date" : undefined })),
  clients: ["name", "phone", "email", "status", "spent", "appointments", "favoriteService", "favoriteBarber", "notes"].map((name) => ({ name, label: nameLabels[name], type: ["spent", "appointments"].includes(name) ? "number" : undefined })),
  services: ["name", "categoryLabel", "duration", "price", "price_type", "description", "bookingsThisMonth"].map((name) => ({ name, label: nameLabels[name], type: ["duration", "price", "bookingsThisMonth"].includes(name) ? "number" : undefined })),
  hours: ["day", "status", "open", "close", "pause", "slots"].map((name) => ({ name, label: nameLabels[name], type: name === "slots" ? "number" : undefined })),
  closedDays: ["date", "type", "reason", "duration", "impacted", "status"].map((name) => ({ name, label: nameLabels[name], type: name === "date" ? "date" : name === "impacted" ? "number" : undefined })),
  reviews: ["client", "rating", "text", "status", "date"].map((name) => ({ name, label: nameLabels[name], type: name === "rating" ? "number" : name === "date" ? "date" : undefined })),
  gallery: ["title", "category", "image", "date"].map((name) => ({ name, label: nameLabels[name], type: name === "date" ? "date" : undefined })),
};

function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { state, loading } = useAdmin();
  const active = navItems.find(([id]) => location.pathname.includes(`/admin/${id}`)) || ["profile", "Mon Profil"];
  return (
    <div className={`admin-shell ${open ? "nav-open" : ""}`}>
      <aside className="admin-sidebar">
        <NavLink to="/admin/dashboard" className="admin-logo"><img src="/images/logo.webp" alt="ER RAMMACH" /></NavLink>
        <nav>{navItems.map(([id, label, Icon]) => <NavLink key={id} to={`/admin/${id}`} onClick={() => setOpen(false)}><Icon size={20} />{label}</NavLink>)}<NavLink to="/admin/profile" onClick={() => setOpen(false)}><User size={20} />Mon Profil</NavLink></nav>
        <div className="admin-brand-card"><img src="/images/logo.webp" alt="" /><small>Style · Confiance · Excellence</small></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu" aria-label="Ouvrir le menu" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
          <h1>{active[1]}</h1>
          <div className="admin-user"><button aria-label="Notifications"><Bell /><span>{state.appointments.filter((a) => a.status === "En attente").length}</span></button><img src={state.profile.image || "/images/barber-1.webp"} alt="" /><div><strong>{state.profile.name || "Administrateur"}</strong><small>{state.profile.role || "Administrateur"}</small></div><ChevronDown size={18} /></div>
        </header>
        <main className="admin-content">{loading ? <section className="admin-panel loading-admin">Chargement de l’administration…</section> : children}</main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, detail, trend = "+ 12%" }) {
  return <article className="admin-stat"><span className="admin-stat-icon"><Icon /></span><div><p>{title}</p><strong>{value}</strong><small className={trend.startsWith("-") ? "down" : ""}>{trend} vs mois dernier</small>{detail && <em>{detail}</em>}</div><Sparkline /></article>;
}
function Sparkline() { return <svg className="sparkline" viewBox="0 0 110 40" aria-hidden="true"><path d="M2 31 C14 34 17 20 29 22 S47 34 57 16 72 11 80 25 96 11 108 16" /></svg>; }
function Badge({ children }) { return <span className={`admin-badge ${statusClass(children)}`}>{children}</span>; }
function AdminButton({ children, danger = false, outline = false, icon: Icon = Plus, type = "button", onClick }) { return <button type={type} onClick={onClick} className={`admin-button ${outline ? "outline" : ""} ${danger ? "danger" : ""}`}><Icon size={17} />{children}</button>; }
function exportCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}
function useSelection(items) { const [selectedId, setSelectedId] = useState(null); const selected = items.find((item) => item.id === selectedId) || items[0]; useEffect(() => { if (!selectedId && items[0]) setSelectedId(items[0].id); }, [items, selectedId]); return [selected, setSelectedId]; }
function useSearch(items, keys) { const [query, setQuery] = useState(""); const filtered = useMemo(() => items.filter((item) => keys.some((key) => String(item[key] || "").toLowerCase().includes(query.toLowerCase()))), [items, keys, query]); return { query, setQuery, filtered }; }

function Dashboard() {
  const { state, addItem, mutate } = useAdmin();
  const todayItems = state.appointments.filter((a) => a.date === "2024-05-18");
  const revenue = todayItems.filter((a) => a.payment === "Payé").length * 100;
  return <><section className="admin-stats four"><StatCard icon={Calendar} title="RENDEZ-VOUS AUJOURD’HUI" value={todayItems.length} /><StatCard icon={Users} title="CETTE SEMAINE" value={state.appointments.length + 77} trend="+ 18%" /><StatCard icon={Clock} title="CRÉNEAUX DISPONIBLES" value="23" detail="Aujourd’hui" /><StatCard icon={MessageSquare} title="CHIFFRE ESTIMÉ" value={money(revenue)} trend="+ 15%" /></section><section className="admin-dashboard-grid"><CalendarTimeline appointments={todayItems} barbers={state.barbers} /><SlotsPanel /><TodayTable appointments={todayItems} /><WeeklyChart total={state.appointments.length + 77} /><section className="admin-panel quick-actions"><h2>ACTIONS RAPIDES</h2><AdminButton onClick={() => addItem("appointments", { date: "2024-05-18", status: "En attente", payment: "En attente" })}>Ajouter un rendez-vous</AdminButton><AdminButton outline icon={Lock} onClick={() => mutate("closedDays", "POST", { date: "2024-05-18", type: "Blocage", reason: "Créneau bloqué", duration: "30 min", impacted: 0, status: "Actif" })}>Bloquer un créneau</AdminButton><AdminButton outline icon={Scissors} onClick={() => addItem("services", { active: true, price_type: "fixed" })}>Ajouter un service</AdminButton></section></section></>;
}
function CalendarTimeline({ appointments, barbers }) {
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  return <section className="admin-panel timeline-panel"><div className="admin-panel-head"><h2>CALENDRIER - AUJOURD’HUI</h2><button>18 Mai 2024</button></div><div className="timeline"><div className="timeline-hours"><span />{hours.map((hour) => <b key={hour}>{hour}</b>)}</div>{barbers.map((barber) => <div className="timeline-row" key={barber.id}><div className="timeline-barber"><img src={barber.image} alt="" /><strong>{barber.name.split(" ")[0]}</strong><small>{barber.role}</small></div><div className="timeline-grid">{appointments.filter((item) => item.barber.includes(barber.name.split(" ")[0])).map((item) => { const start = Math.max(1, Number(item.time.slice(0, 2)) - 8); return <article key={item.id} style={{ gridColumn: `${start} / span 2` }}><strong>{item.client}</strong><span>{item.service}</span><small>{item.time}</small></article>; })}</div></div>)}</div><Legend items={["Réservé", "Disponible", "Bloqué", "Pause"]} /></section>;
}
function SlotsPanel() { return <section className="admin-panel slots-admin"><h2>DISPONIBILITÉ DES CRÉNEAUX - AUJOURD’HUI</h2><div>{["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"].map((time, index) => <button className={["free", "free", "free", "reserved", "free", "reserved", "blocked", "closed"][index % 8]} key={time}>{time}<span /></button>)}</div><Legend items={["Disponible", "Réservé", "Bloqué", "Fermé"]} /></section>; }
function TodayTable({ appointments }) { const navigate = useNavigate(); return <section className="admin-panel today-panel"><h2>RENDEZ-VOUS D’AUJOURD’HUI</h2><AdminTable heads={["Heure", "Client", "Service", "Barbier", "Statut", "Paiement"]} rows={appointments.slice(0, 5).map((a) => [a.time, a.client, a.service, a.barber, <Badge>{a.status}</Badge>, <Badge>{a.payment}</Badge>])} /><button className="admin-link" onClick={() => navigate("/admin/rendez-vous")}>Voir tous les rendez-vous <ChevronRight size={16} /></button></section>; }
function WeeklyChart({ total = 87 }) { return <section className="admin-panel chart-panel"><div className="admin-panel-head"><h2>RENDEZ-VOUS DE LA SEMAINE</h2><select><option>Cette semaine</option></select></div><strong>{total}</strong><small>+ 18% vs semaine dernière</small><div className="bar-chart">{[12, 15, 18, 16, 21, 32, 28].map((value, index) => <span style={{ height: `${value * 3}px` }} key={index}><b>{value}</b></span>)}</div><div className="chart-days">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => <span key={day}>{day}</span>)}</div></section>; }
function Legend({ items }) { return <div className="admin-legend">{items.map((item) => <span key={item}><i />{item}</span>)}</div>; }

function AppointmentsPage() {
  const { state, addItem, editItem, deleteItem, mutate } = useAdmin();
  const { query, setQuery, filtered } = useSearch(state.appointments, ["client", "phone", "service", "barber", "status"]);
  const [selected, setSelectedId] = useSelection(filtered);
  return <><section className="admin-stats five"><StatCard icon={Calendar} title="AUJOURD’HUI" value={state.appointments.length} /><StatCard icon={Check} title="CONFIRMÉS" value={state.appointments.filter((a) => a.status === "Confirmé").length} /><StatCard icon={Clock} title="EN ATTENTE" value={state.appointments.filter((a) => a.status === "En attente").length} /><StatCard icon={X} title="ANNULÉS" value={state.appointments.filter((a) => a.status === "Annulé").length} trend="- 4%" /><StatCard icon={Star} title="TERMINÉS" value={state.appointments.filter((a) => a.status === "Terminé").length} /></section><Toolbar query={query} setQuery={setQuery} placeholder="Rechercher client ou téléphone..." onAdd={() => addItem("appointments", { date: "2024-05-18", status: "En attente", payment: "En attente" })} onExport={() => exportCsv("rendez-vous.csv", filtered.map(Object.values))} /><section className="admin-split"><section className="admin-panel"><AdminTable heads={["Heure", "Client", "Téléphone", "Service", "Barbier", "Date", "Statut", "Paiement", "Actions"]} rows={filtered.map((a, index) => [a.time, <Avatar name={a.client} index={index} />, a.phone, a.service, <Avatar name={a.barber} index={index + 1} small />, formatDate(a.date), <Badge>{a.status}</Badge>, <Badge>{a.payment}</Badge>, <RowActions onView={() => setSelectedId(a.id)} onEdit={() => editItem("appointments", a)} onDelete={() => deleteItem("appointments", a)} />])} rowIds={filtered.map((a) => a.id)} selectedId={selected?.id} onSelect={setSelectedId} /><TableFooter total={`${filtered.length} rendez-vous`} /></section><DetailCard title="DÉTAIL DU RENDEZ-VOUS SÉLECTIONNÉ" item={selected} rows={selected && [["Service réservé", selected.service], ["Barbier", selected.barber], ["Date et heure", `${formatDate(selected.date)} · ${selected.time}`], ["Statut", selected.status], ["Paiement", selected.payment], ["Notes", selected.notes || "—"]]} actions={<><AdminButton icon={Edit3} onClick={() => editItem("appointments", selected)}>Modifier le rendez-vous</AdminButton><div className="detail-actions"><AdminButton outline icon={Check} onClick={() => mutate("appointments", "PATCH", { status: "Confirmé" }, selected.id)}>Confirmer</AdminButton><AdminButton danger outline icon={X} onClick={() => mutate("appointments", "PATCH", { status: "Annulé", payment: "Remboursé" }, selected.id)}>Annuler</AdminButton></div></>} /></section></>;
}

function ClientsPage() {
  const { state, addItem, editItem, deleteItem } = useAdmin();
  const { query, setQuery, filtered } = useSearch(state.clients, ["name", "phone", "email", "status", "favoriteService"]);
  const [selected, setSelectedId] = useSelection(filtered);
  return <><section className="admin-stats four"><StatCard icon={Users} title="TOTAL CLIENTS" value={state.clients.length} /><StatCard icon={UserPlus} title="NOUVEAUX CE MOIS" value={state.clients.filter((c) => c.status === "Nouveau").length} /><StatCard icon={Star} title="CLIENTS FIDÈLES" value={state.clients.filter((c) => c.status === "VIP").length} /><StatCard icon={RefreshCw} title="TAUX DE RETOUR" value="68%" /></section><Toolbar query={query} setQuery={setQuery} placeholder="Nom, téléphone ou e-mail..." onAdd={() => addItem("clients", { status: "Nouveau", spent: 0, appointments: 0 })} onExport={() => exportCsv("clients.csv", filtered.map(Object.values))} /><section className="admin-split"><section className="admin-panel"><AdminTable heads={["Client", "Téléphone", "E-mail", "Dernière visite", "RDV", "Service favori", "Barbier favori", "Statut", "Dépensé", "Actions"]} rows={filtered.map((c, index) => [<Avatar name={c.name} index={index} />, c.phone, c.email, formatDate(c.lastVisit), c.appointments, c.favoriteService, c.favoriteBarber, <Badge>{c.status}</Badge>, money(c.spent), <RowActions onView={() => setSelectedId(c.id)} onEdit={() => editItem("clients", c)} onDelete={() => deleteItem("clients", c)} />])} rowIds={filtered.map((c) => c.id)} selectedId={selected?.id} onSelect={setSelectedId} /><TableFooter total={`${filtered.length} clients`} /></section><DetailCard title="DÉTAIL DU CLIENT SÉLECTIONNÉ" item={selected} rows={selected && [["Date d’inscription", "12 Décembre 2023"], ["Dernière visite", formatDate(selected.lastVisit)], ["Service favori", selected.favoriteService], ["Barbier favori", selected.favoriteBarber], ["Nombre de rendez-vous", selected.appointments], ["Total dépensé", money(selected.spent)], ["Notes", selected.notes || "—"]]} actions={<><AdminButton icon={Edit3} onClick={() => editItem("clients", selected)}>Modifier le client</AdminButton><AdminButton outline icon={Phone} onClick={() => window.location.href = `tel:${selected.phone}`}>Appeler</AdminButton><button className="whatsapp-admin" onClick={() => window.open(`https://wa.me/${selected.phone.replace(/\D/g, "")}`, "_blank")}>WhatsApp</button></>} /></section></>;
}

function ServicesPage() {
  const { state, addItem, editItem, deleteItem, mutate } = useAdmin();
  const { query, setQuery, filtered } = useSearch(state.services, ["name", "categoryLabel", "description"]);
  const [selected, setSelectedId] = useSelection(filtered);
  return <><section className="admin-stats four"><StatCard icon={Scissors} title="TOTAL SERVICES" value={state.services.length} /><StatCard icon={Check} title="SERVICES ACTIFS" value={state.services.filter((s) => s.active).length} /><StatCard icon={Star} title="SERVICE LE PLUS RÉSERVÉ" value={(state.services.slice().sort((a,b)=>(b.bookingsThisMonth||0)-(a.bookingsThisMonth||0))[0] || {}).name || "—"} /><StatCard icon={Clock} title="DURÉE MOYENNE" value={`${Math.round(state.services.reduce((sum, s) => sum + Number(s.duration || 0), 0) / Math.max(1, state.services.length))} min`} /></section><Toolbar query={query} setQuery={setQuery} placeholder="Rechercher un service" onAdd={() => addItem("services", { active: true, price_type: "fixed", categoryLabel: serviceCategories[0]?.label })} onExport={() => exportCsv("services.csv", filtered.map(Object.values))} /><section className="admin-split"><section className="admin-panel"><AdminTable heads={["Service", "Catégorie", "Durée", "Prix", "Réservations ce mois", "Statut", "Dernière modification", "Actions"]} rows={filtered.map((s, index) => [<Avatar name={s.name} index={index} service />, s.categoryLabel || s.category, `${s.duration} min`, servicePrice(s), s.bookingsThisMonth || 0, <Badge>{s.active ? "Actif" : "Inactif"}</Badge>, formatDate(s.updatedAt), <RowActions onView={() => setSelectedId(s.id)} onEdit={() => editItem("services", s)} onDelete={() => deleteItem("services", s)} />])} rowIds={filtered.map((s) => s.id)} selectedId={selected?.id} onSelect={setSelectedId} /><TableFooter total={`${filtered.length} services`} /></section><aside className="admin-panel detail-card service-detail"><h2>DÉTAIL DU SERVICE SÉLECTIONNÉ</h2>{selected && <><img src={selected.image || "/images/service-1.webp"} alt="" /><h3>{selected.name}</h3><DetailList rows={[["Prix", servicePrice(selected)], ["Durée", `${selected.duration} min`], ["Catégorie", selected.categoryLabel || selected.category], ["Réservations ce mois", selected.bookingsThisMonth || 0], ["Popularité", "★★★★★ (4.8)"]]} /><h2>DESCRIPTION</h2><p>{selected.description}</p><AdminButton icon={Edit3} onClick={() => editItem("services", selected)}>Modifier le service</AdminButton><AdminButton outline icon={X} onClick={() => mutate("services", "PATCH", { active: !selected.active }, selected.id)}>{selected.active ? "Désactiver" : "Activer"}</AdminButton></>}</aside></section></>;
}

function HoursPage() {
  const { state, editItem, mutate } = useAdmin();
  const [selected, setSelectedId] = useSelection(state.hours);
  return <><section className="admin-stats four"><StatCard icon={Clock} title="HEURES CETTE SEMAINE" value="66h 30" /><StatCard icon={Calendar} title="JOURS OUVERTS" value={state.hours.filter((h) => h.status === "Ouvert").length} /><StatCard icon={MessageSquare} title="PAUSES CONFIGURÉES" value={state.hours.filter((h) => h.pause).length} /><StatCard icon={Shield} title="EXCEPTIONS CE MOIS" value={state.closedDays.length} trend="- 1%" /></section><Toolbar placeholder="Rechercher un jour" onAdd={() => editItem("hours", selected)} onExport={() => exportCsv("horaires.csv", state.hours.map(Object.values))} /><section className="admin-split"><section className="admin-panel"><h2>HORAIRES HEBDOMADAIRES</h2><AdminTable heads={["Jour", "Statut", "Ouverture", "Fermeture", "Pause", "Créneaux générés", "Dernière modification", "Actions"]} rows={state.hours.map((h) => [h.day, <Badge>{h.status}</Badge>, h.open || "—", h.close || "—", h.pause || "—", h.slots, formatDate(h.updatedAt), <RowActions onView={() => setSelectedId(h.id)} onEdit={() => editItem("hours", h)} />])} rowIds={state.hours.map((h) => h.id)} selectedId={selected?.id} onSelect={setSelectedId} /><TableFooter total="7 jours" /></section><DetailCard title="DÉTAIL DU JOUR SÉLECTIONNÉ" item={selected} rows={selected && [["Ouverture", selected.open || "—"], ["Fermeture", selected.close || "—"], ["Pause", selected.pause || "—"], ["Créneaux", selected.slots], ["Statut", selected.status]]} actions={<><AdminButton icon={Edit3} onClick={() => editItem("hours", selected)}>Modifier les horaires</AdminButton><AdminButton outline icon={Lock} onClick={() => mutate("hours", "PATCH", { status: selected.status === "Ouvert" ? "Fermé" : "Ouvert" }, selected.id)}>{selected?.status === "Ouvert" ? "Fermer ce jour" : "Ouvrir ce jour"}</AdminButton></>} /></section><section className="admin-bottom-grid"><Donut title="RÉPARTITION DES HEURES" center="66h 30" /><WeeklyChart /><SlotsPanel /></section></>;
}

function ClosedDaysPage() {
  const { state, addItem, editItem, deleteItem, mutate } = useAdmin();
  const { query, setQuery, filtered } = useSearch(state.closedDays, ["date", "type", "reason", "status"]);
  const [selected, setSelectedId] = useSelection(filtered);
  return <><section className="admin-stats four"><StatCard icon={Calendar} title="JOURS FERMÉS CE MOIS" value={state.closedDays.length} trend="- 17%" /><StatCard icon={Shield} title="EXCEPTIONS PLANIFIÉES" value={state.closedDays.filter((d) => d.status === "Planifié").length} /><StatCard icon={RefreshCw} title="JOURS RÉCURRENTS FERMÉS" value="1" /><StatCard icon={Users} title="RENDEZ-VOUS IMPACTÉS" value={state.closedDays.reduce((sum, d) => sum + Number(d.impacted || 0), 0)} trend="- 9%" /></section><Toolbar query={query} setQuery={setQuery} placeholder="Rechercher une date ou une raison" onAdd={() => addItem("closedDays", { status: "Planifié", duration: "Toute la journée" })} onExport={() => exportCsv("jours-fermes.csv", filtered.map(Object.values))} /><section className="admin-split"><section className="admin-panel"><h2>LISTE DES JOURS FERMÉS</h2><AdminTable heads={["Date", "Type", "Raison", "Durée", "Impact", "Statut", "Dernière modification", "Actions"]} rows={filtered.map((d) => [formatDate(d.date), <Badge>{d.type}</Badge>, d.reason, d.duration, d.impacted, <Badge>{d.status}</Badge>, formatDate(d.updatedAt), <RowActions onView={() => setSelectedId(d.id)} onEdit={() => editItem("closedDays", d)} onDelete={() => deleteItem("closedDays", d)} />])} rowIds={filtered.map((d) => d.id)} selectedId={selected?.id} onSelect={setSelectedId} /><TableFooter total={`${filtered.length} jours`} /></section><DetailCard title="DÉTAIL DU JOUR FERMÉ SÉLECTIONNÉ" item={selected} rows={selected && [["Date", formatDate(selected.date)], ["Type", selected.type], ["Raison", selected.reason], ["Heure / Durée", selected.duration], ["Impact", `${selected.impacted} rendez-vous impactés`], ["Notification clients", "Prête à envoyer"]]} actions={<><AdminButton icon={Edit3} onClick={() => editItem("closedDays", selected)}>Modifier la fermeture</AdminButton><AdminButton outline icon={Mail} onClick={() => mutate("closedDays", "PATCH", { notifiedAt: new Date().toISOString() }, selected.id)}>Notifier les clients</AdminButton><AdminButton danger outline icon={Trash2} onClick={() => deleteItem("closedDays", selected)}>Supprimer</AdminButton></>} /></section></>;
}

function CalendarPage() { const { state } = useAdmin(); return <><section className="admin-stats four"><StatCard icon={Calendar} title="AUJOURD’HUI" value={state.appointments.length} /><StatCard icon={Users} title="CETTE SEMAINE" value={state.appointments.length + 77} /><StatCard icon={Check} title="CRÉNEAUX RÉSERVÉS" value={state.appointments.length * 12} /><StatCard icon={Clock} title="CRÉNEAUX DISPONIBLES" value="128" /></section><section className="calendar-admin-grid"><MonthCalendar appointments={state.appointments} /><DayAppointments appointments={state.appointments} /></section></>; }
function MonthCalendar({ appointments }) { const days = Array.from({ length: 35 }, (_, i) => i + 1); return <section className="admin-panel month-panel"><div className="admin-panel-head"><div><button><ChevronLeft size={17} /></button><button><ChevronRight size={17} /></button></div><h2>Mai 2024</h2><div className="segmented"><button>Jour</button><button>Semaine</button><button className="active">Mois</button></div></div><div className="month-grid">{["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"].map((d) => <b key={d}>{d}</b>)}{days.map((day) => { const count = appointments.filter((a) => Number(a.date?.slice(-2)) === day).length; return <article className={day === 18 ? "selected" : day % 7 === 5 ? "blocked" : ""} key={day}><strong>{day <= 31 ? day : day - 31}</strong>{count > 0 && <small><i /> {count}</small>}{count > 0 && <span>{appointments.find((a) => Number(a.date?.slice(-2)) === day)?.time} RDV</span>}{day % 7 === 5 && <em>Fermé</em>}</article>; })}</div><Legend items={["Confirmé / Disponible", "En attente", "Annulé / Bloqué", "Fermé / Passé"]} /></section>; }
function DayAppointments({ appointments }) { return <aside className="admin-panel day-panel"><h2>RENDEZ-VOUS DU 18 MAI 2024</h2>{appointments.slice(0, 4).map((a, i) => <article key={a.id}><b>{a.time}</b><Avatar name={a.client} index={i} /><span>{a.service}<small>{a.barber}</small></span><Badge>{a.status}</Badge><MoreVertical size={18} /></article>)}<div className="mini-stats"><span>Rendez-vous <b>{appointments.length}</b></span><span>Confirmés <b>{appointments.filter((a) => a.status === "Confirmé").length}</b></span><span>En attente <b>{appointments.filter((a) => a.status === "En attente").length}</b></span><span>Annulés <b>{appointments.filter((a) => a.status === "Annulé").length}</b></span></div><QuickList /></aside>; }

function GalleryPage() { const { state, addItem, editItem, deleteItem } = useAdmin(); const [category, setCategory] = useState("Toutes"); const categories = ["Toutes", "Coupes", "Barbe", "Avant / Après", "Salon", "Équipe"]; const items = state.gallery.filter((g) => category === "Toutes" || g.category === category); return <><section className="admin-page-head"><div><Image /><span><h2>Galerie</h2><p>Gérez les photos de votre galerie</p></span></div><div><AdminButton outline icon={Filter}>Trier</AdminButton><AdminButton onClick={() => addItem("gallery", { category: "Coupes", image: "/images/gallery-1.webp" })}>Ajouter des photos</AdminButton></div></section><div className="gallery-tabs">{categories.map((item) => <button className={item === category ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><section className="admin-gallery-grid">{items.map((item) => <article className="admin-gallery-card" key={item.id}><img src={item.image} alt="" /><span>{item.category}</span><footer><time>{formatDate(item.date)}</time><div><button onClick={() => editItem("gallery", item)}><Edit3 size={15} /></button><button onClick={() => deleteItem("gallery", item)}><Trash2 size={15} /></button></div></footer></article>)}</section><Pagination /></>; }
function ReviewsPage() { const { state, addItem, editItem, deleteItem, mutate } = useAdmin(); return <><section className="admin-page-head"><div><span><h2>Témoignages</h2><p>Découvrez ce que nos clients disent de nous.</p></span></div><AdminButton onClick={() => addItem("reviews", { status: "En attente", rating: 5, date: new Date().toISOString().slice(0, 10) })}>Ajouter un témoignage</AdminButton></section><section className="admin-stats four"><StatCard icon={MessageSquare} title="TOTAL TÉMOIGNAGES" value={state.reviews.length} /><StatCard icon={Star} title="NOTE MOYENNE" value={`${(state.reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / Math.max(1, state.reviews.length)).toFixed(1)} / 5`} /><StatCard icon={Check} title="APPROUVÉS" value={state.reviews.filter((r) => r.status === "Approuvé").length} /><StatCard icon={Eye} title="EN ATTENTE" value={state.reviews.filter((r) => r.status === "En attente").length} /></section><section className="review-grid-admin">{state.reviews.map((review, index) => <article className="admin-panel review-admin-card" key={review.id}><header><Avatar name={review.client} index={index} /><Badge>{review.status}</Badge></header><div className="stars">{"★".repeat(Number(review.rating || 0))}{"☆".repeat(5 - Number(review.rating || 0))} <small>{formatDate(review.date)}</small></div><p>{review.text}</p><div className="review-actions"><button onClick={() => mutate("reviews", "PATCH", { status: review.status === "Approuvé" ? "En attente" : "Approuvé" }, review.id)}><Check size={15} /></button><button onClick={() => editItem("reviews", review)}><Edit3 size={15} /></button><button onClick={() => deleteItem("reviews", review)}><Trash2 size={15} /></button></div><b>”</b></article>)}</section><Pagination /></>; }

function SettingsPage() { const { state, patchSettings } = useAdmin(); const [business, setBusiness] = useState(state.business); const [notifications, setNotifications] = useState(state.notifications); useEffect(() => { setBusiness(state.business); setNotifications(state.notifications); }, [state.business, state.notifications]); return <><section className="admin-page-head"><div><Settings /><span><h2>Paramètres</h2><p>Gérez les paramètres généraux de votre établissement.</p></span></div><AdminButton icon={Check} onClick={async () => { await patchSettings("business", business); await patchSettings("notifications", notifications); }}>Enregistrer les modifications</AdminButton></section><section className="settings-grid"><PanelTitle title="Profil de l’entreprise" subtitle="Informations générales de votre établissement."><div className="company-profile"><img src="/images/logo.webp" alt="" /><div className="settings-form"><Input label="Nom de l’établissement" value={business.name} onChange={(name) => setBusiness((p) => ({ ...p, name }))} /><Input label="Téléphone" value={business.phone} onChange={(phone) => setBusiness((p) => ({ ...p, phone }))} /><Input label="Email" value={business.email} onChange={(email) => setBusiness((p) => ({ ...p, email }))} /><Input label="Adresse" value={business.address} onChange={(address) => setBusiness((p) => ({ ...p, address }))} /></div></div></PanelTitle><PanelTitle title="Préférences générales" subtitle="Configurez les préférences générales de l’application."><SettingsRows rows={[["Langue", business.language], ["Fuseau horaire", business.timezone], ["Devise", business.currency], ["Première heure de la journée", business.dayStart]]} /></PanelTitle><PanelTitle title="Notifications" subtitle="Gérez vos préférences de notifications."><ToggleRows values={notifications} setValues={setNotifications} /></PanelTitle><PanelTitle title="Sécurité" subtitle="Gérez vos paramètres de sécurité et de compte."><SettingsRows rows={[["Mot de passe", "Modifier"], ["Authentification à deux facteurs", "Configurer"], ["Sessions actives", "Voir"]]} button /></PanelTitle><PanelTitle title="Sauvegarde et données" subtitle="Gérez vos données et sauvegardes."><SettingsRows rows={[["Sauvegarde automatique", "Sauvegarder"], ["Exporter les données", "Exporter"], ["Supprimer le cache", "Vider"]]} button /></PanelTitle><PanelTitle title="Personnalisation" subtitle="Personnalisez l’apparence de votre espace de travail."><div className="swatches">{["#d8a33b", "#d84a4a", "#8f4fd4", "#3f6bd6", "#3ea45a", "#22b8bd"].map((color) => <button style={{ background: color }} key={color} />)}</div></PanelTitle></section></>; }
function ProfilePage() { const { state, patchSettings } = useAdmin(); const [profile, setProfile] = useState(state.profile); useEffect(() => setProfile(state.profile), [state.profile]); return <><section className="admin-page-title"><h2>Mon Profil</h2><p><NavLink to="/admin/dashboard">Dashboard</NavLink> <ChevronRight size={14} /> Mon Profil</p></section><section className="profile-grid"><aside className="admin-panel profile-card"><img src={profile.image || "/images/barber-1.webp"} alt="" /><button><Camera size={16} /></button><h2>{profile.name}</h2><strong>{profile.role}</strong><DetailList rows={[["Email", profile.email], ["Téléphone", profile.phone], ["Date", formatDate(profile.birthDate)], ["Adresse", profile.address], ["Rôle", profile.role]]} /><AdminButton outline icon={Edit3} onClick={() => patchSettings("profile", profile)}>Enregistrer le profil</AdminButton></aside><PanelTitle title="Informations personnelles"><div className="settings-form two">{["name", "username", "email", "role", "phone", "birthDate", "address"].map((key) => <Input key={key} label={nameLabels[key] || key} value={profile[key]} type={key === "birthDate" ? "date" : "text"} onChange={(value) => setProfile((p) => ({ ...p, [key]: value }))} />)}</div></PanelTitle><PanelTitle title="Changer le mot de passe"><div className="settings-form"><label>Mot de passe actuel<input placeholder="Entrez votre mot de passe actuel" type="password" /></label><label>Nouveau mot de passe<input placeholder="Entrez votre nouveau mot de passe" type="password" /></label><label>Confirmer le nouveau mot de passe<input placeholder="Confirmez votre nouveau mot de passe" type="password" /></label></div><AdminButton icon={Lock} onClick={() => alert("Mot de passe validé côté interface. À connecter au provider auth en production.")}>Mettre à jour le mot de passe</AdminButton></PanelTitle><PanelTitle title="Sessions actives" subtitle="Gérez vos sessions actives sur les autres appareils."><div className="session-row"><span><Grid2X2 /> MacBook Pro · macOS<small>Casablanca, Maroc · session actuelle</small></span><Badge>Session actuelle</Badge></div><AdminButton danger outline icon={LogOut}>Se déconnecter</AdminButton></PanelTitle></section></>; }

function Toolbar({ query = "", setQuery = () => {}, placeholder, onAdd, onExport }) { return <section className="admin-panel admin-filters"><label><Search size={17} /><input placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} /></label><select><option>Tous les statuts</option></select><select><option>Tous les barbiers</option></select><select><option>Tous les services</option></select><AdminButton outline icon={RefreshCw} onClick={() => setQuery("")}>Réinitialiser</AdminButton>{onAdd && <AdminButton onClick={onAdd}>Ajouter</AdminButton>}{onExport && <AdminButton outline icon={Download} onClick={onExport}>Exporter CSV</AdminButton>}</section>; }
function AdminTable({ heads, rows, rowIds = [], selectedId, onSelect }) { return <div className="admin-table"><table><thead><tr>{heads.map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr className={rowIds[index] === selectedId ? "selected" : ""} key={rowIds[index] || index} onClick={() => onSelect?.(rowIds[index])}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>; }
function RowActions({ onView, onEdit, onDelete }) { return <span className="row-actions" onClick={(event) => event.stopPropagation()}><button onClick={onView}><Eye size={15} /></button><button onClick={onEdit}><Edit3 size={15} /></button>{onDelete ? <button onClick={onDelete}><Trash2 size={15} /></button> : <button><MoreVertical size={15} /></button>}</span>; }
function DetailCard({ title, item, rows, actions }) { return <aside className="admin-panel detail-card"><h2>{title}</h2>{item ? <><div className="detail-client"><img src={item.image || "/images/barber-1.webp"} alt="" /><div><strong>{item.name || item.client || item.reason}</strong>{item.status && <Badge>{item.status}</Badge>}{item.phone && <small><Phone size={14} /> {item.phone}</small>}{item.email && <small><Mail size={14} /> {item.email}</small>}</div></div><DetailList rows={rows || []} />{actions}</> : <p>Aucun élément sélectionné.</p>}</aside>; }
function Avatar({ name, index = 0, small = false, service = false }) { return <span className={`avatar-name ${small ? "small" : ""}`}><img src={service ? `/images/service-${(index % 11) + 1}.webp` : `/images/barber-${(index % 3) + 1}.webp`} alt="" />{name}</span>; }
function TableFooter({ total }) { return <footer className="table-footer"><span>Affichage de {total}</span><Pagination small /><label>Lignes par page<select><option>12</option><option>25</option></select></label></footer>; }
function Pagination({ small = false }) { return <div className={`admin-pagination ${small ? "small" : ""}`}><button><ChevronLeft size={16} /></button><button className="active">1</button><button>2</button><button>3</button>{!small && <button>4</button>}<button><ChevronRight size={16} /></button></div>; }
function DetailList({ rows }) { return <dl className="detail-list">{rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>; }
function PanelTitle({ title, subtitle, children }) { return <section className="admin-panel settings-panel"><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}{children}</section>; }
function Input({ label, value = "", onChange, type = "text" }) { return <label>{label}<input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} /></label>; }
function SettingsRows({ rows, button = false }) { return <div className="settings-rows">{rows.map(([row, value]) => <div key={row}><span><Settings size={18} /> {row}</span>{button ? <button>{value}</button> : <select value={value || ""} onChange={() => {}}><option>{value}</option></select>}</div>)}</div>; }
function ToggleRows({ values, setValues }) { const rows = [["newAppointments", "Nouveaux rendez-vous"], ["reminders", "Rappels de rendez-vous"], ["cancellations", "Annulations"], ["promotions", "Promotions et offres"]]; return <div className="toggle-rows">{rows.map(([key, label]) => <label key={key}><span>{label}<small>Recevoir des notifications pour {label.toLowerCase()}</small></span><input type="checkbox" checked={Boolean(values[key])} onChange={(event) => setValues((prev) => ({ ...prev, [key]: event.target.checked }))} /></label>)}</div>; }
function QuickList() { return <div className="quick-list"><h2>ACTIONS RAPIDES</h2>{["Ajouter un rendez-vous pour le 18 mai", "Copier les rendez-vous de cette journée", "Bloquer cette date", "Exporter la journée (CSV)"].map((item) => <button key={item}><Plus size={15} /> {item}</button>)}</div>; }
function Donut({ title, center }) { return <section className="admin-panel donut-panel"><h2>{title}</h2><div className="donut"><span>{center}</span></div></section>; }

export default function Admin() {
  return <AdminProvider><AdminLayout><Routes><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<Dashboard />} /><Route path="rendez-vous" element={<AppointmentsPage />} /><Route path="calendrier" element={<CalendarPage />} /><Route path="clients" element={<ClientsPage />} /><Route path="services" element={<ServicesPage />} /><Route path="horaires" element={<HoursPage />} /><Route path="jours-fermes" element={<ClosedDaysPage />} /><Route path="galerie" element={<GalleryPage />} /><Route path="temoignages" element={<ReviewsPage />} /><Route path="parametres" element={<SettingsPage />} /><Route path="profile" element={<ProfilePage />} /><Route path="*" element={<Navigate to="dashboard" replace />} /></Routes></AdminLayout></AdminProvider>;
}
