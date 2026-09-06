import assert from "node:assert/strict";
import { pool } from "../server/config/database.js";
import { formatServicePrice } from "../shared/catalog.js";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:5000";
const email = `qa-${Date.now()}@example.com`;
async function request(path, body) {
  const res = await fetch(
    base + "/api" + path,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {},
  );
  return { status: res.status, body: await res.json() };
}
try {
  for (const endpoint of ["services", "barbers", "gallery", "reviews"]) {
    const response = await request("/" + endpoint);
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    if (endpoint === "services") {
      assert.equal(response.body.data.length, 16);
      assert.deepEqual(
        response.body.data.map(({ id, name, category, price, price_type }) => ({
          id,
          name,
          category,
          price: Number(price),
          price_type,
        })),
        [
          {
            id: 1,
            name: "Dégradé cheveux",
            category: "coupe_moderne",
            price: 25,
            price_type: "fixed",
          },
          {
            id: 2,
            name: "Dégradé barbe",
            category: "coupe_moderne",
            price: 15,
            price_type: "fixed",
          },
          {
            id: 3,
            name: "Dégradé enfant",
            category: "coupe_moderne",
            price: 20,
            price_type: "fixed",
          },
          {
            id: 4,
            name: "Sèche-cheveux",
            category: "coupe_moderne",
            price: 10,
            price_type: "fixed",
          },
          {
            id: 5,
            name: "Lavage cheveux",
            category: "coupe_moderne",
            price: 10,
            price_type: "fixed",
          },
          {
            id: 6,
            name: "Coupe cheveux",
            category: "coupe_classique",
            price: 20,
            price_type: "fixed",
          },
          {
            id: 7,
            name: "Rasage visage",
            category: "coupe_classique",
            price: 10,
            price_type: "fixed",
          },
          {
            id: 8,
            name: "Coupe enfant classique",
            category: "coupe_classique",
            price: 15,
            price_type: "fixed",
          },
          {
            id: 9,
            name: "Contours cheveux + barbe",
            category: "coupe_classique",
            price: 15,
            price_type: "fixed",
          },
          {
            id: 10,
            name: "Protéine",
            category: "soins_beaute",
            price: 200,
            price_type: "starting_from",
          },
          {
            id: 11,
            name: "Kératine",
            category: "soins_beaute",
            price: 150,
            price_type: "starting_from",
          },
          {
            id: 12,
            name: "Hydratation (Dark)",
            category: "soins_beaute",
            price: 60,
            price_type: "fixed",
          },
          {
            id: 13,
            name: "Nettoyage du visage à la vapeur",
            category: "soins_beaute",
            price: 80,
            price_type: "fixed",
          },
          {
            id: 14,
            name: "Nettoyage du visage (Gommage)",
            category: "soins_beaute",
            price: 20,
            price_type: "fixed",
          },
          {
            id: 15,
            name: "Masque noir",
            category: "soins_beaute",
            price: 10,
            price_type: "fixed",
          },
          {
            id: 16,
            name: "Coloration cheveux",
            category: "soins_beaute",
            price: 70,
            price_type: "starting_from",
          },
        ],
      );
    }
  }
  const date = new Date(Date.now() + 14 * 86400000);
  if (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  const day = date.toISOString().slice(0, 10);
  const data = {
    serviceId: 10,
    barberId: 3,
    date: day,
    time: "09:00",
    name: "Test de réservation",
    phone: "0623444465",
    email,
    message: "Test automatisé — à supprimer.",
  };
  const responses = await Promise.all([
    request("/appointments", data),
    request("/appointments", data),
  ]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
  const confirmed = responses.find((response) => response.status === 201);
  assert.equal(confirmed.body.data.displayedPrice, "À partir de 200 DH");
  assert.equal(confirmed.body.data.priceType, "starting_from");
  assert.equal(
    (await request("/appointments", { ...data, time: "09:30", serviceId: 1 }))
      .status,
    409,
  );
  const availability = await request(
    `/appointments/availability?date=${day}&barberId=3&serviceId=1`,
  );
  assert.equal(
    availability.body.data.find((s) => s.time === "09:30").status,
    "reserved",
  );
  assert.equal(
    availability.body.data.find((s) => s.time === "10:00").status,
    "available",
  );
  assert.equal(
    (await request("/appointments", { ...data, time: "10:00", serviceId: 1 }))
      .status,
    201,
  );
  const proteinResponse = await request("/appointments", {
    ...data,
    serviceId: 11,
    barberId: 2,
    time: "11:00",
  });
  assert.equal(proteinResponse.status, 201);
  assert.equal(proteinResponse.body.data.displayedPrice, "À partir de 150 DH");
  assert.equal(proteinResponse.body.data.priceType, "starting_from");
  assert.equal(
    proteinResponse.body.data.displayedPrice,
    formatServicePrice({ price: 150, price_type: "starting_from" }),
  );
  assert.equal(
    (await request("/appointments", { ...data, date: "2020-01-01" })).status,
    422,
  );
  assert.equal(
    (await request("/appointments", { ...data, email: "invalid" })).status,
    422,
  );
  assert.equal(
    (
      await request(
        "/appointments/availability?date=2026-02-30&barberId=1&serviceId=1",
      )
    ).status,
    422,
  );
  assert.equal(
    (
      await request("/contact", {
        name: "Test QA",
        email,
        phone: "0623444465",
        subject: "Test technique",
        message: "Vérification du formulaire de contact.",
      })
    ).status,
    201,
  );
  assert.equal(
    (await request("/contact", { name: "A", email: "bad" })).status,
    422,
  );
  const [contacts] = await pool.execute(
    "SELECT id FROM contacts WHERE email=?",
    [email],
  );
  assert.equal(contacts.length, 1);
  console.log(
    "API verified: official services, price types, booking snapshots, concurrent duplicate protection, overlap protection, adjacent booking, validation, contact persistence.",
  );
} finally {
  await pool.execute(
    "DELETE FROM appointment_slots WHERE appointment_id IN (SELECT id FROM appointments WHERE customer_email=?)",
    [email],
  );
  await pool.execute("DELETE FROM appointments WHERE customer_email=?", [
    email,
  ]);
  await pool.execute("DELETE FROM contacts WHERE email=?", [email]);
  await pool.end();
}
