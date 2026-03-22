import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import { logger } from "./lib/logger.js";
import routes from "./routes/index.js";
import path from "path"; // Importe o path
import { fileURLToPath } from "url"; // Necessário para ESM

const app: Express = express();
const PostgresStore = connectPgSimple(session);

// Configuração para caminhos no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  store: new PostgresStore({ pool, tableName: "session" }),
  secret: "sua_chave_secreta",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

import fs from 'fs'; // Adicione este import no topo

// ... restante do seu código (sessão, api, etc) ...

app.use("/api", routes);

// 1. Caminho absoluto partindo da raiz do Render
const frontendPath = path.join(process.cwd(), "artifacts/controle-operacao/dist/public");
const indexPath = path.join(frontendPath, "index.html");

// 2. LOGS DE DEBUG (Isso vai aparecer no painel do Render)
console.log("-----------------------------------------");
console.log("📂 Root Directory (cwd):", process.cwd());
console.log("📂 Target Frontend Path:", frontendPath);
console.log("❓ Folder exists?", fs.existsSync(frontendPath));
if (fs.existsSync(frontendPath)) {
  console.log("📄 Files in folder:", fs.readdirSync(frontendPath));
  console.log("❓ index.html exists?", fs.existsSync(indexPath));
}
console.log("-----------------------------------------");

// 3. Servir arquivos e fallback
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send(`Erro: index.html não encontrado em ${indexPath}`);
    }
  }
});
// No final do arquivo app.ts
export { app };