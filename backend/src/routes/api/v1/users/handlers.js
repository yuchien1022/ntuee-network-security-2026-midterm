import { prisma } from "../../../../adapters.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getAllUsers(req, res) {
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.json(allUsers);
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getOneUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const user = await prisma.user.findUnique({ where: { id } });
  if (user === null) return res.status(404).json({ error: "Not Found" });
  return res.json(user);
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createOneUser(req, res) {
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Name is required" });
  }
  const user = await prisma.user.create({ data: { name: name.trim() } });
  return res.status(201).json(user);
}
