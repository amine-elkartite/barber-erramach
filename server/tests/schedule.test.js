import test from "node:test";
import assert from "node:assert/strict";
import { validDate, makeSlots, localNow } from "../../shared/schedule.js";
const now = { date: "2026-09-07", minutes: 600 };
test("rejects impossible dates, accepts Sundays (weekday handled via hours)", () => {
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2026-09-07"), true);
  assert.equal(validDate("2026-09-06"), true);
});
test("past slots and services extending beyond closing are unavailable", () => {
  const slots = makeSlots(now.date, 60, [], now);
  assert.equal(slots.find((s) => s.time === "10:00").status, "unavailable");
  assert.equal(slots.find((s) => s.time === "10:30").status, "available");
  assert.equal(slots.some((s) => s.time === "19:30"), false);
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
test("makeSlots honors opening hours and an optional lunch break", () => {
  const slots = makeSlots(
    "2026-09-08",
    60,
    [],
    now,
    { open: 8 * 60 + 30, close: 18 * 60, breakStart: 12 * 60, breakEnd: 13 * 60 },
  );
  assert.equal(slots[0].time, "08:30");
  assert.equal(slots.at(-1).time, "17:00");
  for (const s of slots)
    if (s.time >= "12:00" && s.time < "13:00")
      assert.equal(s.status, "unavailable");
  const noBreak = makeSlots("2026-09-08", 60, [], now, { open: 540, close: 1200 });
  assert.equal(noBreak[0].time, "09:00");
  assert.equal(noBreak.at(-1).time, "19:00");
  assert.equal(noBreak.some((s) => s.time === "20:00"), false);
});
