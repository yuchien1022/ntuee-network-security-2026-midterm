import { Router } from "express";
import { getAllUsers, getOneUser, createOneUser } from "./handlers.js";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getOneUser);
router.post("/", createOneUser);

export default router;
