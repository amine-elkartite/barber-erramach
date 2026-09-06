import { Router } from "express";
import { editableCollections, makeId, readAdminState, writeAdminState } from "../services/adminStore.js";

const router = Router();
const ok = (res, message, data) => res.json({ success: true, message, data });
const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

function collectionOrThrow(name) {
  if (!editableCollections.has(name)) throw badRequest("Collection admin inconnue.");
  return name;
}

function sanitizeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Données invalides.");
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

router.get("/state", async (req, res) => {
  ok(res, "Données admin chargées.", await readAdminState());
});

router.post("/reset", async (req, res) => {
  const state = await readAdminState();
  await writeAdminState({ ...state, _resetRequestedAt: new Date().toISOString() });
  ok(res, "Réinitialisation enregistrée.", await readAdminState());
});

router.post("/:collection", async (req, res) => {
  const collection = collectionOrThrow(req.params.collection);
  if (["business", "profile", "notifications"].includes(collection)) throw badRequest("Cette collection doit être modifiée avec PATCH.");
  const state = await readAdminState();
  const payload = sanitizeObject(req.body);
  const item = { ...payload, id: makeId(collection, payload), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  state[collection] = [item, ...(state[collection] || [])];
  const next = await writeAdminState(state);
  ok(res.status(201), "Élément ajouté.", { item, state: next });
});

router.patch("/:collection", async (req, res) => {
  const collection = collectionOrThrow(req.params.collection);
  if (!["business", "profile", "notifications"].includes(collection)) throw badRequest("Un identifiant est requis pour cette collection.");
  const state = await readAdminState();
  state[collection] = { ...(state[collection] || {}), ...sanitizeObject(req.body), updatedAt: new Date().toISOString() };
  const next = await writeAdminState(state);
  ok(res, "Paramètres enregistrés.", { item: state[collection], state: next });
});

router.patch("/:collection/:id", async (req, res) => {
  const collection = collectionOrThrow(req.params.collection);
  if (["business", "profile", "notifications"].includes(collection)) throw badRequest("Cette collection ne contient pas de lignes.");
  const state = await readAdminState();
  const items = state[collection] || [];
  const index = items.findIndex((item) => String(item.id) === String(req.params.id));
  if (index === -1) throw Object.assign(new Error("Élément introuvable."), { status: 404 });
  const item = { ...items[index], ...sanitizeObject(req.body), updatedAt: new Date().toISOString() };
  state[collection] = items.map((current, currentIndex) => (currentIndex === index ? item : current));
  const next = await writeAdminState(state);
  ok(res, "Élément mis à jour.", { item, state: next });
});

router.delete("/:collection/:id", async (req, res) => {
  const collection = collectionOrThrow(req.params.collection);
  const state = await readAdminState();
  const before = state[collection] || [];
  state[collection] = before.filter((item) => String(item.id) !== String(req.params.id));
  if (before.length === state[collection].length) throw Object.assign(new Error("Élément introuvable."), { status: 404 });
  const next = await writeAdminState(state);
  ok(res, "Élément supprimé.", { id: req.params.id, state: next });
});

export default router;
