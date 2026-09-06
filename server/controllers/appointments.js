import { pool } from "../config/database.js";
import { formatServicePrice } from "../../shared/catalog.js";
import { makeSlots, toMinutes } from "../../shared/schedule.js";
const fail = (status, message) => Object.assign(new Error(message), { status });
async function selection(db, serviceId, barberId, lock = false) {
  const [s] = await db.execute(
    "SELECT * FROM services WHERE id=? AND active=1",
    [serviceId],
  );
  const [b] = await db.execute(
    `SELECT * FROM barbers WHERE id=? AND active=1${lock ? " FOR UPDATE" : ""}`,
    [barberId],
  );
  if (!s.length || !b.length)
    throw fail(404, "Service ou barbier indisponible.");
  return { service: s[0], barber: b[0] };
}
async function slots(db, date, barberId, service) {
  const [rows] = await db.execute(
    "SELECT appointment_time,duration FROM appointments WHERE barber_id=? AND appointment_date=? AND status='confirmed'",
    [barberId, date],
  );
  return makeSlots(date, service.duration, rows);
}
export async function availability(req, res) {
  const { date, barberId, serviceId } = req.query;
  const { service } = await selection(pool, serviceId, barberId);
  res.json({
    success: true,
    message: "Disponibilités actualisées.",
    data: await slots(pool, date, barberId, service),
  });
}
export async function createAppointment(req, res) {
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    const {
      serviceId,
      barberId,
      date,
      time,
      name,
      phone,
      email,
      message = "",
    } = req.body;
    const { service, barber } = await selection(db, serviceId, barberId, true);
    const available = await slots(db, date, barberId, service);
    if (!available.some((s) => s.time === time && s.status === "available"))
      throw fail(
        409,
        "Ce créneau n’est plus disponible. Veuillez en choisir un autre.",
      );
    const displayedPrice = formatServicePrice(service);
    const [result] = await db.execute(
      "INSERT INTO appointments (service_id,barber_id,service_name,displayed_price,price_type,customer_name,customer_phone,customer_email,appointment_date,appointment_time,duration,message,total_price) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        serviceId,
        barberId,
        service.name,
        displayedPrice,
        service.price_type,
        name,
        phone,
        email,
        date,
        time,
        service.duration,
        message,
        service.price,
      ],
    );
    const start = toMinutes(time);
    for (let minute = start; minute < start + service.duration; minute++)
      await db.execute(
        "INSERT INTO appointment_slots (barber_id,appointment_date,minute_of_day,appointment_id) VALUES (?,?,?,?)",
        [barberId, date, minute, result.insertId],
      );
    await db.commit();
    res
      .status(201)
      .json({
        success: true,
        message: "Rendez-vous confirmé !",
        data: {
          id: result.insertId,
          service: service.name,
          barber: barber.name,
          date,
          time,
          total: service.price,
          displayedPrice,
          priceType: service.price_type,
        },
      });
  } catch (error) {
    await db.rollback();
    if (error.code === "ER_DUP_ENTRY")
      throw fail(409, "Ce créneau vient d’être réservé.");
    throw error;
  } finally {
    db.release();
  }
}
