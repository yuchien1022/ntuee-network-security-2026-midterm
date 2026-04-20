import express from "express";
import users from "./api/v1/users/index.js";
import auth from "./api/v1/auth/index.js";
import messages from "./api/v1/messages/index.js";
import upload from "./api/v1/upload/index.js";
import { getCsrfToken } from "./api/v1/handlers.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const rootRouter = express.Router();

rootRouter.get("/api/v1/csrf-token", asyncHandler(getCsrfToken));
rootRouter.use("/api/v1/users", users);
rootRouter.use("/api/v1/auth", auth);
rootRouter.use("/api/v1/messages", messages);
rootRouter.use("/api/v1/upload", upload);

export default rootRouter;
