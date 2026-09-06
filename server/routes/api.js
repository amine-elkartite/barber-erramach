import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../config/database.js";
import {
  availability,
  createAppointment,
} from "../controllers/appointments.js";
import admin from "./admin.js";
import {
  availabilityRules,
  appointmentRules,
  contactRules,
  validate,
} from "../validators/index.js";
const router = Router();
router.use("/admin", admin);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de demandes. Réessayez dans quelques minutes.",
    errors: [],
  },
});
for (const table of ["services", "barbers", "gallery", "reviews"])
  router.get("/" + table, async (req, res) => {
    const [rows] = await pool.query(
      `SELECT * FROM ${table}${table === "gallery" ? "" : " WHERE active=1"} ORDER BY id`,
    );
    res.json({ success: true, message: "Données chargées.", data: rows });
  });
router.get(
  "/appointments/availability",
  availabilityRules,
  validate,
  availability,
);
router.post(
  "/appointments",
  limiter,
  appointmentRules,
  validate,
  createAppointment,
);
router.post("/contact", limiter, contactRules, validate, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  await pool.execute(
    "INSERT INTO contacts (name,email,phone,subject,message) VALUES (?,?,?,?,?)",
    [name, email, phone, subject, message],
  );
  res
    .status(201)
    .json({
      success: true,
      message: "Votre message a bien été envoyé.",
      data: { received: true },
    });
});
export default router;
