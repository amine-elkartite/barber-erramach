import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { pool } from "../config/database.js";
import { business } from "../../shared/business.js";

const require = createRequire(import.meta.url);
const crypto = require("node:crypto");

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
});

const DB_USER = process.env.MIGRATION_DB_USER || "root";
const DB_PASSWORD = process.env.MIGRATION_DB_PASSWORD || "";
const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_NAME = process.env.DB_NAME || "barber_rammach";

async function migrate() {
  console.log("Migration de la base barber_rammach…");
  const admin = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });
  try {
    await admin.query(`USE ${DB_NAME}`);
    const columnExists = async (table, column) => {
      const [rows] = await admin.query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?",
        [DB_NAME, table, column],
      );
      return rows.length > 0;
    };
    const addColumn = async (table, column, definition) => {
      if (await columnExists(table, column)) return;
      await admin.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
      console.log(`  + ${table}.${column}`);
    };
    const tableExists = async (table) => {
      const [rows] = await admin.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
        [DB_NAME, table],
      );
      return rows.length > 0;
    };

    // services.display_order
    await addColumn(
      "services",
      "display_order",
      "display_order INT NOT NULL DEFAULT 0 AFTER image",
    );
    // barbers.phone / email
    await addColumn("barbers", "phone", "phone VARCHAR(25) AFTER role");
    await addColumn("barbers", "email", "email VARCHAR(254) AFTER phone");
    // appointments.status enum includes 'pending', default stays 'confirmed'
    const [statusRows] = await admin.query(
      "SHOW COLUMNS FROM appointments LIKE 'status'",
    );
    const statusType = statusRows[0]?.Type || "";
    const statusDefault = statusRows[0]?.Default;
    if (!statusType.includes("'pending'") || statusDefault !== "confirmed") {
      await admin.query(
        "ALTER TABLE appointments MODIFY COLUMN status ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'confirmed'",
      );
      console.log("  + appointments.status enum + default 'confirmed'");
    }
    // contacts.is_read
    await addColumn(
      "contacts",
      "is_read",
      "is_read BOOLEAN NOT NULL DEFAULT FALSE AFTER message",
    );
    // gallery columns
    await addColumn("gallery", "active", "active BOOLEAN NOT NULL DEFAULT TRUE AFTER image");
    await addColumn("gallery", "description", "description VARCHAR(255) AFTER active");
    await addColumn("gallery", "position", "position INT NOT NULL DEFAULT 0 AFTER description");
    await addColumn(
      "gallery",
      "updated_at",
      "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
    );
    // new tables
    const createTable = async (name, ddl) => {
      if (await tableExists(name)) return;
      await admin.query(ddl);
      console.log(`  + ${name} table created`);
    };
    await createTable(
      "admins",
      "CREATE TABLE admins (id INT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(120) NOT NULL,email VARCHAR(254) NOT NULL UNIQUE,phone VARCHAR(25),avatar VARCHAR(255),password_hash VARCHAR(255) NOT NULL,role VARCHAR(50) NOT NULL DEFAULT 'admin',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    );
    await createTable(
      "sessions",
      "CREATE TABLE sessions (id INT PRIMARY KEY AUTO_INCREMENT,token CHAR(64) NOT NULL UNIQUE,admin_id INT NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,expires_at DATETIME NOT NULL,FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE)",
    );
    await createTable(
      "settings",
      "CREATE TABLE settings (setting_key VARCHAR(100) PRIMARY KEY,setting_value LONGTEXT NOT NULL,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    );
    await createTable(
      "closed_days",
      "CREATE TABLE closed_days (id INT PRIMARY KEY AUTO_INCREMENT,closed_date DATE NOT NULL UNIQUE,reason VARCHAR(150) NOT NULL DEFAULT '',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    );
    await createTable(
      "opening_hours",
      "CREATE TABLE opening_hours (day_of_week TINYINT PRIMARY KEY,open_time VARCHAR(5) NOT NULL DEFAULT '09:00',close_time VARCHAR(5) NOT NULL DEFAULT '20:00',break_start VARCHAR(5) NOT NULL DEFAULT '',break_end VARCHAR(5) NOT NULL DEFAULT '',is_open BOOLEAN NOT NULL DEFAULT TRUE)",
    );
    await admin.query(
      "INSERT IGNORE INTO opening_hours (day_of_week,open_time,close_time,break_start,break_end,is_open) VALUES (0,'09:00','20:00','','',0),(1,'09:00','20:00','','',1),(2,'09:00','20:00','','',1),(3,'09:00','20:00','','',1),(4,'09:00','20:00','','',1),(5,'09:00','20:00','','',1),(6,'09:00','20:00','','',1)",
    );

    // seed admin + settings
    const [adminRows] = await admin.query(
      "SELECT id FROM admins WHERE email=?",
      ["admin@errammach.ma"],
    );
    if (!adminRows.length) {
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.scryptSync("admin123", salt, 64).toString("hex");
      await admin.query(
        "INSERT INTO admins (name, email, phone, avatar, password_hash, role) VALUES (?,?,?,?,?,?)",
        [
          "Mohamed Er rammach",
          "admin@errammach.ma",
          "+212623444465",
          "/images/barber-1.webp",
          `${salt}:${hash}`,
          "admin",
        ],
      );
      console.log("  + admin account created (admin@errammach.ma)");
    }
    const defaultSettings = {
      business_name: business.name,
      business_phone: business.phone,
      business_phone_display: business.phoneDisplay,
      business_email: "contact@errammach.ma",
      business_address: business.address,
      business_city: business.city,
      business_opening_hours: business.openingHours,
      business_opening_hours_sunday: "Dimanche : Fermé",
      business_whatsapp: business.internationalPhone,
      business_instagram_handle: business.instagramHandle,
      business_instagram_label: business.instagram,
      business_facebook_url: "",
      hero_title: "ER RAMMACH",
      hero_subtitle_top: "MOHAMED",
      hero_subtitle_bottom: "BARBER SHOP",
      hero_slogan: "Style · Confiance · Excellence",
      hero_description:
        "Bienvenue dans votre espace dédié à l’élégance masculine.\nDes coupes modernes, des soins de qualité et une expérience unique vous attendent.",
      home_services_title: "NOS SERVICES",
      about_text:
        "ER RAMMACH Mohamed Barber Shop est un salon dédié à l’élégance masculine, où tradition et modernité se rencontrent. Fondé par Mohamed Er Rammach, passionné par l’art du barbering, notre salon accueille chaque client dans un cadre raffiné et chaleureux pour une expérience unique et personnalisée.",
      about_values: JSON.stringify([
        "Excellence dans chaque détail",
        "Respect et écoute de nos clients",
        "Hygiène irréprochable",
        "Passion pour notre métier",
        "Style et modernité",
      ]),
      about_stats_years: "5+",
      about_stats_clients: "1000+",
      about_stats_services: "15+",
      footer_copyright: "© 2026 ER RAMMACH. Tous droits réservés.",
    };
    for (const [key, value] of Object.entries(defaultSettings)) {
      const [rows] = await admin.query(
        "SELECT setting_key FROM settings WHERE setting_key=?",
        [key],
      );
      if (rows.length) continue;
      await admin.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?,?)",
        [key, value],
      );
    }
    console.log("  + default settings seeded");

    // ensure app user has DDL for future migrations
    try {
      const appUser = process.env.DB_USER || "rammach_app";
      const appHost = "127.0.0.1";
      const [grants] = await admin.query(
        "SELECT * FROM information_schema.USER_PRIVILEGES WHERE GRANTEE = ?",
        [`'${appUser}'@'${appHost}'`],
      );
      const privs = new Set(grants.map((g) => g.PRIVILEGE_TYPE));
      const needed = ["ALTER", "CREATE", "INDEX", "SELECT", "INSERT", "UPDATE", "DELETE"];
      const missing = needed.filter((p) => !privs.has(p) && !privs.has("ALL"));
      if (missing.length && process.env.NODE_ENV !== "production") {
        await admin.query(
          `GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP ON \`${DB_NAME}\`.* TO \`${appUser}\`@\`${appHost}\``,
        );
        await admin.query("FLUSH PRIVILEGES");
        console.log(`  + granted ${DB_NAME} DDL to ${appUser}@${appHost}`);
      }
    } catch (e) {
      console.log("  ! (ignored) could not grant app user privileges:", e.message);
    }
    console.log("Migration terminée.");
  } finally {
    await admin.end();
  }
}

try {
  await migrate();
} catch (error) {
  console.error("Échec de la migration :", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}