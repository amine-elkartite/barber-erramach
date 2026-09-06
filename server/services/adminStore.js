import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { services as catalogServices, serviceCategories } from "../../shared/catalog.js";
import { business } from "../../shared/business.js";

const storePath = fileURLToPath(new URL("../data/admin-state.json", import.meta.url));

const today = "2024-05-18";
const now = () => new Date().toISOString();
const slug = (value) => String(value || "item").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const defaultBarbers = [
  { id: "barber-1", name: "Mohamed Er rammach", role: "Barbier Senior", phone: "+212 6 12 34 56 78", email: "mohamed.errammach@gmail.com", image: "/images/barber-1.webp", active: true },
  { id: "barber-2", name: "Youssef", role: "Barbier", phone: "+212 6 98 76 54 32", email: "youssef@errammach.ma", image: "/images/barber-2.webp", active: true },
  { id: "barber-3", name: "Amine", role: "Barbier", phone: "+212 6 21 45 78 90", email: "amine@errammach.ma", image: "/images/barber-3.webp", active: true },
  { id: "barber-4", name: "Karim", role: "Barbier", phone: "+212 6 77 88 99 00", email: "karim@errammach.ma", image: "/images/barber-1.webp", active: true },
];

const defaultClients = [
  ["Karim Benali", "06 12 34 56 78", "karim.benali@gmail.com", "VIP", 1850, "Coupe + Barbe", "Mohamed Er rammach"],
  ["Reda Hammouch", "06 98 76 54 32", "reda.hammouch@gmail.com", "Actif", 1230, "Entretien barbe", "Youssef"],
  ["Ilyass Bouzid", "06 21 45 78 90", "ilyass.bouzid@gmail.com", "Actif", 1050, "Soin du visage", "Amine"],
  ["Yassine El Amrani", "06 56 78 12 34", "yassine.amrani@gmail.com", "VIP", 2300, "Coupe + Barbe", "Mohamed Er rammach"],
  ["Omar Bouzidi", "06 11 22 33 44", "omar.bouzidi@gmail.com", "Actif", 980, "Coupe moderne", "Youssef"],
  ["Hanna Kabbaji", "06 33 44 55 66", "hanna.kabbaji@gmail.com", "Actif", 870, "Coupe + soin", "Amine"],
  ["Rachid Alaoui", "06 77 88 99 00", "rachid.alaoui@gmail.com", "Nouveau", 560, "Entretien barbe", "Karim"],
  ["Sofiane Rajae", "06 55 66 77 88", "sofiane.rajae@gmail.com", "Actif", 760, "Coupe + Barbe", "Mohamed Er rammach"],
  ["Zakaria Chafaq", "06 44 55 66 77", "zakaria.chafaq@gmail.com", "Nouveau", 450, "Soin du visage", "Amine"],
  ["Amine El Idrissi", "06 66 77 88 99", "amine.idrissi@gmail.com", "Actif", 690, "Coupe moderne", "Youssef"],
  ["Mehdi Tahiri", "06 99 11 22 33", "mehdi.tahiri@gmail.com", "Actif", 400, "Coupe moderne", "Mohamed Er rammach"],
  ["Youssef Alaoui", "06 88 99 00 11", "youssef.alaoui@gmail.com", "Nouveau", 320, "Entretien barbe", "Karim"],
].map(([name, phone, email, status, spent, favoriteService, favoriteBarber], index) => ({
  id: `client-${index + 1}`,
  name,
  phone,
  email,
  status,
  spent,
  appointments: Math.max(2, 12 - index),
  favoriteService,
  favoriteBarber,
  lastVisit: `2024-05-${String(Math.max(1, 17 - index)).padStart(2, "0")}`,
  notes: "Client régulier, préfère un service précis et ponctuel.",
}));

const appointmentSeed = [
  ["09:30", "Karim Benali", "Dégradé cheveux", "Mohamed Er rammach", "Confirmé", "Payé"],
  ["10:00", "Reda Hammouch", "Dégradé barbe", "Youssef", "Confirmé", "Payé"],
  ["10:30", "Ilyass Bouzid", "Nettoyage du visage à la vapeur", "Amine", "Confirmé", "Payé"],
  ["11:00", "Yassine El Amrani", "Coupe cheveux", "Mohamed Er rammach", "Confirmé", "Payé"],
  ["11:30", "Omar Bouzidi", "Dégradé cheveux", "Youssef", "Annulé", "Remboursé"],
  ["12:00", "Hanna Kabbaji", "Hydratation (Dark)", "Amine", "Confirmé", "Payé"],
  ["12:30", "Rachid Alaoui", "Contours cheveux + barbe", "Karim", "En attente", "En attente"],
  ["14:00", "Sofiane Rajae", "Coupe cheveux", "Mohamed Er rammach", "Confirmé", "Payé"],
  ["15:00", "Zakaria Chafaq", "Masque noir", "Amine", "Terminé", "Payé"],
  ["16:00", "Amine El Idrissi", "Dégradé enfant", "Youssef", "Terminé", "Payé"],
].map(([time, client, service, barber, status, payment], index) => ({
  id: `appointment-${index + 1}`,
  date: today,
  time,
  client,
  phone: defaultClients[index]?.phone || "06 00 00 00 00",
  service,
  barber,
  status,
  payment,
  notes: index === 0 ? "Client préfère une coupe dégradée basse." : "",
  createdAt: now(),
}));

