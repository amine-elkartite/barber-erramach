import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { pool } from "../server/config/database.js";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const email = `browser-qa-${Date.now()}@example.com`;
try {
  await page.goto("http://127.0.0.1:5000/booking");
  await page
    .getByRole("button", { name: /Protéine\s+À partir de 200 DH/ })
    .click();
  assert.match(
    await page.locator(".booking-summary").innerText(),
    /Prix\s+À partir de 200 DH/,
  );
  assert.match(
    await page.locator(".booking-summary").innerText(),
    /Le prix final peut varier selon la longueur/,
  );
  await page.locator(".time-slots .available").first().click();
  await page.getByLabel("Nom complet").fill("Client test navigateur");
  await page.getByLabel("Téléphone", { exact: false }).fill("0623444465");
  await page.getByLabel("Email", { exact: false }).fill(email);
  await page
    .getByRole("button", { name: "CONFIRMER LE RENDEZ-VOUS", exact: true })
    .click();
  await page.getByRole("dialog").waitFor();
  assert.match(
    await page.getByRole("dialog").innerText(),
    /Rendez-vous confirmé/,
  );
  assert.match(
    await page.getByRole("dialog").innerText(),
    /À partir de 200 DH/,
  );
  const [appointments] = await pool.execute(
    "SELECT id,service_name,displayed_price,price_type,total_price FROM appointments WHERE customer_email=?",
    [email],
  );
  assert.equal(appointments.length, 1);
  assert.equal(appointments[0].service_name, "Protéine");
  assert.equal(appointments[0].displayed_price, "À partir de 200 DH");
  assert.equal(appointments[0].price_type, "starting_from");
  assert.equal(Number(appointments[0].total_price), 200);
  await page.screenshot({
    path: "/tmp/rammach-qa/booking-confirmed-mobile.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page.goto("http://127.0.0.1:5000/contact");
  await page
    .getByLabel("Votre nom", { exact: true })
    .fill("Client test navigateur");
  await page.getByLabel("Votre email", { exact: true }).fill(email);
  await page.getByLabel("Votre téléphone", { exact: true }).fill("0623444465");
  await page
    .getByLabel("Sujet", { exact: true })
    .selectOption("Renseignements");
  await page
    .getByLabel("Votre message", { exact: true })
    .fill("Vérification du formulaire depuis le navigateur.");
  await page
    .getByRole("button", { name: "ENVOYER LE MESSAGE", exact: true })
    .click();
  await page.getByRole("dialog").waitFor();
  assert.match(
    await page.getByRole("dialog").innerText(),
    /Votre message a bien été envoyé/,
  );
  const [contacts] = await pool.execute(
    "SELECT id FROM contacts WHERE email=?",
    [email],
  );
  assert.equal(contacts.length, 1);
  assert.deepEqual(errors, []);
  console.log(
    "Mobile booking and contact: browser → API → database → confirmation verified.",
  );
} finally {
  await browser.close();
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
