import path from "path";

const backendRoot = process.cwd();

export const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(backendRoot, "uploads");

export const frontendDistDir = path.resolve(backendRoot, "../frontend/dist");

