import { randomUUID } from "crypto";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { httpError } from "../../common/middleware/error.js";
import { uploadBuffer } from "../../config/cloudinary.js";

const router = Router();
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 1 },
});

function parseUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return next(httpError(status, err.code === "LIMIT_FILE_SIZE" ? "File exceeds the 10 MB limit." : err.message));
    }
    return next(err);
  });
}

router.post(
  "/",
  requireAuth,
  parseUpload,
  asyncHandler(async (req, res) => {
    if (!req.file) throw httpError(400, "A file is required.");

    const folder = req.body.folder || "nearmart";
    if (
      typeof folder !== "string" ||
      folder.length > 255 ||
      !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(folder)
    ) {
      throw httpError(400, "Invalid upload folder.");
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const safeExtension = /^\.[a-z0-9]{1,8}$/.test(extension) ? extension : "";
    const result = await uploadBuffer(req.file.buffer, {
      folder,
      filename: `${randomUUID()}${safeExtension}`,
    });

    res.status(201).json({ ok: true, data: result });
  })
);

export default router;
