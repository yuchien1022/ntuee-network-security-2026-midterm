import { Prisma } from "@prisma/client";

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Username or email already taken" });
    }
  }

  console.error("Unhandled request error", error);
  return res.status(500).json({ error: "Internal server error" });
}
