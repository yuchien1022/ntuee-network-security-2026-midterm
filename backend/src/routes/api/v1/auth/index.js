import { Router } from "express";
import { doubleCsrfProtection, csrfErrorHandler } from "../../../../csrf.js";
import { register, login, logout, me } from "./handlers.js";
import { asyncHandler } from "../../../../middleware/asyncHandler.js";

const router = Router();

router.get("/me", asyncHandler(me));
router.post("/register", doubleCsrfProtection, csrfErrorHandler, asyncHandler(register));
router.post("/login", doubleCsrfProtection, csrfErrorHandler, asyncHandler(login));
router.post("/logout", doubleCsrfProtection, csrfErrorHandler, asyncHandler(logout));

export default router;
