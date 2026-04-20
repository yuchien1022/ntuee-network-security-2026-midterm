import bcrypt from "bcryptjs";
import { prisma } from "../../../../adapters.js";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SAFE_USER_FIELDS = {
  id: true,
  username: true,
  email: true,
  avatarUrl: true,
  createdAt: true,
};

export async function register(req, res) {
  const { username, email, password } = req.body;
  const normalizedUsername = typeof username === "string" ? username.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedUsername || !USERNAME_RE.test(normalizedUsername)) {
    return res.status(400).json({ error: "Username must be 3–30 alphanumeric/underscore characters" });
  }
  if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 254) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  if (!password || typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Password must be 8–128 characters" });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: normalizedUsername }, { email: normalizedEmail }] },
  });
  if (existing) {
    return res.status(409).json({ error: "Username or email already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username: normalizedUsername, email: normalizedEmail, passwordHash },
    select: SAFE_USER_FIELDS,
  });

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Session error" });
    req.session.userId = user.id;
    return res.status(201).json(user);
  });
}

export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || typeof username !== "string" || !password || typeof password !== "string") {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { passwordHash: _, ...safeUser } = user;
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Session error" });
    req.session.userId = user.id;
    return res.json(safeUser);
  });
}

export async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("sessionId");
    return res.json({ message: "Logged out" });
  });
}

export async function me(req, res) {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: SAFE_USER_FIELDS,
  });
  return res.json({ user });
}
