import { Router } from "express";
import { doubleCsrfProtection, csrfErrorHandler } from "../../../../csrf.js";
import { requireAuth } from "../../../../middleware/requireAuth.js";
import { getMessages, createMessage, updateMessage, deleteMessage } from "./handlers.js";
import { asyncHandler } from "../../../../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getMessages));
router.post("/", doubleCsrfProtection, csrfErrorHandler, requireAuth, asyncHandler(createMessage));
router.patch("/:id", doubleCsrfProtection, csrfErrorHandler, requireAuth, asyncHandler(updateMessage));
router.delete("/:id", doubleCsrfProtection, csrfErrorHandler, requireAuth, asyncHandler(deleteMessage));

export default router;
