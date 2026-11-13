import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, setAuthCookie, clearAuthCookie } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import * as ctrl from "../controllers/admin.js";

const router = Router();
const ok = (res, msg, data) => res.json({ success: true, message: msg, data });
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de tentatives de connexion. Réessayez dans quelques minutes.",
    errors: [],
  },
});

router.post("/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "Aucun fichier reçu.", errors: {} });
  ok(res, "Image téléversée.", { url: `/uploads/${req.file.filename}` });
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await ctrl.adminLogin(email, password);
    setAuthCookie(res, data.token);
    ok(res, "Connexion réussie.", data);
  } catch (e) { next(e); }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    await ctrl.adminLogout(req.sessionToken);
    clearAuthCookie(res);
    ok(res, "Déconnexion réussie.");
  } catch (e) { next(e); }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try { ok(res, "Profil récupéré.", await ctrl.adminProfile(req.admin)); } catch (e) { next(e); }
});

router.get("/stats", requireAuth, async (_req, res, next) => {
  try { ok(res, "Statistiques chargées.", await ctrl.adminStats()); } catch (e) { next(e); }
});

// Appointments
router.get("/appointments", requireAuth, async (req, res, next) => {
  try {
    const data = await ctrl.listAppointments(req.query);
    ok(res, "Rendez-vous chargés.", data);
  } catch (e) { next(e); }
});
router.post("/appointments", requireAuth, async (req, res, next) => {
  try { ok(res, "Rendez-vous créé.", await ctrl.bookForClient(req.body)); } catch (e) { next(e); }
});
router.patch("/appointments/:id/status", requireAuth, async (req, res, next) => {
  try { ok(res, "Rendez-vous mis à jour.", await ctrl.updateAppointmentStatus(req.params.id, req.body.status)); } catch (e) { next(e); }
});
router.delete("/appointments/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Rendez-vous supprimé.", await ctrl.deleteAppointment(req.params.id)); } catch (e) { next(e); }
});

// Closed days (jours fermés)
router.get("/closed-days", requireAuth, async (_req, res, next) => {
  try { ok(res, "Jours fermés chargés.", await ctrl.listClosedDays()); } catch (e) { next(e); }
});
router.post("/closed-days", requireAuth, async (req, res, next) => {
  try { ok(res, "Jour fermé ajouté.", await ctrl.addClosedDay(req.body)); } catch (e) { next(e); }
});
router.delete("/closed-days/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Jour fermé supprimé.", await ctrl.deleteClosedDay(req.params.id)); } catch (e) { next(e); }
});

// Working hours (temps du travail)
router.get("/opening-hours", requireAuth, async (_req, res, next) => {
  try { ok(res, "Horaires chargés.", await ctrl.listOpeningHours()); } catch (e) { next(e); }
});
router.put("/opening-hours", requireAuth, async (req, res, next) => {
  try { ok(res, "Horaires enregistrés.", await ctrl.saveOpeningHours(req.body)); } catch (e) { next(e); }
});

// Customers (derived from appointments)
router.get("/customers", requireAuth, async (_req, res, next) => {
  try { ok(res, "Clients chargés.", await ctrl.listCustomers()); } catch (e) { next(e); }
});

// Services
router.get("/services", requireAuth, async (_req, res, next) => {
  try { ok(res, "Services chargés.", await ctrl.listServices()); } catch (e) { next(e); }
});
router.post("/services", requireAuth, async (req, res, next) => {
  try { ok(res, "Service créé.", await ctrl.createService(req.body)); } catch (e) { next(e); }
});
router.patch("/services/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Service mis à jour.", await ctrl.updateService(req.params.id, req.body)); } catch (e) { next(e); }
});
router.delete("/services/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Service supprimé.", await ctrl.deleteService(req.params.id)); } catch (e) { next(e); }
});
router.patch("/services/:id/active", requireAuth, async (req, res, next) => {
  try { ok(res, "Service mis à jour.", await ctrl.toggleServiceActive(req.params.id, req.body.active)); } catch (e) { next(e); }
});

