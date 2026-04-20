import { prisma } from "../../../../adapters.js";

const MESSAGE_AUTHOR_FIELDS = {
  username: true,
  avatarUrl: true,
};

const MESSAGE_RESPONSE_FIELDS = {
  id: true,
  content: true,
  author: { select: MESSAGE_AUTHOR_FIELDS },
};

export async function getMessages(req, res) {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    select: MESSAGE_RESPONSE_FIELDS,
  });
  return res.json(messages);
}

export async function updateMessage(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid message id" });

  const { content } = req.body;
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "Message content is required" });
  }
  if (content.length > 1000) {
    return res.status(400).json({ error: "Message cannot exceed 1000 characters" });
  }

  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Message not found" });
  if (existing.authorId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });

  const message = await prisma.message.update({
    where: { id },
    data: { content: content.trim() },
    select: MESSAGE_RESPONSE_FIELDS,
  });
  return res.json(message);
}

export async function deleteMessage(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid message id" });

  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Message not found" });
  if (existing.authorId !== req.session.userId) return res.status(403).json({ error: "Forbidden" });

  await prisma.message.delete({ where: { id } });
  return res.status(204).send();
}

export async function createMessage(req, res) {
  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "Message content is required" });
  }
  if (content.length > 1000) {
    return res.status(400).json({ error: "Message cannot exceed 1000 characters" });
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      authorId: req.session.userId,
    },
    select: MESSAGE_RESPONSE_FIELDS,
  });
  return res.status(201).json(message);
}
