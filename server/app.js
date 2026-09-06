import { pageHandler } from "./seo.js";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import api from "./routes/api.js";
const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
  });
  next();
});
app.use(
  cors({
    origin: (
      process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173"
    ).split(","),
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use("/api", api);
app.use("/api", (req, res) =>
  res
    .status(404)
    .json({ success: false, message: "Route API introuvable.", errors: [] }),
);
const origin = () =>
  new URL(process.env.SITE_URL || "http://localhost:5000").origin;
app.get("/robots.txt", (req, res) =>
  res
    .type("text")
    .send(`User-agent: *\nAllow: /\nSitemap: ${origin()}/sitemap.xml\n`),
);
app.get("/sitemap.xml", (req, res) =>
  res
    .type("xml")
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", "/services", "/booking", "/gallery", "/about", "/contact"].map((p) => `<url><loc>${origin() + p}</loc></url>`).join("")}</urlset>`,
    ),
);
const dist = fileURLToPath(new URL("../client/dist", import.meta.url));
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false }));
  app.get("/{*path}", pageHandler(dist + "/index.html"));
}
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || 503;
  res
    .status(status)
    .json({
      success: false,
      message:
        status < 500
          ? error.message
          : "Le service est momentanément indisponible. Veuillez réessayer.",
      errors: [],
    });
});
export default app;
