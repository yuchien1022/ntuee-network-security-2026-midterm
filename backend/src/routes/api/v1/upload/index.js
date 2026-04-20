import { Router } from "express";
import { doubleCsrfProtection, csrfErrorHandler } from "../../../../csrf.js";
import { requireAuth } from "../../../../middleware/requireAuth.js";
import { upload, uploadAvatar, multerErrorHandler } from "./handlers.js";
import { asyncHandler } from "../../../../middleware/asyncHandler.js";

const router = Router();

router.post(
  "/avatar",
  doubleCsrfProtection,
  csrfErrorHandler,
  requireAuth,
  upload.single("avatar"),
  asyncHandler(uploadAvatar),
  multerErrorHandler
);

export default router;
