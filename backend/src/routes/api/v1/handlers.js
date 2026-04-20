import { csrfCookieName, generateToken } from "../../../csrf.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getCsrfToken(req, res) {
  let csrfToken;
  try {
    csrfToken = generateToken(req, res);
  } catch (error) {
    if (error?.code !== "EBADCSRFTOKEN") throw error;
    // After session regeneration the browser may still send the old CSRF cookie.
    // Drop the stale cookie from the current request and mint a fresh token.
    if (req.cookies) delete req.cookies[csrfCookieName];
    csrfToken = generateToken(req, res);
  }
  req.session.init = true;
  res.json({ csrfToken });
}
