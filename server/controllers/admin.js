import { pool } from "../config/database.js";
import {
  authenticateAdmin,
  revokeSession,
  revokeAllSessionsForAdmin,
  hashPassword,
  verifyPassword,
} from "../services/auth.js";
import { bookAppointment } from "./appointments.js";
import { validDate, toMinutes } from "../../shared/schedule.js";

const fail = (status, message) => Object.assign(new Error(message), { status });

function parseSettings(body) {
  const parsed = {};
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    parsed[key] = typeof value === "string" ? value : JSON.stringify(value);
  }
  return parsed;
}

const settingsColumns = (rows) =>
  rows.reduce((acc, r) => {
    const v = r.setting_value;
    try {
      acc[r.setting_key] = v.startsWith("[") || v.startsWith("{")
        ? JSON.parse(v)
        : v;
    } catch {
      acc[r.setting_key] = v;
    }
    return acc;
  }, {});

export async function adminLogin(email, password) {
  const { token, expiresAt, admin } = await authenticateAdmin(email, password);
  const { password_hash, ...safe } = admin;
  return { token, expiresAt, admin: safe };
}

export async function adminLogout(token) {
  if (token) await revokeSession(token);
}

export async function adminProfile(adminRow) {
  const safe = {
    id: adminRow.id,
    name: adminRow.name,
    email: adminRow.email,
    phone: adminRow.phone,
    avatar: adminRow.avatar,
    role: adminRow.role,
    created_at: adminRow.created_at,
    updated_at: adminRow.updated_at,
  };
  return safe;
}

export async function adminStats() {
  const count = async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows[0].c;
  };
  const [services, barbers, gallery, reviews, appointments, pending, today, month, revenue, messages, unread, pendingReviews, customers] =
    await Promise.all([
      count("SELECT COUNT(*) c FROM services"),
      count("SELECT COUNT(*) c FROM barbers"),
      count("SELECT COUNT(*) c FROM gallery"),
      count("SELECT COUNT(*) c FROM reviews"),
      count("SELECT COUNT(*) c FROM appointments"),
      count("SELECT COUNT(*) c FROM appointments WHERE status='pending'"),
      count(
        "SELECT COUNT(*) c FROM appointments WHERE appointment_date=CURDATE() AND status IN ('pending','confirmed')",
      ),
      count(
        "SELECT COUNT(*) c FROM appointments WHERE YEAR(appointment_date)=YEAR(CURDATE()) AND MONTH(appointment_date)=MONTH(CURDATE())",
      ),
      (async () => {
        const [rows] = await pool.query(
          "SELECT COALESCE(SUM(total_price),0) total FROM appointments WHERE status IN ('confirmed','completed')",
        );
        return Number(rows[0].total);
      })(),
      count("SELECT COUNT(*) c FROM contacts"),
      count("SELECT COUNT(*) c FROM contacts WHERE is_read=0"),
      count("SELECT COUNT(*) c FROM reviews WHERE active=0"),
      count("SELECT COUNT(DISTINCT customer_phone, customer_email) c FROM appointments"),
    ]);
  return {
    services,
    barbers,
    gallery,
    reviews,
    reviewsPending: pendingReviews,
    messages,
    messagesUnread: unread,
    appointments,
    appointmentsPending: pending,
    appointmentsToday: today,
    appointmentsThisMonth: month,
    revenue,
    customers,
  };
}

