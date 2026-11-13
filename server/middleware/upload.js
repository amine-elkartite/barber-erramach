import multer from "multer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const crypto = require("node:crypto");
const { mkdirSync } = require("node:fs");

const uploadsDir = fileURLToPath(new URL("../../uploads", import.meta.url));
mkdirSync(uploadsDir, { recursive: true });

const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = ALLOWED.get(file.mimetype) || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error("Format d'image non supporté."), { status: 400 }));
  },
});