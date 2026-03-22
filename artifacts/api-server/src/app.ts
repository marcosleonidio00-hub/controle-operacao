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

// 1. Roteamento da API
app.use("/api", routes);

// 2. Servir arquivos estáticos do Frontend
// O caminho deve apontar para onde o Vite colocou os arquivos (dist/public)
const frontendPath = path.resolve(__dirname, "../../controle-operacao/dist/public");
app.use(express.static(frontendPath));

// 3. Fallback para o SPA (Single Page Application)
// Se a rota não for da API e não for um arquivo físico, manda o index.html
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

export default app;