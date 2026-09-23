import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { requireAuth } from "../../common/middleware/auth.js";
import { uploadBuffer } from "../../config/cloudinary.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

/** POST /api/uploads — multipart field `file`. Returns { url }. */
router.post(
  "/",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file provided." });
    const result = await uploadBuffer(req.file.buffer, {
      folder: req.body?.folder || "nearmart",
      filename: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]+/g, "-")}`,
    });
    res.status(201).json({ ok: true, data: result });
  })
);

export default router;
