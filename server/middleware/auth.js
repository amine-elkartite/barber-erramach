import { getSession } from "../services/auth.js";

const COOKIE_NAME = "errammach.auth";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 12,
};

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/", httpOnly: true, sameSite: "lax" });
}

export function getAuthToken(req) {
  const cookie = req.cookies && req.cookies[COOKIE_NAME];
  if (cookie) return cookie;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = getAuthToken(req);
    const session = await getSession(token);
    if (!session) {
      return res
        .status(401)
        .json({ success: false, message: "Session expirée. Veuillez vous reconnecter.", errors: {} });
    }
    req.admin = session;
    req.sessionToken = token;
    return next();
  } catch (error) {
    return next(error);
  }
}