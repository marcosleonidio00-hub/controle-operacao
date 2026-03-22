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

// 1. Roteamento da API (mantenha como está)
app.use("/api", routes);

// 2. Servir arquivos estáticos do Frontend
// Usamos process.cwd() para garantir que pegamos a raiz do workspace no Render
const frontendPath = path.join(process.cwd(), "artifacts/controle-operacao/dist/public");

// Log para você conferir no painel do Render se o caminho está certo
console.log("📂 Tentando servir frontend de:", frontendPath);

app.use(express.static(frontendPath));

// 3. Fallback para o SPA
app.get("*", (req, res) => {
  // Se não for uma rota de API e não for um arquivo (ex: .js, .css), manda o index.html
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
      if (err) {
        console.error("❌ Erro ao enviar index.html:", err);
        res.status(404).send("Frontend não encontrado no servidor.");
      }
    });
  }
});