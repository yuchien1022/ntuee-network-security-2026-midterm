import path, { dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import { fileTypeFromFile } from "file-type";
import { prisma } from "../../../../adapters.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "../../../../../uploads");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];

const MIME_TO_EXT = { "image/jpeg": ".jpg", "image/png": ".png" };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  // 先用 .tmp 存檔，等 magic bytes 驗證後再決定正式副檔名
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(12).toString("hex");
    cb(null, `avatar-${Date.now()}-${randomHex}.tmp`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // 第一道：拒絕明顯不合法的 Content-Type（快速失敗，不寫磁碟）
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(Object.assign(new Error("Only jpg/png images are allowed"), { code: "INVALID_TYPE" }));
    }
    cb(null, true);
  },
});

function removeFileIfExists(filePath) {
  try {
    fs.rmSync(filePath, { force: true });
  } catch {
    // best-effort cleanup
  }
}

function avatarPathFromUrl(avatarUrl) {
  if (!avatarUrl) return null;
  return path.join(uploadsDir, path.basename(avatarUrl));
}

export async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // 第二道：用 magic bytes 驗證實際檔案內容（防止偽造 Content-Type）
  const detected = await fileTypeFromFile(req.file.path);
  if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
    removeFileIfExists(req.file.path);
    return res.status(400).json({ error: "Only jpg/png images are allowed" });
  }

  // magic bytes 驗證通過後，依實際內容決定副檔名（不信任 client 提供的 mimetype）
  const finalExt = MIME_TO_EXT[detected.mime];
  const finalPath = req.file.path.replace(/\.tmp$/, finalExt);
  fs.renameSync(req.file.path, finalPath);
  const finalFilename = req.file.filename.replace(/\.tmp$/, finalExt);

  const avatarUrl = `/uploads/${finalFilename}`;
  const previousUser = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: { avatarUrl: true },
  });

  try {
    const user = await prisma.user.update({
      where: { id: req.session.userId },
      data: { avatarUrl },
      select: { id: true, username: true, email: true, avatarUrl: true, createdAt: true },
    });

    const previousAvatarPath = avatarPathFromUrl(previousUser?.avatarUrl);
    if (previousAvatarPath && previousAvatarPath !== finalPath) {
      removeFileIfExists(previousAvatarPath);
    }

    return res.json(user);
  } catch (error) {
    removeFileIfExists(finalPath);
    throw error;
  }
}

export function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large (max 5 MB)" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err?.code === "INVALID_TYPE") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
}
