import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { localNow, validDate } from "../../../shared/schedule";
export default function Calendar({ value, onChange }) {
  const today = localNow().date;
  const [month, setMonth] = useState(
    () => new Date((value || today).slice(0, 7) + "-01T12:00:00"),
  );
  const year = month.getFullYear(),
    m = month.getMonth();
  const pad = (n) => String(n).padStart(2, "0");
  const count = new Date(year, m + 1, 0).getDate();
  const offset = (new Date(year, m, 1).getDay() + 6) % 7;
  const max = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  return (
    <div className="calendar">
      <div className="calendar-header">
        <strong>
          {month.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </strong>
        <button
          type="button"
          aria-label="Mois précédent"
          disabled={`${year}-${pad(m + 1)}` <= today.slice(0, 7)}
          onClick={() => setMonth(new Date(year, m - 1, 1))}
        >
          <ChevronLeft size={17} />
        </button>
        <button
          type="button"
          aria-label="Mois suivant"
          disabled={`${year}-${pad(m + 1)}` >= max.slice(0, 7)}
          onClick={() => setMonth(new Date(year, m + 1, 1))}
        >
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="calendar-grid">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <small key={day}>{day}</small>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const date = `${year}-${pad(m + 1)}-${pad(i + 1)}`;
          return (
            <button
              type="button"
              key={date}
              aria-label={new Date(date + "T12:00:00").toLocaleDateString(
                "fr-FR",
                { dateStyle: "full" },
              )}
              aria-pressed={value === date}
              disabled={date < today || date > max || !validDate(date)}
              className={value === date ? "selected" : ""}
              onClick={() => onChange(date)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
