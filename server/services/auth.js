import { createRequire } from "node:module";
import { pool } from "../config/database.js";

const require = createRequire(import.meta.url);
const crypto = require("node:crypto");

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const fail = (status, message) => Object.assign(new Error(message), { status });

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

async function pruneExpired() {
  await pool.execute("DELETE FROM sessions WHERE expires_at <= NOW()");
}

export async function authenticateAdmin(email, password) {
  const [rows] = await pool.execute(
    "SELECT * FROM admins WHERE email=? LIMIT 1",
    [email],
  );
  const admin = rows[0];
  if (!admin || !verifyPassword(password, admin.password_hash))
    throw fail(401, "Identifiants incorrects.");
  await pool.execute("DELETE FROM sessions WHERE admin_id=? AND expires_at <= NOW()", [
    admin.id,
  ]);
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await pool.execute(
    "INSERT INTO sessions (token, admin_id, expires_at) VALUES (?,?,?)",
    [token, admin.id, expiresAt],
  );
  return { token, expiresAt, admin };
}

export async function getSession(token) {
  if (!token) return null;
  await pruneExpired();
  const [rows] = await pool.execute(
    "SELECT s.id AS session_id, s.expires_at, a.* FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token=? LIMIT 1",
    [token],
  );
  return rows[0] || null;
}

export async function revokeSession(token) {
  if (!token) return;
  await pool.execute("DELETE FROM sessions WHERE token=?", [token]);
}

export async function revokeAllSessionsForAdmin(adminId, except) {
  await pool.execute("DELETE FROM sessions WHERE admin_id=? AND token<>?", [
    adminId,
    except || "",
  ]);
}