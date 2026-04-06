import { doubleCsrf } from "csrf-csrf";

const isProd = process.env.NODE_ENV === "production";

export const {
  invalidCsrfTokenError,
  generateToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: (req) => req.session.id,
  cookieName: isProd ? "__Host-csrf" : "csrf",
  cookieOptions: {
    httpOnly: true,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
    secure: isProd,
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

export function csrfErrorHandler(error, req, res, next) {
  if (error == invalidCsrfTokenError) {
    res.status(403).json({ error: "invalid csrf token" });
  } else {
    next();
  }
}