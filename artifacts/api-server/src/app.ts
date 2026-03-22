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

// 1. Roteamento da API (Mantenha como está)
app.use("/api", routes);

// 2. Localizador de Frontend "Inteligente"
const possiblePaths = [
  path.join(process.cwd(), "artifacts/controle-operacao/dist/public"),
  path.join(process.cwd(), "dist/public"),
  path.join(__dirname, "../../controle-operacao/dist/public")
];

// Tenta encontrar qual dessas pastas realmente tem o index.html
const frontendPath = possiblePaths.find(p => fs.existsSync(path.join(p, "index.html"))) || possiblePaths[0];

console.log("-----------------------------------------");
console.log("🚀 Servidor detectou Frontend em:", frontendPath);
console.log("-----------------------------------------");

app.use(express.static(frontendPath));

// 3. Fallback para Single Page Application (SPA)
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    const indexPath = path.join(frontendPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send(`<h1>Erro de Deploy</h1><p>Pasta frontend não encontrada. Verifique se o build do Vite rodou com sucesso.</p>`);
    }
  }
});