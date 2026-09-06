import { readFileSync } from "node:fs";
import { metadata } from "../shared/seo.js";
import { business, instagramUrl } from "../shared/business.js";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function pageHandler(index) {
  return (req, res) => {
    const template = readFileSync(index, "utf8");
    const meta = metadata[req.path];
    const [title, description] = meta || [
      "Page introuvable | ER RAMMACH",
      "Retrouvez votre chemin vers ER RAMMACH Barber Shop.",
    ];
    const origin = new URL(process.env.SITE_URL || "http://localhost:5000")
      .origin;
    const url = origin + (meta ? req.path : "/");
    const structured = {
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: business.name,
      url: origin,
      telephone: business.internationalPhone,
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: "Meknès",
        addressCountry: "MA",
      },
      openingHours: "Mo-Sa 09:00-20:00",
      sameAs: [instagramUrl],
    };
    const head = `<link rel="canonical" href="${escape(url)}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${escape(url)}"/><meta property="og:type" content="website"/><meta property="og:image" content="${escape(origin)}/images/hero-barber.webp"/><script id="business-schema" type="application/ld+json">${JSON.stringify(structured).replace(/</g, "\\u003c")}</script>`;
    res
      .status(meta ? 200 : 404)
      .type("html")
      .send(
        template
          .replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
          .replace(
            /<meta name="description"[^>]*\/>/,
            `<meta name="description" content="${escape(description)}"/>`,
          )
          .replace("</head>", head + "</head>"),
      );
  };
}
