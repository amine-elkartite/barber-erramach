import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { formatServicePrice, services } from "../shared/catalog.js";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [],
  assets = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && !message.text().includes("net::ERR"))
    errors.push(message.text());
});
page.on("response", (res) => {
  if (res.url().startsWith("http://127.0.0.1:5000") && res.status() >= 400)
    assets.push([res.status(), res.url()]);
});
await mkdir("/tmp/rammach-qa", { recursive: true });
const routes = ["/", "/services", "/booking", "/gallery", "/about", "/contact"];
for (const width of [1920, 1600, 1440, 1366, 1200, 1024, 768, 430, 390, 375]) {
  await page.setViewportSize({ width, height: 1024 });
  for (const path of routes) {
    await page.goto("http://127.0.0.1:5000" + path);
    await page.locator("h1").waitFor();
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false, `${path} overflow at ${width}`);
    const broken = await page
      .locator("img")
      .evaluateAll((images) =>
        images.filter((i) => i.complete && !i.naturalWidth).map((i) => i.src),
      );
    assert.deepEqual(broken, [], `${path} broken images`);
    if ([1440, 390].includes(width))
      await page.screenshot({
        path: `/tmp/rammach-qa/${path === "/" ? "home" : path.slice(1)}-${width}.png`,
        fullPage: true,
      });
  }
  console.log(`All six routes: ${width}px, no overflow.`);
}
await page.goto("http://127.0.0.1:5000/gallery");
await page.getByRole("button", { name: "Barbes", exact: true }).click();
assert.equal(await page.locator(".gallery-image").count(), 2);
await page.locator(".gallery-image").first().click();
await page.getByRole("dialog").waitFor();
await page.keyboard.press("Escape");
assert.equal(await page.getByRole("dialog").count(), 0);
await page.getByRole("button", { name: "Ouvrir le menu" }).click();
await page
  .getByRole("navigation", { name: "Navigation principale", exact: true })
  .getByRole("link", { name: "Contact", exact: true })
  .click();
assert.ok(page.url().endsWith("/contact"));
await page.goto("http://127.0.0.1:5000/booking");
await page.locator(".time-slots .available").first().waitFor();
assert.ok((await page.locator(".calendar-grid button:disabled").count()) > 0);
await page.goto("http://127.0.0.1:5000/services");
const servicesText = await page.locator("main").innerText();
for (const category of ["COUPE MODERNE", "COUPE CLASSIQUE", "SOINS & BEAUTÉ"])
  assert.ok(servicesText.includes(category), category);
for (const service of services) {
  assert.ok(servicesText.includes(service.name), service.name);
  assert.ok(
    servicesText.includes(formatServicePrice(service)),
    formatServicePrice(service),
  );
}
await page.goto("http://127.0.0.1:5000/");
const homeText = await page.locator(".home-services").innerText();
for (const id of [1, 2, 10, 13]) {
  const service = services.find((item) => item.id === id);
  assert.ok(homeText.includes(service.name), service.name);
  assert.ok(homeText.includes(formatServicePrice(service)), service.name);
}
await page.goto("http://127.0.0.1:5000/booking");
for (const service of services) {
  const escapedName = service.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedPrice = formatServicePrice(service).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  await page
    .getByRole("button", { name: new RegExp(`${escapedName}\\s+${escapedPrice}`) })
    .click();
  assert.match(
    await page.locator(".booking-summary").innerText(),
    new RegExp(escapedPrice),
  );
}
assert.deepEqual(errors, []);
assert.deepEqual(assets, []);
console.log(
  "Gallery filters, lightbox, keyboard dismissal, mobile navigation, assets and console passed.",
);
await browser.close();
