import { generateToken } from "../../../csrf.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getCsrfToken(req, res) {
  const csrfToken = generateToken(res, req);
  req.session.init = true;
  res.json({ csrfToken });
}
