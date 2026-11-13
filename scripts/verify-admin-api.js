import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 5099;
const BASE = `http://127.0.0.1:${PORT}`;
let pass = 0;
let fail = 0;
const results = [];

function check(name, cond, extra = "") {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name} ${extra}`);
  }
  results.push({ name, ok: cond });
}

async function main() {
  const server = spawn("node", ["server/server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: "ignore",
  });
  await sleep(1200);

  let cookie = "";
  try {
    // Auth
    let r = await fetch(`${BASE}/api/admin/stats`);
    check("stats protected", r.status === 401, `got ${r.status}`);
    let j = await r.json();
    check("401 uses API shape", j.success === false && "message" in j);

    r = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@errammach.ma", password: "wrong" }),
    });
    check("wrong password rejected", r.status === 401, `got ${r.status}`);

    r = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@errammach.ma", password: "admin123" }),
    });
    check("login succeeds", r.status === 200, `got ${r.status}`);
    cookie = (r.headers.get("set-cookie") || "").split(";")[0];
    check("session cookie set", cookie.startsWith("errammach.auth="));

    r = await fetch(`${BASE}/api/admin/me`, { headers: { cookie } });
    j = await r.json();
    check("me returns profile", r.status === 200 && j.data.email === "admin@errammach.ma");
    check("me hides password", j.data.password_hash === undefined);

    // Stats
    r = await fetch(`${BASE}/api/admin/stats`, { headers: { cookie } });
    j = await r.json();
    check(
      "stats shape",
      r.status === 200 &&
        typeof j.data.services === "number" &&
        typeof j.data.appointments === "number" &&
        typeof j.data.revenue === "number",
    );

    // Services
    r = await fetch(`${BASE}/api/admin/services`, { headers: { cookie } });
    j = await r.json();
    check("list services", r.status === 200 && j.data.length === 16);

    r = await fetch(`${BASE}/api/admin/services`, {
      method: "POST",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "AUDIT TEST SERVICE",
        category: "barbe",
        price: 49.5,
        price_type: "fixed",
        duration: 30,
        image: "",
        display_order: 999,
      }),
    });
    j = await r.json();
    check("create service", r.status === 200 && j.data.id);
    const svcId = j.data.id;
    const svcName = j.data.name;

    r = await fetch(`${BASE}/api/admin/services/${svcId}`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ price: 55 }),
    });
    j = await r.json();
    check("update service", r.status === 200 && Number(j.data.price) === 55);

    r = await fetch(`${BASE}/api/admin/services/${svcId}/active`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });
    j = await r.json();
    check("toggle service active", r.status === 200 && j.data.active === false);

    // verify public API honored active status
    r = await fetch(`${BASE}/api/services`);
    j = await r.json();
    const pubMissing = !j.data.some((s) => s.id === svcId);
    check("deactivated service hidden publicly", pubMissing);

    r = await fetch(`${BASE}/api/admin/services/${svcId}`, {
      method: "DELETE",
      headers: { cookie },
    });
    check("delete service", r.status === 200);

    // Barbers
    r = await fetch(`${BASE}/api/admin/barbers`, { headers: { cookie } });
    j = await r.json();
    check("list barbers", r.status === 200 && j.data.length >= 3);

    r = await fetch(`${BASE}/api/admin/barbers`, {
      method: "POST",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "AUDIT TEST BARBER", role: "Test" }),
    });
    j = await r.json();
    check("create barber", r.status === 200 && j.data.id);
    const bId = j.data.id;
    r = await fetch(`${BASE}/api/admin/barbers/${bId}`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+212600000000" }),
    });
    j = await r.json();
    check("update barber", r.status === 200 && j.data.phone === "+212600000000");
    await fetch(`${BASE}/api/admin/barbers/${bId}`, { method: "DELETE", headers: { cookie } });

    // Gallery
    r = await fetch(`${BASE}/api/admin/gallery`, { headers: { cookie } });
    j = await r.json();
    check("list gallery", r.status === 200 && j.data.length === 9);

    r = await fetch(`${BASE}/api/admin/gallery`, {
      method: "POST",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "AUDIT TEST", image: "/images/gallery-1.webp", active: false }),
    });
    j = await r.json();
    check("create gallery item", r.status === 200 && j.data.id);
    const gId = j.data.id;
    await fetch(`${BASE}/api/admin/gallery/${gId}`, { method: "DELETE", headers: { cookie } });

    // Reviews
    r = await fetch(`${BASE}/api/admin/reviews`, {
      method: "POST",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ customer_name: "Audit", review: "Excellent service", rating: 5, active: true }),
    });
    j = await r.json();
    check("create review", r.status === 200 && j.data.id);
    const revId = j.data.id;
    await fetch(`${BASE}/api/admin/reviews/${revId}/active`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });
    check("toggle review active", true);
    await fetch(`${BASE}/api/admin/reviews/${revId}`, { method: "DELETE", headers: { cookie } });

    // Contacts
    r = await fetch(`${BASE}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Audit User",
        email: "audit@example.com",
        phone: "0600000000",
        subject: "Test audit",
        message: "Ceci est un message de test pour l'audit.",
      }),
    });
    check("public contact create", r.status === 201);
    r = await fetch(`${BASE}/api/admin/contacts`, { headers: { cookie } });
    j = await r.json();
    const contact = j.data.find((c) => c.email === "audit@example.com");
    check("message visible in admin", !!contact);
    const cId = contact?.id;
    r = await fetch(`${BASE}/api/admin/contacts/${cId}/read`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
    check("mark message read", r.status === 200);
    await fetch(`${BASE}/api/admin/contacts/${cId}`, { method: "DELETE", headers: { cookie } });

    // Customers
    r = await fetch(`${BASE}/api/admin/customers`, { headers: { cookie } });
    j = await r.json();
    check("customers derived", r.status === 200 && Array.isArray(j.data.items));

    // Appointments
    r = await fetch(`${BASE}/api/admin/appointments`, { headers: { cookie } });
    j = await r.json();
    check("list appointments", r.status === 200 && j.data.total >= 2);

    r = await fetch(`${BASE}/api/admin/appointments?status=pending`, { headers: { cookie } });
    check("filter appointments by status", r.status === 200);

    // Settings
    r = await fetch(`${BASE}/api/admin/settings`, { headers: { cookie } });
    j = await r.json();
    check("get settings", r.status === 200 && j.data.business_name);
    r = await fetch(`${BASE}/api/admin/settings`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ hero_slogan: "AUDIT TEST SLOGAN" }),
    });
    check("update settings", r.status === 200);
    // revert
    await fetch(`${BASE}/api/admin/settings`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ hero_slogan: "Style · Confiance · Excellence" }),
    });

    // Public settings now reflects DB
    r = await fetch(`${BASE}/api/settings`);
    j = await r.json();
    check("public settings endpoint", r.status === 200 && j.data.business_phone);

    // Profile
    r = await fetch(`${BASE}/api/admin/profile`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+212623444465" }),
    });
    check("update profile", r.status === 200);

    // Upload
    const fd = new FormData();
    fd.append(
      "file",
      new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64")], { type: "image/png" }),
      "audit.png",
    );
    r = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      headers: { cookie },
      body: fd,
    });
    j = await r.json();
    check("upload image", r.status === 200 && j.data.url?.startsWith("/uploads/"));
    const upPath = j.data?.url;
    if (upPath) {
      r = await fetch(`${BASE}${upPath}`);
      check("uploaded image served", r.status === 200);
      const { rmSync } = await import("node:fs");
      rmSync(upPath.replace("/uploads/", "uploads/"), { force: true });
    }

    // Password change flow (change to new, change back)
    r = await fetch(`${BASE}/api/admin/change-password`, {
      method: "POST",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: "admin123", new_password: "audit1234" }),
    });
    check("change password", r.status === 200);
    // login with new password
    r = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@errammach.ma", password: "audit1234" }),
    });
    check("login with new password", r.status === 200);
    cookie = (r.headers.get("set-cookie") || "").split(";")[0];
    // change back
    await fetch(`${BASE}/api/admin/change-password`, {
      method: "POST",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: "audit1234", new_password: "admin123" }),
    });
    // re-login (password change revokes all sessions)
    r = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@errammach.ma", password: "admin123" }),
    });
    cookie = (r.headers.get("set-cookie") || "").split(";")[0];

    // Logout
    r = await fetch(`${BASE}/api/admin/logout`, { method: "POST", headers: { cookie } });
    check("logout", r.status === 200);
    r = await fetch(`${BASE}/api/admin/me`, { headers: { cookie } });
    check("session revoked after logout", r.status === 401);
  } catch (e) {
    fail++;
    console.error("ERROR:", e.message);
  } finally {
    server.kill();
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }
}

main();