const defaultHours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((day, index) => ({
  id: `hours-${index + 1}`,
  day,
  status: index === 6 ? "Fermé" : "Ouvert",
  open: index === 6 ? "" : "09:00",
  close: index === 5 ? "21:00" : index === 6 ? "" : "20:00",
  pause: index === 6 ? "" : "13:00 - 14:00",
  slots: index === 6 ? 0 : index === 5 ? 24 : 20,
  updatedAt: now(),
}));

const defaultClosedDays = [
  ["2024-06-16", "Férié", "Aïd al-Adha", "Toute la journée", 18, "Actif"],
  ["2024-07-14", "Férié", "Fête Nationale", "Toute la journée", 15, "Planifié"],
  ["2024-08-15", "Férié", "Assomption", "Toute la journée", 12, "Planifié"],
  ["2024-09-01", "Maintenance", "Maintenance du salon", "Toute la journée", 9, "Planifié"],
  ["2024-09-10", "Formation", "Formation équipe", "09:00 - 17:00", 6, "Planifié"],
].map(([date, type, reason, duration, impacted, status], index) => ({ id: `closed-${index + 1}`, date, type, reason, duration, impacted, status, updatedAt: now() }));

const defaultReviews = [
  ["Yassine El Amrani", 5, "Meilleur coiffeur de la ville ! Service professionnel, équipe accueillante et résultats toujours au top.", "Approuvé"],
  ["Adil Benjelloun", 5, "Ambiance exceptionnelle et service irréprochable. Chaque visite est une expérience unique.", "Approuvé"],
  ["Omar Tazi", 5, "Très satisfait de la coupe et de la barbe. Le souci du détail fait toute la différence.", "Approuvé"],
  ["Hamza Lahlou", 4, "Bon service dans l’ensemble, mais j’ai eu un léger retard sur mon rendez-vous.", "En attente"],
].map(([client, rating, text, status], index) => ({ id: `review-${index + 1}`, client, rating, text, status, date: `2024-05-${String(15 - index).padStart(2, "0")}` }));

const defaultGallery = Array.from({ length: 12 }, (_, index) => ({
  id: `gallery-${index + 1}`,
  title: ["Coupe moderne", "Avant / Après", "Barbe", "Salon", "Équipe"][index % 5],
  category: ["Coupes", "Avant / Après", "Barbe", "Salon", "Équipe"][index % 5],
  image: `/images/gallery-${(index % 9) + 1}.webp`,
  date: `2024-05-${String(Math.max(1, 16 - index)).padStart(2, "0")}`,
  active: true,
}));

function createDefaultState() {
  return {
    version: 1,
    updatedAt: now(),
    business: {
      name: "ER RAMMACH Mohamed Barber Shop",
      phone: business.internationalPhone || "+212 6 12 34 56 78",
      email: "contact@errammach.ma",
      address: "Meknès, Maroc",
      instagram: "https://www.instagram.com/mohamed_errammach/",
      language: "Français",
      timezone: "(GMT+01:00) Casablanca",
      currency: "MAD (DHS)",
      dayStart: "08:00",
    },
    profile: {
      name: "Mohamed Er rammach",
      username: "er_rammach",
      email: "mohamed.errammach@gmail.com",
      phone: "+212 6 12 34 56 78",
      role: "Administrateur",
      birthDate: "1995-05-15",
      address: "Casablanca, Maroc",
      image: "/images/barber-1.webp",
    },
    notifications: {
      newAppointments: true,
      reminders: true,
      cancellations: true,
      promotions: false,
    },
    barbers: defaultBarbers,
    clients: defaultClients,
    appointments: appointmentSeed,
    services: catalogServices.map((service, index) => ({
      ...service,
      id: `service-${service.id}`,
      sourceId: service.id,
      categoryLabel: serviceCategories.find((item) => item.id === service.category)?.label || service.category,
      active: true,
      bookingsThisMonth: [24, 18, 14, 9, 11, 28, 16, 7, 19, 32, 21, 13, 8, 6, 5, 12][index] || 0,
      updatedAt: now(),
    })),
    hours: defaultHours,
    closedDays: defaultClosedDays,
    reviews: defaultReviews,
    gallery: defaultGallery,
  };
}

async function ensureStore() {
  if (existsSync(storePath)) return;
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(createDefaultState(), null, 2)}\n`);
}

export async function readAdminState() {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  return JSON.parse(raw);
}

export async function writeAdminState(state) {
  const next = { ...state, updatedAt: now() };
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

export function makeId(collection, value) {
  return `${collection}-${slug(value?.name || value?.title || value?.client || value?.reason || Date.now())}-${Date.now().toString(36)}`;
}

export const editableCollections = new Set(["appointments", "clients", "services", "hours", "closedDays", "reviews", "gallery", "business", "profile", "notifications"]);