export async function listAppointments({ status, query = "", page = 1, limit = 50 } = {}) {
  const numLimit = Math.max(1, Math.min(200, Number(limit) || 50));
  const offset = (Math.max(1, Number(page)) - 1) * numLimit;
  const where = [];
  const params = [];
  if (status) {
    where.push("a.status=?");
    params.push(status);
  }
  if (query) {
    where.push(
      "(a.customer_name LIKE ? OR a.customer_phone LIKE ? OR a.customer_email LIKE ? OR a.service_name LIKE ?)",
    );
    const like = `%${query}%`;
    params.push(like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [items] = await pool.query(
    `SELECT a.*, b.name AS barber_name FROM appointments a LEFT JOIN barbers b ON b.id=a.barber_id ${whereSql} ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?`,
    [...params, numLimit, offset],
  );
  const [countRow] = await pool.query(
    `SELECT COUNT(*) c FROM appointments a ${whereSql}`,
    params,
  );
  return { items, total: countRow[0].c, page: Number(page), limit: numLimit };
}

export async function updateAppointmentStatus(id, status) {
  const allowed = ["pending", "confirmed", "cancelled", "completed"];
  if (!allowed.includes(status)) throw fail(400, "Statut invalide.");
  const [result] = await pool.execute(
    "UPDATE appointments SET status=? WHERE id=?",
    [status, id],
  );
  if (!result.affectedRows) throw fail(404, "Rendez-vous introuvable.");
  if (status !== "confirmed") {
    await pool.execute("DELETE FROM appointment_slots WHERE appointment_id=?", [id]);
  }
  return { id: Number(id), status };
}

export async function deleteAppointment(id) {
  const [result] = await pool.execute("DELETE FROM appointments WHERE id=?", [id]);
  if (!result.affectedRows) throw fail(404, "Rendez-vous introuvable.");
  await pool.execute("DELETE FROM appointment_slots WHERE appointment_id=?", [id]);
  return { id: Number(id) };
}

export async function bookForClient(body) {
  const { serviceId, barberId, date, time, name, phone } = body || {};
  if (!serviceId || !barberId || !date || !time || !name || !phone)
    throw fail(400, "Service, barbier, date, heure, nom et téléphone requis.");
  if (!validDate(date))
    throw fail(422, "Date invalide ou jour non ouvert.");
  const booked = await bookAppointment({
    ...body,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(body.email || "").trim(),
    message: String(body.message || ""),
  });
  return booked;
}

// Closed days

export async function listClosedDays() {
  const [rows] = await pool.query(
    "SELECT * FROM closed_days ORDER BY closed_date",
  );
  return rows;
}

export async function addClosedDay(body) {
  const closedDate = String(body?.closed_date || "").trim();
  const parsed = new Date(closedDate + "T12:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(closedDate) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== closedDate
  )
    throw fail(400, "Date invalide.");
  const reason = String(body?.reason || "").trim().slice(0, 150);
  let result;
  try {
    [result] = await pool.execute(
      "INSERT INTO closed_days (closed_date, reason) VALUES (?,?)",
      [closedDate, reason],
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      throw fail(409, "Cette date est déjà enregistrée comme jour fermé.");
    throw error;
  }
  const [rows] = await pool.execute(
    "SELECT * FROM closed_days WHERE id=?",
    [result.insertId],
  );
  return rows[0];
}

export async function deleteClosedDay(id) {
  const [result] = await pool.execute(
    "DELETE FROM closed_days WHERE id=?",
    [id],
  );
  if (!result.affectedRows) throw fail(404, "Jour fermé introuvable.");
  return { id: Number(id) };
}

// Working hours (temps du travail)

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAY_LONG = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export async function listOpeningHours() {
  const [rows] = await pool.query(
    "SELECT * FROM opening_hours ORDER BY day_of_week",
  );
  return rows;
}

function validateHoursRow(row, index) {
  const day = Number(row?.day_of_week);
  if (!Number.isInteger(day) || day < 0 || day > 6)
    throw fail(400, `Jour invalide à la ligne ${index + 1}.`);
  const open = String(row?.open_time || "").trim();
  const close = String(row?.close_time || "").trim();
  const breakStart = String(row?.break_start || "").trim();
  const breakEnd = String(row?.break_end || "").trim();
  if (!TIME_RE.test(open) || !TIME_RE.test(close))
    throw fail(400, `Heures invalides pour le ${DAY_LONG[day]}.`);
  if (toMinutes(close) <= toMinutes(open))
    throw fail(400, `La fermeture doit être après l’ouverture (${DAY_LONG[day]}).`);
  const hasBreak = breakStart || breakEnd;
  if (hasBreak) {
    if (!TIME_RE.test(breakStart) || !TIME_RE.test(breakEnd))
      throw fail(400, `Pause mal définie pour le ${DAY_LONG[day]}.`);
    if (
      toMinutes(breakEnd) <= toMinutes(breakStart) ||
      toMinutes(breakStart) < toMinutes(open) ||
      toMinutes(breakEnd) > toMinutes(close)
    )
      throw fail(400, `La pause doit être comprise dans l’horaire (${DAY_LONG[day]}).`);
  }
  return {
    day,
    open,
    close,
    breakStart: hasBreak ? breakStart : "",
    breakEnd: hasBreak ? breakEnd : "",
    isOpen: Number(row?.is_open) === 1,
  };
}

function hoursLabel(row) {
  if (!row.isOpen) return { open: false, label: "Fermé" };
  let label = `${row.open} - ${row.close}`;
  if (row.breakStart && row.breakEnd)
    label += ` (pause ${row.breakStart} - ${row.breakEnd})`;
  return { open: true, label };
}

function sameSchedule(a, b) {
  return (
    a.isOpen === b.isOpen &&
    a.open === b.open &&
    a.close === b.close &&
    a.breakStart === b.breakStart &&
    a.breakEnd === b.breakEnd
  );
}

function compressRanges(rows, names) {
  const parts = [];
  let i = 0;
  while (i < rows.length) {
    const cur = rows[i];
    let j = i;
    while (j + 1 < rows.length && sameSchedule(cur, rows[j + 1])) j++;
    const start = names[cur.day];
    const end = names[rows[j].day];
    const range = start === end ? start : `${start} - ${end}`;
    parts.push(`${range} : ${hoursLabel(cur).label}`);
    i = j + 1;
  }
  return parts.join(" ; ");
}

export async function saveOpeningHours(body) {
  const hours = Array.isArray(body?.hours) ? body.hours : null;
  if (!hours || hours.length !== 7)
    throw fail(400, "Les horaires des 7 jours sont requis.");
  const seen = new Set();
  const validated = hours.map((h, i) => {
    const row = validateHoursRow(h, i);
    if (seen.has(row.day)) throw fail(400, `Jour ${row.day} en double.`);
    seen.add(row.day);
    return row;
  });
  for (const row of validated)
    await pool.execute(
      "INSERT INTO opening_hours (day_of_week,open_time,close_time,break_start,break_end,is_open) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE open_time=VALUES(open_time),close_time=VALUES(close_time),break_start=VALUES(break_start),break_end=VALUES(break_end),is_open=VALUES(is_open)",
      [row.day, row.open, row.close, row.breakStart, row.breakEnd, row.isOpen],
    );
  const week = validated.sort((a, b) => a.day - b.day);
  const workweek = week.filter((r) => r.day >= 1 && r.day <= 6);
  const sunday = week.find((r) => r.day === 0);
  await updateSettings({
    business_opening_hours: compressRanges(workweek, DAY_SHORT),
    business_opening_hours_sunday: compressRanges([sunday], DAY_LONG),
  });
  return listOpeningHours();
}

// Customers

export async function listCustomers() {
  const [items] = await pool.query(
    `SELECT a.customer_name AS name, a.customer_phone AS phone, a.customer_email AS email,
            COUNT(*) AS total_appointments, MAX(a.appointment_date) AS last_appointment
     FROM appointments a
     GROUP BY a.customer_phone, a.customer_email, a.customer_name
     ORDER BY last_appointment DESC`,
  );
  return { items, total: items.length };
}

// Services

export async function listServices() {
  const [rows] = await pool.query(
    "SELECT * FROM services ORDER BY display_order, id",
  );
  return rows;
}

export async function createService(body) {
  const {
    name,
    category = "coupe_moderne",
    description = "",
    price,
    price_type = "fixed",
    duration,
    image = "",
    active = true,
    display_order = 0,
  } = body;
  if (!name || price === undefined || !duration)
    throw fail(400, "Nom, prix et durée requis.");
  const [result] = await pool.execute(
    "INSERT INTO services (name,category,description,price,price_type,duration,image,active,display_order) VALUES (?,?,?,?,?,?,?,?,?)",
    [name, category, description, price, price_type, duration, image, active, display_order],
  );
  const [rows] = await pool.execute("SELECT * FROM services WHERE id=?", [result.insertId]);
  return rows[0];
}

export async function updateService(id, body) {
  const allowed = [
    "name", "category", "description", "price", "price_type",
    "duration", "image", "active", "display_order",
  ];
  const set = [];
  const params = [];
  for (const key of allowed) {
    if (key in body) {
      set.push(`${key}=?`);
      params.push(body[key]);
    }
  }
  if (set.length) {
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE services SET ${set.join(", ")} WHERE id=?`,
      params,
    );
    if (!result.affectedRows) throw fail(404, "Service introuvable.");
  }
  const [rows] = await pool.execute("SELECT * FROM services WHERE id=?", [id]);
  return rows[0];
}

export async function deleteService(id) {
  const [result] = await pool.execute("DELETE FROM services WHERE id=?", [id]);
  if (!result.affectedRows) throw fail(404, "Service introuvable.");
  return { id: Number(id) };
}

export async function toggleServiceActive(id, active) {
  const [result] = await pool.execute("UPDATE services SET active=? WHERE id=?", [active, id]);
  if (!result.affectedRows) throw fail(404, "Service introuvable.");
  return { id: Number(id), active };
}

// Barbers

export async function listBarbers() {
  const [rows] = await pool.query("SELECT * FROM barbers ORDER BY id");
  return rows;
}

export async function createBarber(body) {
  const { name, role = "", phone = "", email = "", image = "", active = true } = body;
  if (!name) throw fail(400, "Nom requis.");
  const [result] = await pool.execute(
    "INSERT INTO barbers (name,role,phone,email,image,active) VALUES (?,?,?,?,?,?)",
    [name, role, phone, email, image, active],
  );
  const [rows] = await pool.execute("SELECT * FROM barbers WHERE id=?", [result.insertId]);
  return rows[0];
}

export async function updateBarber(id, body) {
  const allowed = ["name", "role", "phone", "email", "image", "active"];
  const set = [];
  const params = [];
  for (const key of allowed) {
    if (key in body) {
      set.push(`${key}=?`);
      params.push(body[key]);
    }
  }
  if (set.length) {
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE barbers SET ${set.join(", ")} WHERE id=?`,
      params,
    );
    if (!result.affectedRows) throw fail(404, "Barbier introuvable.");
  }
  const [rows] = await pool.execute("SELECT * FROM barbers WHERE id=?", [id]);
  return rows[0];
}

export async function deleteBarber(id) {
  const [result] = await pool.execute("DELETE FROM barbers WHERE id=?", [id]);
  if (!result.affectedRows) throw fail(404, "Barbier introuvable.");
  return { id: Number(id) };
}

export async function toggleBarberActive(id, active) {
  const [result] = await pool.execute("UPDATE barbers SET active=? WHERE id=?", [active, id]);
  if (!result.affectedRows) throw fail(404, "Barbier introuvable.");
  return { id: Number(id), active };
}

// Gallery

export async function listGallery() {
  const [rows] = await pool.query("SELECT * FROM gallery ORDER BY position, id");
  return rows;
}

export async function createGalleryItem(body) {
  const {
    title = "",
    category = "",
    image = "",
    description = "",
    active = true,
    position = 0,
  } = body;
  const [result] = await pool.execute(
    "INSERT INTO gallery (title,category,image,description,active,position) VALUES (?,?,?,?,?,?)",
    [title, category, image, description, active, position],
  );
  const [rows] = await pool.execute("SELECT * FROM gallery WHERE id=?", [result.insertId]);
  return rows[0];
}

export async function updateGalleryItem(id, body) {
  const allowed = ["title", "category", "image", "description", "active", "position"];
  const set = [];
  const params = [];
  for (const key of allowed) {
    if (key in body) {
      set.push(`${key}=?`);
      params.push(body[key]);
    }
  }
  if (set.length) {
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE gallery SET ${set.join(", ")} WHERE id=?`,
      params,
    );
    if (!result.affectedRows) throw fail(404, "Élément galerie introuvable.");
  }
  const [rows] = await pool.execute("SELECT * FROM gallery WHERE id=?", [id]);
  return rows[0];
}

export async function deleteGalleryItem(id) {
  const [result] = await pool.execute("DELETE FROM gallery WHERE id=?", [id]);
  if (!result.affectedRows) throw fail(404, "Élément galerie introuvable.");
  return { id: Number(id) };
}

// Reviews

export async function listReviews() {
  const [rows] = await pool.query("SELECT * FROM reviews ORDER BY id DESC");
  return rows;
}

export async function createReview(body) {
  const { customer_name, review, rating, image = "", active = true } = body;
  if (!customer_name || !review || !rating)
    throw fail(400, "Nom, avis et note requis.");
  const [result] = await pool.execute(
    "INSERT INTO reviews (customer_name,review,rating,image,active) VALUES (?,?,?,?,?)",
    [customer_name, review, rating, image, active],
  );
  const [rows] = await pool.execute("SELECT * FROM reviews WHERE id=?", [result.insertId]);
  return rows[0];
}

export async function updateReview(id, body) {
  const allowed = ["customer_name", "review", "rating", "image", "active"];
  const set = [];
  const params = [];
  for (const key of allowed) {
    if (key in body) {
      set.push(`${key}=?`);
      params.push(body[key]);
    }
  }
  if (set.length) {
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE reviews SET ${set.join(", ")} WHERE id=?`,
      params,
    );
    if (!result.affectedRows) throw fail(404, "Avis introuvable.");
  }
  const [rows] = await pool.execute("SELECT * FROM reviews WHERE id=?", [id]);
  return rows[0];
}

export async function deleteReview(id) {
  const [result] = await pool.execute("DELETE FROM reviews WHERE id=?", [id]);
  if (!result.affectedRows) throw fail(404, "Avis introuvable.");
  return { id: Number(id) };
}

export async function toggleReviewActive(id, active) {
  const [result] = await pool.execute("UPDATE reviews SET active=? WHERE id=?", [active, id]);
  if (!result.affectedRows) throw fail(404, "Avis introuvable.");
  return { id: Number(id), active };
}

// Contacts / Messages

export async function listContacts() {
  const [rows] = await pool.query(
    "SELECT * FROM contacts ORDER BY is_read ASC, created_at DESC",
  );
  return rows;
}

export async function toggleContactRead(id, is_read) {
  const [result] = await pool.execute("UPDATE contacts SET is_read=? WHERE id=?", [is_read, id]);
  if (!result.affectedRows) throw fail(404, "Message introuvable.");
  return { id: Number(id), is_read };
}

export async function deleteContact(id) {
  const [result] = await pool.execute("DELETE FROM contacts WHERE id=?", [id]);
  if (!result.affectedRows) throw fail(404, "Message introuvable.");
  return { id: Number(id) };
}

// Settings

export async function getSettings() {
  const [rows] = await pool.query(
    "SELECT setting_key,setting_value,updated_at FROM settings",
  );
  return settingsColumns(rows);
}

export async function updateSettings(body) {
  const parsed = parseSettings(body || {});
  const keys = Object.keys(parsed);
  if (!keys.length) throw fail(400, "Aucun paramètre à enregistrer.");
  const values = keys.map((k) => parsed[k]);
  const placeholders = keys.map(() => "(?, ?)").join(", ");
  await pool.query(
    `INSERT INTO settings (setting_key, setting_value) VALUES ${placeholders} ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)`,
    keys.flatMap((k, i) => [k, values[i]]),
  );
  const [rows] = await pool.query("SELECT setting_key,setting_value FROM settings");
  return settingsColumns(rows);
}

// Profile

export async function updateProfile(adminRow, body) {
  const { name, phone, avatar } = body;
  const set = [];
  const params = [];
  if (name !== undefined) { set.push("name=?"); params.push(name); }
  if (phone !== undefined) { set.push("phone=?"); params.push(phone); }
  if (avatar !== undefined) { set.push("avatar=?"); params.push(avatar); }
  if (set.length) {
    params.push(adminRow.id);
    await pool.execute(`UPDATE admins SET ${set.join(", ")} WHERE id=?`, params);
  }
  const [rows] = await pool.execute(
    "SELECT id,name,email,phone,avatar,role,created_at FROM admins WHERE id=?",
    [adminRow.id],
  );
  return rows[0];
}

export async function changePassword(adminRow, current_password, new_password) {
  if (!current_password || !new_password)
    throw fail(400, "Mot de passe actuel et nouveau requis.");
  if (String(new_password).length < 8)
    throw fail(400, "Le nouveau mot de passe doit contenir au moins 8 caractères.");
  const [rows] = await pool.execute("SELECT * FROM admins WHERE id=?", [adminRow.id]);
  if (!verifyPassword(current_password, rows[0].password_hash))
    throw fail(400, "Mot de passe actuel incorrect.");
  await pool.execute("UPDATE admins SET password_hash=? WHERE id=?", [
    hashPassword(new_password),
    adminRow.id,
  ]);
  await revokeAllSessionsForAdmin(adminRow.id);
}