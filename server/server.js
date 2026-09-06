import app from "./app.js";
import { pool } from "./config/database.js";
const port = Number(process.env.PORT || 5000);
const server = app.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`ER RAMMACH : http://localhost:${port}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await pool.end();
      process.exit(0);
    }),
  );
