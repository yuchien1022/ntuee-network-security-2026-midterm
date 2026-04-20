import "dotenv/config";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { prisma } from "./adapters.js";
import { csrfErrorHandler } from "./csrf.js";
import { errorHandler } from "./middleware/errorHandler.js";
import rootRouter from "./routes/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
if (!process.env.SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET environment variable is not set");
  process.exit(1);
}

const port = process.env.PORT || 8000;
const isProd = process.env.NODE_ENV === "production";
const PgSessionStore = connectPgSimple(session);
const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

if (isProd) app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
    ].join("; ")
  );
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24,
    },
    name: "sessionId",
    store: new PgSessionStore({
      pool: pgPool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/uploads", express.static(uploadsDir));
app.use(rootRouter);
app.use(csrfErrorHandler);
app.use(errorHandler);

const frontendDir = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDir));
app.get("*", (req, res) => {
  if (!req.originalUrl.startsWith("/api")) {
    return res.sendFile(path.join(frontendDir, "index.html"));
  }
  return res.status(404).send();
});

process.on("exit", async () => {
  await prisma.$disconnect();
  await pgPool.end();
});

async function bootstrap() {
  await prisma.$connect();
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

bootstrap().catch(async (error) => {
  console.error("FATAL: failed to connect to PostgreSQL");
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
