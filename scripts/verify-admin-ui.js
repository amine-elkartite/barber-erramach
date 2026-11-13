import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
const httpErrors = [];
page.on("pageerror", (e) => {
  errors.push("pageerror: " + e.message);
});
page.on("console", (m) => {
  if (m.type() !== "error" || m.text().includes("net::ERR")) return;
  if (m.text().includes("401 (Unauthorized)") || m.text().includes("Failed to load resource")) return;
  errors.push("console: " + m.text());
});
page.on("response", (res) => {
  if (!res.url().startsWith("http://127.0.0.1:5000")) return;
  if (res.url().endsWith("/api/admin/me") && res.status() === 401) return;
  if (res.status() >= 400) httpErrors.push([res.status(), res.url()]);
});

const assertOverflow = async () => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  const width = page.viewportSize().width;
  assert.equal(overflow, false, `overflow at ${width}px`);
};

// --- Desktop login + pages ---
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://127.0.0.1:5000/admin");
await page.locator(".login-screen").waitFor();
await page.getByPlaceholder("Email").fill("admin@errammach.ma");
await page.getByPlaceholder("Mot de passe").fill("admin123");
await page.getByRole("button", { name: "Se connecter" }).click();
await page.locator(".admin-shell").waitFor();
await page.locator(".stat-grid .stat-card").first().waitFor();
await assertOverflow();

const pages = [
  ["rendez-vous", "Rendez-vous"],
  ["clients", "Clients"],
  ["services", "Services"],
  ["barbiers", "Barbiers"],
  ["galerie", "Galerie"],
  ["temoignages", "Témoignages"],
  ["jours-fermes", "Jours fermés"],
  ["horaires", "Horaires"],
  ["messages", "Messages"],
  ["parametres", "Paramètres"],
  ["profile", "Mon Profil"],
];
for (const [route, title] of pages) {
  await page.goto(`http://127.0.0.1:5000/admin/${route}`);
  await page.locator(".page-header h2, .page-header").first().waitFor();
  await page.locator("main .spinner").waitFor({ state: "detached", timeout: 8000 });
  assert.equal(await page.locator("main .error-state").count(), 0, `${route} shows an error state`);
  await assertOverflow();
  await page.screenshot({
    path: `/tmp/rammach-qa/admin-${route}.png`,
    fullPage: true,
  });
}
assert.ok(page.url().endsWith("/admin/profile"));

// --- Regression: CRUD modal submit (AdminButton must forward form=) ---
await page.goto("http://127.0.0.1:5000/admin/barbiers");
await page.locator(".service-card").first().waitFor();
const originalRole = await page
  .locator(".service-card")
  .first()
  .locator(".service-category")
  .innerText();
await page.locator("button[aria-label='Modifier']").first().click();
await page.locator(".admin-modal").waitFor();
await page.locator('input[placeholder="Barbier, Coiffeur…"]').fill("QA Test Team");
await page.getByRole("button", { name: "Enregistrer" }).click();
await page.locator(".admin-modal").waitFor({ state: "detached", timeout: 8000 });
let newRole = await page
  .locator(".service-card")
  .first()
  .locator(".service-category")
  .innerText();
assert.equal(newRole.toLowerCase(), "qa test team", "barber role was not persisted after saving");
await page.locator("button[aria-label='Modifier']").first().click();
await page.locator('input[placeholder="Barbier, Coiffeur…"]').fill(originalRole.trim());
await page.getByRole("button", { name: "Enregistrer" }).click();
await page.locator(".admin-modal").waitFor({ state: "detached", timeout: 8000 });
newRole = await page.locator(".service-card").first().locator(".service-category").innerText();
assert.equal(newRole.trim().toLowerCase(), (originalRole || "").trim().toLowerCase());
await assertOverflow();

// --- Mobile: sidebar hamburger ---
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5000/admin/dashboard");
await page.locator(".admin-shell").waitFor();
assert.equal(await page.locator(".admin-shell.nav-open").count(), 0);
await page.getByRole("button", { name: "Ouvrir le menu" }).click();
await page.locator(".admin-shell.nav-open").waitFor();
await page
  .locator(".admin-nav")
  .getByRole("link", { name: "Rendez-vous", exact: true })
  .click();
await page.locator(".admin-shell.nav-open").count().then((n) => assert.equal(n, 0));
await page.locator(".page-header").waitFor();
await assertOverflow();
await page.screenshot({ path: "/tmp/rammach-qa/admin-mobile.png" });

// --- Logout ---
await page.getByTitle("Se déconnecter").click();
await page.goto("http://127.0.0.1:5000/admin/profile");
await page.locator(".login-screen").waitFor();

assert.deepEqual(errors, []);
assert.deepEqual(httpErrors, []);
console.log(
  "Admin UI: login, 11 recorded screens, responsive sidebar, logout — verified.",
);
await browser.close();