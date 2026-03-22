// No topo do index.ts:
import { app } from "./app.js";
import { logger } from "./lib/logger.js";
      import { pool } from "@workspace/db";
      import bcrypt from "bcryptjs";

      async function ensureSchema() {
        const client = await pool.connect();
        try {
          await client.query(
            "DO $$ BEGIN " +
            "IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN " +
            "CREATE TYPE user_role AS ENUM ('master', 'admin', 'user'); " +
            "END IF; " +
            "END $$;"
          );

          await client.query(
            "CREATE TABLE IF NOT EXISTS users (" +
            "id SERIAL PRIMARY KEY," +
            "name TEXT NOT NULL," +
            "email TEXT NOT NULL UNIQUE," +
            "username TEXT NOT NULL UNIQUE," +
            "password_hash TEXT NOT NULL," +
            "role user_role NOT NULL DEFAULT 'user'," +
            "active BOOLEAN NOT NULL DEFAULT true," +
            "perm_fluxo_dados BOOLEAN NOT NULL DEFAULT false," +
            "perm_fluxo_cancelamento BOOLEAN NOT NULL DEFAULT false," +
            "perm_fluxo_emissao BOOLEAN NOT NULL DEFAULT false," +
            "created_at TIMESTAMP NOT NULL DEFAULT NOW()," +
            "updated_at TIMESTAMP NOT NULL DEFAULT NOW()" +
            ")"
          );

          await client.query(
            "CREATE TABLE IF NOT EXISTS orders (" +
            "id SERIAL PRIMARY KEY," +
            "order_number TEXT NOT NULL UNIQUE," +
            "supplier TEXT," +
            "product TEXT," +
            "start_date TEXT," +
            "booking TEXT," +
            "emission_cost REAL," +
            "pax_total INTEGER," +
            "agency TEXT," +
            "issued_by TEXT," +
            "status TEXT NOT NULL DEFAULT 'ATIVO'," +
            "delivery_status TEXT NOT NULL DEFAULT 'PENDENTE'," +
            "notes TEXT," +
            "created_at TIMESTAMP NOT NULL DEFAULT NOW()," +
            "updated_at TIMESTAMP NOT NULL DEFAULT NOW()" +
            ")"
          );

          await client.query(
            "CREATE TABLE IF NOT EXISTS cancellations (" +
            "id SERIAL PRIMARY KEY," +
            "order_number TEXT NOT NULL," +
            "supplier TEXT," +
            "product TEXT," +
            "passenger TEXT," +
            "booking TEXT," +
            "value REAL," +
            "use_date TEXT," +
            "pax INTEGER," +
            "reason TEXT NOT NULL," +
            "status TEXT NOT NULL DEFAULT 'PENDENTE'," +
            "created_by TEXT NOT NULL," +
            "send_date TIMESTAMP DEFAULT NOW()," +
            "solution_date TIMESTAMP," +
            "days_pending INTEGER DEFAULT 0," +
            "email_sent BOOLEAN NOT NULL DEFAULT false," +
            "notes TEXT," +
            "created_at TIMESTAMP NOT NULL DEFAULT NOW()," +
            "updated_at TIMESTAMP NOT NULL DEFAULT NOW()" +
            ")"
          );

          await client.query("ALTER TABLE cancellations ADD COLUMN IF NOT EXISTS passenger TEXT");
          await client.query("ALTER TABLE cancellations ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT false");

          await client.query(
            "CREATE TABLE IF NOT EXISTS goals (" +
            "id SERIAL PRIMARY KEY," +
            "user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE," +
            "date TEXT NOT NULL," +
            "target INTEGER NOT NULL," +
            "achieved INTEGER NOT NULL DEFAULT 0," +
            "created_at TIMESTAMP NOT NULL DEFAULT NOW()," +
            "updated_at TIMESTAMP NOT NULL DEFAULT NOW()" +
            ")"
          );

          await client.query(
            "CREATE TABLE IF NOT EXISTS session (" +
            "sid varchar NOT NULL," +
            "sess json NOT NULL," +
            "expire timestamp(6) NOT NULL," +
            "CONSTRAINT session_pkey PRIMARY KEY (sid)" +
            ")"
          );

          await client.query("CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire)");

          logger.info("Schema verificado/criado com sucesso");
        } finally {
          client.release();
        }
      }

      async function seedMasterUser() {
        const client = await pool.connect();
        try {
          const result = await client.query(
            "SELECT id FROM users WHERE email = $1 LIMIT 1",
            ["marcosleonidio00@gmail.com"]
          );
          if (result.rows.length === 0) {
            const passwordHash = await bcrypt.hash("Admin@2025", 12);
            await client.query(
              "INSERT INTO users (name, email, username, password_hash, role, active, perm_fluxo_dados, perm_fluxo_cancelamento, perm_fluxo_emissao) " +
              "VALUES ($1, $2, $3, $4, 'master', true, true, true, true)",
              ["Marcos Leonidio", "marcosleonidio00@gmail.com", "marcosmaster", passwordHash]
            );
            logger.info("Usuario master criado");
          } else {
            logger.info("Usuario master ja existe");
          }
        } finally {
          client.release();
        }
      }

      async function start() {
        const rawPort = process.env["PORT"];
        if (!rawPort) { logger.warn("PORT não definida, usando 3000"); }

        const port = Number(process.env.PORT || rawPort || 10000);
        if (Number.isNaN(port) || port <= 0) throw new Error("Invalid PORT value: " + rawPort);

        await ensureSchema();
        await seedMasterUser();

        app.listen(port, "0.0.0.0", () => {
          logger.info({ port }, "Server listening");
        });
      }

      start().catch((err) => {
        logger.error(err, "Failed to start server");
        process.exit(1);
      });