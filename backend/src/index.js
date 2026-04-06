import "dotenv/config";
import express from "express";
import session from "express-session";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { prisma } from "./adapters.js";
import rootRouter from "./routes/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8000;
const isProd = process.env.NODE_ENV === "production";
const app = express();

if (isProd) { app.set("trust proxy", 1); }

app.use(express.json());
app.use(session({
  cookie: { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: 1000 * 60 * 60 * 24 },
  name: "sessionId",
  secret: process.env.SESSION_SECRET || "dev-secret-change-me",
  resave: false,
  saveUninitialized: true,
}));

app.use(rootRouter);

const frontendDir = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDir));
app.get("*", (req, res) => {
  if (!req.originalUrl.startsWith("/api")) return res.sendFile(path.join(frontendDir, "index.html"));
  return res.status(404).send();
});

process.on("exit", async () => { await prisma.$disconnect(); });
app.listen(port, () => { console.log(`Server listening at http://localhost:${port}`); });