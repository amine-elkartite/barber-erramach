export function localNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}
export function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + "T12:00:00Z");
  return (
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === date &&
    d.getUTCDay() !== 0
  );
}
export const toMinutes = (time) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export const timeLabel = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export function makeSlots(date, duration, appointments = [], now = localNow()) {
  if (!validDate(date) || date < now.date) return [];
  return Array.from({ length: 22 }, (_, i) => 540 + i * 30).map((start) => ({
    time: timeLabel(start),
    status:
      start + duration > 1200 || (date === now.date && start <= now.minutes)
        ? "unavailable"
        : appointments.some(
              (a) =>
                start < toMinutes(a.appointment_time) + a.duration &&
                start + duration > toMinutes(a.appointment_time),
            )
          ? "reserved"
          : "available",
  }));
}
