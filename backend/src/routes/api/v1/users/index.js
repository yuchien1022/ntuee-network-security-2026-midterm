import { Router } from "express";
import { getAllUsers, getOneUser } from "./handlers.js";
import { asyncHandler } from "../../../../middleware/asyncHandler.js";
import { requireAuth } from "../../../../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(getAllUsers));
router.get("/:id", requireAuth, asyncHandler(getOneUser));

export default router;