// Barbers
router.get("/barbers", requireAuth, async (_req, res, next) => {
  try { ok(res, "Barbiers chargés.", await ctrl.listBarbers()); } catch (e) { next(e); }
});
router.post("/barbers", requireAuth, async (req, res, next) => {
  try { ok(res, "Barbier créé.", await ctrl.createBarber(req.body)); } catch (e) { next(e); }
});
router.patch("/barbers/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Barbier mis à jour.", await ctrl.updateBarber(req.params.id, req.body)); } catch (e) { next(e); }
});
router.delete("/barbers/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Barbier supprimé.", await ctrl.deleteBarber(req.params.id)); } catch (e) { next(e); }
});
router.patch("/barbers/:id/active", requireAuth, async (req, res, next) => {
  try { ok(res, "Barbier mis à jour.", await ctrl.toggleBarberActive(req.params.id, req.body.active)); } catch (e) { next(e); }
});

// Gallery
router.get("/gallery", requireAuth, async (_req, res, next) => {
  try { ok(res, "Galerie chargée.", await ctrl.listGallery()); } catch (e) { next(e); }
});
router.post("/gallery", requireAuth, async (req, res, next) => {
  try { ok(res, "Élément ajouté à la galerie.", await ctrl.createGalleryItem(req.body)); } catch (e) { next(e); }
});
router.patch("/gallery/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Élément galerie mis à jour.", await ctrl.updateGalleryItem(req.params.id, req.body)); } catch (e) { next(e); }
});
router.delete("/gallery/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Élément galerie supprimé.", await ctrl.deleteGalleryItem(req.params.id)); } catch (e) { next(e); }
});

// Reviews
router.get("/reviews", requireAuth, async (_req, res, next) => {
  try { ok(res, "Avis chargés.", await ctrl.listReviews()); } catch (e) { next(e); }
});
router.post("/reviews", requireAuth, async (req, res, next) => {
  try { ok(res, "Avis créé.", await ctrl.createReview(req.body)); } catch (e) { next(e); }
});
router.patch("/reviews/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Avis mis à jour.", await ctrl.updateReview(req.params.id, req.body)); } catch (e) { next(e); }
});
router.delete("/reviews/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Avis supprimé.", await ctrl.deleteReview(req.params.id)); } catch (e) { next(e); }
});
router.patch("/reviews/:id/active", requireAuth, async (req, res, next) => {
  try { ok(res, "Avis mis à jour.", await ctrl.toggleReviewActive(req.params.id, req.body.active)); } catch (e) { next(e); }
});

// Contacts / Messages
router.get("/contacts", requireAuth, async (_req, res, next) => {
  try { ok(res, "Messages chargés.", await ctrl.listContacts()); } catch (e) { next(e); }
});
router.patch("/contacts/:id/read", requireAuth, async (req, res, next) => {
  try { ok(res, "Message mis à jour.", await ctrl.toggleContactRead(req.params.id, req.body.is_read)); } catch (e) { next(e); }
});
router.delete("/contacts/:id", requireAuth, async (req, res, next) => {
  try { ok(res, "Message supprimé.", await ctrl.deleteContact(req.params.id)); } catch (e) { next(e); }
});

// Settings
router.get("/settings", requireAuth, async (_req, res, next) => {
  try { ok(res, "Paramètres chargés.", await ctrl.getSettings()); } catch (e) { next(e); }
});
router.patch("/settings", requireAuth, async (req, res, next) => {
  try { ok(res, "Paramètres enregistrés.", await ctrl.updateSettings(req.body)); } catch (e) { next(e); }
});

// Profile
router.patch("/profile", requireAuth, async (req, res, next) => {
  try { ok(res, "Profil mis à jour.", await ctrl.updateProfile(req.admin, req.body)); } catch (e) { next(e); }
});
router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    await ctrl.changePassword(req.admin, current_password, new_password);
    clearAuthCookie(res);
    ok(res, "Mot de passe mis à jour.");
  } catch (e) { next(e); }
});

export default router;