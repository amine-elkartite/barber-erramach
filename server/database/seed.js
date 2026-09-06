import { pool } from "../config/database.js";
import { services, barbers, gallery } from "../../shared/catalog.js";
async function addColumnIfMissing(table, column, definition) {
  const [columns] = await pool.execute(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, column],
  );
  if (columns.length) return;
  await pool.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
}
try {
  await addColumnIfMissing(
    "services",
    "category",
    "category VARCHAR(60) NOT NULL DEFAULT 'coupe_moderne' AFTER name",
  );
  await addColumnIfMissing(
    "services",
    "price_type",
    "price_type ENUM('fixed','starting_from') NOT NULL DEFAULT 'fixed' AFTER price",
  );
  await addColumnIfMissing(
    "appointments",
    "service_name",
    "service_name VARCHAR(150) NOT NULL DEFAULT '' AFTER barber_id",
  );
  await addColumnIfMissing(
    "appointments",
    "displayed_price",
    "displayed_price VARCHAR(80) NOT NULL DEFAULT '' AFTER service_name",
  );
  await addColumnIfMissing(
    "appointments",
    "price_type",
    "price_type ENUM('fixed','starting_from') NOT NULL DEFAULT 'fixed' AFTER displayed_price",
  );
  for (const [table, rows] of [
    ["services", services],
    ["barbers", barbers],
    ["gallery", gallery],
  ])
    for (const row of rows) {
      const keys = Object.keys(row);
      await pool.execute(
        `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")}) ON DUPLICATE KEY UPDATE ${keys
          .filter((key) => key !== "id")
          .map((key) => `${key}=VALUES(${key})`)
          .join(",")}`,
        Object.values(row),
      );
    }
  await pool.execute("UPDATE services SET active=0 WHERE id > ?", [
    services.length,
  ]);
  console.log("Catalogue officiel initialisé.");
} finally {
  await pool.end();
}
