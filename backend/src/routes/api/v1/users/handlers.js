import { prisma } from "../../../../adapters.js";

const PUBLIC_USER_FIELDS = {
  id: true,
  username: true,
  role: true,
  avatarUrl: true,
};

export async function getOwnerUser(req, res) {
  const owner = await prisma.user.findFirst({
    where: { role: "owner" },
    select: PUBLIC_USER_FIELDS,
  });
  if (!owner) return res.status(404).json({ error: "Owner not found" });
  return res.json(owner);
}

export async function getAllUsers(req, res) {
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: PUBLIC_USER_FIELDS,
  });
  return res.json(allUsers);
}

export async function getOneUser(req, res) {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: PUBLIC_USER_FIELDS,
  });
  if (user === null) return res.status(404).json({ error: "Not Found" });
  return res.json(user);
}
