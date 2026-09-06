import test from "node:test";
import assert from "node:assert/strict";
import { validDate, makeSlots, localNow } from "../../shared/schedule.js";
const now = { date: "2026-09-07", minutes: 600 };
test("rejects Sundays and impossible dates", () => {
  assert.equal(validDate("2026-09-06"), false);
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2026-09-07"), true);
});
test("past slots and services extending beyond closing are unavailable", () => {
  const slots = makeSlots(now.date, 60, [], now);
  assert.equal(slots.find((s) => s.time === "10:00").status, "unavailable");
  assert.equal(slots.find((s) => s.time === "10:30").status, "available");
  assert.equal(slots.find((s) => s.time === "19:30").status, "unavailable");
});
test("detects overlapping appointments in either direction and allows adjacent ones", () => {
  const slots = makeSlots(
    "2026-09-08",
    60,
    [{ appointment_time: "10:00:00", duration: 60 }],
    now,
  );
  for (const time of ["09:30", "10:00", "10:30"])
    assert.equal(slots.find((s) => s.time === time).status, "reserved");
  for (const time of ["09:00", "11:00"])
    assert.equal(slots.find((s) => s.time === time).status, "available");
});
test("20 minute service occupies only its duration", () => {
  const slots = makeSlots(
    "2026-09-08",
    20,
    [{ appointment_time: "10:00:00", duration: 20 }],
    now,
  );
  assert.equal(slots.find((s) => s.time === "10:30").status, "available");
});
test("business time is independent of browser timezone", () => {
  assert.match(localNow(new Date("2026-09-07T12:00:00Z")).date, /^2026-09-07$/);
});
